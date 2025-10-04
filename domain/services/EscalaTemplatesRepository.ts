import { EscalaTemplatesApi } from '../api/EscalaTemplatesApi';
import { BaseRepository } from './BaseRepository';
import { EscalaTemplate } from '../models/EscalaTemplate';

class EscalaTemplatesRepositoryClass extends BaseRepository<EscalaTemplate> {
  constructor() {
    super(EscalaTemplatesApi);
  }

  add(data: EscalaTemplate): Promise<EscalaTemplate> {
    return EscalaTemplatesApi.create(data);
  }

  update(id: string, data: EscalaTemplate): Promise<EscalaTemplate> {
    return EscalaTemplatesApi.update(id, data);
  }
}

export const EscalaTemplatesRepository = new EscalaTemplatesRepositoryClass();
