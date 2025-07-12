import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signUp, signIn, signOut, getProfile, createProfile, type Profile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('Refreshing profile for user:', user.id);
      let userProfile = await getProfile(user.id);
      console.log('Profile fetched:', userProfile ? 'found' : 'not found');
      
      // If profile doesn't exist, try to create one
      if (!userProfile && user.email) {
        console.log('Creating new profile for user:', user.id);
        try {
          const { data: newProfile, error } = await createProfile(
            user.id, 
            user.user_metadata?.name || 'User', 
            user.email
          );
          if (!error && newProfile) {
            console.log('Profile created successfully:', newProfile);
            userProfile = newProfile;
          } else {
            console.error('Profile creation failed:', error);
          }
        } catch (error) {
          console.error('Error creating profile:', error);
        }
      }
      
      console.log('Profile refreshed:', userProfile ? 'success' : 'failed');
      setProfile(userProfile);
    } else {
      console.log('No user ID available for profile refresh');
    }
  };

  useEffect(() => {
    console.log('AuthContext: Starting auth initialization');
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext: Initial session loaded:', !!session?.user);
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, !!session?.user);
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove user dependency to prevent infinite loop

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error);
        return false;
      }
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await signUp(email, password, name);
      if (error) {
        console.error('Registration error:', error);
        return false;
      }
      return !!data.user;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    profile,
    login,
    register,
    logout,
    loading,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}