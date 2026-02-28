import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { ResponseEscalaDto } from '../../../../../domain/dtos/Escala/escala.response';

export type EscalaInsightsPersonRow = {
  voluntarioId: string;
  nome: string;
  qtdAtual: number;
};

export type EscalaCurrentInsights = {
  totalEventos: number;
  totalPessoasEscaladas: number;
  totalEscalasAtribuidas: number;
  mediaEscalasPorPessoaAtual: number;
  vagasTotais: number;
  vagasPreenchidas: number;
  funcoesSemVoluntario: number;
  percentualPreenchimento: number;
  rankingAtual: EscalaInsightsPersonRow[];
  maiorCarga?: EscalaInsightsPersonRow;
  menorCarga?: EscalaInsightsPersonRow;
  cargaMediaAtual: number;
};

export type EscalaHistoricalInsights = {
  mesesJanela: number;
  totalAtribuicoesPeriodo: number;
  mediaEscalasMesMinisterio: number;
  mediaEscalasMesPorPessoa: Record<string, number>;
};

function getVoluntarioNome(item: ResponseEscalaItemDto): string {
  return item.voluntario?.voluntario?.nome?.trim() || 'Voluntário';
}

function isInsideRange(date: Date, start: Date, end: Date): boolean {
  const ts = date.getTime();
  return ts >= start.getTime() && ts <= end.getTime();
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildCurrentEscalaInsights(itens: ResponseEscalaItemDto[]): EscalaCurrentInsights {
  const eventoKeys = new Set<string>();
  const pessoasMap = new Map<string, EscalaInsightsPersonRow>();
  const vagasTotais = itens.length;
  let vagasPreenchidas = 0;

  for (const item of itens) {
    const eventoId = item.eventoId || item.evento?.id;
    const ocorrencia = item.dataOcorrencia || '';
    if (eventoId && ocorrencia) {
      eventoKeys.add(`${eventoId}::${ocorrencia}`);
    }

    if (!item.voluntarioId) continue;
    vagasPreenchidas += 1;

    const current = pessoasMap.get(item.voluntarioId);
    if (current) {
      current.qtdAtual += 1;
      continue;
    }

    pessoasMap.set(item.voluntarioId, {
      voluntarioId: item.voluntarioId,
      nome: getVoluntarioNome(item),
      qtdAtual: 1,
    });
  }

  const rankingAtual = Array.from(pessoasMap.values()).sort((a, b) => {
    if (b.qtdAtual !== a.qtdAtual) return b.qtdAtual - a.qtdAtual;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });

  const totalPessoasEscaladas = rankingAtual.length;
  const totalEscalasAtribuidas = vagasPreenchidas;
  const mediaEscalasPorPessoaAtual =
    totalPessoasEscaladas > 0 ? totalEscalasAtribuidas / totalPessoasEscaladas : 0;
  const funcoesSemVoluntario = Math.max(vagasTotais - vagasPreenchidas, 0);
  const percentualPreenchimento = vagasTotais > 0 ? (vagasPreenchidas / vagasTotais) * 100 : 0;
  const maiorCarga = rankingAtual[0];
  const menorCarga = rankingAtual[rankingAtual.length - 1];

  return {
    totalEventos: eventoKeys.size,
    totalPessoasEscaladas,
    totalEscalasAtribuidas,
    mediaEscalasPorPessoaAtual,
    vagasTotais,
    vagasPreenchidas,
    funcoesSemVoluntario,
    percentualPreenchimento,
    rankingAtual,
    maiorCarga,
    menorCarga,
    cargaMediaAtual: mediaEscalasPorPessoaAtual,
  };
}

export function buildHistoricalEscalaInsights(
  escalas: ResponseEscalaDto[],
  periodStart: Date,
  periodEnd: Date,
  mesesJanela: number,
): EscalaHistoricalInsights {
  const atribuicoesPorPessoa = new Map<string, number>();
  let totalAtribuicoesPeriodo = 0;

  for (const escala of escalas) {
    const itens = escala.itens ?? [];

    for (const item of itens) {
      if (!item.voluntarioId) continue;
      const dataOcorrencia = parseDate(item.dataOcorrencia);
      if (!dataOcorrencia || !isInsideRange(dataOcorrencia, periodStart, periodEnd)) continue;

      totalAtribuicoesPeriodo += 1;
      atribuicoesPorPessoa.set(
        item.voluntarioId,
        (atribuicoesPorPessoa.get(item.voluntarioId) ?? 0) + 1,
      );
    }
  }

  const divisor = Math.max(mesesJanela, 1);
  const mediaEscalasMesPorPessoa: Record<string, number> = {};
  for (const [voluntarioId, total] of atribuicoesPorPessoa.entries()) {
    mediaEscalasMesPorPessoa[voluntarioId] = total / divisor;
  }

  return {
    mesesJanela: divisor,
    totalAtribuicoesPeriodo,
    mediaEscalasMesMinisterio: totalAtribuicoesPeriodo / divisor,
    mediaEscalasMesPorPessoa,
  };
}
