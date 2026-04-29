import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyBottomSheetSelect from '../../fields/FancyBottomSheetSelect';
import FancyButton from '../../buttons/FancyButton';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyLoading from '../../FancyLoading';
import FancyText from '../../FancyText';
import FancyTextInput from '../../fields/FancyTextInput';
import EquipeMemberCard from './EquipeMemberCard';
import { AppImages } from '../../../assets/app_images';
import { getApiErrorMessage } from '../../../domain/api/api-error';
import { EscalaItemStatusEnum } from '../../../domain/enums/Escala/escala-item-status.enum';
import { MinisterioVoluntarioStatusEnum } from '../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { useAuth } from '../../../contexts/AuthContext';
import { usePallete } from '../../../hooks/usePallete';
import { useEscalaItensCrud } from '../../../hooks/useEscalaItensCrud';
import { useEventoEquipe } from '../../../hooks/useEventoEquipe';
import { useVoluntariosDoMinisterioCrud } from '../../../hooks/useVoluntariosDoMinisterioCrud';
import { ColorUtils } from '../../../utils/color_utils';
import { ResponseEquipeOcorrenciaIntegranteDto } from '../../../domain/dtos/Evento/evento-equipe.response';

type Integrante = ResponseEquipeOcorrenciaIntegranteDto & { nomeFuncao: string };

type Props = {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  modo: 'lider' | 'voluntario';
  responsavelSetlistVoluntarioIdFallback?: string;
  responsavelSetlistVoluntarioNomeFallback?: string;
};

type TeamStatusFilter = 'all' | EscalaItemStatusEnum;

const GRID_GAP = 10;
const GRID_PADDING_H = 0; // padding horizontal já vem do contentContainerStyle das FancyTabs (20px)

/** Número de colunas baseado na largura da tela */
function getColumnCount(screenWidth: number): number {
  if (screenWidth >= 768) return 4;
  if (screenWidth < 360) return 2;
  return 3;
}

export default function EquipeOcorrenciaView({
  eventoId,
  dataOcorrencia,
  ministerioId,
  modo,
  responsavelSetlistVoluntarioIdFallback,
  responsavelSetlistVoluntarioNomeFallback,
}: Props) {
  const palette = usePallete();
  const queryClient = useQueryClient();
  const { user, igrejaAtiva } = useAuth();
  const { width: screenWidth } = useWindowDimensions();

  const columnCount = getColumnCount(screenWidth);
  const isLeaderMode = modo === 'lider';
  const dataOcorrenciaIso = dataOcorrencia.toISOString();

  const { data, isLoading, refetch } = useEventoEquipe(eventoId, dataOcorrenciaIso, ministerioId);
  const { ministerioVoluntariosList, isLoadingMinisterioVoluntarios } = useVoluntariosDoMinisterioCrud(
    ministerioId,
    MinisterioVoluntarioStatusEnum.Ativo,
  );
  const { update } = useEscalaItensCrud();

  const [statusFilter, setStatusFilter] = useState<TeamStatusFilter>('all');
  const [substituicaoVisible, setSubstituicaoVisible] = useState(false);
  const [escalaItemSelecionadoId, setEscalaItemSelecionadoId] = useState<string | null>(null);
  const [novoVoluntarioId, setNovoVoluntarioId] = useState('');
  const [motivoSubstituicao, setMotivoSubstituicao] = useState('');
  const [isSalvandoSubstituicao, setIsSalvandoSubstituicao] = useState(false);

  const integrantesEscaladosIds = useMemo(
    () =>
      new Set(
        data?.grupos
          .flatMap((grupo) => grupo.integrantes.map((integrante) => integrante.voluntarioId))
          .filter(Boolean) ?? [],
      ),
    [data?.grupos],
  );

  const integrantesFlat = useMemo<Integrante[]>(
    () =>
      data?.grupos.flatMap((grupo) =>
        grupo.integrantes.map((integrante) => ({
          ...integrante,
          nomeFuncao: grupo.nomeFuncao,
        })),
      ) ?? [],
    [data?.grupos],
  );

  const statusSummary = useMemo(() => {
    const confirmed = integrantesFlat.filter((item) => item.status === EscalaItemStatusEnum.Confirmado).length;
    const pending = integrantesFlat.filter((item) => item.status === EscalaItemStatusEnum.Pendente).length;
    const absent = integrantesFlat.filter(
      (item) =>
        item.status === EscalaItemStatusEnum.Ausente || item.status === EscalaItemStatusEnum.Substituido,
    ).length;

    return [
      {
        key: EscalaItemStatusEnum.Confirmado as TeamStatusFilter,
        label: 'Confirmados',
        count: confirmed,
        icon: 'check-circle-outline' as const,
        color: palette.confirm,
      },
      {
        key: EscalaItemStatusEnum.Pendente as TeamStatusFilter,
        label: 'Pendentes',
        count: pending,
        icon: 'clock-outline' as const,
        color: palette.warning,
      },
      {
        key: EscalaItemStatusEnum.Ausente as TeamStatusFilter,
        label: 'Ausentes',
        count: absent,
        icon: 'close-circle-outline' as const,
        color: palette.error,
      },
    ];
  }, [integrantesFlat, palette.confirm, palette.error, palette.warning]);

  const integrantesExibidos = useMemo<Integrante[]>(() => {
    let lista = integrantesFlat;

    if (statusFilter !== 'all') {
      if (statusFilter === EscalaItemStatusEnum.Ausente) {
        lista = lista.filter(
          (item) =>
            item.status === EscalaItemStatusEnum.Ausente ||
            item.status === EscalaItemStatusEnum.Substituido,
        );
      } else {
        lista = lista.filter((item) => item.status === statusFilter);
      }
    }

    // Ordena por nome do voluntário (locale pt-BR); vagas abertas ficam no final
    return [...lista].sort((a, b) => {
      const nomeA = a.voluntario?.nome ?? '';
      const nomeB = b.voluntario?.nome ?? '';
      if (!nomeA && !nomeB) return 0;
      if (!nomeA) return 1;
      if (!nomeB) return -1;
      return nomeA.localeCompare(nomeB, 'pt-BR', { sensitivity: 'base' });
    });
  }, [integrantesFlat, statusFilter]);

  const substituicaoOptions = useMemo(() => {
    const integranteAtual = data?.grupos
      .flatMap((grupo) => grupo.integrantes)
      .find((integrante) => integrante.escalaItemId === escalaItemSelecionadoId);

    const funcaoAtualId = integranteAtual?.funcaoId ?? null;

    return ministerioVoluntariosList
      .filter((mv) => {
        const voluntarioId = mv.voluntarioId;
        if (!voluntarioId || voluntarioId === integranteAtual?.voluntarioId) return false;
        if (integrantesEscaladosIds.has(voluntarioId)) return false;
        if (!funcaoAtualId) return true;
        const funcoes = mv.funcoes ?? [];
        return funcoes.length === 0 || funcoes.some((f) => f.funcaoId === funcaoAtualId);
      })
      .map((mv) => ({
        title: mv.voluntario?.nome || 'Voluntário',
        value: mv.voluntarioId,
        left: {
          type: 'image' as const,
          source:
            mv.voluntario?.fotoThumbUrl || mv.voluntario?.fotoUrl
              ? { uri: mv.voluntario?.fotoThumbUrl || mv.voluntario?.fotoUrl || '' }
              : AppImages.emptyProfile,
        },
      }));
  }, [data?.grupos, escalaItemSelecionadoId, integrantesEscaladosIds, ministerioVoluntariosList]);

  const openSubstituicaoSheet = (escalaItemId: string) => {
    setEscalaItemSelecionadoId(escalaItemId);
    setNovoVoluntarioId('');
    setMotivoSubstituicao('');
    setSubstituicaoVisible(true);
  };

  const invalidateEquipe = async () => {
    if (!igrejaAtiva?.id) return;
    await queryClient.invalidateQueries({
      queryKey: ['evento-equipe', igrejaAtiva.id, eventoId, ministerioId, dataOcorrenciaIso],
    });
    await queryClient.invalidateQueries({ queryKey: ['eventos'] });
    await queryClient.invalidateQueries({
      queryKey: ['evento-setlist', igrejaAtiva.id, ministerioId, eventoId, dataOcorrenciaIso],
    });
    await refetch();
  };

  const handleSubstituir = async () => {
    if (!escalaItemSelecionadoId || !novoVoluntarioId) return;

    try {
      setIsSalvandoSubstituicao(true);
      await update?.({
        id: escalaItemSelecionadoId,
        data: { voluntarioId: novoVoluntarioId },
      });
      await invalidateEquipe();
      setSubstituicaoVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Voluntário substituído',
        text2: motivoSubstituicao ? `Motivo registrado: ${motivoSubstituicao}` : undefined,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao substituir voluntário',
        text2: getApiErrorMessage(error, 'Não foi possível atualizar a escala desta ocorrência.'),
      });
    } finally {
      setIsSalvandoSubstituicao(false);
    }
  };

  // ── Componente de cabeçalho da lista (painel de filtros, modo líder) ──
  const ListHeader = useMemo(() => {
    if (!isLeaderMode) return null;
    return (
      <View
        style={[
          styles.summaryPanel,
          {
            backgroundColor: palette.backgroundColor4,
            borderColor: ColorUtils.withAlpha(palette.borderCard, 0.5),
          },
          palette.shadows[100],
        ]}
      >
        {statusSummary.map((item, index) => {
          const isActive = statusFilter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setStatusFilter((current) => (current === item.key ? 'all' : item.key))}
              style={[
                styles.summaryStat,
                index < statusSummary.length - 1 && {
                  borderRightWidth: 1,
                  borderRightColor: ColorUtils.withAlpha(palette.borderCard, 0.34),
                },
                isActive && { backgroundColor: ColorUtils.withAlpha(item.color, 0.08) },
              ]}
            >
              <View style={styles.summaryStatTop}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={15}
                  color={isActive ? item.color : ColorUtils.withAlpha(item.color, 0.92)}
                />
                <FancyText
                  type='bold'
                  size='small'
                  style={[styles.summaryCount, { color: isActive ? item.color : palette.fonts.dark }]}
                >
                  {item.count}
                </FancyText>
              </View>
              <FancyText
                type='medium'
                size='extraSmall'
                numberOfLines={1}
                style={[
                  styles.summaryLabel,
                  { color: isActive ? item.color : palette.fonts.inactive },
                ]}
              >
                {item.label}
              </FancyText>
            </Pressable>
          );
        })}
      </View>
    );
  }, [
    isLeaderMode,
    palette,
    statusFilter,
    statusSummary,
  ]);

  if (isLoading || (isLeaderMode && isLoadingMinisterioVoluntarios)) {
    return <FancyLoading />;
  }

  if (!data || data.grupos.length === 0) {
    return (
      <FancyListEmpty
        label='Nenhuma equipe escalada para esta ocorrência.'
        icon={{ library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 56 }}
      />
    );
  }

  return (
    <>
      <FlatList<Integrante>
        data={integrantesExibidos}
        keyExtractor={(item) => item.escalaItemId}
        numColumns={columnCount}
        key={`grid-${columnCount}`} // força re-mount quando o número de colunas muda
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: GRID_PADDING_H },
        ]}
        columnWrapperStyle={columnCount > 1 ? styles.columnWrapper : undefined}
        // Espaçamento vertical entre linhas (igual ao horizontal do columnWrapper)
        ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
        renderItem={({ item, index }) => {
          const isCurrentUser = item.voluntario?.id === user?.user?.id;
          return (
            // alignSelf 'stretch' + flex:1 no surface = todos os cards da linha
            // ficam com a mesma altura (altura do mais alto da linha)
            <View style={[styles.cardCell, { flex: 1 / columnCount }]}>
              <EquipeMemberCard
                integrante={item}
                isCurrentUser={isCurrentUser}
                isLeaderMode={isLeaderMode}
                index={index}
                onSubstituir={openSubstituicaoSheet}
              />
            </View>
          );
        }}
        removeClippedSubviews
        initialNumToRender={12}
      />

      <FancyBottomSheetModal
        visible={substituicaoVisible}
        onClose={() => setSubstituicaoVisible(false)}
        title='Substituir voluntário'
        footer={
          <FancyButton
            label='Confirmar'
            icon={{ library: 'MaterialCommunityIcons', name: 'check', size: 18 }}
            isLoading={isSalvandoSubstituicao}
            disabled={!novoVoluntarioId}
            onPress={() => void handleSubstituir()}
          />
        }
      >
        <View style={styles.sheetForm}>
          <FancyBottomSheetSelect
            label='Novo voluntário'
            title='Selecionar substituto'
            value={novoVoluntarioId}
            onChange={(value: string) => setNovoVoluntarioId(String(value || ''))}
            listItems={substituicaoOptions}
          />
          <FancyTextInput
            label='Motivo'
            value={motivoSubstituicao}
            inputProps={{
              onChangeText: setMotivoSubstituicao,
              multiline: true,
              style: { minHeight: 90, textAlignVertical: 'top' },
            }}
          />
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: GRID_GAP,
  },
  cardCell: {
    // flex definido inline; stretch faz todos os cards da linha terem mesma altura
    alignSelf: 'stretch',
  },
  // ── Painel de resumo (modo líder) ──
  summaryPanel: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: GRID_GAP,
  },
  summaryStat: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 4,
  },
  summaryStatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  summaryCount: {
    fontSize: 15,
    lineHeight: 17,
  },
  summaryLabel: {
    textAlign: 'center',
    fontSize: 10.6,
    lineHeight: 12.2,
  },
  sheetForm: {
    gap: 14,
  },
});
