import { EscalaSubstituicoesApi } from '../api/EscalaSubstituicoesApi';
import { CreateEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.create';
import { ResponseEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.response';
import { UpdateEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.update';

import { BaseRepository } from './BaseRepository';

class EscalaSubstituicoesRepositoryClass extends BaseRepository<
  ResponseEscalaSubstituicaoDto,
  CreateEscalaSubstituicaoDto,
  UpdateEscalaSubstituicaoDto
> {
  constructor() {
    super(EscalaSubstituicoesApi);
  }
}

export const EscalaSubstituicoesRepository = new EscalaSubstituicoesRepositoryClass();
