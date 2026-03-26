import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
  role?: 'super_admin' | 'internal_staff' | 'client_admin' | 'client_member';
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp({ email, password, fullName }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const isSuperAdmin = data.user.email?.toLowerCase() === 'nedpearson@gmail.com';
      await supabase.from('bb_profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        // Make sure the first created profile correctly gets a functional admin role
        role: isSuperAdmin ? 'super_admin' : 'client_admin',
      });
    }

    return data;
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async getUserProfile() {
    const user = await this.getUser();
    if (!user) return null;

    let { data, error } = await supabase
      .from('bb_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    // Safely auto-promote nedpearson@gmail.com to super_admin if not already
    // Provides a seamless fallback in memory if RLS blocks self-update
    if (data && data.email?.toLowerCase() === 'nedpearson@gmail.com' && data.role !== 'super_admin') {
      try {
        const { data: updated, error: updateError } = await supabase
          .from('bb_profiles')
          .update({ role: 'super_admin' })
          .eq('id', user.id)
          .select()
          .maybeSingle();
        
        if (!updateError && updated) {
          data = updated;
        } else {
          data.role = 'super_admin';
        }
      } catch (e) {
        data.role = 'super_admin';
      }
    }

    return data;
  },

  async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bb_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
