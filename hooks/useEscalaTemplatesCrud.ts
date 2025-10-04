import { zodResolver } from '@hookform/resolvers/zod';
import { useCrud } from './useCrud';
import { DynamicQuery, Operator, ValueType } from '../domain/utils/query_utils';
import { EscalaTemplate } from '../domain/models/EscalaTemplate';
import { EscalaTemplatesRepository } from '../domain/services/EscalaTemplatesRepository';
import { EscalaTemplateFormData, escalaTemplateSchema } from '../domain/schemas/escalaTemplateSchema';

export function useEscalaTemplatesCrud(options?: {
  autoFetch?: boolean;
  initialParams?: DynamicQuery;
}) {
  return useCrud<EscalaTemplate, EscalaTemplateFormData>({
    queryKey: 'escala-templates',
    autoFetch: options?.autoFetch ?? true,
    initialParams: options?.initialParams,
    fetchAll: () => EscalaTemplatesRepository.getAll({ relations: ['ministerio'] }),
    search: query => EscalaTemplatesRepository.search(query),
    fetchOne: async id => {
      const results = await EscalaTemplatesRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: id },
            },
          ],
        },
        relations: [
          'ministerio',
          'voluntarios',
          'voluntarios.voluntario',
          'voluntarios.funcao',
          'funcoes',
          'funcoes.funcao',
        ],
        limit: 1,
      });

      if (!results.length) {
        throw new Error('Template não encontrado');
      }

      return results[0];
    },
    add: data => EscalaTemplatesRepository.add(data),
    update: (id, data) => EscalaTemplatesRepository.update(id, data as EscalaTemplate),
    remove: id => EscalaTemplatesRepository.remove(id),
    resolver: zodResolver(escalaTemplateSchema),
    messages: {
      successCreate: 'Template criado com sucesso!',
      errorCreate: 'Erro ao criar template.',
      successUpdate: 'Template atualizado com sucesso!',
      errorUpdate: 'Erro ao atualizar template.',
      successDelete: 'Template removido com sucesso!',
      errorDelete: 'Erro ao remover template.',
    },
  });
}
