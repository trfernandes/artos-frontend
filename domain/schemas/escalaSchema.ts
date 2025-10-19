import z from 'zod';
import { EscalaTemplateExperienciaEnum, EscalaTemplateTipoEnum } from '../models/EscalaTemplate';

export const EscalaEventoTemplateFuncaoSchema = z.object({
  funcaoId: z.uuidv4(),
  quantidade: z.number(),
  experiencia: z.enum(EscalaTemplateExperienciaEnum),
});

export const EscalaEventoTemplateFixoSchema = z.object({
  ministerioVoluntarioId: z.uuidv4(),
  funcaoId: z.uuidv4(),
});

export const EscalaEventoTemplateSchema = z.object({
  templateBase: z.object({
    id: z.uuidv4(),
    nome: z.uuidv4(),
    tipo: z.enum(EscalaTemplateTipoEnum),
  }),
  tipo: z.enum(EscalaTemplateTipoEnum),
  funcoes: z.array(EscalaEventoTemplateFuncaoSchema),
  fixos: z.array(EscalaEventoTemplateFixoSchema),
});

export const EscalaEventosSchema = z.object({
  eventoId: z.uuidv4(),
  data: z.date(),
  nome: z.string(),
  local: z.string().optional(),
  cor: z.string().optional(),
  selected: z.boolean(),
  template: z.object(EscalaEventoTemplateSchema),
});

const EscalaParticipantesSchema = z.object({
  id: z.uuidv4(),
  selected: z.boolean(),
});

export const EscalaSchema = z.object({
  nome: z.string('Campo Obrigatório'),
  dataInicio: z.date('Campo Obrigatório'),
  dataTermino: z.date('Campo Obrigatório'),
  eventos: z.array(EscalaEventosSchema),
  participantes: z.array(EscalaParticipantesSchema),
});

export type EscalaFormData = z.infer<typeof EscalaSchema>;
export type EscalaParticipanteFormData = z.infer<typeof EscalaParticipantesSchema>;
export type EscalaEventoFormData = z.infer<typeof EscalaEventosSchema>;
export type EscalaEventoTemplateFormData = z.infer<typeof EscalaEventoTemplateSchema>;
