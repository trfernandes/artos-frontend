export interface BaseModel {
  id?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface BaseApiModel {
  id?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export type ModelSerializer<M extends BaseModel, A extends BaseApiModel> = {
  fromApi: (apiModel: A) => M;
  toApi: (model: Partial<M>) => A;
};
