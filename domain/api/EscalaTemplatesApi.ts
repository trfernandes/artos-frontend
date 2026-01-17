import { CreateEscalaTemplateDto } from '../dtos/EscalaTemplate/escala-template.create';
import { ResponseEscalaTemplateDto } from '../dtos/EscalaTemplate/escala-template.response';
import { UpdateEscalaTemplateDto } from '../dtos/EscalaTemplate/escala-template.update';
import { BaseApi } from './BaseApi';

class EscalaTemplatesApiClass extends BaseApi<ResponseEscalaTemplateDto, CreateEscalaTemplateDto, UpdateEscalaTemplateDto> {
  constructor() {
    super('escala-templates');
  }
}

export const EscalaTemplatesApi = new EscalaTemplatesApiClass();
