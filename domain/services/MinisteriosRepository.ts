import { MinisteriosApi } from '../api/MinisteriosApi';
import { CreateMinisterioDto } from '../dtos/Ministerio/ministerio.create';
import { ResponseMinisterioDto } from '../dtos/Ministerio/ministerio.response';
import { UpdateMinisterioDto } from '../dtos/Ministerio/ministerio.update';
import { BaseRepository } from './BaseRepository';

class MinisteriosRepositoryClass extends BaseRepository<
  ResponseMinisterioDto,
  CreateMinisterioDto,
  UpdateMinisterioDto
> {
  constructor() {
    super(MinisteriosApi);
  }
}

export const MinisteriosRepository = new MinisteriosRepositoryClass();
