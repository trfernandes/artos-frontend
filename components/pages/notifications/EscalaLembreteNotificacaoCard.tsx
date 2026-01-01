import { View } from 'react-native';
import { NotificacaoModel } from '../../../domain/models/Notificacao';
import FancyCardIcon from '../../cards/Horizontal/FancyCardIcon';
import FancyText from '../../FancyText';
import { format } from 'date-fns';
import { Pallete } from '../../../constants/colors';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { DefaultIconsNames } from '../../../constants/icons';

export default function EscalaLembreteNotificacaoCard({ data }: { data: NotificacaoModel }) {
  return (
    <FancyCardIcon
      cardIcon={{ library: 'MaterialCommunityIcons', name: 'message-text-clock-outline', size: 18 }}
      title={
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
          <FancyText size="small" type="bold">
            Lembrete de Escala -
          </FancyText>
          <FancyText size="extraSmall" type="semiBold" style={{ opacity: 0.8 }} color={Pallete.fonts.inactive}>
            {data.createdAt ? format(toZonedTime(new Date(data.createdAt), 'America/Sao_Paulo'), 'HH:mm') : ''}
          </FancyText>
        </View>
      }
      subtitle={
        <FancyText type="medium" size="extraSmall" style={{ lineHeight: 13 }}>
          {`Você está escalado amanhã às "${formatInTimeZone(data.data?.dataOcorrencia, 'America/Sao_Paulo', 'HH:mm')}" no evento: "${
            data.data?.eventoNome
          }" como "${data.data?.funcaoNome}".`}
        </FancyText>
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
