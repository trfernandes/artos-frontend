import { BaseApi } from './BaseApi';
import { EscalaTemplate } from '../models/EscalaTemplate';

class EscalaTemplatesApiClass extends BaseApi<EscalaTemplate> {
  constructor() {
    super('escala-templates');
  }

  create(data: EscalaTemplate): Promise<EscalaTemplate> {
    return super.create(data as any);
  }

  update(id: string, data: EscalaTemplate): Promise<EscalaTemplate> {
    return super.update(id, data);
  }
}

export const EscalaTemplatesApi = new EscalaTemplatesApiClass();
