import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { AxiosError } from 'axios';
import apiClient from '../domain/api/api-client';
import { ResponseLoginDto } from '../domain/dtos/login/login.response';
import { clearAuthToken, getAuthToken, setAuthToken } from '../core/storage/authTokenStorage';

type SignOutReason = 'manual' | 'expired';

interface AuthContextData {
  user: ResponseLoginDto | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: (reason?: SignOutReason) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updateUser: (newUserData: Partial<ResponseLoginDto>) => Promise<void>;
  changePassword: (senhaAtual: string, novaSenha: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<ResponseLoginDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isSigningOutRef = useRef(false);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedToken = await getAuthToken();
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.Authorization = `Bearer ${storedToken}`;
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Erro ao carregar storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorage();
  }, []);

  // Interceptor global para 401 (sessão expirada)
  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (res: any) => res,
      async (error: AxiosError) => {
        const status = error?.response?.status;

        if (status === 401 && !isSigningOutRef.current) {
          await signOut('expired');
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, []);

  const signIn = async (email: string, senha: string) => {
    const response = await apiClient.post('/auth/login', { email, senha });

    const loginData = response.data?.data as ResponseLoginDto | undefined;

    const newToken = loginData?.access_token;
    if (!newToken) throw new Error('Token não retornado pelo servidor');

    setToken(newToken);
    apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
    await setAuthToken(newToken);

    const userResponse = loginData?.user;
    if (!userResponse || !loginData) throw new Error('Dados de Usuario nao retornado pelo servidor');

    setUser(loginData);

    if (loginData) {
      await AsyncStorage.setItem('user', JSON.stringify(loginData));
    } else {
      await AsyncStorage.removeItem('user');
    }
  };

  const signOut = async (reason: SignOutReason = 'manual') => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;

    try {
      setToken(null);
      setUser(null);

      delete apiClient.defaults.headers.Authorization;

      await clearAuthToken();
      await AsyncStorage.removeItem('user');

      queryClient.clear();

      router.replace('/(auth)');

      // se quiser avisar:
      // if (reason === 'expired') {
      //   Toast.show({ type: 'info', text1: 'Sessão expirada. Faça login novamente.' });
      // }
    } finally {
      isSigningOutRef.current = false;
    }
  };

  const forgotPassword = async (email: string) => {
    await apiClient.post('/auth/forgot-password', { email });
    return true;
  };

  const updateUser = async (newUserData: Partial<ResponseLoginDto>) => {
    if (!user) return;

    const mergedUser: ResponseLoginDto = {
      ...user,
      ...newUserData,
      user: {
        ...user.user,
        ...(newUserData.user ?? {}),
      },
      igrejas: newUserData.igrejas ?? user.igrejas,
    };

    setUser(mergedUser);
    await AsyncStorage.setItem('user', JSON.stringify(mergedUser));
  };

  const changePassword = async (senhaAtual: string, novaSenha: string) => {
    await apiClient.put('/auth/change-password', { senhaAtual, novaSenha });
    return true;
  };

  const deleteAccount = async () => {
    await apiClient.delete('/auth/delete-account');
    await signOut('manual');
    return true;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signOut,
      forgotPassword,
      updateUser,
      changePassword,
      deleteAccount,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
