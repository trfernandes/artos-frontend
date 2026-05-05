import { EscalaTemplatesApi } from '../api/EscalaTemplatesApi';
import { CreateEscalaTemplateDto } from '../dtos/EscalaTemplate/escala-template.create';
import { ResponseEscalaTemplateDto } from '../dtos/EscalaTemplate/escala-template.response';
import { UpdateEscalaTemplateDto } from '../dtos/EscalaTemplate/escala-template.update';
import { BaseRepository } from './BaseRepository';

class EscalaTemplatesRepositoryClass extends BaseRepository<
  ResponseEscalaTemplateDto,
  CreateEscalaTemplateDto,
  UpdateEscalaTemplateDto
> {
  constructor() {
    super(EscalaTemplatesApi);
  }

  add(data: CreateEscalaTemplateDto): Promise<ResponseEscalaTemplateDto> {
    return EscalaTemplatesApi.create(data);
  }

  update(id: string, data: UpdateEscalaTemplateDto): Promise<ResponseEscalaTemplateDto> {
    return EscalaTemplatesApi.update(id, data);
  }
}

export const EscalaTemplatesRepository = new EscalaTemplatesRepositoryClass();
