import { CreateEscalaDto } from '../dtos/Escala/escala.create';
import { ResponseEscalaDto } from '../dtos/Escala/escala.response';
import apiClient from './api-client';
import { BaseApi } from './BaseApi';

class EscalasApiClass extends BaseApi<ResponseEscalaDto, CreateEscalaDto, Partial<CreateEscalaDto>> {
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
}

export const EscalasApi = new EscalasApiClass();
