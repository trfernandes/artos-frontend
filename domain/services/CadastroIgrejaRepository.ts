import AsyncStorage from '@react-native-async-storage/async-storage';
import {
     setItem as setSecureItem,
     getItem as getSecureItem,
     deleteItem as deleteSecureItem,
     setJSON,
     getJSON,
} from '../../utils/secureStorage';
import apiClient from '../api/api-client';
import {
     CadastroIgrejaStorageDto,
     CreateCadastroIgrejaDto,
     CreateCadastroResponseDto,
     StatusCadastroResponseDto,
     AlterarEmailCadastroDto,
     ConfirmarEmailCadastroDto,
     CadastroIgrejaActionResponseDto,
} from '../dtos/Igreja/cadastro-igreja.dto';
import Constants from 'expo-constants';
import { AxiosError } from 'axios';

const STORAGE_KEY = 'artos.cadastro_igreja';
const IDEMPOTENCY_KEY = 'artos.cadastro_igreja_idempotency_key';
const API_BASE_PATH = '/public/cadastro-igreja';
const APP_SECRET = Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_SECRET_KEY || '';

type ApiEnvelope<T> = {
  data: T;
};

const generateIdempotencyKey = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

class CadastroIgrejaRepositoryClass {
  /**
   * Persiste a Idempotency-Key temporária
   */
  async salvarIdempotencyKey(key: string): Promise<void> {
    await setSecureItem(IDEMPOTENCY_KEY, key);
  }

  /**
   * Recupera a Idempotency-Key temporária
   */
  async obterIdempotencyKey(): Promise<string | null> {
    return await getSecureItem(IDEMPOTENCY_KEY);
  }

  /**
   * Remove a Idempotency-Key temporária
   */
  async limparIdempotencyKey(): Promise<void> {
    await deleteSecureItem(IDEMPOTENCY_KEY);
  }
  // ========== STORAGE (SecureStore) ==========

  /**
   * Salva os dados do cadastro no SecureStore
   */
  async salvarDadosCadastro(dados: CadastroIgrejaStorageDto): Promise<void> {
    await setJSON(STORAGE_KEY, dados);
  }

  /**
   * Recupera os dados do cadastro do SecureStore, migrando de AsyncStorage se necessário
   */
  async obterDadosCadastro(): Promise<CadastroIgrejaStorageDto | null> {
    // 1. Tenta ler do SecureStore
    const secureData = await getJSON<CadastroIgrejaStorageDto>(STORAGE_KEY);
    if (secureData) {
      return secureData;
    }
    // 2. Se não existir, tenta migrar do AsyncStorage
    const legacyRaw = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacyRaw) {
      let legacyData: CadastroIgrejaStorageDto | null = null;
      try {
        legacyData = JSON.parse(legacyRaw);
      } catch {}
      if (legacyData) {
        await setJSON(STORAGE_KEY, legacyData);
      }
      await AsyncStorage.removeItem(STORAGE_KEY);
      return legacyData;
    }
    return null;
  }

  /**
   * Remove os dados do cadastro do SecureStore
   */
  async limparDadosCadastro(): Promise<void> {
    await deleteSecureItem(STORAGE_KEY);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await this.limparIdempotencyKey();
  }

  // ========== API (Público com X-App-Secret) ==========

  /**
   * Cria uma nova solicitação de cadastro de igreja
   * POST /public/cadastro-igreja
   */
  async criarCadastro(dto: CreateCadastroIgrejaDto): Promise<CreateCadastroResponseDto> {
    try {
      let key = await this.obterIdempotencyKey();
      if (!key) {
        key = generateIdempotencyKey(); // <- aqui nasce a key
        await this.salvarIdempotencyKey(key);
      }

      const response = await apiClient.post<ApiEnvelope<CreateCadastroResponseDto>>(API_BASE_PATH, dto, {
        headers: { 'Idempotency-Key': key, 'X-App-Secret': APP_SECRET },
      });
      return response.data.data;
    } catch (err) {
      const e = err as AxiosError<any>;

      console.log('[cadastro-igreja] request failed');
      console.log('url:', e.config?.baseURL, e.config?.url);
      console.log('method:', e.config?.method);
      console.log('message:', e.message);
      console.log('status:', e.response?.status);
      console.log('data:', e.response?.data);

      throw err;
    }
  }

  /**
   * Obtém o status do cadastro
   * GET /public/cadastro-igreja/:cadastroId/status
   */
  async obterStatus(cadastroId: string, cadastroSecret: string): Promise<StatusCadastroResponseDto> {
    const response = await apiClient.get<ApiEnvelope<StatusCadastroResponseDto>>(`${API_BASE_PATH}/${cadastroId}/status`, {
      headers: {
        'X-App-Secret': APP_SECRET,
        'X-Cadastro-Secret': cadastroSecret,
      },
    });
    return response.data.data;
  }

  /**
   * Reenvia o e-mail de confirmação
   * POST /public/cadastro-igreja/:cadastroId/reenviar-email
   */
  async reenviarEmail(cadastroId: string, cadastroSecret: string): Promise<CadastroIgrejaActionResponseDto> {
    const response = await apiClient.post<ApiEnvelope<CadastroIgrejaActionResponseDto>>(
      `${API_BASE_PATH}/${cadastroId}/reenviar-email`,
      {},
      {
        headers: {
          'X-App-Secret': APP_SECRET,
          'X-Cadastro-Secret': cadastroSecret,
        },
      },
    );
    return response.data.data;
  }

  /**
   * Altera o e-mail do cadastro e reenvia a confirmação
   * PATCH /public/cadastro-igreja/:cadastroId/alterar-email
   */
  async alterarEmail(
    cadastroId: string,
    cadastroSecret: string,
    dto: AlterarEmailCadastroDto,
  ): Promise<CadastroIgrejaActionResponseDto> {
    const response = await apiClient.patch<ApiEnvelope<CadastroIgrejaActionResponseDto>>(
      `${API_BASE_PATH}/${cadastroId}/alterar-email`,
      dto,
      {
        headers: {
          'X-App-Secret': APP_SECRET,
          'X-Cadastro-Secret': cadastroSecret,
        },
      },
    );
    return response.data.data;
  }

  /**
   * Confirma o e-mail e ativa a igreja (chamado via deep link)
   * POST /public/cadastro-igreja/:cadastroId/confirmar-email
   */
  async confirmarEmail(cadastroId: string, dto: ConfirmarEmailCadastroDto): Promise<CadastroIgrejaActionResponseDto> {
    const response = await apiClient.post<ApiEnvelope<CadastroIgrejaActionResponseDto>>(
      `${API_BASE_PATH}/${cadastroId}/confirmar-email`,
      dto,
      {
        headers: {
          'X-App-Secret': APP_SECRET,
        },
      },
    );
    return response.data.data;
  }
}

export const CadastroIgrejaRepository = new CadastroIgrejaRepositoryClass();
