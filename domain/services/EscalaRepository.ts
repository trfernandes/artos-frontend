import { EscalasApi, GerarEscalaDto } from '../api/EscalaApi';
import { EscalaApiModel, EscalaModel, EscalaSerializer } from '../models/Escala';
import { BaseRepository } from './BaseRepository';

class EscalaRepositoryClass extends BaseRepository<EscalaModel, EscalaApiModel> {
  constructor() {
    super(EscalasApi, { fromApi: EscalaSerializer.fromApi, toApi: EscalaSerializer.toApi });
  }

  async generate(data: GerarEscalaDto) {
    return EscalasApi.generate(data);
  }
}

export const EscalaRepository = new EscalaRepositoryClass();
