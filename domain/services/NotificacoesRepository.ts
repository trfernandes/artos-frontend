import { NotificacoesApi } from '../api/NotificacoesApi';
import { NotificacaoApiModel, NotificacaoModel, NotificacaoSerializer } from '../models/Notificacao';
import { BaseRepository } from './BaseRepository';

class NotificacoesRepositoryClass extends BaseRepository<NotificacaoModel, NotificacaoApiModel> {
  constructor() {
    super(NotificacoesApi, { fromApi: NotificacaoSerializer.fromApi, toApi: NotificacaoSerializer.toApi });
  }
}

export const NotificacoesRepository = new NotificacoesRepositoryClass();
