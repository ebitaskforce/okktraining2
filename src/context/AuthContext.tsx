import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { mockStorage } from '../services/mockDataService';
import { isSupabaseConfigured, supabase } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginUser: (email: string, pass: string) => Promise<UserProfile>;
  loginAdmin: (email: string, pass: string) => Promise<UserProfile>;
  registerUser: (data: Omit<UserProfile, 'id' | 'role' | 'is_active' | 'created_at'> & { password: string }) => Promise<UserProfile>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('okk_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('okk_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('okk_auth_user');
    }
  }, [user]);

  const loginUser = async (email: string, _pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      // 1. Supabase Auth Mode
      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password: _pass 
        });

        if (authErr) {
          throw new Error(authErr.message);
        }

        if (authData?.user) {
          // Fetch associated user profile
          let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          // Auto-heal: If profile row is missing in public.profiles, create it on the fly
          if (!profile) {
            const isTargetAdmin = email.toLowerCase().includes('admin') || authData.user.id === 'caf244c1-c959-4588-86b5-bff7e59b8fc9';
            const newProfile: UserProfile = {
              id: authData.user.id,
              full_name: isTargetAdmin ? 'System Administrator' : (email.split('@')[0] || 'User'),
              staff_id: isTargetAdmin ? 'ADM-0001' : `STF-${Math.floor(1000 + Math.random() * 9000)}`,
              department: isTargetAdmin ? 'Information Technology & Security' : 'General Staff',
              phone: '+60 3-8000 8000',
              email: authData.user.email || email.trim(),
              role: isTargetAdmin ? 'admin' : 'user',
              is_active: true,
              created_at: new Date().toISOString()
            };

            const { data: created } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();

            profile = created || newProfile;
          }

          if (!profile.is_active) {
            throw new Error('Account is disabled by system administrator.');
          }

          setUser(profile);
          return profile;
        }
      }

      // 2. Offline / Local Demo Fallback Mode
      const profiles = mockStorage.getProfiles();
      const match = profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
      if (!match) {
        throw new Error('Invalid email address or password.');
      }
      if (!match.is_active) {
        throw new Error('Account is disabled. Please contact system administrator.');
      }
      setUser(match);
      return match;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (email: string, pass: string): Promise<UserProfile> => {
    const profile = await loginUser(email, pass);
    if (profile.role !== 'admin') {
      setUser(null);
      throw new Error('Access Denied: Admin authorization required to access this portal.');
    }
    return profile;
  };

  const registerUser = async (data: Omit<UserProfile, 'id' | 'role' | 'is_active' | 'created_at'> & { password: string }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password
        });
        if (authErr) throw new Error(authErr.message);

        if (authData.user) {
          const newProfile: UserProfile = {
            id: authData.user.id,
            full_name: data.full_name,
            staff_id: data.staff_id,
            department: data.department,
            phone: data.phone,
            email: data.email.trim(),
            role: 'user',
            is_active: true,
            created_at: new Date().toISOString()
          };

          const { data: created } = await supabase.from('profiles').insert([newProfile]).select().single();
          const finalProfile = created || newProfile;
          setUser(finalProfile);
          return finalProfile;
        }
      }

      // Local Demo Mode Registration
      const profiles = mockStorage.getProfiles();
      const existingEmail = profiles.find(p => p.email.toLowerCase() === data.email.toLowerCase());
      if (existingEmail) throw new Error('Email address is already registered.');

      const existingStaff = profiles.find(p => p.staff_id.toLowerCase() === data.staff_id.toLowerCase());
      if (existingStaff) throw new Error('Staff ID is already registered.');

      const newProfile: UserProfile = {
        id: `user-${Date.now()}`,
        full_name: data.full_name,
        staff_id: data.staff_id,
        department: data.department,
        phone: data.phone,
        email: data.email,
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString()
      };

      profiles.push(newProfile);
      mockStorage.setProfiles(profiles);
      setUser(newProfile);
      return newProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
      return;
    }

    const profiles = mockStorage.getProfiles();
    const match = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!match) {
      throw new Error('No user account found with that email address.');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      loginUser,
      loginAdmin,
      registerUser,
      resetPassword,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
