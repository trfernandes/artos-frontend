import { StyleSheet, View } from 'react-native';
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
import FancyActionSheet, { FancyActionSheetItem } from '../../../../actions/FancyActionSheet';
import FancyListEmpty from '../../../../list/FancyListEmpty';
import { FancyAlert } from '../../../../modal/FancyAlert';
import ScaleFillIndicator from '../../../../indicators/ScaleFillIndicator';
import ListaVoluntariosTable from './ListaVoluntariosTable';
import SubstituirVoluntarioModal, { SubstituicaoConfirmDialog } from './SubstituirVoluntarioModal';
import AdicionarVoluntarioModal, {
  AdicionarVoluntarioConfirmDialog,
} from './AdicionarVoluntarioModal';
import AdicionarFuncaoModal, { AdicionarFuncaoConfirmDialog } from './AdicionarFuncaoModal';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { AppImages } from '../../../../../assets/app_images';
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
  onAdicionarEvento?: () => void;
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
  onAdicionarEvento,
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
  const [eventoMenuOpen, setEventoMenuOpen] = useState(false);

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

  // Cor de texto-no-acento (mesmo padrão do link do setlist)
  const accentLabelColor = ColorUtils.darkenColor(borderColor, 0.12);

  // Iniciais do responsável (fallback quando definido mas sem foto)
  const responsavelSetlistIniciais = useMemo(() => {
    const parts = responsavelSetlistNome.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }, [responsavelSetlistNome]);

  // Ações do menu de evento (overflow)
  const eventoMenuActions: FancyActionSheetItem[] = [
    {
      label: 'Ver dados do evento',
      icon: { library: 'MaterialIcons', name: 'info-outline', size: 18 },
      onPress: () => setEventoDetailsVisible(true),
    },
  ];
  if (isEditMode) {
    eventoMenuActions.push({
      label: 'Excluir evento',
      icon: { library: 'MaterialIcons', name: 'delete-outline', size: 18 },
      onPress: handleDeleteEvento,
      destructive: true,
    });
  }

  const renderSectionEyebrow = (label: string, iconName: string) => (
    <View style={styles.sectionEyebrow}>
      <DefaultIcons.Custom
        library='MaterialIcons'
        name={iconName}
        size={12}
        color={accentLabelColor}
      />
      <FancyText
        type='semiBold'
        size='extraSmall'
        color={accentLabelColor}
        style={styles.sectionEyebrowText}
      >
        {label.toUpperCase()}
      </FancyText>
    </View>
  );

  return (
    <View style={styles.pageContainer}>
      {/* ── Card unificado (full-height, equipe scroll interno) ─────────────── */}
      <View
        style={[
          styles.unifiedCard,
          {
            borderColor: palette.borderCard,
            borderTopColor: borderColor,
            backgroundColor: palette.backgroundColor,
          },
        ]}
      >
        {/* ── Seção Evento ──────────────────────────────────────────────────── */}
        <View style={styles.eventSection}>
          {/* Linha 1: label "Evento" + ações */}
          <View style={styles.eventHeaderTopRow}>
            <View style={styles.eventLabelGroup}>{renderSectionEyebrow('Evento', 'event')}</View>

            <View style={styles.eventHeaderActions}>
              <FancyButton
                type='text'
                mode='icon'
                size={{ w: 30, h: 30 }}
                icon={{
                  library: 'Entypo',
                  name: 'dots-three-vertical',
                  size: 14,
                  color: ColorUtils.withAlpha(palette.fonts.dark, 0.55),
                }}
                containerStyle={[
                  styles.headerActionChip,
                  { backgroundColor: ColorUtils.withAlpha(palette.fonts.dark, 0.06) },
                ]}
                onPress={() => setEventoMenuOpen(true)}
                accessibilityLabel='Mais ações do evento'
              />
            </View>
          </View>

          {/* Linha 2: nome do evento */}
          <FancyText
            type='bold'
            size='mediumLarge'
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
                    textSize={12}
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
        </View>

        {/* ── Divisor → Setlist ─────────────────────────────────────────────── */}
        <View style={styles.sectionDivider}>{renderSectionEyebrow('Setlist', 'music-note')}</View>

        {/* ── Seção Setlist ─────────────────────────────────────────────────── */}
        <View style={styles.setlistSection}>
          <View style={styles.setlistOwnerPersonRow}>
            {hasResponsavelSetlist ? (
              <FancyImage
                source={
                  responsavelSetlistFoto ? { uri: responsavelSetlistFoto } : AppImages.emptyProfile
                }
                size={36}
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
              <FancyText type='medium' size='extraSmall' color={palette.fonts.inactive}>
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
                  label={responsavelSetlistValue ? 'Trocar' : 'Definir'}
                  labelProps={{ size: 'extraSmall', type: 'semiBold' }}
                  labelStyle={{ color: accentLabelColor }}
                  icon={{
                    library: 'MaterialCommunityIcons',
                    name: responsavelSetlistValue ? 'swap-horizontal' : 'account-plus-outline',
                    size: 14,
                    color: accentLabelColor,
                  }}
                  iconPosition='left'
                  containerStyle={[
                    styles.addFuncaoButton,
                    { backgroundColor: ColorUtils.withAlpha(borderColor, 0.1) },
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
                    size={{ w: 26, h: 26 }}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'account-minus-outline',
                      size: 14,
                      color: ColorUtils.withAlpha(palette.error, 0.75),
                    }}
                    containerStyle={[
                      styles.setlistOwnerButton,
                      {
                        backgroundColor: ColorUtils.withAlpha(palette.error, 0.1),
                        borderWidth: 1,
                        borderColor: ColorUtils.withAlpha(palette.error, 0.18),
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
          {renderSectionEyebrow('Equipe', 'people')}
          {isEditMode && (
            <FancyButton
              type='text'
              label='Nova Função'
              labelProps={{ size: 'extraSmall', type: 'semiBold' }}
              labelStyle={{ color: accentLabelColor }}
              icon={{ library: 'MaterialIcons', name: 'add', size: 14, color: accentLabelColor }}
              iconPosition='left'
              containerStyle={[
                styles.addFuncaoButton,
                { backgroundColor: ColorUtils.withAlpha(borderColor, 0.1) },
              ]}
              onPress={() => setAdicionarFuncaoModalOpen(true)}
              accessibilityLabel='Adicionar nova função'
            />
          )}
        </View>

        {/* ── Seção Equipe ──────────────────────────────────────────────────── */}
        <View style={styles.equipeSection}>
          {data.equipe.filter((item) => !!item.funcao?.id).length === 0 ? (
            <FancyListEmpty
              icon={{ library: 'MaterialIcons', name: 'groups', size: 48 }}
              label='Nenhuma função criada'
              helperText={
                isEditMode
                  ? 'Toque em + Nova Função para adicionar'
                  : 'As funções aparecem aqui quando forem definidas.'
              }
              muted
            />
          ) : (
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
          )}
        </View>

        {/* ── Rodapé: navegação entre eventos (‹ 3 / 13 ›) + adicionar ──────── */}
        {(showNav || onAdicionarEvento) && (
          <View style={styles.pagerFooter}>
            {showNav && (
              <FancyButton
                type='outlined'
                mode='icon'
                size={{ w: 30, h: 30 }}
                disabled={isFirst}
                icon={{
                  library: 'MaterialIcons',
                  name: 'chevron-left',
                  size: 20,
                  color: isFirst ? ColorUtils.withAlpha(borderColor, 0.3) : borderColor,
                }}
                containerStyle={[
                  styles.pagerNavButton,
                  { borderColor: ColorUtils.withAlpha(borderColor, isFirst ? 0.2 : 0.5) },
                ]}
                onPress={pagerProps!.onPrev}
                accessibilityLabel='Evento anterior'
              />
            )}

            <View style={[styles.pagerDots, !showNav && styles.pagerDotsHidden]}>
              {showNav &&
                (() => {
                  const total = pagerProps!.total;
                  const current = pagerProps!.currentIndex;
                  const MAX = 13;
                  let start = 0;
                  let end = total;
                  if (total > MAX) {
                    start = Math.min(Math.max(0, current - Math.floor(MAX / 2)), total - MAX);
                    end = start + MAX;
                  }
                  return Array.from({ length: end - start }, (_, k) => {
                    const idx = start + k;
                    const active = idx === current;
                    const isEdge = total > MAX && (k === 0 || k === end - start - 1);
                    const base = isEdge ? 4 : 6;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.pagerDot,
                          {
                            width: active ? 8 : base,
                            height: active ? 8 : base,
                            backgroundColor: active
                              ? borderColor
                              : ColorUtils.withAlpha(borderColor, 0.25),
                          },
                        ]}
                      />
                    );
                  });
                })()}
            </View>

            <View style={styles.pagerNavRight}>
              {showNav && (
                <FancyButton
                  type='light'
                  mode='icon'
                  size={{ w: 30, h: 30 }}
                  disabled={isLast}
                  icon={{
                    library: 'MaterialIcons',
                    name: 'chevron-right',
                    size: 20,
                    color: isLast ? ColorUtils.withAlpha(borderColor, 0.3) : borderColor,
                  }}
                  containerStyle={[
                    styles.pagerNavButton,
                    {
                      backgroundColor: ColorUtils.withAlpha(borderColor, isLast ? 0.06 : 0.14),
                      borderColor: 'transparent',
                    },
                  ]}
                  onPress={pagerProps!.onNext}
                  accessibilityLabel='Próximo evento'
                />
              )}

              {onAdicionarEvento && (
                <FancyButton
                  type='contained'
                  label='Novo evento'
                  labelProps={{ size: 'extraSmall', type: 'semiBold' }}
                  icon={{
                    library: 'MaterialIcons',
                    name: 'playlist-add',
                    size: 16,
                  }}
                  iconPosition='left'
                  containerStyle={[
                    styles.pagerNavButton,
                    {
                      backgroundColor: borderColor,
                      borderColor: 'transparent',
                      height: 30,
                      paddingHorizontal: 10,
                    },
                  ]}
                  onPress={onAdicionarEvento}
                  accessibilityLabel='Adicionar evento'
                />
              )}
            </View>
          </View>
        )}

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
      <FancyActionSheet
        visible={eventoMenuOpen}
        onClose={() => setEventoMenuOpen(false)}
        title={data.evento.nome}
        actions={eventoMenuActions}
      />

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
              <FancyText type='medium' size='extraSmall' color={palette.fonts.inactive}>
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
                <FancyText type='medium' size='extraSmall' color={palette.fonts.inactive}>
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
                <FancyText type='medium' size='extraSmall' color={palette.fonts.inactive}>
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
                <FancyText type='medium' size='extraSmall' color={palette.fonts.inactive}>
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
    sectionEyebrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    sectionEyebrowText: {
      letterSpacing: 0.8,
    },
    eventName: {
      lineHeight: 18,
      marginTop: -4,
    },
    eventHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerActionChip: {
      borderRadius: 999,
      borderWidth: 0,
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
      borderTopWidth: 3,
      backgroundColor: palette.backgroundColor,
      overflow: 'hidden',
      flex: 1,
      ...palette.shadows[200],
    },
    eventSection: {
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 10,
      gap: 3,
    },
    sectionDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
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
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 16,
    },
    equipeSection: {
      paddingHorizontal: 16,
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
    accentGhostChip: {
      alignSelf: 'center',
      paddingHorizontal: 10,
      height: 28,
      minWidth: 0,
      borderRadius: 999,
    },
    // ── Rodapé de navegação entre eventos ────────────────────────────────────
    pagerFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.borderCard,
    },
    pagerNavButton: {
      borderRadius: 999,
    },
    pagerNavRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pagerDots: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    pagerDotsHidden: {
      flex: 0,
      marginHorizontal: 12,
    },
    pagerDot: {
      borderRadius: 999,
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
      borderRadius: 18,
    },
    setlistOwnerAvatarPlaceholder: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.backgroundColor3,
      borderWidth: 1,
      borderColor: palette.borderCard,
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
    addFuncaoButton: {
      height: 26,
      borderRadius: 999,
      paddingHorizontal: 8,
      minWidth: 0,
      alignSelf: 'center',
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
