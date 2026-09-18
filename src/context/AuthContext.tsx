import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.js';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: 'user' | 'admin') => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      setLoading(true);
      const res = await api.auth.login({ email, password });
      setUser(res.user);
      showToast('success', 'Logged in', `Welcome back, ${res.user.name}`);
    } catch (err: any) {
      showToast('error', 'Login failed', err.message || 'Please check your credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const res = await api.auth.register(data);
      setUser(res.user);
      showToast('success', 'Account created', `Welcome to MediBasket, ${res.user.name}`);
    } catch (err: any) {
      showToast('error', 'Registration failed', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      showToast('info', 'Logged out', 'You have been logged out successfully');
    } catch {
      setUser(null);
    }
  };

  const switchRole = async (role: 'user' | 'admin') => {
    try {
      setLoading(true);
      const res = await api.auth.switchRole(role);
      setUser(res.user);
      showToast('info', 'Role Switched', `Now operating as ${res.user.name} (${role})`);
    } catch (err: any) {
      showToast('error', 'Role switch failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await api.auth.updateProfile(data);
      setUser(res.user);
      showToast('success', 'Profile updated', 'Your contact and address details were saved');
    } catch (err: any) {
      showToast('error', 'Update failed', err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
