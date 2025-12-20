import { Notificacao } from '../models/Notificacao';
import apiClient from './api-client';

class NotificaoesApiClass {
  async listar(apenasNaoLidas = false): Promise<Notificacao[]> {
    const res = await apiClient.get('/notificacoes', {
      params: { apenasNaoLidas },
    });
    return res.data.data;
  }

  async marcarComoLido(id: string): Promise<void> {
    await apiClient.patch(`/notificacoes/${id}/lida`);
  }

  async marcarTodasComoLidas(): Promise<void> {
    await apiClient.patch('/notificacoes/lidas');
  }

  async contarNaoLidas(): Promise<number> {
    const res = await apiClient.get('/notificacoes/nao-lidas/count');
    return res.data.data.count || 0;
  }
}

export const NotificacoesApi = new NotificaoesApiClass();
