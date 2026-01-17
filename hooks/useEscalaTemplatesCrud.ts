import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { EscalaTemplatesRepository } from '../domain/services/EscalaTemplatesRepository';
import { EscalaTemplateFormData, escalaTemplateSchema } from '../domain/schemas/escalaTemplateSchema';
import { CreateEscalaTemplateDto } from '../domain/dtos/EscalaTemplate/escala-template.create';
import { UpdateEscalaTemplateDto } from '../domain/dtos/EscalaTemplate/escala-template.update';
import { ResponseEscalaTemplateDto } from '../domain/dtos/EscalaTemplate/escala-template.response';

export function useEscalaTemplatesCrud({ autoFetch = false, initialParams = {} }: ExternalUseCrudParams = {}) {
  return useCrud<ResponseEscalaTemplateDto, EscalaTemplateFormData, CreateEscalaTemplateDto, UpdateEscalaTemplateDto>({
    queryKey: 'escala-templates',
    autoFetch,
    initialParams,
    fetchAll: () => EscalaTemplatesRepository.getAll({ relations: ['ministerio'] }),
    search: (query) => EscalaTemplatesRepository.search(query),
    fetchOne: async (id) => {
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
        relations: ['ministerio', 'voluntarios', 'voluntarios.voluntario', 'voluntarios.funcao', 'funcoes', 'funcoes.funcao'],
        limit: 1,
      });

      if (!results.length) {
        throw new Error('Template não encontrado');
      }

      return results[0];
    },
    add: (data) => EscalaTemplatesRepository.add(data),
    update: (id, data) => EscalaTemplatesRepository.update(id, data),
    remove: (id) => EscalaTemplatesRepository.remove(id),
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
