import {
  RegrasIndisponibilidadeMinisterioApi,
  ListarRegrasMinisterioResponse,
} from '../api/RegrasIndisponibilidadeMinisterioApi';
import { CreateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.create';
import { UpdateRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.update';

class RegrasIndisponibilidadeMinisterioRepositoryClass {
  listar(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
  ): Promise<ListarRegrasMinisterioResponse> {
    return RegrasIndisponibilidadeMinisterioApi.listar(igrejaId, ministerioId, voluntarioId);
  }

  criar(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
    dto: CreateRegraIndisponibilidadeVoluntarioDto,
  ) {
    return RegrasIndisponibilidadeMinisterioApi.criar(igrejaId, ministerioId, voluntarioId, dto);
  }

  atualizar(
    igrejaId: string,
    ministerioId: string,
    voluntarioId: string,
    id: string,
    dto: UpdateRegraIndisponibilidadeVoluntarioDto,
  ) {
    return RegrasIndisponibilidadeMinisterioApi.atualizar(
      igrejaId,
      ministerioId,
      voluntarioId,
      id,
      dto,
    );
  }

  remover(igrejaId: string, ministerioId: string, voluntarioId: string, id: string) {
    return RegrasIndisponibilidadeMinisterioApi.remover(igrejaId, ministerioId, voluntarioId, id);
  }
}

export const RegrasIndisponibilidadeMinisterioRepository =
  new RegrasIndisponibilidadeMinisterioRepositoryClass();
