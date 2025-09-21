import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../domain/api/api-client';

interface AuthContextData {
  user: any;
  token: string | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.Authorization = `Bearer ${storedToken}`;
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao carregar storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorage();
  }, []);

  // Login
  const signIn = async (email: string, senha: string) => {
    const response = await apiClient.post('/auth/login', { email, senha });

    const token = response.data?.data?.access_token;
    if (!token) throw new Error('Token não retornado pelo servidor');

    setToken(token);
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    await AsyncStorage.setItem('token', token);

    const user = response.data?.data?.user;
    if (!user) throw new Error('Dados de Usuário não retornado pelo servidor');
    setUser(user);
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('user');
    }
  };

  // Logout
  const signOut = async () => {
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.Authorization;

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  const forgotPassword = async (email: string) => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
