import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from 'expo-router';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyBottomSheetSelect from '../../fields/FancyBottomSheetSelect';
import FancyButton from '../../buttons/FancyButton';
import FancyChips from '../../FancyChips';
import DefaultIcons from '../../FancyIcons';
import FancyLoading from '../../FancyLoading';
import FancyPageView from '../../containers/FancyPageView';
import FancyScrollView from '../../FancyScrollView';
import FancyTabs, { TabItem } from '../../tabs/FancyTabs';
import FancyText from '../../FancyText';
import FancyTextInput from '../../fields/FancyTextInput';
import { FancyAlert } from '../../modal/FancyAlert';
import { usePallete } from '../../../hooks/usePallete';
import { useEventoSetlist } from '../../../hooks/useEventoSetlist';
import { useEventoSetlistEstrutura } from '../../../hooks/useEventoSetlistEstrutura';
import { useRepertorioMusicaEstrutura } from '../../../hooks/useRepertorioMusicaEstrutura';
import { ColorUtils } from '../../../utils/color_utils';
import { estimarDuracaoMusica } from '../../../utils/estimarDuracaoMusica';
import { useSecaoVisualMap } from '../../../utils/secaoCores';
import { RepertorioMusicaSecaoTipoEnum } from '../../../domain/dtos/Repertorio/repertorio-musica-secao.response';
import { UpsertEventoSetlistItemEstruturaRowDto } from '../../../domain/dtos/Evento/evento-setlist-item-estrutura.update';

type Props = {
  eventoId: string;
  itemId: string;
  ministerioId: string;
  dataOcorrencia: string;
  canEdit?: boolean;
};

type EditableEstruturaRow = UpsertEventoSetlistItemEstruturaRowDto & {
  key: string;
};

const CUSTOM_SECTION_VALUE = '__custom__';

export default function EventoSetlistItemDetailsView({
  eventoId,
  itemId,
  ministerioId,
  dataOcorrencia,
  canEdit = false,
}: Props) {
  const navigation = useNavigation<any>();
  const palette = usePallete();
  const secaoVisualMap = useSecaoVisualMap();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [secaoSelecionada, setSecaoSelecionada] = useState<string>(CUSTOM_SECTION_VALUE);
  const [rotuloCustomizado, setRotuloCustomizado] = useState('');
  const [tipo, setTipo] = useState<RepertorioMusicaSecaoTipoEnum>(RepertorioMusicaSecaoTipoEnum.PERSONALIZADO);
  const [letraOverride, setLetraOverride] = useState('');
  const [cifraOverride, setCifraOverride] = useState('');
  const [repeticoes, setRepeticoes] = useState('1');
  const [observacao, setObservacao] = useState('');
  const [draftRows, setDraftRows] = useState<EditableEstruturaRow[]>([]);

  const { data: setlist, isLoading: isLoadingSetlist } = useEventoSetlist(eventoId, dataOcorrencia, ministerioId);
  const item = useMemo(() => setlist?.find((entry) => entry.id === itemId) ?? null, [itemId, setlist]);
  const {
    data: estrutura,
    isLoading: isLoadingEstrutura,
    substituirEstrutura,
    removerOverrideEstrutura,
    isMutating,
  } = useEventoSetlistEstrutura(eventoId, itemId, dataOcorrencia, ministerioId);
  const { secoes: secoesRepertorio = [] } = useRepertorioMusicaEstrutura(item?.repertorioMusicaId || undefined);

  useEffect(() => {
    navigation.setOptions({
      title: item?.nome || 'Música do setlist',
    });
  }, [item?.nome, navigation]);

  useEffect(() => {
    if (!estrutura?.itens) return;
    setDraftRows(
      estrutura.itens.map((row, index) => ({
        key: row.id || `${row.ordem}-${index}`,
        ordem: index + 1,
        secaoRepertorioId: row.secaoRepertorioId || undefined,
        rotuloCustomizado: row.secaoRepertorioId ? undefined : row.rotulo,
        tipo: (row.tipo || row.secaoRepertorio?.tipo || RepertorioMusicaSecaoTipoEnum.PERSONALIZADO) as RepertorioMusicaSecaoTipoEnum,
        letraOverride: row.letra || undefined,
        cifraOverride: row.cifra || undefined,
        repeticoes: row.repeticoes,
        observacao: row.observacao || undefined,
      })),
    );
  }, [estrutura?.itens]);

  const estruturaResolvida = estrutura?.itens ?? [];

  const sectionOptions = useMemo(
    () => [
      { title: 'Seção personalizada', value: CUSTOM_SECTION_VALUE },
      ...secoesRepertorio.map((secao) => ({
        title: secao.rotulo,
        subtitle: secaoVisualMap[secao.tipo]?.label ?? secao.tipo,
        value: secao.id,
      })),
    ],
    [secaoVisualMap, secoesRepertorio],
  );

  const typeOptions = useMemo(
    () =>
      Object.values(RepertorioMusicaSecaoTipoEnum).map((value) => ({
        title: secaoVisualMap[value]?.label ?? value,
        value,
      })),
    [secaoVisualMap],
  );

  const duracaoEstimada = useMemo(
    () =>
      estimarDuracaoMusica({
        bpm: item?.bpm ?? undefined,
        totalSecoes: estruturaResolvida.length,
        repeticoes: estruturaResolvida.reduce((total, row) => total + (row.repeticoes || 1), 0),
      }),
    [estruturaResolvida, item?.bpm],
  );

  const openEditor = (index?: number) => {
    if (index === undefined) {
      setEditingIndex(null);
      setSecaoSelecionada(CUSTOM_SECTION_VALUE);
      setRotuloCustomizado('');
      setTipo(RepertorioMusicaSecaoTipoEnum.PERSONALIZADO);
      setLetraOverride('');
      setCifraOverride('');
      setRepeticoes('1');
      setObservacao('');
      setEditorVisible(true);
      return;
    }

    const row = draftRows[index];
    setEditingIndex(index);
    setSecaoSelecionada(row.secaoRepertorioId || CUSTOM_SECTION_VALUE);
    setRotuloCustomizado(row.rotuloCustomizado || '');
    setTipo(row.tipo || RepertorioMusicaSecaoTipoEnum.PERSONALIZADO);
    setLetraOverride(row.letraOverride || '');
    setCifraOverride(row.cifraOverride || '');
    setRepeticoes(String(row.repeticoes || 1));
    setObservacao(row.observacao || '');
    setEditorVisible(true);
  };

  const handleSaveRow = () => {
    const repeticoesNumber = Math.max(1, Number(repeticoes || '1'));
    const isCustom = secaoSelecionada === CUSTOM_SECTION_VALUE;

    const nextRow: EditableEstruturaRow = {
      key: editingIndex !== null ? draftRows[editingIndex].key : `${Date.now()}`,
      ordem: editingIndex !== null ? draftRows[editingIndex].ordem : draftRows.length + 1,
      secaoRepertorioId: isCustom ? undefined : secaoSelecionada,
      rotuloCustomizado: isCustom ? rotuloCustomizado.trim() : undefined,
      tipo: isCustom ? tipo : undefined,
      letraOverride: letraOverride.trim() || undefined,
      cifraOverride: cifraOverride.trim() || undefined,
      repeticoes: repeticoesNumber,
      observacao: observacao.trim() || undefined,
    };

    const nextRows = [...draftRows];
    if (editingIndex !== null) {
      nextRows[editingIndex] = nextRow;
    } else {
      nextRows.push(nextRow);
    }
    setDraftRows(nextRows.map((row, index) => ({ ...row, ordem: index + 1 })));
    setEditorVisible(false);
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draftRows.length) return;
    const nextRows = [...draftRows];
    [nextRows[index], nextRows[target]] = [nextRows[target], nextRows[index]];
    setDraftRows(nextRows.map((row, rowIndex) => ({ ...row, ordem: rowIndex + 1 })));
  };

  const removeRow = (index: number) => {
    FancyAlert.alert('Remover seção', 'Esta seção será removida do arranjo desta ocorrência.', [
      { text: 'Cancelar', style: 'default' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          setDraftRows((current) => current.filter((_row, rowIndex) => rowIndex !== index).map((row, rowIndex) => ({ ...row, ordem: rowIndex + 1 })));
        },
      },
    ]);
  };

  const handleSalvarEstrutura = async () => {
    await substituirEstrutura({
      ministerioId,
      dataOcorrencia,
      itens: draftRows.map((row, index) => ({
        ordem: index + 1,
        secaoRepertorioId: row.secaoRepertorioId || undefined,
        rotuloCustomizado: row.rotuloCustomizado || undefined,
        tipo: row.secaoRepertorioId ? undefined : row.tipo,
        letraOverride: row.letraOverride || undefined,
        cifraOverride: row.cifraOverride || undefined,
        repeticoes: row.repeticoes,
        observacao: row.observacao || undefined,
      })),
    });
  };

  const handleRestaurarPadrao = async () => {
    FancyAlert.alert('Restaurar arranjo padrão', 'O arranjo desta ocorrência voltará a usar a estrutura padrão do repertório.', [
      { text: 'Cancelar', style: 'default' },
      {
        text: 'Restaurar',
        onPress: () => {
          void removerOverrideEstrutura();
        },
      },
    ]);
  };

  const arranjoTab = (
    <FancyScrollView contentContainerStyle={styles.tabContent}>
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: palette.backgroundColor4,
            borderColor: ColorUtils.withAlpha(palette.primary, 0.14),
            ...palette.shadows[100],
          },
        ]}
      >
        <View style={styles.summaryHeader}>
          <View style={styles.summaryInfo}>
            <FancyText type='bold' size='large'>
              {item?.nome || 'Música'}
            </FancyText>
            <FancyText size='small' color={palette.fonts.inactive}>
              {[
                item?.tom ? `Tom ${item.tom}` : null,
                item?.bpm ? `${item.bpm} bpm` : null,
                `${estruturaResolvida.length} seções`,
                `~${duracaoEstimada}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </FancyText>
          </View>

          <FancyChips
            label={
              estrutura?.origem === 'OCORRENCIA'
                ? 'Ocorrência'
                : estrutura?.origem === 'REPERTORIO'
                  ? 'Padrão'
                  : 'Manual'
            }
            size='small'
            color={estrutura?.origem === 'OCORRENCIA' ? palette.terciary : palette.primary}
            backgroundColor={ColorUtils.withAlpha(
              estrutura?.origem === 'OCORRENCIA' ? palette.terciary : palette.primary,
              0.1,
            )}
          />
        </View>

        {canEdit ? (
          <View style={styles.summaryActions}>
            <FancyButton
              label='Adicionar seção'
              type='light'
              icon={{ library: 'Feather', name: 'plus', size: 16, color: palette.primary }}
              containerStyle={styles.summaryActionButton}
              onPress={() => openEditor()}
            />
            {estrutura?.origem === 'OCORRENCIA' ? (
              <FancyButton
                label='Restaurar padrão'
                type='text'
                icon={{ library: 'MaterialCommunityIcons', name: 'restore', size: 16, color: palette.terciary }}
                containerStyle={styles.summaryActionButton}
                onPress={() => void handleRestaurarPadrao()}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {draftRows.map((row, index) => {
        const secaoBase = row.secaoRepertorioId
          ? secoesRepertorio.find((secao) => secao.id === row.secaoRepertorioId)
          : null;
        const tipoSecao = (row.tipo || secaoBase?.tipo || RepertorioMusicaSecaoTipoEnum.PERSONALIZADO) as RepertorioMusicaSecaoTipoEnum;
        const visual = secaoVisualMap[tipoSecao];
        const repeticoes = row.repeticoes || 1;

        return (
          <View
            key={row.key}
            style={[
              styles.sectionCard,
              {
                backgroundColor: palette.backgroundColor2,
                borderColor: ColorUtils.withAlpha(visual.color, 0.2),
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIndex, { backgroundColor: ColorUtils.withAlpha(visual.color, 0.12) }]}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name={visual.icon}
                  size={16}
                  color={visual.color}
                />
              </View>

              <View style={styles.sectionContent}>
                <View style={styles.sectionTitleRow}>
                  <FancyText type='semiBold' size='small'>
                    {secaoBase?.rotulo || row.rotuloCustomizado || visual.label}
                  </FancyText>
                  <FancyChips
                    label={visual.label}
                    size='small'
                    color={visual.color}
                    backgroundColor={ColorUtils.withAlpha(visual.color, 0.1)}
                  />
                </View>

                <FancyText size='extraSmall' color={palette.fonts.inactive}>
                  {repeticoes > 1 ? `${repeticoes}x seguidas` : '1 execução'}
                  {row.observacao ? ` · ${row.observacao}` : ''}
                </FancyText>

                <FancyText size='extraSmall' color={palette.fonts.dark} numberOfLines={3} style={styles.sectionPreview}>
                  {(row.letraOverride || secaoBase?.letra || 'Sem letra cadastrada.').replace(/\n+/g, ' ')}
                </FancyText>
              </View>

              {canEdit ? (
                <View style={styles.sectionActions}>
                  <FancyButton
                    type='text'
                    mode='icon'
                    icon={{ library: 'Feather', name: 'chevron-up', size: 16, color: palette.primary }}
                    containerStyle={styles.smallIconButton}
                    onPress={() => moveRow(index, -1)}
                  />
                  <FancyButton
                    type='text'
                    mode='icon'
                    icon={{ library: 'Feather', name: 'edit-2', size: 14, color: palette.primary }}
                    containerStyle={styles.smallIconButton}
                    onPress={() => openEditor(index)}
                  />
                  <FancyButton
                    type='text'
                    mode='icon'
                    icon={{ library: 'Feather', name: 'chevron-down', size: 16, color: palette.primary }}
                    containerStyle={styles.smallIconButton}
                    onPress={() => moveRow(index, 1)}
                  />
                  <FancyButton
                    type='text'
                    mode='icon'
                    icon={{ library: 'Feather', name: 'trash-2', size: 14, color: palette.error }}
                    containerStyle={styles.smallIconButton}
                    onPress={() => removeRow(index)}
                  />
                </View>
              ) : null}
            </View>
          </View>
        );
      })}

      {canEdit ? (
        <FancyButton
          label='Salvar arranjo da ocorrência'
          icon={{ library: 'Feather', name: 'save', size: 16 }}
          isLoading={isMutating}
          onPress={() => void handleSalvarEstrutura()}
          containerStyle={styles.saveButton}
        />
      ) : null}
    </FancyScrollView>
  );

  const letraTab = (
    <FancyScrollView contentContainerStyle={styles.tabContent}>
      {estruturaResolvida.map((row) => {
        const secaoBase = row.secaoRepertorio;
        const tipoSecao = (row.tipo || secaoBase?.tipo || RepertorioMusicaSecaoTipoEnum.PERSONALIZADO) as RepertorioMusicaSecaoTipoEnum;
        const visual = secaoVisualMap[tipoSecao];
        const repeticoes = row.repeticoes || 1;
        return (
          <View key={row.id} style={styles.letraSection}>
            <View style={styles.letraHeader}>
              <FancyText type='bold' size='small' color={visual.color}>
                {secaoBase?.rotulo || row.rotulo}
              </FancyText>
              {repeticoes > 1 ? (
                <FancyText size='extraSmall' color={palette.fonts.inactive}>
                  {repeticoes}x
                </FancyText>
              ) : null}
            </View>
            <FancyText size='small' style={styles.letraText}>
              {row.letra || 'Sem letra cadastrada.'}
            </FancyText>
          </View>
        );
      })}
    </FancyScrollView>
  );

  const tabs: TabItem[] = [
    {
      title: 'Arranjo',
      icon: { library: 'MaterialCommunityIcons', name: 'playlist-music-outline', size: 18 },
      content: arranjoTab,
    },
    {
      title: 'Letra',
      icon: { library: 'MaterialCommunityIcons', name: 'text-box-outline', size: 18 },
      content: letraTab,
    },
  ];

  if (isLoadingSetlist || isLoadingEstrutura || !item) {
    return <FancyLoading />;
  }

  return (
    <>
      <FancyPageView style={styles.page}>
        <FancyTabs
          items={tabs}
          containerStyle={{ flex: 1 }}
          headerStyle={styles.headerStyle}
          contentContainerStyle={{ flex: 1, paddingHorizontal: 18 }}
        />
      </FancyPageView>

      <FancyBottomSheetModal
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        title={editingIndex !== null ? 'Editar seção' : 'Adicionar seção'}
        footer={
          <FancyButton
            label='Salvar seção'
            onPress={handleSaveRow}
          />
        }
      >
        <View style={styles.editorForm}>
          <FancyBottomSheetSelect
            label='Base da seção'
            title='Selecionar seção'
            value={secaoSelecionada}
            onChange={(value) => setSecaoSelecionada(String(value || CUSTOM_SECTION_VALUE))}
            listItems={sectionOptions}
          />

          {secaoSelecionada === CUSTOM_SECTION_VALUE ? (
            <>
              <FancyBottomSheetSelect
                label='Tipo'
                title='Tipo da seção'
                value={tipo}
                onChange={(value) => setTipo(value as RepertorioMusicaSecaoTipoEnum)}
                listItems={typeOptions}
              />
              <FancyTextInput
                label='Rótulo'
                value={rotuloCustomizado}
                inputProps={{ onChangeText: setRotuloCustomizado }}
              />
            </>
          ) : null}

          <View style={styles.inlineFields}>
            <FancyTextInput
              label='Repetições'
              value={repeticoes}
              containerStyle={{ flex: 1 }}
              inputProps={{ keyboardType: 'numeric', onChangeText: setRepeticoes }}
            />
            <FancyTextInput
              label='Observação'
              value={observacao}
              containerStyle={{ flex: 2 }}
              inputProps={{ onChangeText: setObservacao }}
            />
          </View>

          <FancyTextInput
            label='Letra desta ocorrência'
            value={letraOverride}
            inputProps={{ onChangeText: setLetraOverride, multiline: true, style: { minHeight: 90, textAlignVertical: 'top' } }}
          />
          <FancyTextInput
            label='Cifra desta ocorrência'
            value={cifraOverride}
            inputProps={{ onChangeText: setCifraOverride, multiline: true, style: { minHeight: 90, textAlignVertical: 'top' } }}
          />
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingBottom: 10,
  },
  headerStyle: {
    paddingHorizontal: 18,
  },
  tabContent: {
    paddingTop: 10,
    paddingBottom: 120,
    gap: 14,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryInfo: {
    flex: 1,
    gap: 4,
  },
  summaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryActionButton: {
    height: 36,
    minWidth: 0,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    flex: 1,
    gap: 5,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionPreview: {
    marginTop: 4,
    lineHeight: 18,
  },
  sectionActions: {
    gap: 4,
  },
  smallIconButton: {
    minWidth: 30,
    width: 30,
    height: 30,
  },
  saveButton: {
    marginTop: 4,
    height: 42,
  },
  letraSection: {
    gap: 8,
  },
  letraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  letraText: {
    lineHeight: 22,
  },
  editorForm: {
    gap: 14,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 10,
  },
});
