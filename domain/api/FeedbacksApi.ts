import { BaseApi } from './BaseApi';
import apiClient from './api-client';

export interface FeedbackResponse {
  id: string;
  nota: 'RUIM' | 'BOM' | 'EXCELENTE';
  texto: string | null;
  voluntarioId: string | null;
  igrejaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  nota: 'RUIM' | 'BOM' | 'EXCELENTE';
  texto?: string;
}

class FeedbacksApiClass extends BaseApi<FeedbackResponse, CreateFeedbackDto, any> {
  constructor() {
    super('feedbacks');
  }

  async createFeedback(
    dto: CreateFeedbackDto,
    igrejaId: string,
  ): Promise<FeedbackResponse> {
    const response = await apiClient.post<{ data: FeedbackResponse }>(
      '/feedbacks',
      dto,
      { params: { igrejaId } },
    );
    return response.data.data;
  }

  async listMy(): Promise<FeedbackResponse[]> {
    const response = await apiClient.get<{ data: FeedbackResponse[] }>('/feedbacks/meu');
    return response.data.data;
  }

  async listByIgreja(igrejaId: string): Promise<FeedbackResponse[]> {
    const response = await apiClient.get<{ data: FeedbackResponse[] }>('/feedbacks', {
      params: { igrejaId },
    });
    return response.data.data;
  }
}

export const feedbacksApi = new FeedbacksApiClass();
