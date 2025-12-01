import { EscalasApi, GerarEscalaDto } from '../api/EscalaApi';
import { Escala } from '../models/Escala';
import { BaseRepository } from './BaseRepository';

class EscalaRepositoryClass extends BaseRepository<Escala> {
  constructor() {
    super(EscalasApi);
  }

  async generate(data: GerarEscalaDto) {
    return EscalasApi.generate(data);
  }
}

export const EscalaRepository = new EscalaRepositoryClass();
