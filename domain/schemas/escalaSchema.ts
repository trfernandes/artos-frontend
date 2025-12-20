import z from 'zod';
import { EscalaTemplateExperienciaEnum, EscalaTemplateTipoEnum } from '../models/EscalaTemplate';

export const EscalaEventoTemplateFuncaoSchema = z.object({
  funcaoId: z.uuidv4('Campo obrigatório'),
  quantidade: z.coerce.number<number>('Campo obrigatório').min(1, 'Valor mínimo permitido é 1').max(10, 'Valor máximo permitido é 10'),
  experiencia: z.enum(EscalaTemplateExperienciaEnum, 'Campo obrigatório'),
});

export const EscalaEventoTemplateFixoSchema = z.object({
  minVolId: z.uuidv4('Campo Obrigatório'),
  funcaoId: z.uuidv4('Campo Obrigatório'),
});

export const EscalaEventoTemplateSchema = z.object({
  templateBase: z
    .object({
      id: z.uuidv4(),
      nome: z.string('Campo Obrigatório'),
    })
    .or(z.object({})),
  tipo: z.enum(EscalaTemplateTipoEnum),
  funcoes: z.array(EscalaEventoTemplateFuncaoSchema).optional(),
  fixos: z.array(EscalaEventoTemplateFixoSchema).optional(),
});

export const EscalaEventosSchema = z
  .object({
    eventoId: z.uuidv4(),
    data: z
      .string()
      .transform(val => new Date(val))
      .refine(date => !isNaN(date.getTime()), {
        message: 'Data inválida',
      }),
    nome: z.string(),
    local: z.string().optional(),
    cor: z.string().optional(),
    selected: z.boolean(),
    template: EscalaEventoTemplateSchema,
  })
  .superRefine((data, ctx) => {
    if (data.selected) {
      if (data.template.tipo === EscalaTemplateTipoEnum.Funcoes) {
        if (!data.template.funcoes || data.template.funcoes.length === 0) {
          ctx.addIssue({
            path: ['funcoes'],
            code: 'custom',
            message: `É necessário adicionar pelo menos uma função no evento "${data.nome}"`,
          });
        }
      }

      if (data.template.tipo === EscalaTemplateTipoEnum.Fixo) {
        if (!data.template.fixos || data.template.fixos.length === 0) {
          ctx.addIssue({
            path: ['fixos'],
            code: 'custom',
            message: `É necessário adicionar pelo menos um voluntário no evento "${data.nome}"`,
          });
        }
      }
    }
  });

export const EscalaEventosArraySchema = z.array(EscalaEventosSchema).refine(eventos => eventos.some(e => e.selected), {
  message: 'Selecione pelo menos um evento',
  path: ['selected'],
});

const EscalaParticipantesSchema = z.object({
  voluntarioId: z.uuidv4(),
  minVolId: z.uuidv4(),
  selected: z.boolean(),
});

export const EscalaParticipantesArraySchema = z
  .array(EscalaParticipantesSchema)
  .refine(participantes => participantes.some(p => p.selected), {
    message: 'Selecione pelo menos um participante',
    path: ['selected'],
  });

export const EscalaSchema = z
  .object({
    nome: z.string('Campo Obrigatório'),
    dataInicio: z.date('Campo Obrigatório'),
    dataTermino: z.date('Campo Obrigatório'),
    eventos: EscalaEventosArraySchema.optional(),
    participantes: EscalaParticipantesArraySchema.optional(),
    markEventsAll: z.boolean().default(true),
    markParticipantsAll: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.dataTermino <= data.dataInicio) {
      ctx.addIssue({
        code: 'custom',
        path: ['dataTermino'],
        message: 'A data de término deve ser posterior à data de início',
      });
    }
  });

export type EscalaFormData = z.infer<typeof EscalaSchema>;
export type EscalaParticipanteFormData = z.infer<typeof EscalaParticipantesSchema>;
export type EscalaEventoFormData = z.infer<typeof EscalaEventosSchema>;
export type EscalaEventoTemplateFormData = z.infer<typeof EscalaEventoTemplateSchema>;
export type EscalaEventoTemplateFuncaoFormData = z.infer<typeof EscalaEventoTemplateFuncaoSchema>;
export type EscalaEventoTemplateFixoFormData = z.infer<typeof EscalaEventoTemplateFixoSchema>;
