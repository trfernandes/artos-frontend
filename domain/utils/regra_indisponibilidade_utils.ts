import { ResponseRegraIndisponibilidadeVoluntarioDto } from '../dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.response';
import { ThemePalette } from '../../constants/colors';

const DIA_NOMES_PLURAL = [
  'domingos',
  'segundas',
  'terças',
  'quartas',
  'quintas',
  'sextas',
  'sábados',
];
const isMasc = (d: number) => d === 0 || d === 6;

export function descreverRegra(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'DIAS_SEMANA' && regra.diasSemana) {
    const sorted = [...regra.diasSemana].sort((a, b) => a - b);
    if (sorted.length === 7) return 'Indisponível todos os dias';
    if (sorted.length === 2 && sorted[0] === 0 && sorted[1] === 6)
      return 'Indisponível nos fins de semana';
    if (sorted.length === 5 && sorted.join(',') === '1,2,3,4,5')
      return 'Indisponível em dias úteis';
    const allMasc = sorted.every(isMasc);
    const allFem = sorted.every((d) => !isMasc(d));
    if (allMasc) return 'Indisponível nos ' + sorted.map((d) => DIA_NOMES_PLURAL[d]).join(', ');
    if (allFem) return 'Indisponível nas ' + sorted.map((d) => DIA_NOMES_PLURAL[d]).join(', ');
    return (
      'Indisponível ' +
      sorted.map((d) => (isMasc(d) ? 'nos ' : 'nas ') + DIA_NOMES_PLURAL[d]).join(', ')
    );
  }
  if (regra.tipo === 'PERIODO') {
    const fmtDateOnly = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
    const inicio = regra.dataInicio ? fmtDateOnly(regra.dataInicio) : '?';
    const fim = regra.dataFim ? fmtDateOnly(regra.dataFim) : '?';
    return `Indisponível de ${inicio} a ${fim}${regra.recorrente ? ' (todo ano)' : ''}`;
  }
  if (regra.tipo === 'LIMITE_MENSAL') {
    return `Máximo de ${regra.limiteMensal} escala${(regra.limiteMensal ?? 0) !== 1 ? 's' : ''} por mês`;
  }
  return 'Regra de indisponibilidade';
}

export function descreverDetalheRegra(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'LIMITE_MENSAL') {
    return 'Restrição de frequência mensal';
  }
  return '';
}

export function regraIcone(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'DIAS_SEMANA') return 'calendar-week';
  if (regra.tipo === 'LIMITE_MENSAL') return 'counter';
  if (regra.recorrente) return 'calendar-sync';
  return 'calendar-range';
}

export function regraChipLabel(regra: ResponseRegraIndisponibilidadeVoluntarioDto): string {
  if (regra.tipo === 'DIAS_SEMANA') return 'Semanal';
  if (regra.tipo === 'LIMITE_MENSAL') return 'Frequência';
  if (regra.recorrente) return 'Anual';
  return 'Período';
}

export function regraCor(
  regra: ResponseRegraIndisponibilidadeVoluntarioDto,
  palette: ThemePalette,
): string {
  if (regra.tipo === 'DIAS_SEMANA') return palette.secondary;
  if (regra.tipo === 'LIMITE_MENSAL') return palette.warning;
  return palette.secondary;
}

export function expandirRegrasParaCalendario(
  regras: ResponseRegraIndisponibilidadeVoluntarioDto[],
  inicio: Date,
  fim: Date,
): Set<string> {
  const result = new Set<string>();
  const toKey = (d: Date) => d.toISOString().slice(0, 10);

  for (const regra of regras) {
    if (regra.tipo === 'DIAS_SEMANA' && regra.diasSemana) {
      const cur = new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()));
      const endUtc = new Date(Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()));
      while (cur <= endUtc) {
        if (regra.diasSemana.includes(cur.getUTCDay())) {
          result.add(toKey(cur));
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else if (regra.tipo === 'PERIODO' && regra.dataInicio && regra.dataFim) {
      if (regra.recorrente) {
        const mmddInicio = regra.dataInicio.slice(5);
        const mmddFim = regra.dataFim.slice(5);
        const crossYear = mmddInicio > mmddFim;
        const cur = new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()));
        const endUtc = new Date(Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()));
        while (cur <= endUtc) {
          const mmddAtual = toKey(cur).slice(5);
          const incluso = crossYear
            ? mmddAtual >= mmddInicio || mmddAtual <= mmddFim
            : mmddAtual >= mmddInicio && mmddAtual <= mmddFim;
          if (incluso) result.add(toKey(cur));
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
      } else {
        const ri = new Date(regra.dataInicio + 'T00:00:00Z');
        const rf = new Date(regra.dataFim + 'T00:00:00Z');
        const rangeIni =
          ri > inicio
            ? ri
            : new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()));
        const rangeFim =
          rf < fim ? rf : new Date(Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()));
        const cur = new Date(rangeIni);
        while (cur <= rangeFim) {
          result.add(toKey(cur));
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
      }
    }
  }
  return result;
}
