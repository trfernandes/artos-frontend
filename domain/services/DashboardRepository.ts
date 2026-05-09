import { addMonths, endOfMonth, isAfter, isBefore, isSameMonth, startOfMonth } from 'date-fns';
import { ResponseDashboardDto, DashboardEventoProximoDto, DashboardSolicitacaoDto } from '../dtos/Dashboard/dashboard.response';
import { ResponseEscalaItemDto } from '../dtos/Escala/escala-item.response';
import { ResponseEventoOcorrenciaDto } from '../dtos/Evento/evento-ocorrencia.response.dto';
import { ResponseLoginMinisterioDto } from '../dtos/login/login.response';
import { EscalaItemStatusEnum } from '../enums/Escala/escala-item-status.enum';
import { EscalaStatusEnum } from '../enums/Escala/escala-status.enum';
import { IgrejaVoluntarioRoleEnum } from '../enums/Igreja/voluntario-role.enum';
import { MinisterioFuncaoStatusEnum } from '../enums/MinisterioFuncao/ministerio-funcao-status.enum';
import { MinisterioStatusEnum } from '../enums/Ministerio/ministerio-status.enum';
import { MinisterioVoluntarioStatusEnum } from '../enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { VoluntarioHierarquiaEnum } from '../enums/MinisterioVoluntario/hierarquia.enum';
import { EscalaItensRepository } from './EscalaItensRepository';
import { IgrejaEventosRepository } from './IgrejaEventosRepository';
import { IgrejaMinisteriosRepository } from './IgrejaMinisteriosRepository';
import { IgrejaRepository } from './IgrejaRepository';
import { Conjunction, DynamicQuery, Operator, OrderDirection, ValueType } from '../utils/query_utils';
import { getOccurrenceDateTimeIso } from '../../utils/evento-datetime';

export interface GetDashboardParams {
  igrejaId: string;
  userId: string;
  role?: string;
  ministeriosUsuario?: ResponseLoginMinisterioDto[];
}

type EscalaStats = {
  totalFuncoes: number;
  totalEscalados: number;
  totalConfirmados: number;
};

type EscalaStatsPerKey = {
  totalFuncoes: number;
  totalEscalados: number;
  totalConfirmados: number;
  porMinisterio: Map<string, EscalaStats>;
};

type MinisterioSlotStats = {
  totalFuncoes: number;
  totalEscalados: number;
  funcoesDescobertas: Set<string>;
  eventosAtivos: Set<string>;
};

const WINDOW_MONTHS_AHEAD = 2;
const UPCOMING_LIMIT = 5;

function isAdminRole(role?: string): boolean {
  return role === IgrejaVoluntarioRoleEnum.ADMIN || role === 'OWNER';
}

function isLeaderRole(role?: string): boolean {
  return role === IgrejaVoluntarioRoleEnum.LIDER;
}

function toIsoSafe(dateValue: string): string {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? dateValue : date.toISOString();
}

function toOccurrenceKey(eventoId?: string, dataOcorrencia?: string): string {
  return `${eventoId || 'sem-evento'}::${toIsoSafe(dataOcorrencia || '')}`;
}

function toDateOrNull(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isWithinMonth(date: Date, monthBase: Date): boolean {
  return isSameMonth(date, monthBase);
}

function getMinisterioIdFromEscalaItem(item: ResponseEscalaItemDto): string | undefined {
  return item.funcao?.ministerioId || item.voluntario?.ministerioId || item.voluntario?.ministerio?.id;
}

function mapEscalaItemToDashboard(item: ResponseEscalaItemDto) {
  const ministerioId = getMinisterioIdFromEscalaItem(item);
  const eventoData = getEscalaItemOccurrenceDateTimeIso(item);
  return {
    id: item.id,
    eventoId: item.eventoId,
    eventoNome: item.evento?.nome || 'Evento',
    eventoData,
    funcaoNome: item.funcao?.nome || 'Sem função',
    ministerioId,
    ministerioNome: item.voluntario?.ministerio?.nome || item.funcao?.ministerio?.nome || 'Ministério',
    ministerioLogoUrl: item.voluntario?.ministerio?.logoThumbUrl || item.voluntario?.ministerio?.logoUrl || undefined,
    eventoLocal: item.evento?.local,
    eventoDescricao: item.evento?.descricao,
    eventoCor: item.evento?.cor,
    horarioEnsaio: item.horarioEnsaio ?? item.evento?.horarioEnsaioPadrao,
    isConfirmado: item.status === EscalaItemStatusEnum.Confirmado,
    evento: item.evento ? {
      nome: item.evento.nome,
      horarioEnsaioPadrao: item.evento.horarioEnsaioPadrao,
      local: item.evento.local,
      descricao: item.evento.descricao,
      cor: item.evento.cor,
    } : undefined,
  };
}

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (__DEV__) {
      console.log('[DashboardRepository] optional source failed:', error);
    }
    return fallback;
  }
}

function buildUserEscalasQuery(
  startDateIso: string,
  endDateIso: string,
  userId?: string,
): DynamicQuery {
  const conditions: any[] = [
    {
      path: 'dataOcorrencia',
      operator: Operator.GTE,
      value: { type: ValueType.LITERAL, value: startDateIso },
    },
    {
      path: 'dataOcorrencia',
      operator: Operator.LTE,
      value: { type: ValueType.LITERAL, value: endDateIso },
    },
  ];

  if (userId) {
    conditions.push({
      path: 'voluntario.voluntario.id',
      operator: Operator.EQUALS,
      value: { type: ValueType.LITERAL, value: userId },
    });
  }

  return {
    where: {
      conjunction: Conjunction.AND,
      conditions,
    },
    orderBy: [{ path: 'dataOcorrencia', direction: OrderDirection.ASC }],
    relations: ['escala', 'evento', 'funcao', 'funcao.ministerio', 'voluntario', 'voluntario.ministerio'],
  };
}

function aggregateEscalas(escalas: ResponseEscalaItemDto[]) {
  const statsByOccurrence = new Map<string, EscalaStatsPerKey>();
  const statsByMinisterio = new Map<string, MinisterioSlotStats>();

  for (const item of escalas) {
    const key = toOccurrenceKey(item.eventoId || item.evento?.id, item.dataOcorrencia);
    const ministerioId = getMinisterioIdFromEscalaItem(item);
    const hasVolunteer = Boolean(item.voluntarioId);

    const occurrenceStats = statsByOccurrence.get(key) || {
      totalFuncoes: 0,
      totalEscalados: 0,
      totalConfirmados: 0,
      porMinisterio: new Map<string, EscalaStats>(),
    };
    occurrenceStats.totalFuncoes += 1;
    if (hasVolunteer) occurrenceStats.totalEscalados += 1;
    if (item.status === EscalaItemStatusEnum.Confirmado) occurrenceStats.totalConfirmados += 1;

    if (ministerioId) {
      const ministerioStats = occurrenceStats.porMinisterio.get(ministerioId) || {
        totalFuncoes: 0,
        totalEscalados: 0,
        totalConfirmados: 0,
      };
      ministerioStats.totalFuncoes += 1;
      if (hasVolunteer) ministerioStats.totalEscalados += 1;
      if (item.status === EscalaItemStatusEnum.Confirmado) ministerioStats.totalConfirmados += 1;
      occurrenceStats.porMinisterio.set(ministerioId, ministerioStats);

      const slotStats = statsByMinisterio.get(ministerioId) || {
        totalFuncoes: 0,
        totalEscalados: 0,
        funcoesDescobertas: new Set<string>(),
        eventosAtivos: new Set<string>(),
      };
      slotStats.totalFuncoes += 1;
      if (hasVolunteer) slotStats.totalEscalados += 1;
      if (!hasVolunteer && item.funcaoId) slotStats.funcoesDescobertas.add(item.funcaoId);
      slotStats.eventosAtivos.add(key);
      statsByMinisterio.set(ministerioId, slotStats);
    }

    statsByOccurrence.set(key, occurrenceStats);
  }

  return { statsByOccurrence, statsByMinisterio };
}

function isPublishedEscalaItem(item: ResponseEscalaItemDto): boolean {
  return !item.escala || item.escala.status === EscalaStatusEnum.Publicada;
}

function getEscalaItemOccurrenceDateTimeIso(item: ResponseEscalaItemDto): string {
  return getOccurrenceDateTimeIso(item.dataOcorrencia, item.evento?.dataInicio);
}

function buildEventCards(
  ocorrencias: ResponseEventoOcorrenciaDto[],
  statsByOccurrence: Map<string, EscalaStatsPerKey>,
  now: Date,
  ministryIds?: Set<string>,
): DashboardEventoProximoDto[] {
  const upcomingOccurrences = ocorrencias
    .filter((ocorrencia) => {
      const data = toDateOrNull(ocorrencia.dataOcorrencia);
      if (!data || isBefore(data, now)) return false;
      if (!ministryIds || ministryIds.size === 0) return true;

      const key = toOccurrenceKey(ocorrencia.eventoId || ocorrencia.id, ocorrencia.dataOcorrencia);
      const stats = statsByOccurrence.get(key);
      if (!stats) return false;
      return Array.from(ministryIds).some((ministryId) => stats.porMinisterio.has(ministryId));
    })
    .sort((a, b) => {
      const da = toDateOrNull(a.dataOcorrencia)?.getTime() || 0;
      const db = toDateOrNull(b.dataOcorrencia)?.getTime() || 0;
      return da - db;
    });

  const seenOccurrenceKeys = new Set<string>();
  const uniqueUpcomingOccurrences = upcomingOccurrences.filter((ocorrencia) => {
    const occurrenceKey = toOccurrenceKey(ocorrencia.eventoId || ocorrencia.id, ocorrencia.dataOcorrencia);
    if (seenOccurrenceKeys.has(occurrenceKey)) return false;
    seenOccurrenceKeys.add(occurrenceKey);
    return true;
  });

  return uniqueUpcomingOccurrences
    .slice(0, UPCOMING_LIMIT)
    .map((ocorrencia) => {
      const occurrenceKey = toOccurrenceKey(ocorrencia.eventoId || ocorrencia.id, ocorrencia.dataOcorrencia);
      const stats = statsByOccurrence.get(occurrenceKey);

      let totalFuncoes = stats?.totalFuncoes || 0;
      let totalEscalados = stats?.totalEscalados || 0;
      let totalConfirmados = stats?.totalConfirmados || 0;

      if (ministryIds && ministryIds.size > 0 && stats) {
        totalFuncoes = 0;
        totalEscalados = 0;
        totalConfirmados = 0;
        for (const ministryId of ministryIds) {
          const item = stats.porMinisterio.get(ministryId);
          if (!item) continue;
          totalFuncoes += item.totalFuncoes;
          totalEscalados += item.totalEscalados;
          totalConfirmados += item.totalConfirmados;
        }
      }

      const percentualPreenchido = totalFuncoes > 0 ? (totalConfirmados / totalFuncoes) * 100 : 0;
      return {
        id: ocorrencia.eventoId || ocorrencia.id,
        occurrenceKey,
        nome: ocorrencia.nome,
        dataInicio: getOccurrenceDateTimeIso(ocorrencia.dataOcorrencia, ocorrencia.evento?.dataInicio),
        local: ocorrencia.local,
        cor: ocorrencia.cor || '#3498db',
        horarioEnsaio: ocorrencia.horarioEnsaio,
        evento: {
          horarioEnsaioPadrao: ocorrencia.evento?.horarioEnsaioPadrao,
        },
        totalEscalados,
        totalConfirmados,
        totalFuncoes,
        percentualPreenchido,
      };
    });
}

function mapSolicitacoes(items: any[]): DashboardSolicitacaoDto[] {
  return [...items]
    .sort((a, b) => {
      const da = toDateOrNull(a?.createdAt)?.getTime() || 0;
      const db = toDateOrNull(b?.createdAt)?.getTime() || 0;
      return db - da;
    })
    .map((item) => ({
      id: item.id,
      voluntarioNome: item.voluntario?.nome || 'Voluntário',
      voluntarioFoto: item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl || undefined,
      ministerioNome: undefined,
      dataSolicitacao: item.createdAt,
      tipo: 'entrada' as const,
    }));
}

export class DashboardRepository {
  static async getDashboard({
    igrejaId,
    userId,
    role,
    ministeriosUsuario = [],
  }: GetDashboardParams): Promise<ResponseDashboardDto> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const windowEnd = endOfMonth(addMonths(now, WINDOW_MONTHS_AHEAD));

    const monthStartIso = monthStart.toISOString();
    const windowEndIso = windowEnd.toISOString();

    const admin = isAdminRole(role);
    const leader = isLeaderRole(role);
    const needsChurchData = admin || leader;

    const userEscalasPromise = EscalaItensRepository.search(
      { ...(buildUserEscalasQuery(monthStartIso, windowEndIso, userId) as any), igrejaId } as any,
      false,
    );

    const churchEscalasPromise = needsChurchData
      ? safe(
          EscalaItensRepository.search(
            { ...(buildUserEscalasQuery(monthStartIso, windowEndIso) as any), igrejaId } as any,
            false,
          ),
          [],
        )
      : Promise.resolve([] as ResponseEscalaItemDto[]);

    const ocorrenciasPromise = needsChurchData
      ? safe(
          IgrejaEventosRepository.buscarPorIntervalo(igrejaId, {
            dataInicio: monthStart,
            dataTermino: windowEnd,
          }),
          [],
        )
      : Promise.resolve([] as ResponseEventoOcorrenciaDto[]);

    const ministeriosPromise = needsChurchData
      ? safe(
          IgrejaMinisteriosRepository.listarMinisterios(igrejaId, {
            relations: ['voluntarios', 'funcoes'],
          }),
          [],
        )
      : Promise.resolve([] as any[]);

    const solicitacoesPromise = needsChurchData
      ? safe(IgrejaRepository.listarSolicitacoes(igrejaId, 'PENDING'), [])
      : Promise.resolve([] as any[]);

    const voluntariosPromise = admin
      ? safe(IgrejaRepository.listarVoluntarios(igrejaId), [])
      : Promise.resolve([] as any[]);

    const [rawUserEscalas, rawChurchEscalas, ocorrencias, ministerios, solicitacoes, voluntariosIgreja] = await Promise.all([
      userEscalasPromise,
      churchEscalasPromise,
      ocorrenciasPromise,
      ministeriosPromise,
      solicitacoesPromise,
      voluntariosPromise,
    ]);
    const userEscalas = rawUserEscalas.filter(isPublishedEscalaItem);
    const churchEscalas = rawChurchEscalas.filter(isPublishedEscalaItem);

    const monthEscalas = userEscalas.filter((item) => {
      const date = toDateOrNull(item.dataOcorrencia);
      return date ? isWithinMonth(date, now) : false;
    });

    const proximasEscalas = userEscalas
      .filter((item) => {
        const date = toDateOrNull(getEscalaItemOccurrenceDateTimeIso(item));
        return date ? isAfter(date, now) || date.getTime() === now.getTime() : false;
      })
      .sort((a, b) => {
        const da = toDateOrNull(getEscalaItemOccurrenceDateTimeIso(a))?.getTime() || 0;
        const db = toDateOrNull(getEscalaItemOccurrenceDateTimeIso(b))?.getTime() || 0;
        return da - db;
      })
      .slice(0, UPCOMING_LIMIT)
      .map(mapEscalaItemToDashboard);

    const escalasConfirmadas = monthEscalas.filter((item) => item.status === EscalaItemStatusEnum.Confirmado).length;

    const base: ResponseDashboardDto = {
      proximasEscalas,
      totalEscalasMes: monthEscalas.length,
      escalasConfirmadas,
      escalasPendentes: Math.max(monthEscalas.length - escalasConfirmadas, 0),
    };

    if (!needsChurchData) return base;

    const { statsByOccurrence, statsByMinisterio } = aggregateEscalas(churchEscalas);
    const solicitacoesMapped = mapSolicitacoes(solicitacoes);

    const totalEventosMes = ocorrencias.filter((item) => {
      const date = toDateOrNull(item.dataOcorrencia);
      return date ? isWithinMonth(date, now) : false;
    }).length;

    const ministeriosStats = ministerios
      .filter((ministerio: any) => ministerio.status === MinisterioStatusEnum.Ativo || ministerio.status === undefined)
      .map((ministerio: any) => {
        const slotStats = statsByMinisterio.get(ministerio.id);
        const totalFuncoesEscala = slotStats?.totalFuncoes || 0;
        const totalEscaladosEscala = slotStats?.totalEscalados || 0;
        const percentualPreenchimento = totalFuncoesEscala > 0 ? (totalEscaladosEscala / totalFuncoesEscala) * 100 : 0;

        return {
          ministerioId: ministerio.id,
          ministerioNome: ministerio.nome,
          ministerioLogoUrl: ministerio.logoThumbUrl || ministerio.logoUrl || undefined,
          totalVoluntarios:
            ministerio.voluntarios?.filter((v: any) => v.status === MinisterioVoluntarioStatusEnum.Ativo).length || 0,
          totalFuncoes:
            ministerio.funcoes?.filter((f: any) => f.status === MinisterioFuncaoStatusEnum.Ativo).length ||
            ministerio.funcoes?.length ||
            0,
          totalEscalasAtivas: slotStats?.eventosAtivos.size || 0,
          percentualPreenchimento,
          funcoesDescobertas: slotStats?.funcoesDescobertas.size || 0,
        };
      });

    if (admin) {
      return {
        ...base,
        totalMinisterios: ministerios.length,
        totalVoluntarios: voluntariosIgreja.length,
        totalEventosMes,
        ministeriosStats,
        proximosEventosIgreja: buildEventCards(ocorrencias, statsByOccurrence, now),
        solicitacoesGerais: solicitacoesMapped,
      };
    }

    const leaderMinistryIds = new Set(
      ministeriosUsuario
        .filter((m) => m.hierarquia === VoluntarioHierarquiaEnum.Lider || m.hierarquia === VoluntarioHierarquiaEnum.Auxiliar)
        .map((m) => m.id),
    );
    if (leaderMinistryIds.size === 0) {
      for (const ministerio of ministeriosUsuario) {
        leaderMinistryIds.add(ministerio.id);
      }
    }

    const ministerioStats =
      ministeriosStats.find((item) => leaderMinistryIds.has(item.ministerioId)) || ministeriosStats[0] || undefined;

    return {
      ...base,
      ministerioStats,
      proximosEventosMinisterio: buildEventCards(ocorrencias, statsByOccurrence, now, leaderMinistryIds),
      solicitacoesPendentes: solicitacoesMapped,
    };
  }

  static async getMinisterioDashboard(_ministerioId: string): Promise<any> {
    return {};
  }
}
