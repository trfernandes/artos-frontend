import z from 'zod';
import { EscalaTemplateExperienciaEnum } from '../enums/EscalaTemplate/escala-template-experiencia.enum';
import { MinisterioVoluntarioStatusEnum } from '../enums/MinisterioVoluntario/ministerio-voluntario-status.enum';

export const minVoluntarioFuncaoSchema = z.object({
  id: z.string('Campo obrigatório'),
  nome: z.string().optional(),
  experiencia: z.enum(EscalaTemplateExperienciaEnum, 'Campo obrigatório'),
});

export const minVoluntarioSchema = z.object({
  voluntarioId: z.uuid('Campo obrigatório'),
  voluntarioFoto: z.string().optional(),
  voluntarioNome: z.string().optional(),
  voluntarioEmail: z.string().optional(),
  voluntarioStatus: z.enum(MinisterioVoluntarioStatusEnum).optional(),
  funcoes: z.array(minVoluntarioFuncaoSchema).optional(),
});

export type MinVoluntarioFormData = z.infer<typeof minVoluntarioSchema>;
export type MinVoluntarioFuncaoFormData = z.infer<typeof minVoluntarioFuncaoSchema>;
