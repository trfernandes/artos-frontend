import { MinisterioVoluntarioFuncao } from "../models/MinisterioVoluntarioFuncao";
import { BaseApi } from "./BaseApi";

export const apiName = 'ministerio-voluntario-funcoes';

class MinisterioVoluntarioFuncoesApiClass extends BaseApi<MinisterioVoluntarioFuncao> {
  constructor() {
    super(apiName);
  }
}

export const MinisterioVoluntarioFuncoesApi = new MinisterioVoluntarioFuncoesApiClass();
