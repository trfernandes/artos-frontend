import { EscalaTemplatesApi } from '../api/EscalaTemplatesApi';
import { BaseRepository } from './BaseRepository';
import { EscalaTemplateApiModel, EscalaTemplateModel, EscalaTemplateSerializer } from '../models/EscalaTemplate';

class EscalaTemplatesRepositoryClass extends BaseRepository<EscalaTemplateModel, EscalaTemplateApiModel> {
  constructor() {
    super(EscalaTemplatesApi, { fromApi: EscalaTemplateSerializer.fromApi, toApi: EscalaTemplateSerializer.toApi });
  }

  async add(data: EscalaTemplateModel): Promise<EscalaTemplateModel> {
    const apiData = this.serializer.toApi(data);
    const result = await EscalaTemplatesApi.create(apiData);
    return this.serializer.fromApi(result);
  }

  async update(id: string, data: EscalaTemplateModel): Promise<EscalaTemplateModel> {
    const apiData = this.serializer.toApi(data);
    const result = await EscalaTemplatesApi.update(id, apiData);
    return this.serializer.fromApi(result);
  }
}

export const EscalaTemplatesRepository = new EscalaTemplatesRepositoryClass();
