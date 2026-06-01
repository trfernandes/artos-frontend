import apiClient from './api-client';
import { DynamicQuery } from '../utils/query_utils';
import { ResponseRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.response';
import { CreateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.create';
import { UpdateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.update';
import { ResponseRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.response';
import { CreateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.create';
import { UpdateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.update';
import { CreateRepertorioMusicaSecaoDto } from '../dtos/Repertorio/repertorio-musica-secao.create';
import { UpdateRepertorioMusicaSecaoDto } from '../dtos/Repertorio/repertorio-musica-secao.update';
import { ResponseRepertorioMusicaSecaoDto } from '../dtos/Repertorio/repertorio-musica-secao.response';
import { ResponseRepertorioMusicaArranjoDto } from '../dtos/Repertorio/repertorio-musica-arranjo.response';
import { UpsertRepertorioMusicaArranjoDto } from '../dtos/Repertorio/repertorio-musica-arranjo.update';
import { ResponseYoutubeSearchItemDto } from '../dtos/Repertorio/youtube-search-item.response';

type ApiEnvelope<T> = { data: T };

class RepertorioApiClass {
  async searchCategorias(
    igrejaId: string,
    ministerioId: string,
    query?: DynamicQuery,
  ): Promise<ResponseRepertorioCategoriaDto[]> {
    const response = await apiClient.post<ApiEnvelope<ResponseRepertorioCategoriaDto[]>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-categorias/search`,
      query || {},
    );
    return response.data.data;
  }

  async createCategoria(igrejaId: string, ministerioId: string, dto: CreateRepertorioCategoriaDto) {
    const response = await apiClient.post<ApiEnvelope<ResponseRepertorioCategoriaDto>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-categorias`,
      dto,
    );
    return response.data.data;
  }

  async updateCategoria(
    igrejaId: string,
    ministerioId: string,
    id: string,
    dto: UpdateRepertorioCategoriaDto,
  ) {
    const response = await apiClient.put<ApiEnvelope<ResponseRepertorioCategoriaDto>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-categorias/${id}`,
      dto,
    );
    return response.data.data;
  }

  async removeCategoria(igrejaId: string, ministerioId: string, id: string) {
    await apiClient.delete(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-categorias/${id}`,
    );
  }

  async searchYoutubeVersions(
    igrejaId: string,
    query: string,
    limit = 6,
  ): Promise<ResponseYoutubeSearchItemDto[]> {
    const response = await apiClient.get<ApiEnvelope<ResponseYoutubeSearchItemDto[]>>(
      `/igrejas/${igrejaId}/repertorio/youtube/search`,
      {
        params: { query, limit },
      },
    );
    return response.data.data;
  }

  async searchMusicas(
    igrejaId: string,
    ministerioId: string,
    query?: DynamicQuery,
  ): Promise<ResponseRepertorioMusicaDto[]> {
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

  async updateMusica(
    igrejaId: string,
    ministerioId: string,
    id: string,
    dto: UpdateRepertorioMusicaDto,
  ) {
    const response = await apiClient.put<ApiEnvelope<ResponseRepertorioMusicaDto>>(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-musicas/${id}`,
      dto,
    );
    return response.data.data;
  }

  async removeMusica(igrejaId: string, ministerioId: string, id: string) {
    await apiClient.delete(
      `/igrejas/${igrejaId}/ministerios/${ministerioId}/repertorio-musicas/${id}`,
    );
  }

  async listSecoes(igrejaId: string, musicaId: string) {
    const response = await apiClient.get<ApiEnvelope<ResponseRepertorioMusicaSecaoDto[]>>(
      `/igrejas/${igrejaId}/repertorio/musicas/${musicaId}/secoes`,
    );
    return response.data.data;
  }

  async createSecao(igrejaId: string, musicaId: string, dto: CreateRepertorioMusicaSecaoDto) {
    const response = await apiClient.post<ApiEnvelope<ResponseRepertorioMusicaSecaoDto>>(
      `/igrejas/${igrejaId}/repertorio/musicas/${musicaId}/secoes`,
      dto,
    );
    return response.data.data;
  }

  async updateSecao(
    igrejaId: string,
    musicaId: string,
    secaoId: string,
    dto: UpdateRepertorioMusicaSecaoDto,
  ) {
    const response = await apiClient.patch<ApiEnvelope<ResponseRepertorioMusicaSecaoDto>>(
      `/igrejas/${igrejaId}/repertorio/musicas/${musicaId}/secoes/${secaoId}`,
      dto,
    );
    return response.data.data;
  }

  async removeSecao(igrejaId: string, musicaId: string, secaoId: string) {
    await apiClient.delete(`/igrejas/${igrejaId}/repertorio/musicas/${musicaId}/secoes/${secaoId}`);
  }

  async getArranjo(igrejaId: string, musicaId: string) {
    const response = await apiClient.get<ApiEnvelope<ResponseRepertorioMusicaArranjoDto[]>>(
      `/igrejas/${igrejaId}/repertorio/musicas/${musicaId}/arranjo`,
    );
    return response.data.data;
  }

  async replaceArranjo(igrejaId: string, musicaId: string, dto: UpsertRepertorioMusicaArranjoDto) {
    const response = await apiClient.put<ApiEnvelope<ResponseRepertorioMusicaArranjoDto[]>>(
      `/igrejas/${igrejaId}/repertorio/musicas/${musicaId}/arranjo`,
      dto,
    );
    return response.data.data;
  }
}

export const RepertorioApi = new RepertorioApiClass();
