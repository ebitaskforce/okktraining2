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
      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password: _pass });
        if (authErr) throw new Error(authErr.message);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
        if (profile) {
          setUser(profile);
          return profile;
        }
      }

      // Mock Login Validation
      const profiles = mockStorage.getProfiles();
      const match = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
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
    const profiles = mockStorage.getProfiles();
    const match = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!match) {
      throw new Error('No user account found with that email address.');
    }
    // Simulation
  };

  const logout = () => {
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
