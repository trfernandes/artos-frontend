import { Escala } from '../models/Escala';
import { BaseApi } from './BaseApi';

class EscalasApiClass extends BaseApi<Escala> {
  constructor() {
    super('escalas');
  }
}

export const EscalasApi = new EscalasApiClass();
