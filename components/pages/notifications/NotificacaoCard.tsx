import { View } from 'react-native';
import FancyCardIcon from '../../cards/Horizontal/FancyCardIcon';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';
import { DefaultIconsNames } from '../../../constants/icons';
import { ResponseNotificacaoDto } from '../../../domain/dtos/Notificacao/notificacao.response';
import { NotificacaoTipoEnum } from '../../../domain/enums/Notificacao/tipo-notificacao.enum';
import { CustomIconProps } from '../../FancyIcons';
import DateUtils from '../../../utils/date_utils';

const NOTIFICACAO_ICONS: Partial<Record<NotificacaoTipoEnum, CustomIconProps>> = {
  [NotificacaoTipoEnum.EscalaPublicada]: { library: 'MaterialCommunityIcons', name: 'calendar-check', size: 18 },
  [NotificacaoTipoEnum.EscalaAlterada]: { library: 'MaterialCommunityIcons', name: 'calendar-edit', size: 18 },
  [NotificacaoTipoEnum.EscalaCancelada]: { library: 'MaterialCommunityIcons', name: 'calendar-remove', size: 18 },
  [NotificacaoTipoEnum.EscalaConfirmacaoPendente]: { library: 'MaterialCommunityIcons', name: 'calendar-clock', size: 18 },
  [NotificacaoTipoEnum.EscalaSubstituicaoSolicitada]: { library: 'MaterialCommunityIcons', name: 'account-switch', size: 18 },
  [NotificacaoTipoEnum.EscalaSubstituicaoAceita]: { library: 'MaterialCommunityIcons', name: 'account-check', size: 18 },
  [NotificacaoTipoEnum.EscalaSubstituicaoRecusada]: { library: 'MaterialCommunityIcons', name: 'account-cancel', size: 18 },
  [NotificacaoTipoEnum.EscalaVoluntarioConfirmou]: { library: 'MaterialCommunityIcons', name: 'check-circle-outline', size: 18 },
  [NotificacaoTipoEnum.EscalaVoluntarioRecusou]: { library: 'MaterialCommunityIcons', name: 'close-circle-outline', size: 18 },
  [NotificacaoTipoEnum.EscalaSubstituicaoSolicitadaLider]: { library: 'MaterialCommunityIcons', name: 'account-switch-outline', size: 18 },
  [NotificacaoTipoEnum.EscalaSubstituicaoResolvidaLider]: { library: 'MaterialCommunityIcons', name: 'account-check-outline', size: 18 },
  [NotificacaoTipoEnum.MinisterioNovoIntegrante]: { library: 'MaterialCommunityIcons', name: 'account-plus', size: 18 },
  [NotificacaoTipoEnum.IndisponibilidadeConflito]: { library: 'MaterialCommunityIcons', name: 'alert-circle-outline', size: 18 },
  [NotificacaoTipoEnum.IgrejaVinculoAprovado]: { library: 'MaterialCommunityIcons', name: 'church', size: 18 },
  [NotificacaoTipoEnum.IgrejaVinculoNegado]: { library: 'MaterialCommunityIcons', name: 'church', size: 18 },
  [NotificacaoTipoEnum.IgrejaVinculoSolicitado]: { library: 'MaterialCommunityIcons', name: 'account-clock', size: 18 },
  [NotificacaoTipoEnum.IgrejaConviteAceito]: { library: 'MaterialCommunityIcons', name: 'handshake', size: 18 },
  [NotificacaoTipoEnum.IgrejaNovoVoluntario]: { library: 'MaterialCommunityIcons', name: 'account-plus-outline', size: 18 },
  [NotificacaoTipoEnum.IgrejaConviteExpirado]: { library: 'MaterialCommunityIcons', name: 'timer-sand-complete', size: 18 },
};

const DEFAULT_ICON: CustomIconProps = { library: 'MaterialCommunityIcons', name: 'bell-outline', size: 18 };

export default function NotificacaoCard({ data }: { data: ResponseNotificacaoDto }) {
  const createdAt = data.criadaEm || data.createdAt;
  const timeLabel = createdAt ? DateUtils.timeAgoText(new Date(createdAt)) : '';

  const title = data.titulo?.trim() ? data.titulo : 'Notificação';

  return (
    <FancyCardIcon
      cardIcon={data.tipo ? NOTIFICACAO_ICONS[data.tipo] ?? DEFAULT_ICON : DEFAULT_ICON}
      title={
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
          <FancyText size='small' type='bold' numberOfLines={1} style={{ flex: 1, opacity: 0.8 }}>
            {title}
          </FancyText>
          <FancyText
            size='extraSmall'
            type='semiBold'
            numberOfLines={1}
            style={{ opacity: 0.8 }}
            color={Pallete.fonts.inactive}
          >
            {timeLabel}
          </FancyText>
        </View>
      }
      subtitle={
        data.mensagem ? (
          <FancyText type='medium' size='extraSmall' style={{ lineHeight: 13 }} numberOfLines={2}>
            {data.mensagem}
          </FancyText>
        ) : null
      }
      actionButtons={[
        {
          icon: { ...DefaultIconsNames['chevron-right'], size: 18 },
          size: 'small',
        },
      ]}
    />
  );
}
