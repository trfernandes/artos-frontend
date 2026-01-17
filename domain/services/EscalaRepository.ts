import { EscalasApi } from '../api/EscalaApi';
import { CreateEscalaDto } from '../dtos/Escala/escala.create';
import { ResponseEscalaDto } from '../dtos/Escala/escala.response';
import { BaseRepository } from './BaseRepository';

class EscalaRepositoryClass extends BaseRepository<ResponseEscalaDto, CreateEscalaDto, any> {
  constructor() {
    super(EscalasApi);
  }

  async generate(data: CreateEscalaDto): Promise<ResponseEscalaDto> {
    return EscalasApi.generate(data);
  }
}

export const EscalaRepository = new EscalaRepositoryClass();
