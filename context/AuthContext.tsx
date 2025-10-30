'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profile_picture?: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for localStorage with expiration
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_profile',
  TOKEN_EXPIRY: 'auth_token_expiry',
};

const TOKEN_EXPIRY_DAYS = 30; // 30 days

function setStorageWithExpiry(key: string, value: string, days: number = TOKEN_EXPIRY_DAYS) {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  localStorage.setItem(key, value);
  localStorage.setItem(`${key}_expiry`, expiryTime.toISOString());
}

function getStorageWithExpiry(key: string): string | null {
  const value = localStorage.getItem(key);
  const expiryStr = localStorage.getItem(`${key}_expiry`);
  
  if (!value || !expiryStr) {
    return null;
  }
  
  const expiry = new Date(expiryStr);
  if (new Date() > expiry) {
    // Token has expired, remove it
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_expiry`);
    return null;
  }
  
  return value;
}

function removeStorageWithExpiry(key: string) {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_expiry`);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = getStorageWithExpiry(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user profile:', e);
        removeStorageWithExpiry(STORAGE_KEYS.TOKEN);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (idToken: string) => {
    try {
      const response = await fetch('/api/py/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      const newToken = data.access_token;
      const newUser = data.user;

      setToken(newToken);
      setUser(newUser);

      // Store in localStorage with 30-day expiry
      setStorageWithExpiry(STORAGE_KEYS.TOKEN, newToken, TOKEN_EXPIRY_DAYS);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeStorageWithExpiry(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
