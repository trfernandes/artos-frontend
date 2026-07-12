import { EscalasApi } from '../api/EscalaApi';
import { CreateEscalaDto } from '../dtos/Escala/escala.create';
import { ResponseEscalaValidarNomeDto } from '../dtos/Escala/escala-validar-nome.response';
import { EscalaParametrizacaoType, ResponseEscalaDto } from '../dtos/Escala/escala.response';
import { BaseRepository } from './BaseRepository';

class EscalaRepositoryClass extends BaseRepository<ResponseEscalaDto, CreateEscalaDto, any> {
  constructor() {
    super(EscalasApi);
  }

  async generate(data: CreateEscalaDto): Promise<ResponseEscalaDto> {
    return EscalasApi.generate(data);
  }

  async regenerate(escalaId: string): Promise<ResponseEscalaDto> {
    return EscalasApi.regenerate(escalaId);
  }

  async deleteItensByEvento(
    escalaId: string,
    igrejaId: string,
    payload: { eventoId: string; dataOcorrencia: string },
  ): Promise<void> {
    return EscalasApi.deleteItensByEvento(escalaId, igrejaId, payload);
  }

  getParametrizacao(escalaId: string): Promise<EscalaParametrizacaoType> {
    return EscalasApi.getParametrizacao(escalaId);
  }

  getAuditoria(escalaId: string): Promise<any> {
    return EscalasApi.getAuditoria(escalaId);
  }

  validarNome(
    igrejaId: string,
    ministerioId: string,
    nome: string,
    excludeEscalaId?: string,
  ): Promise<ResponseEscalaValidarNomeDto> {
    return EscalasApi.validarNome(igrejaId, ministerioId, nome, excludeEscalaId);
  }
}

export const EscalaRepository = new EscalaRepositoryClass();
