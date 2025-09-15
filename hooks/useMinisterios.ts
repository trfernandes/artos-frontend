import z from 'zod';
import { addLiderSchema } from '../app/(app)/(drawer)/admin/ministerios/add';
import { permissoesSchema } from '../components/pages/admin/ministerios/PermissoesTab';
import { MinisterioTipoEnum, MinisterioStatusEnum } from '../domain/models/Ministerio';
import { MinisteriosRepository } from '../domain/services/MinisteriosRepository';
import { useCrudForm } from './useCrudForm';
import { DynamicQuery, Operator, ValueType } from '../domain/utils/query_utils';
import { zodResolver } from '@hookform/resolvers/zod';

export const ministerioSchema = z.object({
  id: z.uuidv4().nullable().optional(),
  nome: z
    .string({
      message: 'Campo obrigatório',
    })
    .min(1, { message: 'Campo obrigatório' }),
  tipo: z.enum(MinisterioTipoEnum, {
    message: 'Campo obrigatório',
  }),
  logo: z.string().nullable().optional(),
  uploadLogo: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  status: z.enum(MinisterioStatusEnum, {
    message: 'Campo obrigatório',
  }),
  voluntarios: z
    .array(addLiderSchema)
    .min(1, { message: 'É obrigatório informar pelo menos um líder' })
    .refine(
      lideres => {
        const ids = lideres.map(lider => lider.voluntarioId);
        const uniqueIds = new Set(ids);
        return uniqueIds.size === lideres.length;
      },
      { error: 'Esse líder já foi incluído' }
    ),
  permissoes: z.array(permissoesSchema),
});

export type MinisterioFormData = z.infer<typeof ministerioSchema>;

interface UseMinisteriosOptions {
  autoFetch?: boolean;
  initialParams?: DynamicQuery | string;
}

export function useMinisterios(options?: UseMinisteriosOptions) {
  return useCrudForm({
    queryKey: 'ministerios',
    autoFetch: options?.autoFetch ?? true,
    initialParams: options?.initialParams,
    fetchAll: () => MinisteriosRepository.getAll(),
    search: query => MinisteriosRepository.search(query),
    fetchOne: async id => {
      const result = await MinisteriosRepository.search({
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
    add: data => MinisteriosRepository.add(data),
    update: (id, data) => MinisteriosRepository.update(id, data),
    remove: id => MinisteriosRepository.remove(id),
    resolver: zodResolver(ministerioSchema),
  });
}
