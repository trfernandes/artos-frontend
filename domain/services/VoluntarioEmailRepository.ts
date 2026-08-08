import apiClient from '../api/api-client';

class VoluntarioEmailRepositoryClass {
  async reenviarConfirmacaoEmail(email: string): Promise<{ ok: boolean }> {
    const response = await apiClient.post<{ data: { ok: boolean } }>(
      '/voluntarios/reenviar-confirmacao-email',
      { email },
    );
    return response.data.data;
  }
}

export const VoluntarioEmailRepository = new VoluntarioEmailRepositoryClass();
