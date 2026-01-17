import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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

const STORAGE_KEY = '@artos:cadastro_igreja';
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
  // ========== STORAGE (AsyncStorage) ==========

  /**
   * Salva os dados do cadastro no AsyncStorage
   */
  async salvarDadosCadastro(dados: CadastroIgrejaStorageDto): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }

  /**
   * Recupera os dados do cadastro do AsyncStorage
   */
  async obterDadosCadastro(): Promise<CadastroIgrejaStorageDto | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as CadastroIgrejaStorageDto;
  }

  /**
   * Remove os dados do cadastro do AsyncStorage
   */
  async limparDadosCadastro(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  // ========== API (Público com X-App-Secret) ==========

  /**
   * Cria uma nova solicitação de cadastro de igreja
   * POST /public/cadastro-igreja
   */
  async criarCadastro(dto: CreateCadastroIgrejaDto, idempotencyKey?: string): Promise<CreateCadastroResponseDto> {
    const baseURL = apiClient.defaults.baseURL;
    const key = idempotencyKey || generateIdempotencyKey();
    const response = await axios.post<ApiEnvelope<CreateCadastroResponseDto>>(
      `${baseURL}${API_BASE_PATH}`,
      dto,
      {
        headers: {
          'Idempotency-Key': key,
          'X-App-Secret': APP_SECRET,
        },
      },
    );
    return response.data.data;
  }

  /**
   * Obtém o status do cadastro
   * GET /public/cadastro-igreja/:cadastroId/status
   */
  async obterStatus(cadastroId: string, cadastroSecret: string): Promise<StatusCadastroResponseDto> {
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.get<ApiEnvelope<StatusCadastroResponseDto>>(
      `${baseURL}${API_BASE_PATH}/${cadastroId}/status`,
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
   * Reenvia o e-mail de confirmação
   * POST /public/cadastro-igreja/:cadastroId/reenviar-email
   */
  async reenviarEmail(cadastroId: string, cadastroSecret: string): Promise<CadastroIgrejaActionResponseDto> {
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.post<ApiEnvelope<CadastroIgrejaActionResponseDto>>(
      `${baseURL}${API_BASE_PATH}/${cadastroId}/reenviar-email`,
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
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.patch<ApiEnvelope<CadastroIgrejaActionResponseDto>>(
      `${baseURL}${API_BASE_PATH}/${cadastroId}/alterar-email`,
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
  async confirmarEmail(
    cadastroId: string,
    dto: ConfirmarEmailCadastroDto,
  ): Promise<CadastroIgrejaActionResponseDto> {
    const baseURL = apiClient.defaults.baseURL;
    const response = await axios.post<ApiEnvelope<CadastroIgrejaActionResponseDto>>(
      `${baseURL}${API_BASE_PATH}/${cadastroId}/confirmar-email`,
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
