import { Pressable, StyleSheet, View } from 'react-native';
import FancyCardIcon from '../../cards/Horizontal/FancyCardIcon';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';
import { formatInTimeZone } from 'date-fns-tz';
import { DefaultIconsNames } from '../../../constants/icons';
import { ResponseNotificacaoDto } from '../../../domain/dtos/Notificacao/notificacao.response';
import DateUtils from '../../../utils/date_utils';

export default function EscalaLembreteNotificacaoCard({
  data,
  onPress,
}: {
  data: ResponseNotificacaoDto;
  onPress?: (notification: ResponseNotificacaoDto) => void;
}) {
  const createdAt = data.criadaEm || data.createdAt;
  const timeLabel = createdAt ? DateUtils.timeAgoText(new Date(createdAt)) : '';

  const title = data.titulo?.trim() ? data.titulo : 'Lembrete de Escala';

  return (
    <Pressable
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      onPress={() => onPress?.(data)}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <FancyCardIcon
        cardIcon={{ library: 'MaterialCommunityIcons', name: 'message-text-clock-outline', size: 18 }}
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
          <FancyText type='medium' size='extraSmall' style={{ lineHeight: 13 }}>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 24,
  },
  pressed: {
    opacity: 0.85,
  },
});
