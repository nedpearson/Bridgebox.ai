import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { authService } from "../lib/auth";
import { organizationsService } from "../lib/db/organizations";
import { permissions, PermissionContext, UserRole } from "../lib/permissions";

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
  type: "internal" | "client";
  organization_type?: "internal" | "client";
  is_enterprise_client?: boolean;
  billing_plan?: string;
  subscription_status?: string;
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
  isLoadingOrg: boolean;
  permissionContext: PermissionContext | null;
  can: (check: (ctx: PermissionContext) => boolean) => boolean;
  isInternalStaff: boolean;
  isClientUser: boolean;
  isImpersonating: boolean;
  originalProfile: Profile | null;
  impersonateUser: (profile: Profile, org: Organization) => void;
  stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  // Impersonation State
  const [impersonatedProfile, setImpersonatedProfile] =
    useState<Profile | null>(null);
  const [impersonatedOrg, setImpersonatedOrg] = useState<Organization | null>(
    null,
  );

  const activeProfile = impersonatedProfile || profile;
  const activeBaseOrg = impersonatedOrg || currentOrganization;

  const handleSetCurrentOrganization = (org: Organization | null) => {
    if (org) {
      localStorage.setItem("bridgebox_active_org", org.id);
    } else {
      localStorage.removeItem("bridgebox_active_org");
    }
    setCurrentOrganization(org);
  };

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
      } catch (err: any) {
        // If the session refresh fails (e.g. stale token from a previous deployment),
        // silently clear all local auth state and let the user log in fresh.
        // This prevents "Database error querying schema" from showing on the login page.
        const msg = err?.message || "";
        if (
          msg.includes("Database error") ||
          msg.includes("schema") ||
          msg.includes("Invalid Refresh Token") ||
          msg.includes("refresh_token_not_found") ||
          msg.includes("JWT")
        ) {
          console.warn(
            "Stale session detected — clearing local auth state.",
            msg,
          );
          try {
            localStorage.clear();
            sessionStorage.clear();
            await authService.signOut().catch(() => {});
          } catch (_) {
            /* ignore */
          }
        } else {
          console.error("Initial session fetch error:", err);
        }
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Prevent duplicate loads on INITIAL_SESSION (handled by initialize())
        // and TOKEN_REFRESHED (no profile reload needed on silent refresh)
        if (event !== "INITIAL_SESSION" && event !== "TOKEN_REFRESHED") {
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
        const storedOrgId = localStorage.getItem("bridgebox_active_org");
        const defaultOrg =
          orgsData.find((o) => o.id === storedOrgId) || orgsData[0];
        handleSetCurrentOrganization(defaultOrg);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
      setIsLoadingOrg(false);
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
    handleSetCurrentOrganization(null);
  }

  const permissionContext = useMemo<PermissionContext | null>(() => {
    if (!activeProfile || !user) return null;

    return {
      role: activeProfile.role,
      organizationId: activeBaseOrg?.id,
      organizationType: activeBaseOrg?.organization_type || activeBaseOrg?.type,
      userId: impersonatedProfile ? impersonatedProfile.id : user.id,
    };
  }, [activeProfile, user, activeBaseOrg, impersonatedProfile]);

  const can = (check: (ctx: PermissionContext) => boolean): boolean => {
    if (!permissionContext) return false;
    return check(permissionContext);
  };

  const isInternalStaff = useMemo(() => {
    return activeProfile
      ? permissions.isInternalStaff(activeProfile.role)
      : false;
  }, [activeProfile]);

  const isClientUser = useMemo(() => {
    return activeProfile ? permissions.isClientUser(activeProfile.role) : false;
  }, [activeProfile]);

  // Safely inject Enterprise plan entitlements for super admin's internal workspaces
  // while preserving explicit plan layouts for downstream client organizations
  const activeOrganization = useMemo(() => {
    if (!activeBaseOrg) return null;

    // Check if nedpearson@gmail.com is operating in an internal host organization
    if (
      !impersonatedProfile &&
      profile?.role === "super_admin" &&
      profile.email?.toLowerCase() === "nedpearson@gmail.com" &&
      activeBaseOrg.type === "internal"
    ) {
      return {
        ...activeBaseOrg,
        is_enterprise_client: true,
        billing_plan: "enterprise",
        subscription_status: "active",
      };
    }

    return activeBaseOrg;
  }, [activeBaseOrg, profile, impersonatedProfile]);

  const value: AuthContextType = {
    session,
    user,
    profile: activeProfile,
    originalProfile: profile,
    organizations,
    currentOrganization: activeOrganization,
    loading,
    signIn,
    signUp,
    signOut,
    setCurrentOrganization: handleSetCurrentOrganization,
    isLoadingOrg,
    permissionContext,
    can,
    isInternalStaff,
    isClientUser,
    isImpersonating: !!impersonatedProfile,
    impersonateUser: (p: Profile, o: Organization) => {
      setImpersonatedProfile(p);
      setImpersonatedOrg(o);
    },
    stopImpersonating: () => {
      setImpersonatedProfile(null);
      setImpersonatedOrg(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
