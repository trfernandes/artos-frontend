import { BaseApiModel, BaseModel, ModelSerializer } from './BaseModel';

export interface NotificacaoModel extends BaseModel {
  voluntario: string;
  tipo: NotificacaoTipoEnum;
  titulo: string;
  mensagem?: string;
  data?: Record<string, any> | null;
  lidaEm?: Date | null;
  criadaEm: Date;
}

export interface NotificacaoApiModel extends BaseApiModel {
  voluntario: string;
  tipo: NotificacaoTipoEnum;
  titulo: string;
  mensagem: string | null;
  data: Record<string, any> | null;
  lidaEm: Date | null;
  criadaEm: Date;
}

export const NotificacaoSerializer: ModelSerializer<NotificacaoModel, NotificacaoApiModel> = {
  fromApi: (apiModel: NotificacaoApiModel): NotificacaoModel => ({}),
  toApi: (model: Partial<NotificacaoModel>): NotificacaoApiModel => ({}),
};

export enum NotificacaoTipoEnum {
  EscalaLembrete = 'ESCALA_LEMBRETE',
  TesteLocal = 'TESTE_LOCAL',
}
