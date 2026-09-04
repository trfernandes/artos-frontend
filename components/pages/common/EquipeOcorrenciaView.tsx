import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import DefaultIcons from '../../FancyIcons';
import FancyList from '../../list/FancyList';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyLoading from '../../FancyLoading';
import FancyText from '../../FancyText';
import FancySegmentedControl from '../../fields/FancySegmentedControl';
import FancyVerticalSpacer from '../../FancyVerticalSpacer';
import {
  ChamadaGridItem,
  ChamadaGridRow,
  ChamadaRow,
  chunkPairs,
  PessoaChamadaRow,
  PessoaFuncaoStatus,
  VagaChamadaRow,
} from './EquipeChamadaRow';
import { EscalaItemStatusEnum } from '../../../domain/enums/Escala/escala-item-status.enum';
import { useAuth } from '../../../contexts/AuthContext';
import { usePallete } from '../../../hooks/usePallete';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useEventoEquipe } from '../../../hooks/useEventoEquipe';
import { ColorUtils } from '../../../utils/color_utils';
import { EscalaItensRepository } from '../../../domain/services/EscalaItensRepository';
import { Operator, ValueType } from '../../../domain/utils/query_utils';
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
}: Props) {
  const palette = usePallete();
  const { user, igrejaAtiva } = useAuth();

  const isLeaderMode = modo === 'lider';
  const dataOcorrenciaIso = dataOcorrencia.toISOString();

  const { data, isLoading } = useEventoEquipe(eventoId, dataOcorrenciaIso, ministerioId);

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

  // Resolve o id da escala (registro que agrupa os itens) a partir de um item já
  // carregado — a listagem de equipe não traz esse id diretamente. Só busca em modo
  // líder, que é o único contexto onde o link "Gerenciar escala" aparece.
  const primeiroEscalaItemId = integrantesFlat[0]?.escalaItemId;
  const { data: escalaId } = useQuery({
    queryKey: ['escala-item-escala-id', igrejaAtiva?.id, primeiroEscalaItemId],
    enabled: isLeaderMode && !!primeiroEscalaItemId && !!igrejaAtiva?.id,
    queryFn: async () => {
      const [item] = await EscalaItensRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: primeiroEscalaItemId },
            },
          ],
        },
        relations: [],
        igrejaId: igrejaAtiva?.id,
      });
      return item?.escalaId ?? null;
    },
  });

  const handleGerenciarEscala = () => {
    if (!escalaId || !ministerioId) return;
    router.push({
      pathname: '/(app)/(drawer)/ministerios/escalas/details',
      params: { escalaId, ministerioId, viewMode: 'edit' },
    });
  };

  const [filtro, setFiltro] = useState<EquipeFiltro>('todos');

  // Cada pessoa aparece uma única vez, mesmo escalada em várias funções — cada função
  // vira um chip de status dentro do card dela. Vagas (sem voluntário) não têm pessoa
  // pra agrupar e continuam uma linha por vaga.
  const { pessoas, vagas } = useMemo(() => {
    const porPessoa = new Map<string, PessoaChamadaRow & { todasConfirmadas: boolean }>();
    const vagasList: VagaChamadaRow[] = [];

    integrantesFlat.forEach((integrante) => {
      const status = integrante.status as EscalaItemStatusEnum;
      const voluntario = integrante.voluntario;

      if (!voluntario) {
        vagasList.push({
          kind: 'vaga',
          key: integrante.escalaItemId,
          nomeFuncao: integrante.nomeFuncao,
        });
        return;
      }

      const funcao: PessoaFuncaoStatus = {
        key: integrante.escalaItemId,
        nomeFuncao: integrante.nomeFuncao,
        status,
      };

      const pessoaId = integrante.voluntarioId || voluntario.id;
      const existente = porPessoa.get(pessoaId);
      if (existente) {
        existente.funcoes.push(funcao);
        existente.todasConfirmadas =
          existente.todasConfirmadas && status === EscalaItemStatusEnum.Confirmado;
        return;
      }

      const isCurrentUser = voluntario.id === user?.user?.id;
      porPessoa.set(pessoaId, {
        kind: 'pessoa',
        key: pessoaId,
        nome: isCurrentUser ? 'Você' : voluntario.nome,
        fotoUrl: voluntario.fotoThumbUrl || voluntario.fotoUrl,
        isCurrentUser,
        funcoes: [funcao],
        todasConfirmadas: status === EscalaItemStatusEnum.Confirmado,
      });
    });

    const pessoasList = Array.from(porPessoa.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }),
    );

    return { pessoas: pessoasList, vagas: vagasList };
  }, [integrantesFlat, user?.user?.id]);

  const statusCounts = useMemo(() => {
    const confirmados = pessoas.filter((p) => p.todasConfirmadas).length;
    const pendentes = pessoas.length - confirmados;
    return { confirmados, pendentes, vagas: vagas.length };
  }, [pessoas, vagas]);

  const rows = useMemo<ChamadaRow[]>(() => {
    const mostrarConfirmados = filtro === 'todos' || filtro === 'confirmados';
    const mostrarNaoConfirmados = filtro === 'todos' || filtro === 'pendentes';
    const mostrarVagas = filtro === 'todos' || filtro === 'pendentes' || filtro === 'vagas';

    const confirmadosVisiveis = mostrarConfirmados ? pessoas.filter((p) => p.todasConfirmadas) : [];
    const naoConfirmadosVisiveis = mostrarNaoConfirmados
      ? pessoas.filter((p) => !p.todasConfirmadas)
      : [];
    const vagasVisiveis = mostrarVagas ? vagas : [];

    // Lista única, sem agrupador por status — o dot de cada função já indica o
    // status individual. Ordenada por nome (pessoa) ou nome da função (vaga).
    const itens: ChamadaGridItem[] = [
      ...confirmadosVisiveis,
      ...naoConfirmadosVisiveis,
      ...vagasVisiveis,
    ].sort((a, b) => {
      const labelA = a.kind === 'pessoa' ? a.nome : a.nomeFuncao;
      const labelB = b.kind === 'pessoa' ? b.nome : b.nomeFuncao;
      return labelA.localeCompare(labelB, 'pt-BR', { sensitivity: 'base' });
    });

    return chunkPairs(itens).map((par, index) => ({
      kind: 'grid-pair',
      key: `grid-${index}`,
      items: par,
    }));
  }, [pessoas, vagas, filtro]);

  if (isLoading) {
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
        <FancySegmentedControl<EquipeFiltro>
          size='sm'
          options={[
            {
              label: 'Todos',
              value: 'todos',
              count: pessoas.length + vagas.length,
              accentColor: palette.primary,
            },
            {
              label: 'Confirmados',
              value: 'confirmados',
              count: statusCounts.confirmados,
              accentColor: palette.confirm,
            },
            {
              label: 'Pendentes',
              value: 'pendentes',
              count: statusCounts.pendentes,
              accentColor: palette.warning,
            },
            {
              label: 'Vagas',
              value: 'vagas',
              count: statusCounts.vagas,
              accentColor: palette.error,
            },
          ]}
          value={filtro}
          onChange={setFiltro}
        />
      </View>

      {isLeaderMode ? (
        <>
          <FancyVerticalSpacer height={6} />
          <GerenciarEscalaLink disabled={!escalaId} onPress={handleGerenciarEscala} />
        </>
      ) : null}

      <FancyList<ChamadaRow>
        containerStyle={styles.listContainer}
        data={rows}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        listEmptyProps={{
          label:
            filtro === 'todos'
              ? 'Nenhum integrante escalado ainda.'
              : 'Nenhum integrante neste filtro.',
          icon: { library: 'MaterialCommunityIcons', name: 'account-search-outline', size: 56 },
        }}
        renderItem={({ item }) => (
          <ChamadaGridRow key={item.key} kind={item.kind} items={item.items} />
        )}
      />
    </>
  );
}

function GerenciarEscalaLink({ disabled, onPress }: { disabled: boolean; onPress: () => void }) {
  const { palette, isDark } = useAppTheme();
  const cardBg = isDark ? palette.backgroundColor4 : ColorUtils.lightenColor(palette.primary, 0.96);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.manageCard,
        { backgroundColor: cardBg },
        disabled && styles.manageCardDisabled,
      ]}
    >
      <View
        style={[
          styles.manageIcon,
          { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12) },
        ]}
      >
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='calendar-edit'
          size={19}
          color={palette.primary}
        />
      </View>
      <View style={styles.manageTextWrap}>
        <FancyText size='small' type='bold' color={palette.fonts.dark}>
          Gerenciar escala
        </FancyText>
        <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
          Substituir, remover ou preencher vagas
        </FancyText>
      </View>
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='chevron-right'
        size={20}
        color={palette.icons.inactive}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filtersWrap: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  manageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  manageCardDisabled: {
    opacity: 0.5,
  },
  manageIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageTextWrap: {
    flex: 1,
    gap: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
});
