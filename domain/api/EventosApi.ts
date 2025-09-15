import { Evento } from '../models/Evento';
import { BaseApi } from './BaseApi';

class EventosApiClass extends BaseApi<Evento> {
  constructor() {
    super('eventos');
  }
}

export const EventosApi = new EventosApiClass();
