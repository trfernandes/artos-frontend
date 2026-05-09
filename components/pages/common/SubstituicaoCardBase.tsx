import React from 'react';
import { StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../FancyText';
import DefaultIcons from '../../FancyIcons';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import {
  EscalaSubstituicaoStatusEnum,
  EscalaSubstituicaoStatusEnumLabel,
} from '../../../domain/enums/Escala/escala-substituicao-status.enum';
import { ResponseEscalaSubstituicaoDto } from '../../../domain/dtos/Escala/escala-substituicao.response';
import { DateUtilsApi } from '../../../utils/date_utils';
import { getFirstAndLastName } from '../../../utils/text_utils';
import { ThemePalette } from '../../../constants/colors';

type IconLib = 'MaterialIcons';
type StatusVisual = { color: string; icon: string };

export function getStatusVisual(
  status: EscalaSubstituicaoStatusEnum,
  palette: ThemePalette,
): StatusVisual {
  switch (status) {
    case EscalaSubstituicaoStatusEnum.Pendente:
      return { color: palette.warning, icon: 'schedule' };
    case EscalaSubstituicaoStatusEnum.Aprovada:
      return { color: palette.confirm, icon: 'check-circle' };
    case EscalaSubstituicaoStatusEnum.Recusada:
      return { color: palette.error, icon: 'cancel' };
    case EscalaSubstituicaoStatusEnum.Cancelada:
      return { color: palette.fonts.inactive, icon: 'cancel' };
  }
}

function MiniAvatar({ nome, palette }: { nome?: string; palette: ThemePalette }) {
  const initials = nome
    ? nome
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';
  const tone = palette.primary;
  return (
    <View
      style={[
        styles.miniAvatar,
        {
          backgroundColor: ColorUtils.withAlpha(tone, 0.15),
          borderColor: ColorUtils.withAlpha(tone, 0.3),
        },
      ]}
    >
      <FancyText size={12} type='bold' color={tone}>
        {initials}
      </FancyText>
    </View>
  );
}

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  footer?: React.ReactNode;
};

export default function SubstituicaoCardBase({ substituicao, footer }: Props) {
  const palette = usePallete();
  const visual = getStatusVisual(substituicao.status, palette);
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
    ? format(dataOcorrencia, "dd MMM · HH'h'mm", { locale: ptBR })
    : '—';

  const headerBg = ColorUtils.withAlpha(visual.color, 0.1);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderCard },
        palette.shadows[100],
      ]}
    >
      {/* Header tonal */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          <DefaultIcons.Custom
            library={'MaterialIcons' as IconLib}
            name={visual.icon}
            size={16}
            color={visual.color}
          />
          <FancyText size='small' type='semiBold' color={visual.color}>
            {EscalaSubstituicaoStatusEnumLabel[substituicao.status]}
          </FancyText>
        </View>
        <FancyText size='extraSmall' color={visual.color}>
          {dataFormatted}
        </FancyText>
      </View>

      {/* Corpo */}
      <View style={styles.body}>
        {/* Evento */}
        <View>
          <FancyText type='semiBold' size='medium' numberOfLines={2}>
            {substituicao.escalaItem?.evento?.nome ?? '—'}
          </FancyText>
          {substituicao.escalaItem?.funcao?.nome ? (
            <View style={styles.funcaoRow}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='work-outline'
                size={12}
                color={palette.fonts.inactive}
              />
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                {substituicao.escalaItem.funcao.nome}
              </FancyText>
            </View>
          ) : null}
        </View>

        {/* Linha de troca */}
        <View
          style={[
            styles.tradeRow,
            {
              backgroundColor: palette.backgroundColor2,
              borderColor: palette.borderCard,
            },
          ]}
        >
          <View style={styles.personBlock}>
            <MiniAvatar nome={substituicao.solicitante?.voluntario?.nome} palette={palette} />
            <View style={styles.personText}>
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                Solicitante
              </FancyText>
              <FancyText type='semiBold' size='small' numberOfLines={1}>
                {solicitanteNome}
              </FancyText>
            </View>
          </View>

          <View style={styles.arrowWrap}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='arrow-forward'
              size={16}
              color={palette.fonts.inactive}
            />
          </View>

          <View style={styles.personBlock}>
            <MiniAvatar nome={substituicao.substituto?.voluntario?.nome} palette={palette} />
            <View style={styles.personText}>
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                Substituto
              </FancyText>
              <FancyText type='semiBold' size='small' numberOfLines={1}>
                {substitutoNome}
              </FancyText>
            </View>
          </View>
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

        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  body: {
    padding: 14,
    gap: 12,
  },
  funcaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  personBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  personText: {
    flex: 1,
    minWidth: 0,
  },
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  motivo: {
    fontStyle: 'italic',
    lineHeight: 17,
  },
  canceledBox: {
    borderRadius: 8,
    padding: 9,
  },
});
