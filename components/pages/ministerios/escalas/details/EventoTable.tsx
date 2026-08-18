import { View, StyleSheet, Modal } from 'react-native';
import { format } from 'date-fns';
import { ThemePalette } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyAccordeon from '../../../../FancyAccordeon';
import FancyText from '../../../../FancyText';
import ListaVoluntariosTable from './ListaVoluntariosTable';
import DefaultIcons from '../../../../FancyIcons';
import { FancyAlert } from '../../../../modal/FancyAlert';
import {
  EscalaItemDataType,
  EscalaItemEquipeType as EscalaItemEquipeType,
} from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import ScaleFillIndicator from '../../../../indicators/ScaleFillIndicator';
import SubstituirVoluntarioModal, { SubstituicaoConfirmDialog } from './SubstituirVoluntarioModal';
import AdicionarVoluntarioModal, {
  AdicionarVoluntarioConfirmDialog,
} from './AdicionarVoluntarioModal';
import AdicionarFuncaoModal, { AdicionarFuncaoConfirmDialog } from './AdicionarFuncaoModal';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { useAppTheme } from '../../../../../hooks/useAppTheme';
import FancyLoading from '../../../../FancyLoading';
import FancyButton from '../../../../buttons/FancyButton';
import FancyBottomSheetSelect, {
  FancyBottomSheetSelectRef,
} from '../../../../fields/FancyBottomSheetSelect';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import FancyImage from '../../../../images/FancyImage';

export interface EventoTableProps {
  data: EscalaItemDataType;
  viewMode?: 'view' | 'edit';
  ministerioId: string;
  escalaId: string;
  onChangeVoluntario?: (data: SubstituicaoConfirmDialog) => Promise<boolean>;
  onAddVoluntario?: (data: AdicionarVoluntarioConfirmDialog) => Promise<boolean>;
  onRemoveVoluntario?: (idEscalaItem: string) => Promise<boolean>;
  onDeleteEvento?: (eventoId: string, dataOcorrencia: string) => Promise<boolean>;
  onAdicionarFuncao?: (data: AdicionarFuncaoConfirmDialog) => Promise<boolean>;
  onExcluirFuncao?: (funcaoId: string, eventoId: string, dataOcorrencia: string) => Promise<void>;
  canEditSetlistOwner?: boolean;
  isUpdatingSetlistOwner?: boolean;
  onUpdateResponsavelSetlist?: (data: {
    eventoId: string;
    dataOcorrencia: string;
    responsavelVoluntarioId: string | null;
  }) => Promise<boolean>;
}

export default function EventoTable({
  data,
  viewMode,
  ministerioId,
  escalaId: _escalaId,
  onChangeVoluntario,
  onAddVoluntario,
  onRemoveVoluntario,
  onDeleteEvento,
  onAdicionarFuncao,
  onExcluirFuncao,
  canEditSetlistOwner,
  isUpdatingSetlistOwner,
  onUpdateResponsavelSetlist,
}: EventoTableProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useAppTheme();

  const [substituicaoModalProps, setSubstituicaoModalProps] = useState<{
    isOpen: boolean;
    data?: EscalaItemEquipeType;
  }>({
    isOpen: false,
  });
  const [adicionarModalProps, setAdicionarModalProps] = useState<{
    isOpen: boolean;
    data?: EscalaItemEquipeType;
  }>({
    isOpen: false,
  });
  const [adicionarFuncaoModalOpen, setAdicionarFuncaoModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<{ visible: boolean; label: string }>({
    visible: false,
    label: '',
  });
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);
  const [isAccordionPending, setIsAccordionPending] = useState(false);
  const openFrameRef = useRef<number | null>(null);
  const clearPendingFrameRef = useRef<number | null>(null);
  const responsavelSelectRef = useRef<FancyBottomSheetSelectRef>(null);
  const [responsavelSetlistValue, setResponsavelSetlistValue] = useState(
    data.responsavelSetlistVoluntarioId ?? '',
  );

  useEffect(() => {
    setResponsavelSetlistValue(data.responsavelSetlistVoluntarioId ?? '');
  }, [data.responsavelSetlistVoluntarioId]);

  useEffect(() => {
    return () => {
      if (openFrameRef.current !== null) {
        cancelAnimationFrame(openFrameRef.current);
      }
      if (clearPendingFrameRef.current !== null) {
        cancelAnimationFrame(clearPendingFrameRef.current);
      }
    };
  }, []);

  const hasEventPassed = useMemo(() => {
    if (data.dataHoraInicioOcorrencia) {
      const endAt = data.dataHoraTerminoOcorrencia ?? data.dataHoraInicioOcorrencia;
      return endAt.getTime() < Date.now();
    }

    const occurrenceDate = DateUtilsApi.dateOnlyFromApi(data.dataOcorrencia);
    const endAt = new Date(occurrenceDate);
    const startHour = data.evento.dataInicio?.getHours?.() ?? 0;
    const startMinute = data.evento.dataInicio?.getMinutes?.() ?? 0;
    const endHour = data.evento.dataTermino?.getHours?.() ?? 0;
    const endMinute = data.evento.dataTermino?.getMinutes?.() ?? 0;

    endAt.setHours(endHour, endMinute, 0, 0);

    const crossesMidnight =
      endHour < startHour || (endHour === startHour && endMinute <= startMinute);

    if (crossesMidnight) {
      endAt.setDate(endAt.getDate() + 1);
    }

    return endAt.getTime() < Date.now();
  }, [
    data.dataOcorrencia,
    data.dataHoraInicioOcorrencia,
    data.dataHoraTerminoOcorrencia,
    data.evento.dataInicio,
    data.evento.dataTermino,
  ]);

  const {
    borderColor,
    expandableIconColor,
    headerBackgroundColor,
    headerExpandedBackgroundColor,
    headerGradientColors,
    headerExpandedGradientColors,
  } = useMemo(() => {
    const baseAccentColor = data.evento.cor || palette.primary;
    const accentHsl = ColorUtils.hexToHsl(baseAccentColor);
    const accentColor =
      hasEventPassed && accentHsl
        ? ColorUtils.hslToHex(
            accentHsl[0],
            Math.max(10, Math.round(accentHsl[1] * 0.26)),
            Math.min(88, accentHsl[2] + 6),
          )
        : baseAccentColor;
    const darkStart = isDark
      ? ColorUtils.withAlpha(accentColor, 0.32)
      : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.74 : 0.62);
    const midStart = isDark
      ? ColorUtils.withAlpha(accentColor, 0.26)
      : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.81 : 0.72);
    const mid = isDark
      ? ColorUtils.withAlpha(accentColor, 0.22)
      : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.84 : 0.76);
    const midEnd = isDark
      ? ColorUtils.withAlpha(accentColor, 0.18)
      : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.87 : 0.8);
    const lightEnd = isDark
      ? ColorUtils.withAlpha(accentColor, 0.16)
      : ColorUtils.lightenColor(accentColor, hasEventPassed ? 0.9 : 0.84);

    return {
      borderColor: accentColor,
      expandableIconColor:
        ColorUtils.getTextColorForBackground(accentColor) === '#FFFFFF'
          ? palette.fonts.light
          : ColorUtils.darkenColor(accentColor, 0.25),
      headerBackgroundColor: lightEnd,
      headerExpandedBackgroundColor: lightEnd,
      headerGradientColors: [lightEnd, midEnd, mid, midStart, darkStart],
      headerExpandedGradientColors: [lightEnd, midEnd, mid, midStart, darkStart],
    };
  }, [data.evento.cor, hasEventPassed, isDark, palette.primary, palette.fonts.light]);

  const eventMetaColor = hasEventPassed
    ? ColorUtils.withAlpha(palette.fonts.dark, 0.52)
    : ColorUtils.withAlpha(palette.fonts.dark, 0.7);
  const eventTitleColor = hasEventPassed
    ? ColorUtils.withAlpha(palette.fonts.dark, 0.76)
    : palette.fonts.dark;
  const canEditSetlistOwnerHere = Boolean(canEditSetlistOwner && !hasEventPassed);

  const { eventConfirmed, eventTotal } = useMemo(() => {
    const assigned = data.equipe.filter((item) => Boolean(item.voluntario));
    const confirmed = assigned.filter(
      (item) => item.status === EscalaItemStatusEnum.Confirmado,
    ).length;
    return { eventConfirmed: confirmed, eventTotal: assigned.length };
  }, [data.equipe]);

  const eventProgressColor = hasEventPassed
    ? ColorUtils.withAlpha(ColorUtils.darkenColor(borderColor, 0.08), 0.7)
    : ColorUtils.darkenColor(data.evento.cor || palette.primary, 0.25);
  const responsavelSetlistOptions = useMemo<DropDownItemProps<string>[]>(
    () => [
      { title: 'Nenhum', value: '' },
      ...data.equipe
        .filter((item) => item.voluntario?.voluntarioId)
        .map((item) => ({
          title: item.voluntario?.nome || 'Voluntário',
          subtitle: item.funcao?.nome || '',
          value: item.voluntario?.voluntarioId || '',
        }))
        .filter(
          (item, index, array) =>
            item.value && array.findIndex((entry) => entry.value === item.value) === index,
        )
        .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })),
    ],
    [data.equipe],
  );
  const hasResponsavelSetlist = Boolean(responsavelSetlistValue);
  const responsavelSetlistNome = useMemo(
    () =>
      data.equipe.find((item) => item.voluntario?.voluntarioId === responsavelSetlistValue)
        ?.voluntario?.nome ?? 'Não definido',
    [data.equipe, responsavelSetlistValue],
  );
  const responsavelSetlistFoto = useMemo(() => {
    const voluntario = data.equipe.find(
      (item) => item.voluntario?.voluntarioId === responsavelSetlistValue,
    )?.voluntario;

    return voluntario?.fotoThumbUrl || voluntario?.fotoUrl || undefined;
  }, [data.equipe, responsavelSetlistValue]);

  const eventSubtitle: ReactNode | undefined =
    eventTotal > 0 ? (
      <ScaleFillIndicator
        filledCount={eventConfirmed}
        totalCount={eventTotal}
        label=''
        showContainer={false}
        size='compact'
        donutSize={14}
        donutStrokeWidth={2.2}
        textSize={11}
        progressColor={eventProgressColor}
      />
    ) : undefined;

  const handleDeleteEvento = () => {
    FancyAlert.alert('Excluir Evento', 'Deseja realmente excluir este evento da escala?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoadingAction({ visible: true, label: 'Excluindo evento...' });
            await onDeleteEvento?.(data.evento.id, data.dataOcorrencia);
          } finally {
            setLoadingAction({ visible: false, label: '' });
          }
        },
      },
    ]);
  };

  const handleSelectResponsavelSetlist = useCallback(
    (value: string) => {
      const nextValue = String(value || '');
      const previousValue = responsavelSetlistValue;
      setResponsavelSetlistValue(nextValue);

      void (async () => {
        setLoadingAction({ visible: true, label: 'Salvando responsável...' });
        const ok =
          (await onUpdateResponsavelSetlist?.({
            eventoId: data.evento.id,
            dataOcorrencia: data.dataOcorrencia,
            responsavelVoluntarioId: nextValue || null,
          })) ?? false;

        if (!ok) {
          setResponsavelSetlistValue(previousValue);
        }
        setLoadingAction({ visible: false, label: '' });
      })();
    },
    [data.dataOcorrencia, data.evento.id, onUpdateResponsavelSetlist, responsavelSetlistValue],
  );

  const handleClearResponsavelSetlist = useCallback(() => {
    FancyAlert.alert('Limpar responsável', 'Deseja remover quem define o setlist deste evento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: () => handleSelectResponsavelSetlist(''),
      },
    ]);
  }, [handleSelectResponsavelSetlist]);

  const handleAccordionChange = useCallback(
    (expanded: boolean) => {
      if (isAccordionPending) return;

      if (openFrameRef.current !== null) {
        cancelAnimationFrame(openFrameRef.current);
      }
      if (clearPendingFrameRef.current !== null) {
        cancelAnimationFrame(clearPendingFrameRef.current);
      }

      setIsAccordionPending(true);
      openFrameRef.current = requestAnimationFrame(() => {
        setIsAccordionExpanded(expanded);
        clearPendingFrameRef.current = requestAnimationFrame(() => {
          setIsAccordionPending(false);
        });
      });
    },
    [isAccordionPending],
  );

  return (
    <>
      <FancyAccordeon
        expanded={isAccordionExpanded}
        onExpandedChange={handleAccordionChange}
        isLoading={isAccordionPending}
        subtitle={eventSubtitle}
        title={
          <View style={styles.titleContainer}>
            <View style={styles.titleTextContainer}>
              <FancyText type='bold' size='extraSmall' color={eventTitleColor} numberOfLines={1}>
                {data.evento.nome}
              </FancyText>

              <View style={styles.headerMetaRow}>
                <View style={styles.metaGroup}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='event'
                    size={11}
                    color={eventMetaColor}
                  />
                  <FancyText type='semiBold' size='extraSmall' color={eventMetaColor}>
                    {format(data.dataOcorrencia, 'dd/MM/yyyy')}
                  </FancyText>
                </View>
                <View style={styles.metaGroup}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='access-time'
                    size={11}
                    color={eventMetaColor}
                  />
                  <FancyText type='semiBold' size='extraSmall' color={eventMetaColor}>{`${format(
                    data.dataHoraInicioOcorrencia ?? data.evento.dataInicio!,
                    'HH:mm',
                  )} - ${format(
                    data.dataHoraTerminoOcorrencia ?? data.evento.dataTermino!,
                    'HH:mm',
                  )}`}</FancyText>
                </View>
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        headerContainerStyle={[styles.headerContainer, { backgroundColor: headerBackgroundColor }]}
        headerExpandedContainerStyle={[
          styles.headerExpandedContainer,
          {
            borderColor: borderColor,
            backgroundColor: headerExpandedBackgroundColor,
          },
        ]}
        headerGradientColors={headerGradientColors}
        headerExpandedGradientColors={headerExpandedGradientColors}
        headerGradientStart={{ x: 0, y: 0.5 }}
        headerGradientEnd={{ x: 1, y: 0.5 }}
        containerContainerStyle={[
          styles.containerContainer,
          {
            borderColor: borderColor,
            backgroundColor: headerBackgroundColor,
          },
        ]}
        containerExpandedContainerStyle={[
          styles.containerExpandedContainer,
          {
            borderColor: borderColor,
          },
        ]}
        iconProps={{ color: expandableIconColor, size: 18 }}
      >
        <View style={styles.setlistOwnerSection}>
          <FancyText
            size='extraSmall'
            type='semiBold'
            color={palette.fonts.dark}
            style={styles.setlistOwnerLabel}
          >
            Quem define o Setlist?
          </FancyText>

          <View style={styles.setlistOwnerContentRow}>
            <View style={styles.setlistOwnerPersonRow}>
              {hasResponsavelSetlist ? (
                <FancyImage
                  source={responsavelSetlistFoto ? { uri: responsavelSetlistFoto } : undefined}
                  size={30}
                  style={styles.setlistOwnerAvatar}
                />
              ) : (
                <View style={styles.setlistOwnerAvatarPlaceholder}>
                  <DefaultIcons.Custom
                    library='MaterialCommunityIcons'
                    name='account-outline'
                    size={16}
                    color={palette.fonts.inactive}
                  />
                </View>
              )}

              <View style={styles.setlistOwnerTextBlock}>
                <FancyText
                  type='medium'
                  size='extraSmall'
                  color={palette.fonts.inactive}
                  style={styles.setlistOwnerMetaText}
                >
                  Responsável atual
                </FancyText>
                <FancyText
                  type='bold'
                  size='extraSmall'
                  color={hasResponsavelSetlist ? palette.fonts.dark : palette.fonts.inactive}
                  style={styles.setlistOwnerValueText}
                >
                  {responsavelSetlistNome}
                </FancyText>
              </View>
            </View>

            {canEditSetlistOwnerHere ? (
              <View style={styles.setlistOwnerActions}>
                <FancyButton
                  type='contained'
                  mode='icon'
                  size={{ w: 32, h: 28 }}
                  icon={{
                    library: 'MaterialCommunityIcons',
                    name: responsavelSetlistValue ? 'swap-horizontal' : 'account-plus-outline',
                    size: 15,
                    color: ColorUtils.darkenColor(borderColor, 0.12),
                  }}
                  containerStyle={[
                    styles.setlistOwnerButton,
                    {
                      backgroundColor: ColorUtils.withAlpha(borderColor, 0.14),
                      borderWidth: 1,
                      borderColor: ColorUtils.withAlpha(borderColor, 0.22),
                    },
                  ]}
                  accessibilityLabel={
                    responsavelSetlistValue
                      ? 'Trocar responsável do setlist'
                      : 'Selecionar responsável do setlist'
                  }
                  disabled={isUpdatingSetlistOwner}
                  onPress={() => responsavelSelectRef.current?.open()}
                />

                {hasResponsavelSetlist ? (
                  <FancyButton
                    type='light'
                    mode='icon'
                    size={{ w: 32, h: 28 }}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'close-circle-outline',
                      size: 15,
                      color: ColorUtils.withAlpha(palette.fonts.dark, 0.72),
                    }}
                    containerStyle={[
                      styles.setlistOwnerButton,
                      {
                        backgroundColor: ColorUtils.withAlpha(palette.fonts.dark, 0.08),
                        borderWidth: 1,
                        borderColor: ColorUtils.withAlpha(palette.fonts.dark, 0.1),
                      },
                    ]}
                    accessibilityLabel='Limpar responsável do setlist'
                    disabled={isUpdatingSetlistOwner}
                    onPress={handleClearResponsavelSetlist}
                  />
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.hiddenSelectWrapper}>
            <FancyBottomSheetSelect
              ref={responsavelSelectRef}
              listItems={responsavelSetlistOptions}
              value={responsavelSetlistValue}
              onChange={(value) => handleSelectResponsavelSetlist(String(value || ''))}
              title='Responsável pelo setlist'
              placeholder='Selecione um voluntário'
              disabled={isUpdatingSetlistOwner}
              containerStyle={styles.hiddenSelect}
            />
          </View>
        </View>

        <ListaVoluntariosTable
          data={data.equipe}
          viewMode={viewMode}
          onSubstituicaoButtonPressed={(data) => {
            setSubstituicaoModalProps({ isOpen: true, data });
          }}
          onAdicionarVoluntarioButtonPressed={(data) => {
            setAdicionarModalProps({ isOpen: true, data });
          }}
          onRemoverVoluntarioPressed={(equipeItem) => {
            FancyAlert.alert(
              'Remover voluntário',
              'Deseja remover o voluntário desta função? A função permanecerá vaga na escala.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Remover',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setLoadingAction({ visible: true, label: 'Removendo voluntário...' });
                      await onRemoveVoluntario?.(equipeItem.idEscalaItem);
                    } finally {
                      setLoadingAction({ visible: false, label: '' });
                    }
                  },
                },
              ],
            );
          }}
          onExcluirFuncaoPressed={(funcaoId) => {
            FancyAlert.alert('Excluir Função', 'Deseja realmente excluir esta função do evento?', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                  try {
                    setLoadingAction({ visible: true, label: 'Excluindo função...' });
                    await onExcluirFuncao?.(funcaoId, data.evento.id, data.dataOcorrencia);
                  } finally {
                    setLoadingAction({ visible: false, label: '' });
                  }
                },
              },
            ]);
          }}
        />
      </FancyAccordeon>

      {substituicaoModalProps.isOpen && (
        <SubstituirVoluntarioModal
          visible={substituicaoModalProps.isOpen}
          onClose={() => setSubstituicaoModalProps({ isOpen: false })}
          data={{
            ...substituicaoModalProps.data!,
            evento: {
              dataInicio: data.evento.dataInicio!,
              dataTermino: data.evento.dataTermino!,
              dataOcorrencia: DateUtilsApi.dateTimeFromApi(data.dataOcorrencia),
            },
            ministerioId,
          }}
          currentEquipe={data.equipe}
          onConfirm={async (subData) => {
            const result = await onChangeVoluntario?.(subData);
            if (result) {
              setSubstituicaoModalProps({ isOpen: false });
            }
          }}
        />
      )}

      {adicionarModalProps.isOpen && (
        <AdicionarVoluntarioModal
          data={{
            ...adicionarModalProps.data!,
            evento: {
              dataInicio: data.evento.dataInicio!,
              dataTermino: data.evento.dataTermino!,
              dataOcorrencia: DateUtilsApi.dateTimeFromApi(data.dataOcorrencia),
            },
            ministerioId,
          }}
          currentEquipe={data.equipe}
          onButton2Press={async (data) => {
            const result = await onAddVoluntario?.(data);
            if (result) {
              setAdicionarModalProps({ isOpen: false });
            }
          }}
          onButton1Press={() => setAdicionarModalProps({ isOpen: false })}
          modalProps={{
            visible: adicionarModalProps.isOpen,
          }}
        />
      )}

      {adicionarFuncaoModalOpen && (
        <AdicionarFuncaoModal
          visible={adicionarFuncaoModalOpen}
          onClose={() => setAdicionarFuncaoModalOpen(false)}
          ministerioId={ministerioId}
          eventoNome={data.evento.nome}
          eventoId={data.evento.id}
          dataOcorrencia={DateUtilsApi.dateTimeFromApi(data.dataOcorrencia)}
          dataInicio={data.evento.dataInicio!}
          dataTermino={data.evento.dataTermino!}
          onConfirm={async (funcaoData) => {
            const result = await onAdicionarFuncao?.(funcaoData);
            if (result) {
              setAdicionarFuncaoModalOpen(false);
            }
          }}
        />
      )}

      <Modal visible={loadingAction.visible} transparent animationType='fade'>
        <View style={styles.blockingOverlay}>
          <View style={styles.blockingOverlayContent}>
            <FancyLoading
              label={loadingAction.label}
              containerStyle={{ flex: 0, alignSelf: 'center' }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    titleContainer: {
      paddingVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    titleTextContainer: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    headerMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    pastChip: {
      marginTop: 1,
    },
    metaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    contentContainer: {
      paddingHorizontal: 6,
      paddingTop: 2,
      paddingBottom: 2,
      borderWidth: 0,
      backgroundColor: palette.backgroundColor2,
    },
    setlistOwnerSection: {
      marginHorizontal: 6,
      marginTop: 9,
      marginBottom: 9,
      paddingHorizontal: 10,
      paddingTop: 5,
      paddingBottom: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor2,
      gap: 8,
    },
    setlistOwnerLabel: {
      lineHeight: 16,
    },
    setlistOwnerContentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    setlistOwnerPersonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      gap: 9,
    },
    setlistOwnerAvatar: {
      borderRadius: 15,
    },
    setlistOwnerAvatarPlaceholder: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.16),
    },
    setlistOwnerTextBlock: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    setlistOwnerMetaText: {
      lineHeight: 14,
    },
    setlistOwnerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    setlistOwnerButton: {
      alignSelf: 'center',
      borderRadius: 999,
    },
    setlistOwnerValueText: {
      lineHeight: 18,
    },
    hiddenSelectWrapper: {
      height: 0,
      opacity: 0,
      overflow: 'hidden',
    },
    hiddenSelect: {
      height: 0,
      minHeight: 0,
    },
    headerContainer: {
      borderRadius: 10,
    },
    headerExpandedContainer: {
      borderRadius: 10,
      borderBottomWidth: 1,
    },
    containerContainer: {
      borderRadius: 10,
      borderWidth: 1,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    containerExpandedContainer: {
      borderRadius: 10,
      borderWidth: 1,
      backgroundColor: palette.backgroundColor2,
      paddingBottom: 2,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    blockingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
    },
    blockingOverlayContent: {
      minWidth: 180,
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: palette.backgroundColor,
    },
  });
}
