import { useCrudForm } from './useCrudForm';
import { DynamicQuery, Operator, ValueType } from '../domain/utils/query_utils';
import { EventosRepository } from '../domain/services/EventosRepository';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecorrenciaDiaSemanaEnum, RecorrenciaEnum, RecorrenciaSemanaMesEnum } from '../domain/models/Evento';

export const eventoSchema = z
  .object({
    id: z.uuid().optional(),
    nome: z
      .string('Campo Obrigatório')
      .min(3, 'O nome do evento deve ter pelo menos 3 caracteres')
      .max(255, 'O nome do evento pode ter no máximo 255 caracteres'),
    descricao: z.string().max(1000, 'A descrição pode ter no máximo 1000 caracteres').optional(),
    dataInicio: z.date().refine(d => d >= new Date('1900-01-01'), 'A data de início deve ser posterior a 01/01/1900'),
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

export function useEventos(options?: UseEventosOptions) {
  return useCrudForm({
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
}
