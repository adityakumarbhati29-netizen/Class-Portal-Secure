import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const USERS_KEY = '@portal_users';
const SESSION_KEY = '@portal_session';

const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Class Teacher',
  },
  {
    id: 'u2',
    username: 'student1',
    password: 'pass1234',
    role: 'student',
    name: 'Aarav Sharma',
  },
  {
    id: 'u3',
    username: 'student2',
    password: 'pass1234',
    role: 'student',
    name: 'Priya Patel',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_KEY);
      let userList: User[];
      if (storedUsers) {
        userList = JSON.parse(storedUsers) as User[];
      } else {
        userList = DEFAULT_USERS;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }
      setUsers(userList);

      const sessionId = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const current = userList.find((u) => u.id === sessionId);
        if (current) setUser(current);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setUser(found);
      await AsyncStorage.setItem(SESSION_KEY, found.id);
      return true;
    }
    return false;
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }

  async function addUser(
    data: Omit<User, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    if (users.find((u) => u.username === data.username)) {
      return { success: false, error: 'Username already exists' };
    }
    if (users.length >= 55) {
      return { success: false, error: 'Maximum 55 users allowed' };
    }
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newUser: User = { ...data, id };
    const updated = [...users, newUser];
    setUsers(updated);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return { success: true };
  }

  async function removeUser(id: string) {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
  }

  async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>) {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updated);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
    if (user?.id === id) {
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, users, isLoading, login, logout, addUser, removeUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
