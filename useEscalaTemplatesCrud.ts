import { zodResolver } from '@hookform/resolvers/zod';

import { useCrud, UseCrudOptions } from './hooks/useCrud';
import { EscalaTemplateModel } from './domain/models/EscalaTemplate';
import { EscalaTemplatesRepository } from './domain/services/EscalaTemplatesRepository';
import { Operator, ValueType } from './domain/utils/query_utils';
import { EscalaTemplateFormData, escalaTemplateSchema } from './domain/schemas/escalaTemplateSchema';

export function useEscalaTemplatesCrud(
  props?: Pick<UseCrudOptions<any, any>, 'autoFetch' | 'initialParams'>
) {
  return useCrud<EscalaTemplateModel, EscalaTemplateFormData>({
    queryKey: 'escala-templates',
    autoFetch: props?.autoFetch ?? true,
    initialParams: props?.initialParams,
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
    update: (id, data) => EscalaTemplatesRepository.update(id, data as EscalaTemplateModel),
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
