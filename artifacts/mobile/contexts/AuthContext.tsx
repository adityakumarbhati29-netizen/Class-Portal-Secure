import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, usersApi, setToken, clearToken, getToken } from '@/lib/api';

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'student';
  name: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addUser: (data: Omit<User, 'id'>) => Promise<{ success: boolean; error?: string }>;
  removeUser: (id: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const token = await getToken();
      if (token) {
        const me = await authApi.me();
        setUser(me as User);
        // load user list if admin
        if (me.role === 'admin') {
          const list = await usersApi.list();
          setUsers(list as User[]);
        }
      }
    } catch {
      await clearToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const res = await authApi.login(username, password);
      await setToken(res.token);
      // fetch full user (with password field) for display in settings
      const me = await authApi.me();
      setUser(me as User);
      if (me.role === 'admin') {
        const list = await usersApi.list();
        setUsers(list as User[]);
      }
      return true;
    } catch {
      return false;
    }
  }

  async function logout() {
    setUser(null);
    setUsers([]);
    await clearToken();
  }

  async function addUser(data: Omit<User, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      await usersApi.create(data);
      const list = await usersApi.list();
      setUsers(list as User[]);
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to add user' };
    }
  }

  async function removeUser(id: string) {
    await usersApi.delete(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>) {
    // optimistic local update only (no edit endpoint needed for now)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (user?.id === id) setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }

  return (
    <AuthContext.Provider value={{ user, users, isLoading, login, logout, addUser, removeUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
