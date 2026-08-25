import z from 'zod';
import { RecorrenciaDiaSemanaEnum } from '../enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum } from '../enums/Evento/recorrencia.enum';
import { EventoTipoEnum } from '../enums/Evento/evento-tipo.enum';
import { isBefore } from 'date-fns';

export const eventoSchema = z
  .object({
    id: z.string().uuid().optional(),
    nome: z
      .string('Campo Obrigatório')
      .min(3, 'O nome do evento deve ter pelo menos 3 caracteres')
      .max(255, 'O nome do evento pode ter no máximo 255 caracteres'),
    descricao: z.string().max(1000, 'A descrição pode ter no máximo 1000 caracteres').optional(),
    dataInicio: z
      .date()
      .refine(
        (d) => d >= new Date('1900-01-01'),
        'A data de início deve ser posterior a 01/01/1900',
      ),
    dataTermino: z.date().optional(),
    dataFimRecorrencia: z.date().optional(),
    local: z.string().max(255, 'O local pode ter no máximo 255 caracteres').optional(),
    cor: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Cor inválida'),
    tipo: z.enum(EventoTipoEnum).optional(),
    recorrencia: z.enum(RecorrenciaEnum).optional(),
    recorrenciaSemanaDias: z.array(z.enum(RecorrenciaDiaSemanaEnum)).optional(),
    recorrenciaACadaMeses: z
      .number()
      .int('Informe um número inteiro')
      .min(1, 'O número de meses deve ser maior que 1')
      .max(12, 'O número de meses deve ser menor igual a 12')
      .optional(),
    recorrenciaSemanasMes: z.array(z.enum(RecorrenciaSemanaMesEnum)).optional(),
    horarioEnsaioPadrao: z
      .object({
        hour: z.number().int().min(0).max(23),
        minute: z.number().int().min(0).max(59),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Data término > data início
    if (data.dataTermino && isBefore(data.dataTermino, data.dataInicio)) {
      ctx.addIssue({
        code: 'custom',
        path: ['dataTermino'],
        message: 'A data de término deve ser posterior à data de início',
      });
    }

    // Fim de recorrência > data início
    if (data.dataFimRecorrencia && isBefore(data.dataFimRecorrencia, data.dataInicio)) {
      ctx.addIssue({
        code: 'custom',
        path: ['dataFimRecorrencia'],
        message: 'O fim da recorrência deve ser posterior à data de início',
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
