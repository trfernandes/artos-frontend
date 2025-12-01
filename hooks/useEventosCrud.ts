import { useCallback, useState } from 'react';
import { useCrud } from './useCrud';
import { DynamicQuery, Operator, ValueType } from '../domain/utils/query_utils';
import { EventosRepository, EventosIntervaloParams } from '../domain/services/EventosRepository';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RecorrenciaDiaSemanaEnum,
  RecorrenciaEnum,
  RecorrenciaSemanaMesEnum,
} from '../domain/models/Evento';

const DIAS_SEMANA: Record<number, { artigo: string; plural: string }> = {
  1: { artigo: 'o', plural: 'Domingos' },
  2: { artigo: 'a', plural: 'Segundas-feiras' },
  3: { artigo: 'a', plural: 'Terças-feiras' },
  4: { artigo: 'a', plural: 'Quartas-feiras' },
  5: { artigo: 'a', plural: 'Quintas-feiras' },
  6: { artigo: 'a', plural: 'Sextas-feiras' },
  7: { artigo: 'o', plural: 'Sábados' },
};

const SEMANAS_MES: Record<number, { abreviado: string }> = {
  1: { abreviado: '1ª' },
  2: { abreviado: '2ª' },
  3: { abreviado: '3ª' },
  4: { abreviado: '4ª' },
  5: { abreviado: '5ª' },
};

export function generateRecorrenciaDescription(
  recorrencia: RecorrenciaEnum,
  semanaDias: RecorrenciaDiaSemanaEnum[],
  aCadaMeses: number,
  semanasMes: RecorrenciaSemanaMesEnum[]
) {
  // const recorrencia = getValues('recorrencia');
  let result = '';

  if (recorrencia === RecorrenciaEnum.Semanal) {
    const diasSemana = semanaDias || [];
    if (diasSemana.length === 0) {
      result = 'Nenhum dia';
    } else if (diasSemana.length === 7) {
      result = 'Todos os dias';
    } else {
      // Ordena os dias para garantir a ordem correta
      const diasOrdenados = diasSemana.slice().sort((a, b) => a - b);
      const dias = diasOrdenados.map(item => DIAS_SEMANA[item]);
      if (dias.length === 1) {
        result = `N${dias[dias.length - 1].artigo}s ${dias[0].plural.toLowerCase()}`;
      } else if (dias.length === 2) {
        result = `N${dias[dias.length - 1].artigo}s ${dias[0].plural} e ${dias[1].plural.toLowerCase()}`;
      } else {
        result = `N${dias[dias.length - 1].artigo}s ${dias
          .slice(0, -1)
          .map(d => d.plural)
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
    } else if (semanasDoMes.length === Object.keys(SEMANAS_MES).length) {
      result += 'Em todas as semanas do mês';
    } else {
      const semanasValidas = semanasDoMes.filter(item => SEMANAS_MES[item]).sort((a, b) => a - b);
      const semanasAbreviadas = semanasValidas.map(item => SEMANAS_MES[item].abreviado);
      if (semanasAbreviadas.length === 1) {
        result += `Na ${semanasAbreviadas[0]} semana do mês`;
      } else if (semanasAbreviadas.length === 2) {
        result += `Nas ${semanasAbreviadas[0]} e ${semanasAbreviadas[1]} semanas do mês`;
      } else {
        result += `Nas ${semanasAbreviadas.slice(0, -1).join(', ')} e ${
          semanasAbreviadas.slice(-1)[0]
        } semanas do mês`;
      }
    }

    result += '\n';

    // DIAS DA SEMANA
    if (diasSemana.length === 0) {
      result += 'Em nenhum dia da semana';
    } else if (diasSemana.length === 7) {
      result += 'Em todos os dias';
    } else {
      // Ordena os dias para garantir a ordem correta
      const diasOrdenados = diasSemana.slice().sort((a, b) => a - b);
      const dias = diasOrdenados.map(item => DIAS_SEMANA[item]);
      if (dias.length === 1) {
        result += `N${dias[0].artigo}s ${dias[0].plural}`;
      } else if (dias.length === 2) {
        result += `N${dias[0].artigo}s ${dias[0].plural} e ${dias[1].plural}`;
      } else {
        result += `N${dias[0].artigo}s ${dias
          .slice(0, -1)
          .map(d => d.plural)
          .join(', ')} e ${dias[dias.length - 1].plural}`;
      }
    }
  }

  return result;
}

export const eventoSchema = z
  .object({
    id: z.uuid().optional(),
    nome: z
      .string('Campo Obrigatório')
      .min(3, 'O nome do evento deve ter pelo menos 3 caracteres')
      .max(255, 'O nome do evento pode ter no máximo 255 caracteres'),
    descricao: z.string().max(1000, 'A descrição pode ter no máximo 1000 caracteres').optional(),
    dataInicio: z
      .date()
      .refine(d => d >= new Date('1900-01-01'), 'A data de início deve ser posterior a 01/01/1900'),
    dataTermino: z.date(),
    local: z.string().max(255, 'O local pode ter no máximo 255 caracteres').optional(),
    cor: z
      .string()
      .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Cor inválida')
      .optional(),
    recorrencia: z.enum(RecorrenciaEnum).optional(),
    recorrenciaSemanaDias: z.array(z.enum(RecorrenciaDiaSemanaEnum)).optional(),
    recorrenciaACadaMeses: z
      .number()
      .int('Informe um número inteiro')
      .min(1, 'O número de meses deve ser maior que 1')
      .max(12, 'O número de meses deve ser menor igual a 12')
      .optional(),
    recorrenciaSemanasMes: z.array(z.enum(RecorrenciaSemanaMesEnum)).optional(),
  })
  .superRefine((data, ctx) => {
    // Data término > data início
    if (data.dataTermino <= data.dataInicio) {
      ctx.addIssue({
        code: 'custom',
        path: ['dataTermino'],
        message: 'A data de término deve ser posterior à data de início',
      });
    }

    // Se recorrência for semanal, exige pelo menos 1 dia
    if (data.recorrencia === RecorrenciaEnum.Semanal) {
      if (!data.recorrenciaSemanaDias || data.recorrenciaSemanaDias.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaSemanaDias'],
          message: 'Selecione ao menos um dia da semana',
        });
      }
    }
  });

export type EventoFormData = z.infer<typeof eventoSchema>;

interface UseEventosOptions {
  autoFetch?: boolean;
  initialParams?: DynamicQuery | string;
}

export function useEventosCrud(options?: UseEventosOptions) {
  const crud = useCrud({
    queryKey: 'eventos',
    autoFetch: options?.autoFetch ?? true,
    initialParams: options?.initialParams,
    fetchAll: () => EventosRepository.search({}),
    search: query => EventosRepository.search(query),
    fetchOne: async id => {
      const result = await EventosRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: id },
            },
          ],
        },
      });
      return result[0];
    },
    add: data => EventosRepository.add(data),
    update: (id, data) => {
      return EventosRepository.update(id, data);
    },
    remove: id => EventosRepository.remove(id),
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
