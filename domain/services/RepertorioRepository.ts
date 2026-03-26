import { RepertorioApi } from '../api/RepertorioApi';
import { CreateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.create';
import { UpdateRepertorioCategoriaDto } from '../dtos/Repertorio/repertorio-categoria.update';
import { CreateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.create';
import { UpdateRepertorioMusicaDto } from '../dtos/Repertorio/repertorio-musica.update';
import { DynamicQuery } from '../utils/query_utils';

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
}

export const RepertorioRepository = new RepertorioRepositoryClass();
