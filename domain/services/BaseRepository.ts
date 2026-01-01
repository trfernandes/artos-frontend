import { strfyObj } from '../../utils/text_utils';
import { BaseApi } from '../api/BaseApi';
import { BaseApiModel, BaseModel } from '../models/BaseModel';
import { DynamicQuery } from '../utils/query_utils';

export abstract class BaseRepository<TModel extends BaseModel, TApiModel extends BaseApiModel> {
    private api: BaseApi<TApiModel>;

    constructor(api: BaseApi<TApiModel>, protected readonly serializer: { fromApi(apiModel: TApiModel): TModel; toApi(model: Partial<TModel>): TApiModel }) {
        this.api = api;
    }

    async getAll(query?: any): Promise<TModel[]> {
        const result = await this.api.getAll(query);
        return result.map((item) => this.serializer.fromApi(item));
    }

    async getById(id: string): Promise<TModel | null> {
        const result = await this.api.getById(id);
        return result ? this.serializer.fromApi(result) : null;
    }

    async search(query: DynamicQuery): Promise<TModel[]> {
        try {
            const result = await this.api.search(query);
            //   console.log('----> 1');
            const serialized = result.map((item) => this.serializer.fromApi(item));
            //   console.log(`\n=>[BaseRepository.search]\n=> QUERY: ${strfyObj(query)}\n=>RESULT: ${strfyObj(result)}\n=> SERIALIZED: ${strfyObj(serialized)}\n`);
            return serialized;
        } catch (e) {
            console.log('Erro método search BaseRepository:', e);
            throw e;
        }
    }

    async add(data: TModel): Promise<TModel> {
        const dataApi = this.serializer.toApi(data);
        const result = await this.api.create(dataApi);
        return this.serializer.fromApi(result);
    }

    async update(id: string, data: Partial<TModel>): Promise<TModel> {
        console.log('Updating in BaseRepository with data:', strfyObj({ data, id }));
        const dataApi = this.serializer.toApi({ ...data, id });
        console.log('Data converted to API model:', strfyObj(dataApi));
        const result = await this.api.update(id, dataApi);
        console.log('Result from API after update:', strfyObj(result));
        return this.serializer.fromApi({ ...result, id });
    }

    async remove(id: string): Promise<void> {
        return this.api.delete(id);
    }
}
