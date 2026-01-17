import { CreateEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.create';
import { ResponseEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.response';
import { UpdateEscalaSubstituicaoDto } from '../dtos/Escala/escala-substituicao.update';
import { BaseApi } from './BaseApi';

class EscalaSubstituicoesApiClass extends BaseApi<
  ResponseEscalaSubstituicaoDto,
  CreateEscalaSubstituicaoDto,
  UpdateEscalaSubstituicaoDto
> {
  constructor() {
    super('escalas/substituicoes');
  }
}

export const EscalaSubstituicoesApi = new EscalaSubstituicoesApiClass();
