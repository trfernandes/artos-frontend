import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ThemePalette } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { useEventoHeaderState } from '../../../../../hooks/useEventoHeaderState';

import FancyText from '../../../../FancyText';
import FancyScrollView from '../../../../FancyScrollView';
import FancyLoading from '../../../../FancyLoading';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyImage from '../../../../images/FancyImage';
import FancyBottomSheetSelect, {
  FancyBottomSheetSelectRef,
} from '../../../../fields/FancyBottomSheetSelect';
import DefaultIcons from '../../../../FancyIcons';
import { FancyAlert } from '../../../../modal/FancyAlert';
import ScaleFillIndicator from '../../../../indicators/ScaleFillIndicator';
import ListaVoluntariosTable from './ListaVoluntariosTable';
import SubstituirVoluntarioModal, { SubstituicaoConfirmDialog } from './SubstituirVoluntarioModal';
import AdicionarVoluntarioModal, {
  AdicionarVoluntarioConfirmDialog,
} from './AdicionarVoluntarioModal';
import AdicionarFuncaoModal, { AdicionarFuncaoConfirmDialog } from './AdicionarFuncaoModal';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import {
  EscalaItemDataType,
  EscalaItemEquipeType,
} from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';

export interface EscalaPagerNavProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export interface EscalaEventoPageProps {
  data: EscalaItemDataType;
  viewMode?: 'view' | 'edit';
  ministerioId: string;
  escalaId: string;
  pagerProps?: EscalaPagerNavProps;
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

export default function EscalaEventoPage({
  data,
  viewMode,
  ministerioId,
  escalaId: _escalaId,
  pagerProps,
  onChangeVoluntario,
  onAddVoluntario,
  onRemoveVoluntario,
  onDeleteEvento,
  onAdicionarFuncao,
  onExcluirFuncao,
  canEditSetlistOwner,
  isUpdatingSetlistOwner,
  onUpdateResponsavelSetlist,
}: EscalaEventoPageProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isEditMode = !viewMode || viewMode === 'edit';

  const {
    hasEventPassed,
    borderColor,
    eventConfirmed,
    eventTotal,
    eventMetaColor,
    eventTitleColor,
    eventProgressColor,
  } = useEventoHeaderState(data);

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [substituicaoModalProps, setSubstituicaoModalProps] = useState<{
    isOpen: boolean;
    data?: EscalaItemEquipeType;
  }>({ isOpen: false });

  const [adicionarModalProps, setAdicionarModalProps] = useState<{
    isOpen: boolean;
    data?: EscalaItemEquipeType;
  }>({ isOpen: false });

  const [adicionarFuncaoModalOpen, setAdicionarFuncaoModalOpen] = useState(false);
  const [eventoDetailsVisible, setEventoDetailsVisible] = useState(false);
  const [loadingAction, setLoadingAction] = useState<{ visible: boolean; label: string }>({
    visible: false,
    label: '',
  });

  // ── Setlist owner state ───────────────────────────────────────────────────────
  const responsavelSelectRef = useRef<FancyBottomSheetSelectRef>(null);
  const [responsavelSetlistValue, setResponsavelSetlistValue] = useState(
    data.responsavelSetlistVoluntarioId ?? '',
  );

  useEffect(() => {
    setResponsavelSetlistValue(data.responsavelSetlistVoluntarioId ?? '');
  }, [data.responsavelSetlistVoluntarioId]);

  const canEditSetlistOwnerHere = Boolean(canEditSetlistOwner && !hasEventPassed);

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
          (item, idx, arr) => item.value && arr.findIndex((e) => e.value === item.value) === idx,
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
    const vol = data.equipe.find(
      (item) => item.voluntario?.voluntarioId === responsavelSetlistValue,
    )?.voluntario;
    return vol?.fotoThumbUrl || vol?.fotoUrl || undefined;
  }, [data.equipe, responsavelSetlistValue]);

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
        if (!ok) setResponsavelSetlistValue(previousValue);
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

  const handleDeleteEvento = useCallback(() => {
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
  }, [data.dataOcorrencia, data.evento.id, onDeleteEvento]);

  // ── Derived nav values ────────────────────────────────────────────────────────
  const showNav = pagerProps && pagerProps.total > 1;
  const isFirst = pagerProps ? pagerProps.currentIndex === 0 : true;
  const isLast = pagerProps ? pagerProps.currentIndex === pagerProps.total - 1 : true;
  const dotColor = (active: boolean) =>
    active ? borderColor : ColorUtils.withAlpha(borderColor, 0.3);

  return (
    <View style={styles.pageContainer}>
      {/* ── Event header card ───────────────────────────────────────────────── */}
      <View
        style={[
          styles.eventHeader,
          {
            borderColor: ColorUtils.withAlpha(borderColor, 0.28),
            backgroundColor: palette.backgroundColor,
            borderLeftColor: borderColor,
          },
        ]}
      >
        {/* Top row: label + nome + info button + progress */}
        <View style={styles.eventHeaderTopRow}>
          <View style={styles.eventTitleBlock}>
            <FancyText
              type='medium'
              size={9}
              color={palette.fonts.inactive}
              style={styles.eventCategoryLabel}
            >
              Evento
            </FancyText>
            <FancyText
              type='bold'
              size={14}
              color={eventTitleColor}
              numberOfLines={2}
              style={styles.eventName}
            >
              {data.evento.nome}
            </FancyText>
          </View>

          <View style={styles.eventHeaderActions}>
            <TouchableOpacity
              onPress={() => setEventoDetailsVisible(true)}
              style={styles.infoButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel='Ver detalhes do evento'
            >
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='info-outline'
                size={16}
                color={ColorUtils.withAlpha(borderColor, 0.8)}
              />
            </TouchableOpacity>

            {eventTotal > 0 && (
              <ScaleFillIndicator
                filledCount={eventConfirmed}
                totalCount={eventTotal}
                label=''
                showContainer={false}
                size='compact'
                donutSize={18}
                donutStrokeWidth={2.6}
                textSize={11}
                progressColor={eventProgressColor}
              />
            )}
          </View>
        </View>

        {/* Meta row: data, hora, local */}
        <View style={styles.eventMetaRow}>
          <View style={styles.metaGroup}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='event'
              size={13}
              color={ColorUtils.withAlpha(borderColor, 0.9)}
            />
            <FancyText type='semiBold' size='small' color={eventMetaColor}>
              {format(data.dataOcorrencia, 'dd/MM/yyyy')}
            </FancyText>
          </View>

          {data.evento.dataInicio && data.evento.dataTermino && (
            <View style={styles.metaGroup}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='access-time'
                size={13}
                color={ColorUtils.withAlpha(borderColor, 0.9)}
              />
              <FancyText type='semiBold' size='small' color={eventMetaColor}>
                {`${format(data.evento.dataInicio, 'HH:mm')} – ${format(
                  data.evento.dataTermino,
                  'HH:mm',
                )}`}
              </FancyText>
            </View>
          )}

          {data.evento.local ? (
            <View style={styles.metaGroup}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='place'
                size={13}
                color={palette.fonts.inactive}
              />
              <FancyText
                type='medium'
                size='small'
                color={palette.fonts.inactive}
                numberOfLines={1}
                style={styles.localText}
              >
                {data.evento.local}
              </FancyText>
            </View>
          ) : null}
        </View>

        {/* Navigation row: arrows + dots + delete */}
        {(showNav || isEditMode) && (
          <View style={styles.navRow}>
            {showNav ? (
              <>
                <TouchableOpacity
                  onPress={pagerProps.onPrev}
                  disabled={isFirst}
                  style={[
                    styles.navArrow,
                    {
                      backgroundColor: ColorUtils.withAlpha(borderColor, isFirst ? 0.06 : 0.1),
                      borderColor: ColorUtils.withAlpha(borderColor, 0.2),
                    },
                    isFirst && styles.navArrowDisabled,
                  ]}
                  accessibilityLabel='Evento anterior'
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='chevron-left'
                    size={20}
                    color={isFirst ? ColorUtils.withAlpha(borderColor, 0.3) : borderColor}
                  />
                </TouchableOpacity>

                <View style={styles.dotsRow}>
                  {Array.from({ length: pagerProps.total }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: dotColor(i === pagerProps.currentIndex),
                          width: i === pagerProps.currentIndex ? 18 : 6,
                        },
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={pagerProps.onNext}
                  disabled={isLast}
                  style={[
                    styles.navArrow,
                    {
                      backgroundColor: ColorUtils.withAlpha(borderColor, isLast ? 0.06 : 0.1),
                      borderColor: ColorUtils.withAlpha(borderColor, 0.2),
                    },
                    isLast && styles.navArrowDisabled,
                  ]}
                  accessibilityLabel='Próximo evento'
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='chevron-right'
                    size={20}
                    color={isLast ? ColorUtils.withAlpha(borderColor, 0.3) : borderColor}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {isEditMode && (
              <TouchableOpacity
                onPress={handleDeleteEvento}
                style={styles.navDeleteButton}
                accessibilityLabel='Excluir evento'
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='delete-outline'
                  size={16}
                  color={palette.error}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <FancyScrollView
        fill
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        {/* Setlist owner section */}
        <View
          style={[
            styles.card,
            { borderColor: palette.borderCard, backgroundColor: palette.backgroundColor },
          ]}
        >
          <View style={styles.cardLabelRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='music-note-outline'
              size={14}
              color={palette.primary}
            />
            <FancyText size='small' type='semiBold' color={palette.fonts.dark}>
              Quem define o Setlist?
            </FancyText>
          </View>

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
                <FancyText type='medium' size={10} color={palette.fonts.inactive}>
                  Responsável atual
                </FancyText>
                <FancyText
                  type='bold'
                  size='extraSmall'
                  color={hasResponsavelSetlist ? palette.fonts.dark : palette.fonts.inactive}
                >
                  {responsavelSetlistNome}
                </FancyText>
              </View>
            </View>

            {canEditSetlistOwnerHere && (
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

                {hasResponsavelSetlist && (
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
                )}
              </View>
            )}
          </View>

          {/* Hidden select trigger */}
          <View style={styles.hiddenSelectWrapper}>
            <FancyBottomSheetSelect
              ref={responsavelSelectRef}
              listItems={responsavelSetlistOptions}
              value={responsavelSetlistValue}
              onChange={(val) => handleSelectResponsavelSetlist(String(val || ''))}
              title='Responsável pelo setlist'
              placeholder='Selecione um voluntário'
              disabled={isUpdatingSetlistOwner}
              containerStyle={styles.hiddenSelect}
            />
          </View>
        </View>

        {/* Equipe section */}
        <View
          style={[
            styles.card,
            { borderColor: palette.borderCard, backgroundColor: palette.backgroundColor },
          ]}
        >
          <View style={styles.cardLabelRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='account-group-outline'
              size={14}
              color={palette.primary}
            />
            <FancyText size='small' type='semiBold' color={palette.fonts.dark} style={{ flex: 1 }}>
              Equipe
            </FancyText>
            {isEditMode && (
              <TouchableOpacity
                onPress={() => setAdicionarFuncaoModalOpen(true)}
                style={styles.addFuncaoButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='add'
                  size={13}
                  color={palette.icons.light}
                />
                <FancyText size='extraSmall' type='semiBold' color={palette.fonts.light}>
                  Nova Função
                </FancyText>
              </TouchableOpacity>
            )}
          </View>

          <ListaVoluntariosTable
            data={data.equipe}
            viewMode={viewMode}
            accentColor={borderColor}
            onSubstituicaoButtonPressed={(item) =>
              setSubstituicaoModalProps({ isOpen: true, data: item })
            }
            onAdicionarVoluntarioButtonPressed={(item) =>
              setAdicionarModalProps({ isOpen: true, data: item })
            }
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
              FancyAlert.alert(
                'Excluir Função',
                'Deseja realmente excluir esta função do evento?',
                [
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
                ],
              );
            }}
          />
        </View>
      </FancyScrollView>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
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
            const ok = await onChangeVoluntario?.(subData);
            if (ok) setSubstituicaoModalProps({ isOpen: false });
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
          onButton2Press={async (addData) => {
            const ok = await onAddVoluntario?.(addData);
            if (ok) setAdicionarModalProps({ isOpen: false });
          }}
          onButton1Press={() => setAdicionarModalProps({ isOpen: false })}
          modalProps={{ visible: adicionarModalProps.isOpen }}
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
            const ok = await onAdicionarFuncao?.(funcaoData);
            if (ok) setAdicionarFuncaoModalOpen(false);
          }}
        />
      )}

      <FancyBottomSheetModal
        visible={eventoDetailsVisible}
        onClose={() => setEventoDetailsVisible(false)}
        title={data.evento.nome}
      >
        <View style={styles.detailsSheet}>
          <View style={styles.detailsRow}>
            <View style={[styles.detailsAccent, { backgroundColor: borderColor }]} />
            <View style={styles.detailsContent}>
              <FancyText type='medium' size={10} color={palette.fonts.inactive}>
                Data
              </FancyText>
              <FancyText type='semiBold' size='small' color={palette.fonts.dark}>
                {format(data.dataOcorrencia, 'dd/MM/yyyy')}
              </FancyText>
            </View>
          </View>

          {data.evento.dataInicio && data.evento.dataTermino && (
            <View style={styles.detailsRow}>
              <View style={[styles.detailsAccent, { backgroundColor: borderColor }]} />
              <View style={styles.detailsContent}>
                <FancyText type='medium' size={10} color={palette.fonts.inactive}>
                  Horário
                </FancyText>
                <FancyText type='semiBold' size='small' color={palette.fonts.dark}>
                  {`${format(data.evento.dataInicio, 'HH:mm')} – ${format(data.evento.dataTermino, 'HH:mm')}`}
                </FancyText>
              </View>
            </View>
          )}

          {data.evento.local && (
            <View style={styles.detailsRow}>
              <View style={[styles.detailsAccent, { backgroundColor: borderColor }]} />
              <View style={styles.detailsContent}>
                <FancyText type='medium' size={10} color={palette.fonts.inactive}>
                  Local
                </FancyText>
                <FancyText type='semiBold' size='small' color={palette.fonts.dark}>
                  {data.evento.local}
                </FancyText>
              </View>
            </View>
          )}

          {eventTotal > 0 && (
            <View style={styles.detailsRow}>
              <View style={[styles.detailsAccent, { backgroundColor: borderColor }]} />
              <View style={styles.detailsContent}>
                <FancyText type='medium' size={10} color={palette.fonts.inactive}>
                  Equipe
                </FancyText>
                <FancyText type='semiBold' size='small' color={palette.fonts.dark}>
                  {`${eventConfirmed} confirmados de ${eventTotal}`}
                </FancyText>
              </View>
            </View>
          )}
        </View>
      </FancyBottomSheetModal>

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
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
    // ── Event header card ─────────────────────────────────────────────────────
    eventHeader: {
      marginHorizontal: 14,
      marginTop: 10,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderLeftWidth: 4,
      gap: 3,
      ...palette.shadows[100],
    },
    eventHeaderTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    eventTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    eventCategoryLabel: {
      letterSpacing: 0.4,
      marginBottom: 1,
    },
    eventName: {
      lineHeight: 22,
    },
    eventHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    infoButton: {
      width: 26,
      height: 26,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eventMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      columnGap: 10,
      rowGap: 2,
      marginTop: 2,
    },
    metaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    localText: {
      maxWidth: 160,
    },
    // ── Navigation ───────────────────────────────────────────────────────────
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
      gap: 6,
    },
    navArrow: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 1,
    },
    navArrowDisabled: {
      opacity: 0.45,
    },
    navDeleteButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      backgroundColor: ColorUtils.withAlpha(palette.error, 0.1),
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.error, 0.2),
    },
    dotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      flex: 1,
      justifyContent: 'center',
    },
    dot: {
      height: 6,
      borderRadius: 3,
    },
    // ── Scrollable content ───────────────────────────────────────────────────
    scrollContent: {
      padding: 14,
      paddingTop: 10,
      gap: 10,
      paddingBottom: 30,
    },
    // ── Cards ────────────────────────────────────────────────────────────────
    card: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 16,
      gap: 8,
      ...palette.shadows[100],
    },
    cardLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailsSheet: {
      gap: 12,
      paddingHorizontal: 4,
      paddingBottom: 8,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 12,
    },
    detailsAccent: {
      width: 3,
      borderRadius: 2,
    },
    detailsContent: {
      flex: 1,
      gap: 2,
    },
    addFuncaoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: 3,
      backgroundColor: palette.primary,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 999,
    },
    // ── Setlist owner ────────────────────────────────────────────────────────
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
    setlistOwnerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    setlistOwnerButton: {
      alignSelf: 'center',
      borderRadius: 999,
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
    // ── Blocking overlay ─────────────────────────────────────────────────────
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
