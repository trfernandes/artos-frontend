import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ThemePalette } from '../../../../../constants/colors';
import { ColorUtils } from '../../../../../utils/color_utils';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { useEventoHeaderState } from '../../../../../hooks/useEventoHeaderState';
import { useLoading } from '../../../../../contexts/LoadingContext';

import FancyText from '../../../../FancyText';
import FancyScrollView from '../../../../FancyScrollView';
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
  const { showLoading, hideLoading } = useLoading();

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
        showLoading('Salvando responsável...');
        try {
          const ok =
            (await onUpdateResponsavelSetlist?.({
              eventoId: data.evento.id,
              dataOcorrencia: data.dataOcorrencia,
              responsavelVoluntarioId: nextValue || null,
            })) ?? false;
          if (!ok) setResponsavelSetlistValue(previousValue);
        } finally {
          hideLoading();
        }
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
            showLoading('Excluindo evento...');
            await onDeleteEvento?.(data.evento.id, data.dataOcorrencia);
          } finally {
            hideLoading();
          }
        },
      },
    ]);
  }, [data.dataOcorrencia, data.evento.id, onDeleteEvento]);

  // ── Derived nav values ────────────────────────────────────────────────────────
  const showNav = pagerProps && pagerProps.total > 1;
  const isFirst = pagerProps ? pagerProps.currentIndex === 0 : true;
  const isLast = pagerProps ? pagerProps.currentIndex === pagerProps.total - 1 : true;

  return (
    <View style={styles.pageContainer}>
      {/* ── Card unificado (full-height, equipe scroll interno) ─────────────── */}
      <View
          style={[
            styles.unifiedCard,
            {
              borderColor: ColorUtils.withAlpha(borderColor, 0.28),
              backgroundColor: palette.backgroundColor,
              borderLeftColor: borderColor,
            },
          ]}
        >
          {/* ── Seção Evento ──────────────────────────────────────────────────── */}
          <View style={styles.eventSection}>
            {/* Linha 1: label "Evento" + ações */}
            <View style={styles.eventHeaderTopRow}>
              <View style={styles.eventLabelGroup}>
                <FancyText
                  type='medium'
                  size={11}
                  color={palette.fonts.inactive}
                  style={styles.eventCategoryLabel}
                >
                  Evento
                </FancyText>
                {showNav && (
                  <FancyText
                    type='semiBold'
                    size={11}
                    color={ColorUtils.withAlpha(borderColor, 0.9)}
                  >
                    {`· ${pagerProps!.currentIndex + 1}/${pagerProps!.total}`}
                  </FancyText>
                )}
              </View>

              <View style={styles.eventHeaderActions}>
                {showNav && (
                  <>
                    <TouchableOpacity
                      onPress={pagerProps!.onPrev}
                      disabled={isFirst}
                      style={styles.headerIconButton}
                      accessibilityLabel='Evento anterior'
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <DefaultIcons.Custom
                        library='MaterialIcons'
                        name='chevron-left'
                        size={20}
                        color={isFirst ? ColorUtils.withAlpha(borderColor, 0.25) : borderColor}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={pagerProps!.onNext}
                      disabled={isLast}
                      style={styles.headerIconButton}
                      accessibilityLabel='Próximo evento'
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <DefaultIcons.Custom
                        library='MaterialIcons'
                        name='chevron-right'
                        size={20}
                        color={isLast ? ColorUtils.withAlpha(borderColor, 0.25) : borderColor}
                      />
                    </TouchableOpacity>
                    <View style={styles.headerActionsDivider} />
                  </>
                )}

                <TouchableOpacity
                  onPress={() => setEventoDetailsVisible(true)}
                  style={styles.headerIconButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel='Ver detalhes do evento'
                >
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='info-outline'
                    size={20}
                    color={ColorUtils.withAlpha(borderColor, 0.8)}
                  />
                </TouchableOpacity>

                {isEditMode && (
                  <TouchableOpacity
                    onPress={handleDeleteEvento}
                    style={styles.headerIconButton}
                    accessibilityLabel='Excluir evento'
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <DefaultIcons.Custom
                      library='MaterialIcons'
                      name='delete-outline'
                      size={20}
                      color={palette.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Linha 2: nome do evento */}
            <FancyText
              type='bold'
              size={14}
              color={eventTitleColor}
              numberOfLines={2}
              style={styles.eventName}
            >
              {data.evento.nome}
            </FancyText>

            {/* Meta: data/hora + local */}
            <View style={styles.eventMetaRow}>
              <View style={styles.metaDateTimeRow}>
                <View style={styles.metaGroup}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='event'
                    size={13}
                    color={ColorUtils.withAlpha(borderColor, 0.9)}
                  />
                  <FancyText type='semiBold' size={11} color={eventMetaColor}>
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
                    <FancyText type='semiBold' size={11} color={eventMetaColor}>
                      {`${format(data.evento.dataInicio, 'HH:mm')} – ${format(
                        data.evento.dataTermino,
                        'HH:mm',
                      )}`}
                    </FancyText>
                  </View>
                )}

                {eventTotal > 0 && (
                  <View style={styles.metaConfirmIndicator}>
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
                  </View>
                )}
              </View>

              {data.evento.local ? (
                <View style={styles.metaGroup}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='place'
                    size={13}
                    color={ColorUtils.withAlpha(borderColor, 0.9)}
                  />
                  <FancyText
                    type='medium'
                    size={11}
                    color={palette.fonts.inactive}
                    numberOfLines={1}
                    style={styles.localText}
                  >
                    {data.evento.local}
                  </FancyText>
                </View>
              ) : null}
            </View>

          </View>

          {/* ── Divisor → Setlist ─────────────────────────────────────────────── */}
          <View style={styles.sectionDivider}>
            <FancyText type='medium' size={11} color={palette.fonts.inactive}>
              Setlist
            </FancyText>
          </View>

          {/* ── Seção Setlist ─────────────────────────────────────────────────── */}
          <View style={styles.setlistSection}>
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
                  color={hasResponsavelSetlist ? palette.fonts.dark : palette.fonts.inactive2}
                >
                  {responsavelSetlistNome}
                </FancyText>
              </View>

              {canEditSetlistOwnerHere && (
                <View style={styles.setlistOwnerActions}>
                  <FancyButton
                    type='text'
                    size={{ w: 0, h: 28 }}
                    label={responsavelSetlistValue ? 'Trocar' : 'Definir'}
                    labelProps={{ size: 'extraSmall' }}
                    labelStyle={{ color: ColorUtils.darkenColor(borderColor, 0.12) }}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: responsavelSetlistValue ? 'swap-horizontal' : 'account-plus-outline',
                      size: 15,
                      color: ColorUtils.darkenColor(borderColor, 0.12),
                    }}
                    iconPosition='left'
                    containerStyle={styles.setlistOwnerLinkButton}
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
                      size={{ w: 26, h: 26 }}
                      icon={{
                        library: 'MaterialCommunityIcons',
                        name: 'close-circle-outline',
                        size: 14,
                        color: ColorUtils.withAlpha(palette.fonts.dark, 0.5),
                      }}
                      containerStyle={[
                        styles.setlistOwnerButton,
                        {
                          backgroundColor: ColorUtils.withAlpha(palette.fonts.dark, 0.06),
                          borderWidth: 1,
                          borderColor: ColorUtils.withAlpha(palette.fonts.dark, 0.08),
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
          </View>

          {/* ── Divisor → Equipe ──────────────────────────────────────────────── */}
          <View style={styles.sectionDivider}>
            <FancyText type='medium' size={11} color={palette.fonts.inactive}>
              Equipe
            </FancyText>
            {isEditMode && (
              <FancyButton
                type='text'
                label='Nova Função'
                labelProps={{ size: 'extraSmall' }}
                icon={{ library: 'MaterialIcons', name: 'add', size: 13, color: palette.primary }}
                iconPosition='left'
                containerStyle={styles.addFuncaoButton}
                onPress={() => setAdicionarFuncaoModalOpen(true)}
                accessibilityLabel='Adicionar nova função'
              />
            )}
          </View>

          {/* ── Seção Equipe ──────────────────────────────────────────────────── */}
          <View style={styles.equipeSection}>
            <FancyScrollView contentContainerStyle={styles.equipeScrollContent}>
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
                          showLoading('Removendo voluntário...');
                          await onRemoveVoluntario?.(equipeItem.idEscalaItem);
                        } finally {
                          hideLoading();
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
                          showLoading('Excluindo função...');
                          await onExcluirFuncao?.(funcaoId, data.evento.id, data.dataOcorrencia);
                        } finally {
                          hideLoading();
                        }
                      },
                    },
                  ],
                );
              }}
            />
            </FancyScrollView>
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
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
    // ── Event section (inside unified card) ──────────────────────────────────
    eventHeaderTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    eventLabelGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      flex: 1,
    },
    headerActionsDivider: {
      width: 1,
      height: 16,
      backgroundColor: palette.border,
      marginHorizontal: 2,
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
      lineHeight: 18,
      marginTop: -2,
    },
    eventHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerIconButton: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eventMetaRow: {
      flexDirection: 'column',
      gap: 4,
      marginTop: 2,
    },
    metaDateTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    metaConfirmIndicator: {
      marginLeft: 'auto',
    },
    metaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    localText: {
      maxWidth: 160,
    },
    // ── Scrollable content ───────────────────────────────────────────────────
    scrollContent: {
      paddingBottom: 30,
    },
    // ── Unified card ─────────────────────────────────────────────────────────
    unifiedCard: {
      marginHorizontal: 14,
      marginTop: 10,
      marginBottom: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderLeftWidth: 4,
      backgroundColor: palette.backgroundColor,
      overflow: 'hidden',
      flex: 1,
      ...palette.shadows[200],
    },
    eventSection: {
      paddingHorizontal: 14,
      paddingTop: 7,
      paddingBottom: 10,
      gap: 3,
    },
    sectionDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 9,
      gap: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.borderCard,
    },
    sectionDividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
    },
    setlistSection: {
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 16,
    },
    equipeSection: {
      paddingHorizontal: 12,
      flex: 1,
    },
    equipeScrollContent: {
      paddingBottom: 16,
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
      alignSelf: 'center',
      paddingHorizontal: 2,
      height: 28,
      minWidth: 0,
    },
    // ── Setlist owner ────────────────────────────────────────────────────────
    setlistOwnerPersonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      gap: 9,
      paddingLeft: 6,
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
    setlistOwnerLinkButton: {
      alignSelf: 'center',
      paddingHorizontal: 4,
      minWidth: 0,
    },
    hiddenSelectWrapper: {
      position: 'absolute',
      height: 0,
      opacity: 0,
      overflow: 'hidden',
    },
    hiddenSelect: {
      height: 0,
      minHeight: 0,
    },
  });
}
