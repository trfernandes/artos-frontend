import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyBottomSheetSelect from '../../fields/FancyBottomSheetSelect';
import FancyButton from '../../buttons/FancyButton';
import FancyList from '../../list/FancyList';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyLoading from '../../FancyLoading';
import FancyText from '../../FancyText';
import FancyTextInput from '../../fields/FancyTextInput';
import { FancyAlert } from '../../modal/FancyAlert';
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

type EquipeFiltro = 'todos' | 'confirmados' | 'pendentes' | 'vagas';

type Props = {
  eventoId: string;
  dataOcorrencia: Date;
  ministerioId?: string;
  modo: 'lider' | 'voluntario';
  responsavelSetlistVoluntarioIdFallback?: string;
  responsavelSetlistVoluntarioNomeFallback?: string;
};

const LIST_GAP = 10;

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

  const isLeaderMode = modo === 'lider';
  const dataOcorrenciaIso = dataOcorrencia.toISOString();

  const { data, isLoading, refetch } = useEventoEquipe(eventoId, dataOcorrenciaIso, ministerioId);
  const { ministerioVoluntariosList, isLoadingMinisterioVoluntarios } =
    useVoluntariosDoMinisterioCrud(ministerioId, MinisterioVoluntarioStatusEnum.Ativo);
  const { update } = useEscalaItensCrud();

  const [substituicaoVisible, setSubstituicaoVisible] = useState(false);
  const [escalaItemSelecionadoId, setEscalaItemSelecionadoId] = useState<string | null>(null);
  const [novoMinisterioVoluntarioId, setNovoMinisterioVoluntarioId] = useState('');
  const [motivoSubstituicao, setMotivoSubstituicao] = useState('');
  const [isSalvandoSubstituicao, setIsSalvandoSubstituicao] = useState(false);
  const [isRemovendoVoluntario, setIsRemovendoVoluntario] = useState(false);

  const voluntariosEscaladosIds = useMemo(
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

  const integrantesExibidos = useMemo<Integrante[]>(() => {
    // Ordena por nome do voluntário (locale pt-BR); vagas abertas ficam no final
    return [...integrantesFlat].sort((a, b) => {
      const nomeA = a.voluntario?.nome ?? '';
      const nomeB = b.voluntario?.nome ?? '';
      if (!nomeA && !nomeB) return 0;
      if (!nomeA) return 1;
      if (!nomeB) return -1;
      return nomeA.localeCompare(nomeB, 'pt-BR', { sensitivity: 'base' });
    });
  }, [integrantesFlat]);

  const [filtro, setFiltro] = useState<EquipeFiltro>('todos');

  const statusCounts = useMemo(() => {
    let confirmados = 0;
    let pendentes = 0;
    let vagas = 0;
    integrantesFlat.forEach((integrante) => {
      if (!integrante.voluntario) {
        vagas += 1;
        return;
      }
      if (integrante.status === EscalaItemStatusEnum.Confirmado) {
        confirmados += 1;
      } else {
        pendentes += 1;
      }
    });
    return { confirmados, pendentes, vagas };
  }, [integrantesFlat]);

  const matchesFiltro = (integrante: Integrante, f: EquipeFiltro) => {
    switch (f) {
      case 'confirmados':
        return !!integrante.voluntario && integrante.status === EscalaItemStatusEnum.Confirmado;
      case 'pendentes':
        return !!integrante.voluntario && integrante.status !== EscalaItemStatusEnum.Confirmado;
      case 'vagas':
        return !integrante.voluntario;
      default:
        return true;
    }
  };

  const substituicaoOptions = useMemo(() => {
    const integranteAtual = data?.grupos
      .flatMap((grupo) => grupo.integrantes)
      .find((integrante) => integrante.escalaItemId === escalaItemSelecionadoId);

    const funcaoAtualId = integranteAtual?.funcaoId ?? null;

    return ministerioVoluntariosList
      .filter((mv) => {
        const voluntarioId = mv.voluntarioId;
        if (!voluntarioId || voluntarioId === integranteAtual?.voluntarioId) return false;
        if (voluntariosEscaladosIds.has(voluntarioId)) return false;
        if (!funcaoAtualId) return true;
        const funcoes = mv.funcoes ?? [];
        return funcoes.length === 0 || funcoes.some((f) => f.funcaoId === funcaoAtualId);
      })
      .map((mv) => ({
        title: mv.voluntario?.nome || 'Voluntário',
        value: mv.id,
        left: {
          type: 'image' as const,
          source:
            mv.voluntario?.fotoThumbUrl || mv.voluntario?.fotoUrl
              ? { uri: mv.voluntario?.fotoThumbUrl || mv.voluntario?.fotoUrl || '' }
              : AppImages.emptyProfile,
        },
      }));
  }, [data?.grupos, escalaItemSelecionadoId, voluntariosEscaladosIds, ministerioVoluntariosList]);

  const openSubstituicaoSheet = (escalaItemId: string) => {
    setEscalaItemSelecionadoId(escalaItemId);
    setNovoMinisterioVoluntarioId('');
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
    if (isSalvandoSubstituicao || !escalaItemSelecionadoId || !novoMinisterioVoluntarioId) return;

    try {
      setIsSalvandoSubstituicao(true);
      await update?.({
        id: escalaItemSelecionadoId,
        // EscalaItem.voluntarioId aponta para ministerio_voluntarios.id no backend.
        data: { voluntarioId: novoMinisterioVoluntarioId },
      });
      await invalidateEquipe();
      setSubstituicaoVisible(false);
      requestAnimationFrame(() => {
        Toast.show({
          type: 'success',
          text1: 'Voluntário substituído',
          text2: motivoSubstituicao ? `Motivo registrado: ${motivoSubstituicao}` : undefined,
        });
      });
    } catch (error) {
      setSubstituicaoVisible(false);
      requestAnimationFrame(() => {
        Toast.show({
          type: 'error',
          text1: 'Erro ao substituir voluntário',
          text2: getApiErrorMessage(error, 'Não foi possível atualizar a escala desta ocorrência.'),
        });
      });
    } finally {
      setIsSalvandoSubstituicao(false);
    }
  };

  const handleRemoverVoluntario = (escalaItemId: string) => {
    if (isRemovendoVoluntario) return;

    const integrante = integrantesFlat.find((item) => item.escalaItemId === escalaItemId);
    const nome = integrante?.voluntario?.nome || 'este voluntário';

    FancyAlert.alert(
      'Remover voluntário da escala',
      `A vaga de ${nome} ficará pendente nesta ocorrência.`,
      [
        { text: 'Cancelar', style: 'default' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                setIsRemovendoVoluntario(true);
                await update?.({
                  id: escalaItemId,
                  data: {
                    voluntarioId: null as any,
                    status: EscalaItemStatusEnum.Pendente,
                  },
                });
                await invalidateEquipe();
                Toast.show({
                  type: 'success',
                  text1: 'Voluntário removido',
                  text2: 'A vaga voltou para pendente na equipe.',
                });
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Erro ao remover voluntário',
                  text2: getApiErrorMessage(error, 'Não foi possível liberar esta vaga da escala.'),
                });
              } finally {
                setIsRemovendoVoluntario(false);
              }
            })();
          },
        },
      ],
    );
  };

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
      <View style={styles.filtersWrap}>
        <EquipeFiltroChip
          label='Todos'
          count={integrantesFlat.length}
          color={palette.primary}
          active={filtro === 'todos'}
          onPress={() => setFiltro('todos')}
        />
        <EquipeFiltroChip
          label='Confirmados'
          count={statusCounts.confirmados}
          color={palette.confirm}
          active={filtro === 'confirmados'}
          onPress={() => setFiltro((f) => (f === 'confirmados' ? 'todos' : 'confirmados'))}
        />
        <EquipeFiltroChip
          label='Pendentes'
          count={statusCounts.pendentes}
          color={palette.warning}
          active={filtro === 'pendentes'}
          onPress={() => setFiltro((f) => (f === 'pendentes' ? 'todos' : 'pendentes'))}
        />
        <EquipeFiltroChip
          label='Vagas'
          count={statusCounts.vagas}
          color={palette.error}
          active={filtro === 'vagas'}
          onPress={() => setFiltro((f) => (f === 'vagas' ? 'todos' : 'vagas'))}
        />
      </View>

      <FancyList<Integrante>
        containerStyle={styles.listContainer}
        data={integrantesExibidos}
        keyExtractor={(item) => item.escalaItemId}
        key='team-grid'
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: LIST_GAP }} />}
        listEmptyProps={{
          label: 'Nenhum integrante escalado ainda.',
          icon: { library: 'MaterialCommunityIcons', name: 'account-search-outline', size: 56 },
        }}
        renderItem={({ item, index }) => {
          const isCurrentUser = item.voluntario?.id === user?.user?.id;
          return (
            <EquipeMemberCard
              integrante={item}
              isCurrentUser={isCurrentUser}
              isLeaderMode={isLeaderMode}
              dimmed={!matchesFiltro(item, filtro)}
              index={index}
              onSubstituir={openSubstituicaoSheet}
              onRemover={isLeaderMode ? handleRemoverVoluntario : undefined}
            />
          );
        }}
      />

      <FancyBottomSheetModal
        visible={substituicaoVisible}
        onClose={() => {
          if (!isSalvandoSubstituicao) {
            setSubstituicaoVisible(false);
          }
        }}
        title='Substituir voluntário'
        closeDisabled={isSalvandoSubstituicao}
        footer={
          <FancyButton
            label='Confirmar'
            loadingText='Substituindo...'
            icon={{ library: 'MaterialCommunityIcons', name: 'check', size: 18 }}
            isLoading={isSalvandoSubstituicao}
            disabled={!novoMinisterioVoluntarioId || isSalvandoSubstituicao}
            onPress={() => void handleSubstituir()}
          />
        }
      >
        <View style={styles.sheetFormWrapper}>
          <View style={[styles.sheetForm, isSalvandoSubstituicao && styles.sheetFormDisabled]}>
            <FancyBottomSheetSelect
              label='Novo voluntário'
              title='Selecionar substituto'
              value={novoMinisterioVoluntarioId}
              onChange={(value: string) => setNovoMinisterioVoluntarioId(String(value || ''))}
              listItems={substituicaoOptions}
              disabled={isSalvandoSubstituicao}
            />
            <FancyTextInput
              label='Motivo'
              value={motivoSubstituicao}
              disabled={isSalvandoSubstituicao}
              inputProps={{
                onChangeText: setMotivoSubstituicao,
                multiline: true,
                style: { minHeight: 90, textAlignVertical: 'top' },
              }}
            />
          </View>
          {isSalvandoSubstituicao ? (
            <Pressable
              accessibilityLabel='Substituição em andamento'
              style={styles.sheetBlockingOverlay}
              onPress={() => undefined}
            />
          ) : null}
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

function EquipeFiltroChip({
  label,
  count,
  color,
  active,
  onPress,
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  const activeBg = ColorUtils.withAlpha(color, 0.14);
  const inactiveBg = ColorUtils.withAlpha(color, 0.06);
  const inactiveBorder = ColorUtils.withAlpha(color, 0.3);
  const chipBg = active ? activeBg : inactiveBg;
  const chipBorder = active ? color : inactiveBorder;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: chipBg,
          borderColor: chipBorder,
        },
      ]}
    >
      <FancyText size='extraSmall' type='semiBold' color={color}>
        {label}
      </FancyText>
      <FancyText size='extraSmall' type='bold' color={color}>
        {count}
      </FancyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LIST_GAP,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 15,
  },
  columnWrapper: {
    gap: LIST_GAP,
  },
  sheetForm: {
    gap: 14,
  },
  sheetFormWrapper: {
    position: 'relative',
  },
  sheetFormDisabled: {
    opacity: 0.72,
  },
  sheetBlockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    zIndex: 10,
  },
});
