import { NotificacoesApi } from '../api/NotificacoesApi';
import { ResponseNotificacaoDto } from '../dtos/Notificacao/notificacao.response';
import { BaseRepository } from './BaseRepository';

class NotificacoesRepositoryClass extends BaseRepository<ResponseNotificacaoDto, any, any> {
  constructor() {
    super(NotificacoesApi);
  }
}

export const NotificacoesRepository = new NotificacoesRepositoryClass();
