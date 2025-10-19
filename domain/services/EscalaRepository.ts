import { EscalasApi } from '../api/EscalaApi';
import { Escala } from '../models/Escala';
import { BaseRepository } from './BaseRepository';

class EscalaRepositoryClass extends BaseRepository<Escala> {
  constructor() {
    super(EscalasApi);
  }
}

export const EscalaRepository = new EscalaRepositoryClass();
