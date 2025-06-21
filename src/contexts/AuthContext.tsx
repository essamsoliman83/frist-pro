
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase, handleSupabaseError, handleSupabaseSuccess } from '@/integrations/supabase';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    name: 'المدير',
    role: 'manager',
    administrativeWorkPlaces: [] // جهات العمل الإشرافية الوحيدة
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pharmacy_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pharmacy_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem('pharmacy_users', JSON.stringify(users));
  }, [users]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Find user in local state
      const localUser = users.find(u => u.username === username && u.password === password);
      
      if (localUser) {
        setCurrentUser(localUser);
        localStorage.setItem('pharmacy_current_user', JSON.stringify(localUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pharmacy_current_user');
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      setLoading(true);
      
      const newUser = {
        ...userData,
        id: Date.now().toString()
      };

      // Add to local state
      setUsers(prev => [...prev, newUser]);
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      
      // Delete from local state
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      users,
      addUser,
      updateUser,
      deleteUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
