import { EventosApi } from '../api/EventosApi';
import { Evento } from '../models/Evento';
import { BaseRepository } from './BaseRepository';

class EventosRepositoryClass extends BaseRepository<Evento> {
  constructor() {
    super(EventosApi);
  }
}

export const EventosRepository = new EventosRepositoryClass();
