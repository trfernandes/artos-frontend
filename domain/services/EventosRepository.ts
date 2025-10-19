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
    const formatDate = (value: Date | string) => (value instanceof Date ? value.toISOString() : value);

    return EventosApi.buscarPorIntervalo({
      dataInicio: formatDate(params.dataInicio),
      dataTermino: formatDate(params.dataTermino),
    });
  }
}

export const EventosRepository = new EventosRepositoryClass();
