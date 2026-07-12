import { CreateEscalaDto } from '../dtos/Escala/escala.create';
import { EscalaParametrizacaoType, ResponseEscalaDto } from '../dtos/Escala/escala.response';
import { ResponseEscalaValidarNomeDto } from '../dtos/Escala/escala-validar-nome.response';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';

class EscalasApiClass extends BaseApi<
  ResponseEscalaDto,
  CreateEscalaDto,
  Partial<CreateEscalaDto>
> {
  constructor() {
    super('escalas');
  }

  async generate(data: CreateEscalaDto): Promise<ResponseEscalaDto> {
    try {
      const response = await apiClient.post(`/${this.resourceName}/gerar`, data);
      return response.data.data;
    } catch (error) {
      console.log(`Erro ao gerar ${this.resourceName}:`, error);
      throw error;
    }
  }

  async regenerate(escalaId: string): Promise<ResponseEscalaDto> {
    try {
      const response = await apiClient.post(`/${this.resourceName}/${escalaId}/regerar`);
      return response.data.data;
    } catch (error) {
      console.log(`Erro ao regerar ${this.resourceName}:`, error);
      throw error;
    }
  }

  async getAuditoria(escalaId: string): Promise<any> {
    const response = await apiClient.get(`/${this.resourceName}/${escalaId}/auditoria`);
    return response.data.data;
  }

  async deleteItensByEvento(
    escalaId: string,
    igrejaId: string,
    payload: { eventoId: string; dataOcorrencia: string },
  ): Promise<void> {
    try {
      await apiClient.delete(`/${this.resourceName}/${escalaId}/itens`, {
        params: { igrejaId },
        data: payload,
      });
    } catch (error) {
      console.log(`Erro ao remover itens de ${this.resourceName}:`, error);
      throw error;
    }
  }

  async getParametrizacao(escalaId: string): Promise<EscalaParametrizacaoType> {
    const response = await apiClient.get<{ data: EscalaParametrizacaoType }>(
      `/${this.resourceName}/${escalaId}/parametrizacao`,
    );
    return response.data.data;
  }

  async validarNome(
    igrejaId: string,
    ministerioId: string,
    nome: string,
    excludeEscalaId?: string,
  ): Promise<ResponseEscalaValidarNomeDto> {
    const response = await apiClient.get<{ data: ResponseEscalaValidarNomeDto }>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/escalas/validar-nome`,
      {
        params: {
          nome,
          ...(excludeEscalaId ? { excludeEscalaId } : {}),
        },
      },
    );
    return response.data.data;
  }
}

export const EscalasApi = new EscalasApiClass();
