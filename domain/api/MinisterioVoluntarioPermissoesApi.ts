import { MinisterioVoluntarioPermissao } from "../models/MinisterioVoluntarioPermissao";
import { BaseApi } from "./BaseApi";

class MinisterioVoluntarioPermissoesApiClass extends BaseApi<MinisterioVoluntarioPermissao> {
  constructor() {
    super('ministerio-voluntario-permissoes');
  }
}

export const MinisterioVoluntarioPermissoesApi = new MinisterioVoluntarioPermissoesApiClass();
