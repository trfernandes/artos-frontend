import z from 'zod';
import { EscalaTemplateExperienciaEnum } from '../models/EscalaTemplate';

export const minVoluntarioFuncaoSchema = z.object({
  id: z.string('Campo obrigatório'),
  nome: z.string().optional(),
  experiencia: z.enum(EscalaTemplateExperienciaEnum, 'Campo obrigatório'),
});

export const minVoluntarioSchema = z.object({
  voluntarioId: z.uuid('Campo obrigatório'),
  voluntarioFoto: z.string(),
  voluntarioNome: z.string(),
  voluntarioEmail: z.string(),
  funcoes: z.array(minVoluntarioFuncaoSchema).optional(),
});

export type MinVoluntarioFormData = z.infer<typeof minVoluntarioSchema>;
export type MinVoluntarioFuncaoFormData = z.infer<
  typeof minVoluntarioFuncaoSchema
>;
