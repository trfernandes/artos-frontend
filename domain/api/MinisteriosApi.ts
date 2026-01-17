import { CreateMinisterioDto } from '../dtos/Ministerio/ministerio.create';
import { ResponseMinisterioDto } from '../dtos/Ministerio/ministerio.response';
import { UpdateMinisterioDto } from '../dtos/Ministerio/ministerio.update';
import { BaseApi } from './BaseApi';

class MinisteriosApiClass extends BaseApi<ResponseMinisterioDto, CreateMinisterioDto, UpdateMinisterioDto> {
  constructor() {
    super('ministerios');
  }
}

export const MinisteriosApi = new MinisteriosApiClass();
