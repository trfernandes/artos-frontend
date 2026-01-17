import { NotificacaoTipoEnum as TipoNotificacaoEnum } from '../../enums/Notificacao/tipo-notificacao.enum';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';

export type ResponseNotificacaoDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  voluntarioId?: string;
  voluntario?: ResponseVoluntarioDto;
  tipo: TipoNotificacaoEnum;
  titulo: string;
  mensagem?: string;
  data?: Record<string, any>;
  criadaEm: string;
  lidaEm?: string;
};
