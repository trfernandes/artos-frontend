import z from 'zod';
import { MinisterioStatusEnum } from '../enums/Ministerio/ministerio-status.enum';
import { MinisterioTipoEnum } from '../enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../enums/MinisterioVoluntario/hierarquia.enum';

export const AddLiderSchema = z.object({
  id: z.uuidv4('O Id do voluntário deve ser válido').optional(),
  voluntarioId: z.uuidv4('Campo Obrigatório'),
  voluntarioNome: z.string().min(1, { message: 'Campo obrigatório' }),
  hierarquia: z.enum(VoluntarioHierarquiaEnum, { message: 'Campo obrigatório' }),
  fotoUrl: z.string().nullable().optional(),
  fotoThumbUrl: z.string().nullable().optional(),
});

export type AddLiderFormData = z.infer<typeof AddLiderSchema>;

export const AddMinisterioVoluntarioSchema = z.object({
  voluntarioId: z.uuidv4('Campo Obrigatório'),
  voluntarioNome: z.string().min(1, { message: 'Campo obrigatório' }),
  hierarquia: z.enum(VoluntarioHierarquiaEnum, { message: 'Campo obrigatório' }),
  fotoUrl: z.string().nullable().optional(),
  fotoThumbUrl: z.string().nullable().optional(),
});
export type AddMinisterioVoluntarioFormData = z.infer<typeof AddMinisterioVoluntarioSchema>;

export const EditMinisterioVoluntarioSchema = z.object({
  id: z.uuidv4('O Id do voluntário deve ser válido'),
  voluntarioId: z.uuidv4('Campo Obrigatório'),
  voluntarioNome: z.string().min(1, { message: 'Campo obrigatório' }),
  hierarquia: z.enum(VoluntarioHierarquiaEnum, { message: 'Campo obrigatório' }),
  fotoUrl: z.string().nullable().optional(),
  fotoThumbUrl: z.string().nullable().optional(),
});
export type EditMinisterioVoluntarioFormData = z.infer<typeof EditMinisterioVoluntarioSchema>;

export const AddMinisterioSchema = z.object({
  id: z.uuidv4().nullable().optional(),
  nome: z
    .string({
      message: 'Campo obrigatório',
    })
    .min(1, { message: 'Campo obrigatório' }),
  tipo: z.enum(MinisterioTipoEnum, {
    message: 'Campo obrigatório',
  }),
  logoUrl: z
    .string()
    .min(1)
    .refine((v) => v.startsWith('http://') || v.startsWith('https://') || v.startsWith('file://'), {
      message: 'URL de foto inválida',
    })
    .nullish(),
  logoThumbUrl: z.string().nullish(),
  logoUpload: z
    .object({
      uri: z.string().min(1),
      name: z.string().min(1),
      type: z.string().min(1),
    })
    .nullish(),
  descricao: z.string().nullable().optional(),
  status: z.enum(MinisterioStatusEnum, {
    message: 'Campo obrigatório',
  }),
  voluntarios: z
    .array(AddLiderSchema)
    .min(1, { message: 'É obrigatório informar pelo menos um líder' })
    .refine(
      (lideres) => {
        const ids = lideres.map((lider) => lider.voluntarioId);
        const uniqueIds = new Set(ids);
        return uniqueIds.size === lideres.length;
      },
      { error: 'Esse líder já foi incluído' },
    ),
  //   permissoes: z.array(permissoesSchema),
});

export const EditMinisterioSchema = z.object({
  id: z.uuidv4().nullable().optional(),
  nome: z
    .string({
      message: 'Campo obrigatório',
    })
    .min(1, { message: 'Campo obrigatório' }),
  tipo: z.enum(MinisterioTipoEnum, {
    message: 'Campo obrigatório',
  }),
  logoUrl: z
    .string()
    .min(1)
    .refine((v) => v.startsWith('http://') || v.startsWith('https://') || v.startsWith('file://'), {
      message: 'URL de foto inválida',
    })
    .nullish(),
  logoThumbUrl: z.string().nullish(),
  logoUpload: z
    .object({
      uri: z.string().min(1),
      name: z.string().min(1),
      type: z.string().min(1),
    })
    .nullish(),
  uploadLogo: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  status: z.enum(MinisterioStatusEnum, {
    message: 'Campo obrigatório',
  }),
});

export type AddMinisterioFormData = z.infer<typeof AddMinisterioSchema>;
export type EditMinisterioFormData = z.infer<typeof EditMinisterioSchema>;
