import { useCallback, useState } from 'react';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { EventosRepository, EventosIntervaloParams } from '../domain/services/EventosRepository';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResponseEventoDto } from '../domain/dtos/Evento/evento.response';
import { CreateEventoDto } from '../domain/dtos/Evento/evento.create';
import { UpdateEventoDto } from '../domain/dtos/Evento/evento.update';
import { RecorrenciaDiaSemanaEnum } from '../domain/enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../domain/enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum } from '../domain/enums/Evento/recorrencia.enum';
import { EventoFormData, eventoSchema } from '../domain/schemas/eventoSchema';

const DIA_SEMANA_ORDER: RecorrenciaDiaSemanaEnum[] = [
  RecorrenciaDiaSemanaEnum.domingo,
  RecorrenciaDiaSemanaEnum.segunda,
  RecorrenciaDiaSemanaEnum.terca,
  RecorrenciaDiaSemanaEnum.quarta,
  RecorrenciaDiaSemanaEnum.quinta,
  RecorrenciaDiaSemanaEnum.sexta,
  RecorrenciaDiaSemanaEnum.sabado,
];

const DIAS_SEMANA: Record<
  RecorrenciaDiaSemanaEnum,
  {
    artigo: string;
    plural: string;
  }
> = {
  [RecorrenciaDiaSemanaEnum.domingo]: {
    artigo: 'o',
    plural: 'Domingos',
  },
  [RecorrenciaDiaSemanaEnum.segunda]: {
    artigo: 'a',
    plural: 'Segundas-feiras',
  },
  [RecorrenciaDiaSemanaEnum.terca]: {
    artigo: 'a',
    plural: 'Terças-feiras',
  },
  [RecorrenciaDiaSemanaEnum.quarta]: {
    artigo: 'a',
    plural: 'Quartas-feiras',
  },
  [RecorrenciaDiaSemanaEnum.quinta]: {
    artigo: 'a',
    plural: 'Quintas-feiras',
  },
  [RecorrenciaDiaSemanaEnum.sexta]: {
    artigo: 'a',
    plural: 'Sextas-feiras',
  },
  [RecorrenciaDiaSemanaEnum.sabado]: {
    artigo: 'o',
    plural: 'Sábados',
  },
};

// Ordem lógica das semanas do mês
const SEMANA_MES_ORDER: RecorrenciaSemanaMesEnum[] = [
  RecorrenciaSemanaMesEnum.Primeira,
  RecorrenciaSemanaMesEnum.Segunda,
  RecorrenciaSemanaMesEnum.Terceira,
  RecorrenciaSemanaMesEnum.Quarta,
  RecorrenciaSemanaMesEnum.Quinta,
];

const SEMANAS_MES: Record<
  RecorrenciaSemanaMesEnum,
  {
    abreviado: string;
  }
> = {
  [RecorrenciaSemanaMesEnum.Primeira]: {
    abreviado: '1ª',
  },
  [RecorrenciaSemanaMesEnum.Segunda]: {
    abreviado: '2ª',
  },
  [RecorrenciaSemanaMesEnum.Terceira]: {
    abreviado: '3ª',
  },
  [RecorrenciaSemanaMesEnum.Quarta]: {
    abreviado: '4ª',
  },
  [RecorrenciaSemanaMesEnum.Quinta]: {
    abreviado: '5ª',
  },
};

export function generateRecorrenciaJoinableDescription(
  recorrencia: RecorrenciaEnum,
  semanaDias: RecorrenciaDiaSemanaEnum[] = [],
  aCadaMeses = 1,
  semanasMes: RecorrenciaSemanaMesEnum[] = [],
) {
  const joinComE = (items: string[]) => {
    const clean = items.filter(Boolean);
    if (clean.length === 0) return '';
    if (clean.length === 1) return clean[0];
    if (clean.length === 2) return `${clean[0]} e ${clean[1]}`;
    return `${clean.slice(0, -1).join(', ')} e ${clean[clean.length - 1]}`;
  };

  const toSingular = (plural: string) => {
    const s = plural.trim().toLowerCase();
    if (s.endsWith('s')) return s.slice(0, -1);
    return s;
  };

  const formatDias = (dias: RecorrenciaDiaSemanaEnum[]) => {
    const diasOrdenados = (dias ?? []).slice().sort((a, b) => DIA_SEMANA_ORDER.indexOf(a) - DIA_SEMANA_ORDER.indexOf(b));

    const diasInfo = diasOrdenados.map((d) => DIAS_SEMANA[d]).filter(Boolean);

    if (diasInfo.length === 0) return { texto: 'nenhum dia', artigo: null as 'a' | 'o' | null, pluralList: [] as string[] };

    const artigos = new Set(diasInfo.map((d) => d.artigo)); // 'a' | 'o'
    const artigoUnico = artigos.size === 1 ? (diasInfo[0].artigo as 'a' | 'o') : null;

    const pluralList = diasInfo.map((d) => d.plural.toLowerCase());
    const textoLista = joinComE(pluralList);

    return { texto: textoLista, artigo: artigoUnico, pluralList };
  };

  const formatSemanas = (semanas: RecorrenciaSemanaMesEnum[]) => {
    const semanasValidas = (semanas ?? []).filter((s) => SEMANAS_MES[s]);
    const ordenadas = semanasValidas.slice().sort((a, b) => SEMANA_MES_ORDER.indexOf(a) - SEMANA_MES_ORDER.indexOf(b));

    const abrevs = ordenadas.map((s) => SEMANAS_MES[s].abreviado);
    return { abrevs, texto: joinComE(abrevs) };
  };

  if (recorrencia === RecorrenciaEnum.Semanal) {
    const diasSemana = semanaDias ?? [];

    if (diasSemana.length === 0) return 'Sem dias definidos';
    if (diasSemana.length === DIA_SEMANA_ORDER.length) return 'Todos os dias';

    const { pluralList, artigo } = formatDias(diasSemana);

    // 1 dia -> "Todo o sábado" / "Toda a segunda-feira"
    if (pluralList.length === 1) {
      const info = DIAS_SEMANA[diasSemana[0]];
      const singular = toSingular(info.plural);
      return `${info.artigo === 'a' ? 'Toda a' : 'Todo o'} ${singular}`;
    }

    // 2+ dias -> tenta "às" / "aos" se for tudo do mesmo gênero; senão usa "em"
    const prefixo = artigo === 'a' ? 'Toda semana às' : artigo === 'o' ? 'Toda semana aos' : 'Toda semana em';
    return `${prefixo} ${joinComE(pluralList)}`;
  }

  if (recorrencia === RecorrenciaEnum.Mensal) {
    const meses = aCadaMeses || 1;
    const semanasDoMes = semanasMes ?? [];
    const diasSemana = semanaDias ?? [];

    const prefixoMes = meses <= 1 ? 'Todo mês' : `De ${meses} em ${meses} meses`;

    // Semanas
    let parteSemanas = '';
    if (semanasDoMes.length === 0) {
      parteSemanas = 'em nenhuma semana do mês';
    } else if (semanasDoMes.length === SEMANA_MES_ORDER.length) {
      parteSemanas = 'em todas as semanas do mês';
    } else {
      const { texto } = formatSemanas(semanasDoMes);
      parteSemanas = texto ? `na ${texto} semana do mês` : 'em nenhuma semana do mês';
      // Se vier "1ª e 2ª" fica melhor como "na 1ª e 2ª semanas..."
      if (texto.includes(' e ') || texto.includes(',')) parteSemanas = `nas ${texto} semanas do mês`;
    }

    // Dias
    let parteDias = '';
    if (diasSemana.length === 0) {
      parteDias = 'em nenhum dia da semana';
    } else if (diasSemana.length === DIA_SEMANA_ORDER.length) {
      parteDias = 'em todos os dias';
    } else {
      const { pluralList, artigo } = formatDias(diasSemana);

      // 1 dia -> "aos domingos" / "às segundas-feiras"
      if (pluralList.length === 1) {
        const info = DIAS_SEMANA[diasSemana[0]];
        parteDias = `${info.artigo === 'a' ? 'às' : 'aos'} ${info.plural.toLowerCase()}`;
      } else {
        const prefixo = artigo === 'a' ? 'às' : artigo === 'o' ? 'aos' : 'em';
        parteDias = `${prefixo} ${joinComE(pluralList)}`;
      }
    }

    return `${prefixoMes}, ${parteSemanas}, ${parteDias}`;
  }

  return 'Sem recorrência';
}

export function generateRecorrenciaDescription(
  recorrencia: RecorrenciaEnum,
  semanaDias: RecorrenciaDiaSemanaEnum[],
  aCadaMeses: number,
  semanasMes: RecorrenciaSemanaMesEnum[],
) {
  let result = '';

  if (recorrencia === RecorrenciaEnum.Semanal) {
    const diasSemana = semanaDias || [];

    if (diasSemana.length === 0) {
      result = 'Nenhum dia';
    } else if (diasSemana.length === DIA_SEMANA_ORDER.length) {
      result = 'Todos os dias';
    } else {
      // Ordena os dias com base na ordem definida
      const diasOrdenados = diasSemana.slice().sort((a, b) => DIA_SEMANA_ORDER.indexOf(a) - DIA_SEMANA_ORDER.indexOf(b));

      const dias = diasOrdenados.map((item) => DIAS_SEMANA[item]);

      if (dias.length === 1) {
        result = `A${dias[dias.length - 1].artigo}s ${dias[0].plural.toLowerCase()}`;
      } else if (dias.length === 2) {
        result = `A${dias[dias.length - 1].artigo}s ${dias[0].plural} e ${dias[1].plural.toLowerCase()}`;
      } else {
        result = `A${dias[dias.length - 1].artigo}s ${dias
          .slice(0, -1)
          .map((d) => d.plural)
          .join(', ')} e ${dias[dias.length - 1].plural.toLowerCase()}`;
      }
    }
  } else if (recorrencia === RecorrenciaEnum.Mensal) {
    const aCadaMes = aCadaMeses || 0;
    const semanasDoMes = semanasMes || [];
    const diasSemana = semanaDias || [];

    result = `A cada (${aCadaMes}) Mês(es)\n`;

    // SEMANAS DO MÊS
    if (semanasDoMes.length === 0) {
      result += 'Em nenhuma semana';
    } else if (semanasDoMes.length === SEMANA_MES_ORDER.length) {
      result += 'Em todas as semanas do mês';
    } else {
      const semanasValidas = semanasDoMes.filter((item) => SEMANAS_MES[item]);

      const semanasOrdenadas = semanasValidas.slice().sort((a, b) => SEMANA_MES_ORDER.indexOf(a) - SEMANA_MES_ORDER.indexOf(b));

      const semanasAbreviadas = semanasOrdenadas.map((item) => SEMANAS_MES[item].abreviado);

      if (semanasAbreviadas.length === 1) {
        result += `Na ${semanasAbreviadas[0]} semana do mês`;
      } else if (semanasAbreviadas.length === 2) {
        result += `Nas ${semanasAbreviadas[0]} e ${semanasAbreviadas[1]} semanas do mês`;
      } else {
        result += `Nas ${semanasAbreviadas.slice(0, -1).join(', ')} e ${semanasAbreviadas.slice(-1)[0]} semanas do mês`;
      }
    }

    result += '\n';

    // DIAS DA SEMANA
    if (diasSemana.length === 0) {
      result += 'Em nenhum dia da semana';
    } else if (diasSemana.length === DIA_SEMANA_ORDER.length) {
      result += 'Em todos os dias';
    } else {
      // Ordena os dias com base na ordem definida
      const diasOrdenados = diasSemana.slice().sort((a, b) => DIA_SEMANA_ORDER.indexOf(a) - DIA_SEMANA_ORDER.indexOf(b));

      const dias = diasOrdenados.map((item) => DIAS_SEMANA[item]);

      if (dias.length === 1) {
        result += `N${dias[0].artigo}s ${dias[0].plural}`;
      } else if (dias.length === 2) {
        result += `N${dias[0].artigo}s ${dias[0].plural} e ${dias[1].plural}`;
      } else {
        result += `N${dias[0].artigo}s ${dias
          .slice(0, -1)
          .map((d) => d.plural)
          .join(', ')} e ${dias[dias.length - 1].plural}`;
      }
    }
  }

  return result;
}

export function useEventosCrud({ autoFetch = false, initialParams = {}, messages = undefined }: ExternalUseCrudParams = {}) {
  const crud = useCrud<ResponseEventoDto, EventoFormData, CreateEventoDto, UpdateEventoDto>({
    queryKey: 'eventos',
    autoFetch,
    initialParams,
    messages: messages || {
      successCreate: 'Evento criado com sucesso.',
      successUpdate: 'Evento atualizado com sucesso.',
      successDelete: 'Evento removido com sucesso.',
      errorCreate: 'Erro ao criar o evento.',
      errorUpdate: 'Erro ao atualizar o evento.',
      errorDelete: 'Erro ao remover o evento.',
    },
    fetchAll: () => EventosRepository.search({}),
    search: (query) => EventosRepository.search(query),
    fetchOne: async (id) => {
      const result = await EventosRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: {
                type: ValueType.LITERAL,
                value: id,
              },
            },
          ],
        },
      });
      return result[0];
    },
    add: (data) => EventosRepository.add(data),
    update: (id, data) => {
      return EventosRepository.update(id, data);
    },
    remove: (id) => EventosRepository.remove(id),
    resolver: zodResolver(eventoSchema),
  });

  const [isLoadingIntervalo, setIsLoadingIntervalo] = useState(false);

  const buscarPorIntervalo = useCallback(async (params: EventosIntervaloParams) => {
    setIsLoadingIntervalo(true);
    try {
      return await EventosRepository.buscarPorIntervalo(params);
    } finally {
      setIsLoadingIntervalo(false);
    }
  }, []);

  return {
    ...crud,
    isLoading: crud.isLoading || isLoadingIntervalo,
    isLoadingIntervalo,
    buscarPorIntervalo,
  };
}
