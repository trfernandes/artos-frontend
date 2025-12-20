import { NotificacoesApi } from '../api/NotificacoesApi';
import { Notificacao } from '../models/Notificacao';
import { BaseRepository } from './BaseRepository';

class NotificacoesRepositoryClass extends BaseRepository<Notificacao> {
  constructor() {
    super(NotificacoesApi);
  }
}

export const NotificacoesRepository = new NotificacoesRepositoryClass();
