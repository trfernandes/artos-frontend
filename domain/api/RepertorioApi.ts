import apiClient from './api-client';
import { DynamicQuery } from '../utils/query_utils';
import { ResponseRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.response';
import { CreateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.create';
import { UpdateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.update';
import { ResponseRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.response';
import { CreateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.create';
import { UpdateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.update';

type ApiEnvelope<T> = { data: T };

class RepertorioApiClass {
  async searchCategorias(igrejaId: string, query?: DynamicQuery): Promise<ResponseRepertorioCategoriaDto[]> {
    const response = await apiClient.post<ApiEnvelope<ResponseRepertorioCategoriaDto[]>>(`/igrejas/${igrejaId}/repertorio-categorias/search`, query || {});
    return response.data.data;
  }

  async createCategoria(igrejaId: string, dto: CreateRepertorioCategoriaDto) {
    const response = await apiClient.post<ApiEnvelope<ResponseRepertorioCategoriaDto>>(`/igrejas/${igrejaId}/repertorio-categorias`, dto);
    return response.data.data;
  }

  async updateCategoria(igrejaId: string, id: string, dto: UpdateRepertorioCategoriaDto) {
    const response = await apiClient.put<ApiEnvelope<ResponseRepertorioCategoriaDto>>(`/igrejas/${igrejaId}/repertorio-categorias/${id}`, dto);
    return response.data.data;
  }

  async removeCategoria(igrejaId: string, id: string) {
    await apiClient.delete(`/igrejas/${igrejaId}/repertorio-categorias/${id}`);
  }

  async searchMusicas(igrejaId: string, ministerioId: string, query?: DynamicQuery): Promise<ResponseRepertorioMusicaDto[]> {
    const response = await apiClient.post<ApiEnvelope<ResponseRepertorioMusicaDto[]>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-musicas/search`,
      query || {},
    );
    return response.data.data;
  }

  async getMusica(igrejaId: string, ministerioId: string, id: string) {
    const response = await apiClient.get<ApiEnvelope<ResponseRepertorioMusicaDto>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-musicas/${id}`,
    );
    return response.data.data;
  }

  async createMusica(igrejaId: string, ministerioId: string, dto: CreateRepertorioMusicaDto) {
    const response = await apiClient.post<ApiEnvelope<ResponseRepertorioMusicaDto>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-musicas`,
      dto,
    );
    return response.data.data;
  }

  async updateMusica(igrejaId: string, ministerioId: string, id: string, dto: UpdateRepertorioMusicaDto) {
    const response = await apiClient.put<ApiEnvelope<ResponseRepertorioMusicaDto>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-musicas/${id}`,
      dto,
    );
    return response.data.data;
  }

  async removeMusica(igrejaId: string, ministerioId: string, id: string) {
    await apiClient.delete(`/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-musicas/${id}`);
  }
}

export const RepertorioApi = new RepertorioApiClass();
