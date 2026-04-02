import z from 'zod';
import { SexoEnum } from '../enums/common/sexo-enum';
import { VoluntarioStatusEnum } from '../enums/Voluntario/voluntario-status.enum';

export const createAccountSchema = z
  .object({
    nome: z
      .string('Campo obrigatório')
      .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
      .max(255, { message: 'O nome pode ter no máximo 255 caracteres' }),

    email: z
      .string()
      .min(1, 'Campo obrigatório')
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'),

    senha: z
      .string('Campo obrigatório')
      .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
      .max(100, { message: 'A senha pode ter no máximo 100 caracteres' }),

    confirmarSenha: z.string('Campo obrigatório'),
    
    codigoIgreja: z
      .string('Campo obrigatório')
      .min(1, 'Informe o código da igreja'),
  })
  .superRefine((data, ctx) => {
    if (data.senha !== data.confirmarSenha) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmarSenha'],
        message: 'As senhas não coincidem',
      });
    }
  });

export const updateProfileSchema = z.object({
  nome: z.string().min(1, 'Campo obrigatório'),
  email: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'),
  dataNascimento: z.date('Campo obrigatório').nullish(),
  endereco: z.string().nullish(),
  telefone: z.string().nullish(),
  sexo: z.enum(SexoEnum),
  status: z.enum(VoluntarioStatusEnum),
  fotoUrl: z
    .string()
    .min(1)
    .refine((v) => v.startsWith('http://') || v.startsWith('https://') || v.startsWith('file://'), {
      message: 'URL de foto inválida',
    })
    .nullish(),
  fotoThumbUrl: z.string().nullish(),
  fotoUpload: z
    .object({
      uri: z.string().min(1),
      name: z.string().min(1),
      type: z.string().min(1),
    })
    .nullish(),
});
