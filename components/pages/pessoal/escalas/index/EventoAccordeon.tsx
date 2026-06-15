import { View, StyleSheet, Modal } from 'react-native';
import { useMemo, useState } from 'react';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { router } from 'expo-router';
import FancyAccordeon from '../../../../FancyAccordeon';
import FancyText from '../../../../FancyText';
import FancyChips from '../../../../FancyChips';
import FancyButton from '../../../../buttons/FancyButton';
import FancyLoading from '../../../../FancyLoading';
import DefaultIcons from '../../../../FancyIcons';
import FuncoesTable from './FuncoesTable';
import { EscalaDoDiaAgrupada } from '../../../../../app/(app)/(drawer)/pessoal/escalas';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { ColorUtils } from '../../../../../utils/color_utils';
import {
  isLouvorMinisterioTipo,
  resolveEventoEnsaioInfo,
} from '../../../../../utils/evento-ensaio';
import { formatAppDateTime } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';

type EventoAccordeonProps = {
  data: EscalaDoDiaAgrupada;
  onConfirmButtonPress: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress: (dadosEscala: ResponseEscalaItemDto) => void;
};

export default function EventoAccordeon({
  data,
  onConfirmButtonPress,
  onSubButtonPress,
}: EventoAccordeonProps) {
  const palette = usePallete();
  const [isOpeningEvento, setIsOpeningEvento] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isDark = palette.backgroundColor === '#121212';
  const eventColor = data.evento?.cor || palette.primary;
  const isLouvor = useMemo(
    () =>
      isLouvorMinisterioTipo(data.ministerio?.tipo) ||
      data.itens.some(
        (item) =>
          isLouvorMinisterioTipo(item.voluntario?.ministerio?.tipo) ||
          isLouvorMinisterioTipo(item.escala?.ministerio?.tipo),
      ),
    [data.itens, data.ministerio?.tipo],
  );
  const ensaioInfo = useMemo(
    () =>
      resolveEventoEnsaioInfo({
        horarioEnsaio: data.horarioEnsaio,
        horarioEnsaioPadrao: data.evento?.horarioEnsaioPadrao,
        isLouvor,
        fallbackLabel: undefined,
      }),
    [data.horarioEnsaio, data.evento?.horarioEnsaioPadrao, isLouvor],
  );
  const showEnsaio = ensaioInfo.shouldShow;
  const ensaioText = ensaioInfo.label ?? 'A definir';

  const timeRangeText = useMemo(() => {
    if (!data.evento?.dataInicio || !data.evento?.dataTermino) {
      return 'Horário não definido';
    }

    const inicio = formatAppDateTime(data.evento.dataInicio, 'HH:mm');
    const termino = formatAppDateTime(data.evento.dataTermino, 'HH:mm');
    return inicio && termino ? `${inicio} - ${termino}` : 'Horário não definido';
  }, [data.evento?.dataInicio, data.evento?.dataTermino]);

  const countdownLabel = useMemo(() => {
    const diffDays = differenceInCalendarDays(
      startOfDay(data.dataOcorrencia),
      startOfDay(new Date()),
    );

    if (diffDays <= 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    return `Em ${diffDays}d`;
  }, [data.dataOcorrencia]);

  const hasSubstituicaoPendente = useMemo(
    () => data.itens.some((item) => item.status === EscalaItemStatusEnum.SubstituicaoSolicitada),
    [data.itens],
  );

  const eventName = data.evento?.nome || 'Evento';
  const ministryName = data.ministerio?.nome || '';

  const statusChip = hasSubstituicaoPendente
    ? { label: 'Pendente', color: palette.warning, dot: false }
    : { label: countdownLabel, color: eventColor, dot: countdownLabel === 'Hoje' };

  const metaPrimaryText = useMemo(() => {
    const totalFuncoes = data.itens.length;
    let suffix = '';
    if (totalFuncoes > 1) {
      suffix = `${totalFuncoes} funções`;
    } else if (totalFuncoes === 1 && data.itens[0]?.funcao?.nome) {
      suffix = data.itens[0].funcao.nome;
    }

    if (ministryName && suffix) return `${ministryName} · ${suffix}`;
    return ministryName || suffix;
  }, [ministryName, data.itens]);

  const ui = useMemo(() => {
    return {
      cardBg: isDark ? palette.backgroundColor2 : palette.backgroundColor,
      contentBg: isDark ? palette.backgroundColor2 : palette.backgroundColor,
      borderColor: ColorUtils.withAlpha(palette.borderCard ?? palette.border, isDark ? 0.5 : 0.9),
      dividerColor: ColorUtils.withAlpha(palette.borderCard ?? palette.border, isDark ? 0.5 : 0.85),
      shadowStyle: palette.shadows[300],
      titleColor: palette.fonts.dark,
      metaColor: palette.fonts.inactive,
      dateBg: ColorUtils.withAlpha(eventColor, 0.12),
    };
  }, [eventColor, isDark, palette]);

  const totalFuncoes = data.itens.length;
  const confirmadasCount = useMemo(
    () => data.itens.filter((item) => item.status === EscalaItemStatusEnum.Confirmado).length,
    [data.itens],
  );

  const navigateToEvento = () => {
    setIsOpeningEvento(true);

    requestAnimationFrame(() => {
      try {
        router.push({
          pathname: '/pessoal/escalas/evento',
          params: {
            evento: JSON.stringify(data.evento),
            dataOcorrencia: data.dataOcorrencia.toISOString(),
            horarioEnsaio: data.horarioEnsaio ?? '',
            ministerioNome: data.ministerio?.nome ?? '',
            ministerioId: data.ministerio?.id ?? '',
            responsavelSetlistVoluntarioId: data.responsavelSetlistVoluntarioId ?? '',
            responsavelSetlistNome: data.responsavelSetlistVoluntario?.nome ?? '',
          },
        });
      } finally {
        setTimeout(() => {
          setIsOpeningEvento(false);
        }, 450);
      }
    });
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={[styles.dateBox, { backgroundColor: ui.dateBg }]}>
        <FancyText type='bold' size={17} color={eventColor} numberOfLines={1} style={styles.dateDay}>
          {String(data.dataOcorrencia.getDate()).padStart(2, '0')}
        </FancyText>
        <FancyText type='medium' size={9} color={eventColor} numberOfLines={1} style={styles.dateMonth}>
          {data.dataOcorrencia.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
        </FancyText>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <FancyText
            size='small'
            type='semiBold'
            color={ui.titleColor}
            numberOfLines={1}
            style={styles.title}
          >
            {eventName}
          </FancyText>
          <FancyChips size='small' label={statusChip.label} color={statusChip.color} dot={statusChip.dot} />
        </View>

        <FancyText size='extraSmall' type='medium' color={ui.metaColor} numberOfLines={1} style={styles.subtitle}>
          {timeRangeText}
        </FancyText>

        {metaPrimaryText ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='account-group-outline'
                size={11}
                color={ui.metaColor}
              />
              <FancyText
                size='extraSmall'
                type='medium'
                color={ui.metaColor}
                numberOfLines={1}
                style={styles.metaText}
              >
                {metaPrimaryText}
              </FancyText>
            </View>
          </View>
        ) : null}

        {showEnsaio ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='music-note-eighth'
                size={11}
                color={ui.metaColor}
              />
              <FancyText
                size='extraSmall'
                type='medium'
                color={ui.metaColor}
                numberOfLines={1}
                style={styles.metaText}
              >
                {ensaioText}
              </FancyText>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.chevronArea}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={ui.metaColor}
        />
      </View>
    </View>
  );

  return (
    <FancyAccordeon
      expanded={isExpanded}
      onExpandedChange={setIsExpanded}
      title={renderHeader()}
      contentContainerStyle={[
        styles.contentContainer,
        {
          backgroundColor: ui.contentBg,
          borderTopColor: ui.dividerColor,
        },
      ]}
      headerContainerStyle={[
        styles.headerSurface,
        {
          backgroundColor: ui.cardBg,
          borderColor: ui.borderColor,
        },
      ]}
      headerExpandedContainerStyle={[
        styles.headerSurface,
        styles.headerSurfaceExpanded,
        {
          backgroundColor: ui.cardBg,
          borderColor: ui.borderColor,
          borderBottomColor: ui.dividerColor,
        },
      ]}
      containerContainerStyle={[
        styles.cardContainer,
        ui.shadowStyle,
        {
          backgroundColor: ui.cardBg,
          borderColor: ui.borderColor,
        },
      ]}
      containerExpandedContainerStyle={[
        styles.cardContainer,
        ui.shadowStyle,
        {
          backgroundColor: ui.cardBg,
          borderColor: ui.borderColor,
        },
      ]}
      hideChevron
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionEyebrow}>
          <View style={[styles.sectionEyebrowTick, { backgroundColor: eventColor }]} />
          <FancyText size='small' type='semiBold' color={eventColor}>
            Funções
          </FancyText>
        </View>
        <FancyText size='extraSmall' type='medium' color={ui.metaColor}>
          {confirmadasCount} de {totalFuncoes} confirmada{totalFuncoes === 1 ? '' : 's'}
        </FancyText>
      </View>

      <FuncoesTable
        data={data.itens}
        eventColor={eventColor}
        onConfirmButtonPress={onConfirmButtonPress}
        onSubButtonPress={onSubButtonPress}
      />

      <FancyButton
        type='outlined'
        label='Ver evento'
        icon={{ library: 'MaterialCommunityIcons', name: 'chevron-right', size: 16 }}
        iconPosition='right'
        onPress={navigateToEvento}
        containerStyle={styles.verEventoButton}
      />

      <Modal visible={isOpeningEvento} transparent animationType='none'>
        <View style={[styles.loadingOverlay, { backgroundColor: ColorUtils.withAlpha('#0F172A', isDark ? 0.44 : 0.18) }]}>
          <View
            style={[
              styles.loadingSurface,
              { backgroundColor: palette.backgroundColor4 },
              palette.shadows[200],
            ]}
          >
            <FancyLoading label='Abrindo evento...' containerStyle={styles.loadingContent} />
          </View>
        </View>
      </Modal>
    </FancyAccordeon>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    borderWidth: 0.5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  headerSurface: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingVertical: 0,
    borderBottomWidth: 0,
  },
  headerSurfaceExpanded: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dateDay: {
    lineHeight: 19,
    includeFontPadding: false,
  },
  dateMonth: {
    lineHeight: 11,
    includeFontPadding: false,
    letterSpacing: 0.4,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  title: {
    flex: 1,
    lineHeight: 17,
    includeFontPadding: false,
  },
  subtitle: {
    lineHeight: 15,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  metaText: {
    flexShrink: 1,
  },
  chevronArea: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 8,
  },
  sectionEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionEyebrowTick: {
    width: 3,
    height: 11,
    borderRadius: 2,
  },
  verEventoButton: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingSurface: {
    width: 220,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignSelf: 'center',
  },
  loadingContent: {
    flex: 0,
    backgroundColor: 'transparent',
    minHeight: 110,
  },
});
