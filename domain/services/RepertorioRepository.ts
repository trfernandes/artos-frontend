import { RepertorioApi } from '../api/RepertorioApi';
import { CreateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.create';
import { UpdateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.update';
import { CreateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.create';
import { UpdateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.update';
import { DynamicQuery } from '../utils/query_utils';
import { CreateRepertorioMusicaSecaoDto } from '../dtos/Repertorio/repertorio-musica-secao.create';
import { UpdateRepertorioMusicaSecaoDto } from '../dtos/Repertorio/repertorio-musica-secao.update';
import { UpsertRepertorioMusicaArranjoDto } from '../dtos/Repertorio/repertorio-musica-arranjo.update';

class RepertorioRepositoryClass {
  searchCategorias(igrejaId: string, query?: DynamicQuery) {
    return RepertorioApi.searchCategorias(igrejaId, query);
  }

  createCategoria(igrejaId: string, dto: CreateRepertorioCategoriaDto) {
    return RepertorioApi.createCategoria(igrejaId, dto);
  }

  updateCategoria(igrejaId: string, id: string, dto: UpdateRepertorioCategoriaDto) {
    return RepertorioApi.updateCategoria(igrejaId, id, dto);
  }

  removeCategoria(igrejaId: string, id: string) {
    return RepertorioApi.removeCategoria(igrejaId, id);
  }

  searchYoutubeVersions(igrejaId: string, query: string, limit = 6) {
    return RepertorioApi.searchYoutubeVersions(igrejaId, query, limit);
  }

  searchMusicas(igrejaId: string, ministerioId: string, query?: DynamicQuery) {
    return RepertorioApi.searchMusicas(igrejaId, ministerioId, query);
  }

  getMusica(igrejaId: string, ministerioId: string, id: string) {
    return RepertorioApi.getMusica(igrejaId, ministerioId, id);
  }

  createMusica(igrejaId: string, ministerioId: string, dto: CreateRepertorioMusicaDto) {
    return RepertorioApi.createMusica(igrejaId, ministerioId, dto);
  }

  updateMusica(igrejaId: string, ministerioId: string, id: string, dto: UpdateRepertorioMusicaDto) {
    return RepertorioApi.updateMusica(igrejaId, ministerioId, id, dto);
  }

  removeMusica(igrejaId: string, ministerioId: string, id: string) {
    return RepertorioApi.removeMusica(igrejaId, ministerioId, id);
  }

  listSecoes(igrejaId: string, musicaId: string) {
    return RepertorioApi.listSecoes(igrejaId, musicaId);
  }

  createSecao(igrejaId: string, musicaId: string, dto: CreateRepertorioMusicaSecaoDto) {
    return RepertorioApi.createSecao(igrejaId, musicaId, dto);
  }

  updateSecao(igrejaId: string, musicaId: string, secaoId: string, dto: UpdateRepertorioMusicaSecaoDto) {
    return RepertorioApi.updateSecao(igrejaId, musicaId, secaoId, dto);
  }

  removeSecao(igrejaId: string, musicaId: string, secaoId: string) {
    return RepertorioApi.removeSecao(igrejaId, musicaId, secaoId);
  }

  getArranjo(igrejaId: string, musicaId: string) {
    return RepertorioApi.getArranjo(igrejaId, musicaId);
  }

  replaceArranjo(igrejaId: string, musicaId: string, dto: UpsertRepertorioMusicaArranjoDto) {
    return RepertorioApi.replaceArranjo(igrejaId, musicaId, dto);
  }
}

export const RepertorioRepository = new RepertorioRepositoryClass();
