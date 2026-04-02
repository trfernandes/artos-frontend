import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { AxiosError } from 'axios';
import apiClient, { isAuthEndpoint } from '../domain/api/api-client';
import { ResponseLoginDto, ResponseLoginIgrejaDto } from '../domain/dtos/login/login.response';
import { clearAuthToken, getAuthToken, setAuthToken } from '../core/storage/authTokenStorage';
import { deregisterPushToken } from '../services/notifications';

const IGREJA_ATIVA_KEY = 'igrejaAtivaId';
const USER_STORAGE_KEY = 'user';
const HAS_AUTHENTICATED_KEY = 'hasAuthenticatedBefore';

type StoredUserPayload = {
  user: ResponseLoginDto['user'];
  igrejas: ResponseLoginDto['igrejas'];
  access_token?: string;
};

function toStoredUserPayload(loginData: ResponseLoginDto): StoredUserPayload {
  return {
    user: loginData.user,
    igrejas: loginData.igrejas,
  };
}

function parseStoredUserPayload(raw: string): StoredUserPayload | null {
  try {
    const parsed = JSON.parse(raw) as StoredUserPayload | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.user || !Array.isArray(parsed.igrejas)) return null;
    return parsed;
  } catch {
    return null;
  }
}

type SignOutReason = 'manual' | 'expired';

interface AuthContextData {
  user: ResponseLoginDto | null;
  token: string | null;
  loading: boolean;
  hasAuthenticatedBefore: boolean;
  igrejaAtiva: ResponseLoginIgrejaDto | null;
  setIgrejaAtiva: (igreja: ResponseLoginIgrejaDto) => Promise<void>;
  signIn: (email: string, senha: string) => Promise<void>;
  signInWithData: (loginData: ResponseLoginDto) => Promise<void>;
  signOut: (reason?: SignOutReason) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updateUser: (newUserData: Partial<ResponseLoginDto>) => Promise<void>;
  refreshMe: () => Promise<void>;
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
  const [hasAuthenticatedBefore, setHasAuthenticatedBefore] = useState(false);
  const [igrejaAtiva, setIgrejaAtivaState] = useState<ResponseLoginIgrejaDto | null>(null);

  const isSigningOutRef = useRef(false);

  const persistUser = async (authData: ResponseLoginDto) => {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(toStoredUserPayload(authData)));
  };

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedToken = await getAuthToken();
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const storedIgrejaId = await AsyncStorage.getItem(IGREJA_ATIVA_KEY);
        const storedHasAuthenticated = await AsyncStorage.getItem(HAS_AUTHENTICATED_KEY);
        const parsedStoredUser = storedUser ? parseStoredUserPayload(storedUser) : null;
        const legacyToken = parsedStoredUser?.access_token || null;
        const resolvedToken = storedToken || legacyToken;

        setHasAuthenticatedBefore(storedHasAuthenticated === 'true' || !!resolvedToken);

        if (resolvedToken) {
          setToken(resolvedToken);
          apiClient.defaults.headers.Authorization = `Bearer ${resolvedToken}`;
        }

        if (!storedToken && legacyToken) {
          await setAuthToken(legacyToken);
        }

        if (parsedStoredUser && resolvedToken) {
          const hydratedUser: ResponseLoginDto = {
            access_token: resolvedToken,
            user: parsedStoredUser.user,
            igrejas: parsedStoredUser.igrejas,
          };
          setUser(hydratedUser);

          // Remove token legado do payload salvo em AsyncStorage
          if (parsedStoredUser.access_token) {
            await persistUser(hydratedUser);
          }

          // Restaurar igreja ativa ou usar a primeira
          if (hydratedUser.igrejas?.length) {
            const igrejaRestaurada = storedIgrejaId
              ? hydratedUser.igrejas.find((i) => i.id === storedIgrejaId)
              : null;
            setIgrejaAtivaState(igrejaRestaurada || hydratedUser.igrejas[0]);
          }
        } else if (storedUser && !parsedStoredUser) {
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (error) {
        if (__DEV__) {
          console.log('[Auth] Erro ao carregar storage:', error);
        }
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
        const requestUrl = error?.config?.url || '';

        if (status === 401 && !isSigningOutRef.current && !isAuthEndpoint(requestUrl)) {
          await signOut('expired');
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, []);

  const setIgrejaAtiva = async (igreja: ResponseLoginIgrejaDto) => {
    // Limpa cache do React Query para recarregar dados da nova igreja
    await queryClient.cancelQueries();
    queryClient.clear();
    setIgrejaAtivaState(igreja);
    await AsyncStorage.setItem(IGREJA_ATIVA_KEY, igreja.id);
  };

  const signIn = async (email: string, senha: string) => {
    const response = await apiClient.post('/auth/login', { email, senha });

    const loginData = response.data?.data as ResponseLoginDto | undefined;

    const newToken = loginData?.access_token;
    if (!newToken) throw new Error('Token não retornado pelo servidor');

    setToken(newToken);
    setHasAuthenticatedBefore(true);
    apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
    await setAuthToken(newToken);
    await AsyncStorage.setItem(HAS_AUTHENTICATED_KEY, 'true');

    const userResponse = loginData?.user;
    if (!userResponse || !loginData) throw new Error('Dados de Usuario nao retornado pelo servidor');

    setUser(loginData);

    // Define a primeira igreja como ativa ao fazer login
    if (loginData.igrejas?.length) {
      const storedIgrejaId = await AsyncStorage.getItem(IGREJA_ATIVA_KEY);
      const igrejaRestaurada = storedIgrejaId
        ? loginData.igrejas.find((i) => i.id === storedIgrejaId)
        : null;
      setIgrejaAtivaState(igrejaRestaurada || loginData.igrejas[0]);
    }

    if (loginData) {
      await persistUser(loginData);
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const signInWithData = async (loginData: ResponseLoginDto) => {
    const newToken = loginData?.access_token;
    if (!newToken) throw new Error('Token não retornado');

    setToken(newToken);
    setHasAuthenticatedBefore(true);
    apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
    await setAuthToken(newToken);
    await AsyncStorage.setItem(HAS_AUTHENTICATED_KEY, 'true');

    setUser(loginData);
    await persistUser(loginData);

    // Define a primeira igreja como ativa
    if (loginData.igrejas?.length) {
      const storedIgrejaId = await AsyncStorage.getItem(IGREJA_ATIVA_KEY);
      const igrejaRestaurada = storedIgrejaId
        ? loginData.igrejas.find((i) => i.id === storedIgrejaId)
        : null;
      setIgrejaAtivaState(igrejaRestaurada || loginData.igrejas[0]);
    }
  };

  const signOut = async (reason: SignOutReason = 'manual') => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;

    try {
      // Remover push token do backend antes de limpar a sessão
      await deregisterPushToken().catch(() => {});

      setToken(null);
      setUser(null);
      setIgrejaAtivaState(null);

      delete apiClient.defaults.headers.Authorization;

      await clearAuthToken();
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(IGREJA_ATIVA_KEY);

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
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return true;
    } catch (error) {
      console.error('[forgotPassword] Erro:', error);
      throw error;
    }
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
    await persistUser(mergedUser);

    // Atualiza igrejaAtiva se a igreja ativa foi modificada
    if (igrejaAtiva && newUserData.igrejas) {
      const igrejaAtivaAtualizada = newUserData.igrejas.find((i) => i.id === igrejaAtiva.id);
      if (igrejaAtivaAtualizada) {
        // Preservar os ministérios da igreja ativa atual ao atualizar
        const igrejaComMinisterios = {
          ...igrejaAtivaAtualizada,
          ministerios: igrejaAtivaAtualizada.ministerios?.length 
            ? igrejaAtivaAtualizada.ministerios 
            : igrejaAtiva.ministerios,
        };
        setIgrejaAtivaState(igrejaComMinisterios);
      }
    }
  };

  const refreshMe = async () => {
    try {
      const response = await apiClient.get('/voluntarios/me');
      const meData = response.data?.data as ResponseLoginDto | undefined;
      
      if (meData && user) {
        const updatedUser: ResponseLoginDto = {
          ...user,
          access_token: user.access_token,
          user: meData.user || user.user,
          igrejas: meData.igrejas || [],
        };
        
        setUser(updatedUser);
        await persistUser(updatedUser);
        
        // Atualizar igreja ativa se ainda existir na lista
        if (igrejaAtiva && updatedUser.igrejas?.length) {
          const igrejaAindaExiste = updatedUser.igrejas.find((i) => i.id === igrejaAtiva.id);
          if (igrejaAindaExiste) {
            setIgrejaAtivaState(igrejaAindaExiste);
          } else {
            // Se a igreja ativa não existe mais, selecionar a primeira
            setIgrejaAtivaState(updatedUser.igrejas[0]);
            await AsyncStorage.setItem(IGREJA_ATIVA_KEY, updatedUser.igrejas[0].id);
          }
        } else if (!igrejaAtiva && updatedUser.igrejas?.length) {
          // Se não tinha igreja ativa mas agora tem igrejas, selecionar a primeira
          setIgrejaAtivaState(updatedUser.igrejas[0]);
          await AsyncStorage.setItem(IGREJA_ATIVA_KEY, updatedUser.igrejas[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw error;
    }
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
      hasAuthenticatedBefore,
      igrejaAtiva,
      setIgrejaAtiva,
      signIn,
      signInWithData,
      signOut,
      forgotPassword,
      updateUser,
      refreshMe,
      changePassword,
      deleteAccount,
    }),
    [user, token, loading, hasAuthenticatedBefore, igrejaAtiva],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
