import apiClient from './api-client';
import { ResponseChecklistOnboardingDto } from '../dtos/ChecklistOnboarding/checklist-onboarding.response';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    message?: string;
    error?: string;
    statusCode?: number;
  } | null;
};

export class ChecklistOnboardingApi {
  static async getChecklistAdmin(igrejaId: string): Promise<ResponseChecklistOnboardingDto> {
    const response = await apiClient.get<ApiEnvelope<ResponseChecklistOnboardingDto>>(
      `/igrejas/${igrejaId}/checklist-onboarding`,
    );
    if (response.data?.success === false) {
      throw new Error(
        response.data?.message ||
          response.data?.error?.message ||
          'Não foi possível carregar o checklist de configuração.',
      );
    }
    return response.data.data;
  }

  static async getChecklistLider(ministerioId: string): Promise<ResponseChecklistOnboardingDto> {
    const response = await apiClient.get<ApiEnvelope<ResponseChecklistOnboardingDto>>(
      `/ministerios/${ministerioId}/checklist-onboarding`,
    );
    if (response.data?.success === false) {
      throw new Error(
        response.data?.message ||
          response.data?.error?.message ||
          'Não foi possível carregar o checklist de configuração.',
      );
    }
    return response.data.data;
  }
}
