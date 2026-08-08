import apiClient from '../api/api-client';
import {
  ResponseMinisterioAcessoDto,
  ResponseMinisterioAcessoMemberDto,
} from '../dtos/MinisterioAcesso/ministerio-acesso.response';
import { UpsertMinisterioAuxiliarDto } from '../dtos/MinisterioAcesso/ministerio-acesso.upsert';

class MinisterioAcessosRepositoryClass {
  async getAcessos(igrejaId: string, ministerioId: string): Promise<ResponseMinisterioAcessoDto> {
    const response = await apiClient.get(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/acessos`,
    );
    return response.data?.data ?? response.data;
  }

  async addAuxiliar(
    igrejaId: string,
    ministerioId: string,
    dto: UpsertMinisterioAuxiliarDto,
  ): Promise<ResponseMinisterioAcessoMemberDto> {
    const response = await apiClient.post(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/acessos/auxiliares`,
      dto,
    );
    return response.data?.data ?? response.data;
  }

  async updateAuxiliar(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
    dto: Pick<UpsertMinisterioAuxiliarDto, 'permissoes'>,
  ): Promise<ResponseMinisterioAcessoMemberDto> {
    const response = await apiClient.patch(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/acessos/auxiliares/${voluntarioId}`,
      dto,
    );
    return response.data?.data ?? response.data;
  }

  async removeAuxiliar(
    igrejaId: string,
    ministerioId: string,
    ministerioVoluntarioId: string,
  ): Promise<void> {
    await apiClient.delete(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/acessos/auxiliares/${ministerioVoluntarioId}`,
    );
  }
}

export const MinisterioAcessosRepository = new MinisterioAcessosRepositoryClass();
