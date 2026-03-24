import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../lib/auth';
import { organizationsService } from '../lib/db/organizations';
import { permissions, PermissionContext, UserRole } from '../lib/permissions';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
}

interface Organization {
  id: string;
  name: string;
  type: 'internal' | 'client';
  organization_type?: 'internal' | 'client';
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentOrganization: (org: Organization | null) => void;
  permissionContext: PermissionContext | null;
  can: (check: (ctx: PermissionContext) => boolean) => boolean;
  isInternalStaff: boolean;
  isClientUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const session = await authService.getSession();
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial session fetch error:', err);
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Prevent duplicate loads if already loading or if the session just initialized
        if (event !== 'INITIAL_SESSION') {
          await loadUserData();
        }
      } else {
        setProfile(null);
        setOrganizations([]);
        setCurrentOrganization(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadUserData() {
    try {
      const [profileData, orgsData] = await Promise.all([
        authService.getUserProfile(),
        organizationsService.getMyOrganizations(),
      ]);

      setProfile(profileData);
      setOrganizations(orgsData || []);

      if (orgsData && orgsData.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgsData[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { session } = await authService.signIn({ email, password });
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) {
      await loadUserData();
    }
  }

  async function signUp(email: string, password: string, fullName?: string) {
    const { session } = await authService.signUp({ email, password, fullName });
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) {
      await loadUserData();
    }
  }

  async function signOut() {
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setOrganizations([]);
    setCurrentOrganization(null);
  }

  const permissionContext = useMemo<PermissionContext | null>(() => {
    if (!profile || !user) return null;

    return {
      role: profile.role,
      organizationId: currentOrganization?.id,
      organizationType: currentOrganization?.organization_type || currentOrganization?.type,
      userId: user.id,
    };
  }, [profile, user, currentOrganization]);

  const can = (check: (ctx: PermissionContext) => boolean): boolean => {
    if (!permissionContext) return false;
    return check(permissionContext);
  };

  const isInternalStaff = useMemo(() => {
    return profile ? permissions.isInternalStaff(profile.role) : false;
  }, [profile]);

  const isClientUser = useMemo(() => {
    return profile ? permissions.isClientUser(profile.role) : false;
  }, [profile]);

  const value: AuthContextType = {
    session,
    user,
    profile,
    organizations,
    currentOrganization,
    loading,
    signIn,
    signUp,
    signOut,
    setCurrentOrganization,
    permissionContext,
    can,
    isInternalStaff,
    isClientUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
