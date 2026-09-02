import apiClient from './api-client';
import { ResponseRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.response';
import { CreateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.create';
import { UpdateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.update';

type ApiEnvelope<T> = { data: T };

export type ListarRegrasMinisterioResponse = {
  pessoais: ResponseRegraIndisponibilidadeVoluntarioDto[];
  ministerio: ResponseRegraIndisponibilidadeVoluntarioDto[];
  // Datas avulsas da tabela antiga, adaptadas como período de 1 dia. Só pra
  // marcar no calendário — não são regras que o voluntário criou.
  datasAvulsas: ResponseRegraIndisponibilidadeVoluntarioDto[];
};

class RegrasIndisponibilidadeMinisterioApiClass {
  private base(igrejaId: string, ministerioId: string, voluntarioId: string) {
    return `/igrejas/${igrejaId}/ministerios/${ministerioId}/integrantes/${voluntarioId}/indisponibilidades`;
  }

  async listar(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
  ): Promise<ListarRegrasMinisterioResponse> {
    const response = await apiClient.get<ApiEnvelope<ListarRegrasMinisterioResponse>>(
      this.base(igrejaId, ministerioId, voluntarioId),
    );
    return response.data.data;
  }

  async criar(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
    dto: CreateRegraIndisponibilidadeVoluntarioDto,
  ): Promise<ResponseRegraIndisponibilidadeVoluntarioDto> {
    const response = await apiClient.post<ApiEnvelope<ResponseRegraIndisponibilidadeVoluntarioDto>>(
      this.base(igrejaId, ministerioId, voluntarioId),
      dto,
    );
    return response.data.data;
  }

  async atualizar(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
    id: string,
    dto: UpdateRegraIndisponibilidadeVoluntarioDto,
  ): Promise<ResponseRegraIndisponibilidadeVoluntarioDto> {
    const response = await apiClient.put<ApiEnvelope<ResponseRegraIndisponibilidadeVoluntarioDto>>(
      `${this.base(igrejaId, ministerioId, voluntarioId)}/${id}`,
      dto,
    );
    return response.data.data;
  }

  async remover(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
    id: string,
  ): Promise<void> {
    await apiClient.delete(`${this.base(igrejaId, ministerioId, voluntarioId)}/${id}`);
  }
}

export const RegrasIndisponibilidadeMinisterioApi = new RegrasIndisponibilidadeMinisterioApiClass();
