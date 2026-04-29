import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useMemo, useState } from 'react';
import { differenceInCalendarDays, format, startOfDay } from 'date-fns';
import { router } from 'expo-router';
import FancyAccordeon from '../../../../FancyAccordeon';
import FancyText from '../../../../FancyText';
import FancyLoading from '../../../../FancyLoading';
import DefaultIcons from '../../../../FancyIcons';
import FuncoesTable from './FuncoesTable';
import EventoCardContent from '../../../../cards/EventoCardContent';
import { EscalaDoDiaAgrupada } from '../../../../../app/(app)/(drawer)/pessoal/escalas';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { Pallete } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import { isLouvorMinisterioTipo, resolveEventoEnsaioInfo } from '../../../../../utils/evento-ensaio';
import {
  BOLD_FONT,
  SMALL_SIZE_FONT,
  EXTRA_SMALL_SIZE_FONT,
  MEDIUM_SIZE_FONT,
  LARGE_MEDIUM_SIZE_FONT,
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
  const [isOpeningEvento, setIsOpeningEvento] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const eventColor = data.evento?.cor || Pallete.primary;
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
        fallbackLabel: 'Horário de ensaio a definir',
      }),
    [data.horarioEnsaio, data.evento?.horarioEnsaioPadrao, isLouvor],
  );
  const showEnsaio = ensaioInfo.shouldShow;

  const timeRangeText = useMemo(() => {
    if (!data.evento?.dataInicio || !data.evento?.dataTermino) {
      return 'Horario nao definido';
    }

    return `${format(data.evento.dataInicio, 'HH:mm')} - ${format(
      data.evento.dataTermino,
      'HH:mm',
    )}`;
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

  const ensaioText = ensaioInfo.label ?? 'Horário de ensaio a definir';

  const eventName = data.evento?.nome || 'Evento';
  const ministryName = data.ministerio?.nome || '';

  const ui = useMemo(() => {
    const accentText = ColorUtils.darkenColor(eventColor, 0.32);

    return {
      cardBg:
        variant === 'compactAgenda'
          ? ColorUtils.lightenColor(eventColor, 0.918)
          : ColorUtils.lightenColor(eventColor, variant === 'editorialClean' ? 0.932 : 0.925),
      borderColor: ColorUtils.withAlpha(eventColor, variant === 'editorialClean' ? 0.1 : 0.14),
      shadowStyle: variant === 'minimalPremium' ? Pallete.shadows[200] : Pallete.shadows[100],
      titleColor: Pallete.fonts.dark,
      metaColor: Pallete.fonts.inactive,
      accentText,
      accentSoft: ColorUtils.withAlpha(eventColor, 0.065),
      accentMid: ColorUtils.withAlpha(eventColor, 0.11),
      accentStrong: ColorUtils.withAlpha(eventColor, 0.18),
      subtleText: ColorUtils.darkenColor(eventColor, 0.18),
      chipBg: ColorUtils.withAlpha(eventColor, variant === 'compactAgenda' ? 0.11 : 0.1),
      chipBorder: ColorUtils.withAlpha(eventColor, 0.11),
      iconBg: ColorUtils.withAlpha(eventColor, 0.075),
    };
  }, [eventColor, variant]);

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
          <View style={styles.compactMetaItem}>
            <View style={[styles.compactMetaDot, { backgroundColor: eventColor }]} />
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
              name='music-note-eighth'
              size={11}
              color={ui.accentText}
            />
            <FancyText
              size='extraSmall'
              type='medium'
              style={[styles.compactMetaSecondary, { color: ui.accentText }]}
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
    <EventoCardContent
      timeRangeText={timeRangeText}
      countdownLabel={countdownLabel}
      title={eventName}
      eventColor={eventColor}
      metaPrimary={ministryName || undefined}
      metaSecondary={showEnsaio ? ensaioText : undefined}
      isAccordion
      isExpanded={isExpanded}
    />
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
      contentContainerStyle={styles.contentContainer}
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
          backgroundColor: '#FFFFFF',
          borderColor: ui.borderColor,
        },
      ]}
      hideChevron
    >
      <FuncoesTable
        data={data.itens}
        onConfirmButtonPress={onConfirmButtonPress}
        onSubButtonPress={onSubButtonPress}
        variant='rowCompactPremium'
      />

      <TouchableOpacity onPress={navigateToEvento} style={styles.detailsLinkContainer}>
        <View style={styles.detailsLinkDivider} />
        <View style={styles.detailsLinkRow}>
          <View style={styles.detailsLinkCopy}>
            <FancyText size='extraSmall' type='semiBold' style={styles.detailsLinkEyebrow}>
              Evento
            </FancyText>
            <FancyText size='small' type='semiBold' style={styles.detailsLinkTitle}>
              Ver detalhes completos
            </FancyText>
          </View>

          <View style={styles.detailsLinkIcon}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='arrow-top-right'
              size={14}
              color={Pallete.fonts.link}
            />
          </View>
        </View>
      </TouchableOpacity>

      <Modal visible={isOpeningEvento} transparent animationType='fade'>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingSurface}>
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
    paddingBottom: 6,
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
    paddingBottom: 4,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
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
    gap: 7,
    minWidth: 0,
    flexWrap: 'nowrap',
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
  detailsLinkContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 10,
  },
  detailsLinkDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ColorUtils.withAlpha(Pallete.fonts.inactive, 0.18),
  },
  detailsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailsLinkCopy: {
    flex: 1,
    gap: 2,
  },
  detailsLinkEyebrow: {
    color: Pallete.fonts.inactive,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  detailsLinkTitle: {
    color: Pallete.fonts.link,
    fontFamily: BOLD_FONT,
    fontSize: SMALL_SIZE_FONT,
    lineHeight: MEDIUM_SIZE_FONT + 1,
  },
  detailsLinkIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.08),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingSurface: {
    width: '100%',
    maxWidth: 220,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    ...Pallete.shadows[200],
  },
  loadingContent: {
    flex: 0,
    backgroundColor: 'transparent',
    minHeight: 110,
  },
});
