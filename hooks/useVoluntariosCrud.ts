import { useCrud, UseCrudOptions } from './useCrud';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { VoluntariosRepository } from '../domain/services/VoluntariosRepository';
import { z } from 'zod';

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
  nome: z.string('Campo Obrigatório'),
  email: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'),
  dataNascimento: z.date('Campo obrigatório'),
  endereco: z.string().nullish(),
  telefone: z.string().nullish(),
  sexo: z.enum(['M', 'F']),
  foto: z.string().optional(),
  uploadFoto: z.string().optional(),
});

export function useVoluntariosCrud(
  options?: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams' | 'messages'>
) {
  return useCrud({
    queryKey: 'voluntarios',
    autoFetch: options?.autoFetch ?? true,
    initialParams: options?.initialParams,
    fetchAll: () => VoluntariosRepository.getAll(),
    search: query => VoluntariosRepository.search(query),
    fetchOne: async id => {
      const result = await VoluntariosRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: id },
            },
          ],
        },
        relations: ['voluntarios', 'voluntarios.voluntario', 'voluntarios.permissoes'],
      });
      return result[0];
    },
    add: data => VoluntariosRepository.add(data),
    update: (id, data) => {
      return VoluntariosRepository.update(id, data);
    },
    remove: id => VoluntariosRepository.remove(id),
    messages: {
      successCreate: 'Usuário criado com sucesso',
      successUpdate: 'Perfil atualizado com sucesso',
    },
  });
}
