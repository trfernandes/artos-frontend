import { Voluntario } from "../models/Voluntario";
import { BaseApi } from "./BaseApi";

class VoluntariosApiClass extends BaseApi<Voluntario> {
  constructor() {
    super('voluntarios');
  }
}

export const VoluntariosApi = new VoluntariosApiClass();
