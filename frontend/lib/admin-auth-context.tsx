'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'Studio Owner' | 'Receptionist' | 'Staff';
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCredentials: (updates: Partial<AdminUser>) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Demo users for development (replace with real API in production)
const DEMO_USERS: Array<AdminUser & { password: string }> = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@hawipictures.com',
    phone: '0988018016',
    role: 'Studio Owner',
    password: 'admin123',
  },
  {
    id: '2',
    username: 'receptionist',
    email: 'reception@hawipictures.com',
    phone: '0914878007',
    role: 'Receptionist',
    password: 'reception123',
  },
];

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user by username, email, or phone
    const foundUser = DEMO_USERS.find(
      (u) =>
        (u.username.toLowerCase() === identifier.toLowerCase() ||
          u.email.toLowerCase() === identifier.toLowerCase() ||
          u.phone === identifier) &&
        u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('adminUser', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
  };

  const updateCredentials = (updates: Partial<AdminUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, isAuthenticated, login, logout, updateCredentials }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
