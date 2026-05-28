import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { useMemo, useState } from 'react';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { router } from 'expo-router';
import FancyAccordeon from '../../../../FancyAccordeon';
import FancyText from '../../../../FancyText';
import FancyLoading from '../../../../FancyLoading';
import DefaultIcons from '../../../../FancyIcons';
import FuncoesTable from './FuncoesTable';
import { EscalaDoDiaAgrupada } from '../../../../../app/(app)/(drawer)/pessoal/escalas';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { ColorUtils } from '../../../../../utils/color_utils';
import { isLouvorMinisterioTipo, resolveEventoEnsaioInfo } from '../../../../../utils/evento-ensaio';
import { formatAppDateTime } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import {
  BOLD_FONT,
  SMALL_SIZE_FONT,
  EXTRA_SMALL_SIZE_FONT,
  MEDIUM_SIZE_FONT,
  LARGE_MEDIUM_SIZE_FONT,
  LARGE_SIZE_FONT,
} from '../../../../../constants/font';

type EventoAccordeonVariant = 'minimalPremium' | 'editorialClean' | 'compactAgenda';

type EventoAccordeonProps = {
  data: EscalaDoDiaAgrupada;
  onConfirmButtonPress: (dadosEscala: ResponseEscalaItemDto) => void;
  onSubButtonPress: (dadosEscala: ResponseEscalaItemDto) => void;
  variant?: EventoAccordeonVariant;
};

export default function EventoAccordeon({
  data,
  onConfirmButtonPress,
  onSubButtonPress,
  variant = 'compactAgenda',
}: EventoAccordeonProps) {
  const palette = usePallete();
  const [isOpeningEvento, setIsOpeningEvento] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isDark = palette.backgroundColor === '#121212';
  const eventColor = data.evento?.cor || palette.primary;
  const isLouvor = useMemo(
    () =>
      isLouvorMinisterioTipo(data.ministerio?.tipo)
      || data.itens.some(
        (item) =>
          isLouvorMinisterioTipo(item.voluntario?.ministerio?.tipo)
          || isLouvorMinisterioTipo(item.escala?.ministerio?.tipo),
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

  const timeRangeText = useMemo(() => {
    if (!data.evento?.dataInicio || !data.evento?.dataTermino) {
      return 'Horario nao definido';
    }

    const inicio = formatAppDateTime(data.evento.dataInicio, 'HH:mm');
    const termino = formatAppDateTime(data.evento.dataTermino, 'HH:mm');
    return inicio && termino ? `${inicio} - ${termino}` : 'Horario nao definido';
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

  const ensaioText = ensaioInfo.label ?? 'A definir';
  const isEnsaioFallback = showEnsaio && !ensaioInfo.label;

  const hasSubstituicaoPendente = useMemo(
    () => data.itens.some((item) => item.status === EscalaItemStatusEnum.SubstituicaoSolicitada),
    [data.itens],
  );

  const eventName = data.evento?.nome || 'Evento';
  const ministryName = data.ministerio?.nome || '';

  const ui = useMemo(() => {
    const accentText = isDark
      ? ColorUtils.lightenColor(eventColor, 0.2)
      : ColorUtils.darkenColor(eventColor, 0.3);
    const neutralSurface = palette.backgroundColor4;
    const expandedSurface = isDark ? palette.backgroundColor3 : palette.backgroundColor2;

    return {
      cardBg:
        isDark
          ? neutralSurface
          : ColorUtils.lightenColor(eventColor, variant === 'editorialClean' ? 0.932 : 0.925),
      contentBg: expandedSurface,
      borderColor: ColorUtils.withAlpha(eventColor, isDark ? 0.34 : 0.2),
      expandedBorderColor: ColorUtils.withAlpha(eventColor, isDark ? 0.4 : 0.24),
      dividerColor: ColorUtils.withAlpha(isDark ? palette.borderCard : eventColor, isDark ? 0.45 : 0.18),
      shadowStyle: variant === 'minimalPremium' ? palette.shadows[200] : palette.shadows[100],
      titleColor: palette.fonts.dark,
      metaColor: palette.fonts.inactive,
      accentText,
      accentSoft: ColorUtils.withAlpha(eventColor, isDark ? 0.14 : 0.065),
      accentMid: ColorUtils.withAlpha(eventColor, isDark ? 0.18 : 0.11),
      accentStrong: ColorUtils.withAlpha(eventColor, isDark ? 0.24 : 0.18),
      subtleText: accentText,
      chipBg: ColorUtils.withAlpha(eventColor, isDark ? 0.16 : 0.1),
      chipBorder: ColorUtils.withAlpha(eventColor, isDark ? 0.28 : 0.12),
      iconBg: ColorUtils.withAlpha(eventColor, isDark ? 0.16 : 0.075),
      linkText: isDark ? ColorUtils.lightenColor(palette.primary, 0.16) : palette.fonts.link,
      linkIconBg: ColorUtils.withAlpha(palette.primary, isDark ? 0.18 : 0.08),
      loadingBg: ColorUtils.withAlpha('#0F172A', isDark ? 0.44 : 0.18),
      loadingSurface: palette.backgroundColor4,
    };
  }, [eventColor, isDark, palette, variant]);

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

  const renderExpandButton = (editorial = false) => (
    <View
      style={[
        styles.expandButton,
        editorial ? styles.expandButtonEditorial : null,
        { backgroundColor: editorial ? 'transparent' : ui.iconBg },
      ]}
    >
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={editorial ? 17 : 16}
        color={ui.accentText}
      />
    </View>
  );

  const renderStatus = (ghost = false) => (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: ghost ? 'transparent' : ui.chipBg,
          borderColor: ghost ? 'transparent' : ui.chipBorder,
        },
      ]}
    >
      <FancyText
        size='extraSmall'
        type='semiBold'
        style={[
          styles.statusBadgeText,
          ghost ? styles.statusBadgeGhostText : null,
          { color: ui.accentText },
        ]}
      >
        {countdownLabel}
      </FancyText>
    </View>
  );

  const renderMinistryTag = (ghost = false) => {
    if (!ministryName) return null;

    return (
      <View
        style={[
          styles.ministryTag,
          ghost
            ? styles.ministryTagGhost
            : {
                backgroundColor: ui.accentSoft,
                borderColor: ui.chipBorder,
              },
        ]}
      >
        <View style={[styles.ministryTagDot, { backgroundColor: eventColor }]} />
        <FancyText
          size='extraSmall'
          type='semiBold'
          style={[styles.ministryTagText, { color: ui.accentText }]}
          numberOfLines={1}
        >
          {ministryName}
        </FancyText>
      </View>
    );
  };

  const renderEnsaioInline = (muted = false) => {
    if (!showEnsaio) return null;

    return (
      <View style={styles.inlineInfoRow}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='music-note-eighth'
          size={12}
          color={muted ? ui.metaColor : ui.accentText}
        />
        <FancyText
          size='extraSmall'
          type='medium'
          style={[styles.inlineInfoText, { color: muted ? ui.metaColor : ui.subtleText }]}
          numberOfLines={1}
        >
          {ensaioText}
        </FancyText>
      </View>
    );
  };

  const renderCompactMetaLine = () => {
    if (!ministryName && !showEnsaio) return null;

    return (
      <View style={styles.compactMetaLine}>
        {!!ministryName ? (
          <View style={[styles.compactMetaItem, { flexShrink: 0 }]}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='account-group-outline'
              size={11}
              color={ui.accentText}
            />
            <FancyText
              size='extraSmall'
              type='semiBold'
              style={[styles.compactMetaPrimary, { color: ui.accentText }]}
              numberOfLines={1}
            >
              {ministryName}
            </FancyText>
          </View>
        ) : null}

        {!!ministryName && showEnsaio ? (
          <View style={[styles.compactMetaSeparator, { backgroundColor: ui.metaColor }]} />
        ) : null}

        {showEnsaio ? (
          <View style={styles.compactMetaItem}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name={isEnsaioFallback ? 'clock-alert-outline' : 'clock-outline'}
              size={isEnsaioFallback ? 10 : 11}
              color={isEnsaioFallback ? ui.metaColor : ui.accentText}
            />
            <FancyText
              size='extraSmall'
              type='medium'
              style={[
                styles.compactMetaSecondary,
                isEnsaioFallback
                  ? { color: ui.metaColor, fontSize: EXTRA_SMALL_SIZE_FONT - 1 }
                  : { color: ui.accentText },
              ]}
              numberOfLines={1}
            >
              {ensaioText}
            </FancyText>
          </View>
        ) : null}

      </View>
    );
  };

  const renderMinimalPremium = () => (
    <View style={styles.variantRoot}>
      <View style={styles.rowBetween}>
        <View style={styles.inlineMetaRow}>
          <View style={[styles.inlineMetaDot, { backgroundColor: eventColor }]} />
          <FancyText
            size='small'
            type='semiBold'
            style={[styles.eyebrowTime, { color: ui.accentText }]}
          >
            {timeRangeText}
          </FancyText>
        </View>
        <View style={styles.rowInline}>
          {renderStatus()}
          {renderExpandButton()}
        </View>
      </View>

      <FancyText
        size='medium'
        type='bold'
        style={[styles.heroTitle, { color: ui.titleColor }]}
        numberOfLines={1}
      >
        {eventName}
      </FancyText>

      {renderCompactMetaLine()}
    </View>
  );

  const renderEditorialClean = () => (
    <View style={styles.variantRoot}>
      <View style={styles.rowBetween}>
        <FancyText
          size='small'
          type='semiBold'
          style={[styles.editorialTime, { color: ui.metaColor }]}
          numberOfLines={1}
        >
          {timeRangeText}
        </FancyText>

        <View style={styles.rowInline}>
          {renderStatus(true)}
          {renderExpandButton(true)}
        </View>
      </View>

      <FancyText
        size='medium'
        type='bold'
        style={[styles.editorialTitle, { color: ui.titleColor }]}
        numberOfLines={2}
      >
        {eventName}
      </FancyText>

      <View style={styles.editorialMetaBlock}>
        {!!ministryName ? (
          <FancyText
            size='extraSmall'
            type='semiBold'
            style={[styles.editorialMetaLabel, { color: ui.accentText }]}
            numberOfLines={1}
          >
            {ministryName}
          </FancyText>
        ) : null}

        {renderEnsaioInline(true)}
      </View>
    </View>
  );

  const renderCompactAgenda = () => (
    <View style={styles.compactHeaderShell}>
      {/* Barra lateral de cor do evento */}
      <View style={[styles.compactAccentRail, { backgroundColor: eventColor }]} />

      {/* Área de navegação: Pressable consome o toque → não dispara o toggle do acordeão */}
      <Pressable
        onPress={navigateToEvento}
        style={styles.compactNavArea}
        android_ripple={{ color: ColorUtils.withAlpha(eventColor, 0.1) }}
      >
        {/* Linha 1: 🕐 HH:MM-HH:MM  [chip Em Xd] */}
        <View style={styles.compactRow1}>
          <View style={styles.compactTimeRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='clock-outline'
              size={12}
              color={ui.accentText}
            />
            <FancyText
              size='small'
              type='semiBold'
              style={[styles.compactTimeText, { color: ui.accentText }]}
              numberOfLines={1}
            >
              {timeRangeText}
            </FancyText>
          </View>
          {hasSubstituicaoPendente ? (
            <View
              style={[
                styles.compactPendingChip,
                { backgroundColor: ColorUtils.darkenColor(palette.warning, 0.28) },
              ]}
            >
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='swap-horiz'
                size={11}
                color={palette.icons.light}
              />
              <FancyText
                size='extraSmall'
                type='semiBold'
                style={[styles.compactPendingChipText, { color: palette.fonts.light }]}
              >
                Pendente
              </FancyText>
            </View>
          ) : (
            <View style={[styles.compactCountdownBadge, { backgroundColor: ui.chipBg, borderColor: ui.chipBorder }]}>
              <FancyText size='extraSmall' type='semiBold' style={[styles.compactCountdownText, { color: ui.accentText }]}>
                {countdownLabel}
              </FancyText>
            </View>
          )}
        </View>

        {/* Linha 2: Nome do evento */}
        <FancyText
          size='medium'
          type='bold'
          style={[styles.compactTitleText, { color: ui.titleColor }]}
          numberOfLines={1}
        >
          {eventName}
        </FancyText>

        {/* Linha 3: • Ministério  ·  ♪ ensaio */}
        {renderCompactMetaLine()}
      </Pressable>

      {/* Chevron: View pura sem background — o toque sobe ao TouchableOpacity do FancyAccordeon → toggle */}
      <View style={styles.compactChevronArea}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={ui.accentText}
        />
      </View>
    </View>
  );

  const renderHeader = () => {
    if (variant === 'editorialClean') return renderEditorialClean();
    if (variant === 'compactAgenda') return renderCompactAgenda();
    return renderMinimalPremium();
  };

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
        styles.cardContainerExpanded,
        {
          backgroundColor: ui.contentBg,
          borderColor: ui.expandedBorderColor,
        },
      ]}
      hideChevron
    >
      {/* Cabeçalho de seção — orienta o voluntário sobre o que está vendo */}
      <View style={styles.sectionHeader}>
        <FancyText
          size='extraSmall'
          type='semiBold'
          style={[styles.sectionEyebrow, { color: ui.accentText }]}
        >
          SUAS FUNÇÕES NESTE EVENTO
        </FancyText>
        <FancyText
          size='extraSmall'
          type='normal'
          style={[styles.sectionSubtitle, { color: ui.metaColor }]}
        >
          Confirme sua participação abaixo
        </FancyText>
      </View>

      <FuncoesTable
        data={data.itens}
        onConfirmButtonPress={onConfirmButtonPress}
        onSubButtonPress={onSubButtonPress}
        variant='rowCompactPremium'
      />

      <Modal visible={isOpeningEvento} transparent animationType='none'>
        <View style={[styles.loadingOverlay, { backgroundColor: ui.loadingBg }]}>
          <View style={[styles.loadingSurface, { backgroundColor: ui.loadingSurface }, palette.shadows[200]]}>
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
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardContainerExpanded: {
    borderRadius: 18,
    borderWidth: 1,
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
    borderBottomWidth: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 14,
    borderWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  compactHeaderShell: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 84,
  },
  compactAccentRail: {
    width: 4,
    marginVertical: 10,
    marginLeft: 12,
    borderRadius: 999,
    opacity: 0.9,
  },
  compactNavArea: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  compactRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  compactTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    minWidth: 0,
  },
  compactTimeText: {
    fontFamily: BOLD_FONT,
    lineHeight: SMALL_SIZE_FONT + 1,
    letterSpacing: 0.15,
    flexShrink: 1,
  },
  compactCountdownBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  compactCountdownText: {
    lineHeight: EXTRA_SMALL_SIZE_FONT - 1,
    fontSize: EXTRA_SMALL_SIZE_FONT - 2,
  },
  compactTitleText: {
    fontFamily: BOLD_FONT,
    fontSize: MEDIUM_SIZE_FONT,
    lineHeight: MEDIUM_SIZE_FONT + 1,
    letterSpacing: -0.1,
  },
  compactChevronArea: {
    width: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
    marginRight: 8,
  },
  compactPendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  compactPendingChipText: {
    lineHeight: EXTRA_SMALL_SIZE_FONT - 1,
    fontSize: EXTRA_SMALL_SIZE_FONT - 2,
  },
  variantRoot: {
    flex: 1,
    minWidth: 0,
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  variantRootCompact: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    minWidth: 0,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  inlineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  inlineMetaDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    flexShrink: 0,
  },
  eyebrowTime: {
    lineHeight: SMALL_SIZE_FONT + 1,
    letterSpacing: 0.2,
  },
  heroTitle: {
    lineHeight: LARGE_MEDIUM_SIZE_FONT + 2,
    letterSpacing: -0.15,
  },
  ministryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    minHeight: 24,
    maxWidth: '62%',
  },
  ministryTagGhost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    minHeight: 20,
  },
  ministryTagDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  ministryTagText: {
    lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
    flexShrink: 1,
  },
  inlineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  inlineInfoText: {
    lineHeight: EXTRA_SMALL_SIZE_FONT + 3,
    flex: 1,
  },
  editorialTime: {
    lineHeight: SMALL_SIZE_FONT + 1,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  editorialTitle: {
    lineHeight: LARGE_MEDIUM_SIZE_FONT + 3,
    letterSpacing: -0.25,
  },
  editorialMetaBlock: {
    gap: 6,
  },
  editorialMetaLabel: {
    lineHeight: EXTRA_SMALL_SIZE_FONT + 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactTime: {
    lineHeight: SMALL_SIZE_FONT + 1,
    letterSpacing: 0.15,
    fontFamily: BOLD_FONT,
  },
  compactTitle: {
    lineHeight: LARGE_MEDIUM_SIZE_FONT + 1,
    letterSpacing: -0.1,
    marginTop: -1,
  },
  compactMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
    flexWrap: 'wrap',
    marginTop: 1,
  },
  compactMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
    flexShrink: 1,
  },
  compactMetaDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    flexShrink: 0,
  },
  compactMetaPrimary: {
    lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
    flexShrink: 1,
  },
  compactMetaSeparator: {
    width: 3,
    height: 3,
    borderRadius: 99,
    opacity: 0.5,
    flexShrink: 0,
  },
  compactMetaSecondary: {
    lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
    flexShrink: 1,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
    minHeight: 20,
    justifyContent: 'center',
    marginRight: 0,
  },
  statusBadgeText: {
    lineHeight: EXTRA_SMALL_SIZE_FONT,
  },
  statusBadgeGhostText: {
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  expandButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 0,
  },
  expandButtonEditorial: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 6,
    gap: 2,
  },
  sectionEyebrow: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    lineHeight: EXTRA_SMALL_SIZE_FONT + 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
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
