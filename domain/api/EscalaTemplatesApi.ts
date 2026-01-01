import { BaseApi } from './BaseApi';
import { EscalaTemplateApiModel } from '../models/EscalaTemplate';

class EscalaTemplatesApiClass extends BaseApi<EscalaTemplateApiModel> {
  constructor() {
    super('escala-templates');
  }
}

export const EscalaTemplatesApi = new EscalaTemplatesApiClass();
