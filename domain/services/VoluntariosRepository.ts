import { VoluntariosApi } from '../api/VoluntariosApi';
import { VoluntarioApiModel, VoluntarioModel, VoluntarioSerializer } from '../models/Voluntario';
import { DynamicQuery } from '../utils/query_utils';
import { BaseRepository } from './BaseRepository';

class VoluntariosRepositoryClass extends BaseRepository<VoluntarioModel, VoluntarioApiModel> {
  constructor() {
    super(VoluntariosApi, { fromApi: VoluntarioSerializer.fromApi, toApi: VoluntarioSerializer.toApi });
  }

  async update(id: string, data: Partial<VoluntarioModel>): Promise<VoluntarioModel> {
    const dataApi = this.serializer.toApi(data);
    const result = await VoluntariosApi.update(id, dataApi, data.uploadFoto);
    return this.serializer.fromApi(result);
  }

  async search(query: DynamicQuery): Promise<VoluntarioModel[]> {
    console.log(`VoluntariosRepository.search - query:`, query);
    return await super.search(query);
  }
}

export const VoluntariosRepository = new VoluntariosRepositoryClass();
