import apiClient from './api-client';
import { ResponseDashboardDto } from '../dtos/Dashboard/dashboard.response';

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

export class DashboardApi {
  static async getDashboard(igrejaId: string): Promise<ResponseDashboardDto> {
    const response = await apiClient.get<ApiEnvelope<ResponseDashboardDto>>(
      `/dashboard/igreja/${igrejaId}`,
    );
    if (response.data?.success === false) {
      throw new Error(
        response.data?.message ||
          response.data?.error?.message ||
          'Não foi possível carregar o dashboard.',
      );
    }
    return response.data.data;
  }

  static async getMinisterioDashboard(ministerioId: string): Promise<any> {
    const response = await apiClient.get<ApiEnvelope<any>>(`/dashboard/ministerio/${ministerioId}`);
    if (response.data?.success === false) {
      throw new Error(
        response.data?.message ||
          response.data?.error?.message ||
          'Não foi possível carregar o dashboard do ministério.',
      );
    }
    return response.data.data;
  }
}
