import { endOfDay, format } from 'date-fns';
import { EventosApi } from '../api/EventosApi';
import { Evento } from '../models/Evento';
import { BaseRepository } from './BaseRepository';

export interface EventosIntervaloParams {
  dataInicio: Date | string;
  dataTermino: Date | string;
}

class EventosRepositoryClass extends BaseRepository<Evento> {
  constructor() {
    super(EventosApi);
  }

  async buscarPorIntervalo(params: EventosIntervaloParams): Promise<Evento[]> {

    return EventosApi.buscarPorIntervalo({
      dataInicio: format(params.dataInicio, "yyyy-MM-dd'T'HH:mm:ss"),
      dataTermino: format(endOfDay(params.dataTermino), "yyyy-MM-dd'T'HH:mm:ss"),
    });
  }
}

export const EventosRepository = new EventosRepositoryClass();
