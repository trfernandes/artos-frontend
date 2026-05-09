import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../../../FancyText';
import DefaultIcons from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import {
  EscalaSubstituicaoStatusEnum,
  EscalaSubstituicaoStatusEnumLabel,
} from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { getFirstAndLastName } from '../../../../../utils/text_utils';

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  onApprove?: () => void;
  onReject?: () => void;
};

const STATUS_CONFIG: Record<EscalaSubstituicaoStatusEnum, { color: string; stripColor: string }> = {
  [EscalaSubstituicaoStatusEnum.Pendente]: { color: '#F59E0B', stripColor: '#F59E0B' },
  [EscalaSubstituicaoStatusEnum.Aprovada]: { color: '#16A34A', stripColor: '#16A34A' },
  [EscalaSubstituicaoStatusEnum.Recusada]: { color: '#DC2626', stripColor: '#DC2626' },
  [EscalaSubstituicaoStatusEnum.Cancelada]: { color: '#8D8D8D', stripColor: '#D1D5DB' },
};

function MiniAvatar({ nome }: { nome?: string }) {
  const initials = nome
    ? nome.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  const colorIndex = (nome?.charCodeAt(0) ?? 0) % colors.length;

  return (
    <View
      style={[
        styles.miniAvatar,
        {
          backgroundColor: ColorUtils.withAlpha(colors[colorIndex], 0.18),
          borderColor: ColorUtils.withAlpha(colors[colorIndex], 0.35),
        },
      ]}
    >
      <FancyText size={11} type='bold' color={colors[colorIndex]}>
        {initials}
      </FancyText>
    </View>
  );
}

export default function SubstituicaoRecebidaCard({ substituicao, onApprove, onReject }: Props) {
  const palette = usePallete();

  const statusConfig = STATUS_CONFIG[substituicao.status];
  const isPendente = substituicao.status === EscalaSubstituicaoStatusEnum.Pendente;
  const isCancelada = substituicao.status === EscalaSubstituicaoStatusEnum.Cancelada;

  const solicitanteNome = getFirstAndLastName(
    substituicao.solicitante?.voluntario?.nome ?? 'Solicitante',
  );
  const substitutoNome = getFirstAndLastName(
    substituicao.substituto?.voluntario?.nome ?? 'Substituto',
  );

  const dataOcorrencia = substituicao.escalaItem?.dataOcorrencia
    ? DateUtilsApi.dateOnlyFromApi(substituicao.escalaItem.dataOcorrencia as string)
    : null;

  const dataFormatted = dataOcorrencia
    ? format(dataOcorrencia, "EEE · dd MMM · HH'h'mm", { locale: ptBR })
    : '—';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderCard },
        palette.shadows[100],
      ]}
    >
      <View style={[styles.strip, { backgroundColor: statusConfig.stripColor }]} />

      <View style={styles.body}>
        {/* Trade row: Solicitante → Substituto + status chip */}
        <View style={styles.tradeRow}>
          <View style={styles.personBlock}>
            <MiniAvatar nome={substituicao.solicitante?.voluntario?.nome} />
            <View style={styles.personText}>
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                Solicitante
              </FancyText>
              <FancyText type='semiBold' size='small' numberOfLines={1}>
                {solicitanteNome}
              </FancyText>
            </View>
          </View>

          <DefaultIcons.Custom
            library='MaterialIcons'
            name='arrow-forward'
            size={16}
            color={palette.fonts.inactive}
          />

          <View style={styles.personBlock}>
            <MiniAvatar nome={substituicao.substituto?.voluntario?.nome} />
            <View style={styles.personText}>
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                Substituto
              </FancyText>
              <FancyText type='semiBold' size='small' numberOfLines={1}>
                {substitutoNome}
              </FancyText>
            </View>
          </View>

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: ColorUtils.withAlpha(statusConfig.color, 0.12),
                borderColor: ColorUtils.withAlpha(statusConfig.color, 0.3),
              },
            ]}
          >
            <FancyText size={10} type='semiBold' color={statusConfig.color}>
              {EscalaSubstituicaoStatusEnumLabel[substituicao.status]}
            </FancyText>
          </View>
        </View>

        {/* Evento */}
        <View style={[styles.eventBox, { backgroundColor: palette.backgroundColor2 }]}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            {dataFormatted}
          </FancyText>
          <FancyText type='semiBold' size='small' numberOfLines={1} style={styles.eventName}>
            {substituicao.escalaItem?.evento?.nome ?? '—'}
          </FancyText>
          {substituicao.escalaItem?.funcao?.nome ? (
            <View style={styles.funcaoRow}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='work-outline'
                size={11}
                color={palette.fonts.inactive}
              />
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                {substituicao.escalaItem.funcao.nome}
              </FancyText>
            </View>
          ) : null}
        </View>

        {/* Motivo */}
        {substituicao.motivo ? (
          <FancyText size='extraSmall' color={palette.fonts.inactive} style={styles.motivo}>
            "{substituicao.motivo}"
          </FancyText>
        ) : null}

        {/* Cancelamento */}
        {isCancelada && substituicao.motivoCancelamento ? (
          <View
            style={[
              styles.canceledBox,
              { backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08) },
            ]}
          >
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Cancelado: {substituicao.motivoCancelamento}
            </FancyText>
          </View>
        ) : null}

        {/* Ações: aprovar / recusar (só quando substituto e pendente) */}
        {isPendente && onApprove && onReject ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: ColorUtils.withAlpha(palette.error, 0.4),
                  backgroundColor: ColorUtils.withAlpha(palette.error, 0.06),
                },
              ]}
              onPress={onReject}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FancyText size='small' type='semiBold' color={palette.error}>
                Recusar
              </FancyText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: ColorUtils.withAlpha(palette.confirm, 0.4),
                  backgroundColor: ColorUtils.withAlpha(palette.confirm, 0.1),
                },
              ]}
              onPress={onApprove}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FancyText size='small' type='semiBold' color={palette.confirm}>
                Aprovar
              </FancyText>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  strip: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  personText: {
    flex: 1,
    minWidth: 0,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    flexShrink: 0,
  },
  eventBox: {
    borderRadius: 9,
    padding: 9,
    gap: 2,
  },
  eventName: {
    marginTop: 1,
  },
  funcaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  motivo: {
    fontStyle: 'italic',
    lineHeight: 17,
  },
  canceledBox: {
    borderRadius: 7,
    padding: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
