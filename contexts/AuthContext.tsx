import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../domain/api/api-client';
import { VoluntarioPapelEnum } from '../domain/models/Voluntario';
import { HierarquiaEnum } from '../domain/models/MinisterioVoluntario';
import { MinisterioTipoEnum } from '../domain/models/Ministerio';
import { ImageUtils } from '../utils/image_utils';

export interface UserMinisterio {
  id: string;
  nome: string;
  logo?: string;
  tipo: MinisterioTipoEnum;
  hierarquia?: HierarquiaEnum;
}

export interface UserLoginData {
  id: string;
  nome: string;
  foto?: string;
  email: string;
  papel: VoluntarioPapelEnum;
  ministerios: UserMinisterio[];
}

const normalizeUserImages = (user: UserLoginData | null): UserLoginData | null => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    foto: user.foto ? ImageUtils.rawToDataUri(user.foto) ?? user.foto : undefined,
    ministerios: (user.ministerios ?? []).map(ministerio => ({
      ...ministerio,
      logo: ministerio.logo ? ImageUtils.rawToDataUri(ministerio.logo) ?? ministerio.logo : undefined,
    })),
  };
};

interface AuthContextData {
  user: UserLoginData | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updateUser: (newUserData: Partial<UserLoginData>) => Promise<void>;
  changePassword: (senhaAtual: string, novaSenha: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserLoginData | null>(null);
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
          setUser(normalizeUserImages(JSON.parse(storedUser)));
        }
      } catch (error) {
        console.log('Erro ao carregar storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorage();
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     console.log('Usuario Logado');
  //     registerForPushNotificationsAsync(user?.id!).catch(error =>
  //       console.log('erro ao registrar para notificações:', strfyObj(error))
  //     );
  //   } else {
  //     console.log('Usuario não logado');
  //   }
  // }, [user]);

  // Login
  const signIn = async (email: string, senha: string) => {
    const response = await apiClient.post('/auth/login', { email, senha });

    const token = response.data?.data?.access_token;
    if (!token) throw new Error('Token não retornado pelo servidor');

    setToken(token);
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    await AsyncStorage.setItem('token', token);

    const userResponse = response.data?.data?.user;
    if (!userResponse) throw new Error('Dados de Usuario nao retornado pelo servidor');
    const normalizedUser = normalizeUserImages(userResponse);
    setUser(normalizedUser);
    if (normalizedUser) {
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
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
    await apiClient.post('/auth/forgot-password', { email });
    return true;
  };

  const updateUser = async (newUserData: Partial<UserLoginData>) => {
    const mergedUser = user ? { ...user, ...newUserData } : (newUserData as UserLoginData);
    const normalizedUser = normalizeUserImages(mergedUser)!;
    setUser(normalizedUser);
    if (normalizedUser) {
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
    } else {
      await AsyncStorage.removeItem('user');
    }
  };

  const changePassword = async (senhaAtual: string, novaSenha: string) => {
    await apiClient.put('/auth/change-password', {
      senhaAtual,
      novaSenha,
    });
    return true;
  };

  const deleteAccount = async () => {
    await apiClient.delete('/auth/delete-account');
    await signOut();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signOut, forgotPassword, updateUser, changePassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
