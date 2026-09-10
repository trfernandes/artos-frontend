import apiClient from './api-client';
import { ResponsePoliticaPrivacidadeDto } from '../dtos/PoliticaPrivacidade/politica-privacidade.response';

class PoliticaPrivacidadeApiClass {
  async obter(): Promise<ResponsePoliticaPrivacidadeDto> {
    const response = await apiClient.get<ResponsePoliticaPrivacidadeDto>('/politica-privacidade');
    return response.data;
  }
}

export const PoliticaPrivacidadeApi = new PoliticaPrivacidadeApiClass();
