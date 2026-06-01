import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { getApiErrorMessage } from '../domain/api/api-error';
import { EscalaRepository } from '../domain/services/EscalaRepository';
import { Operator, ValueType } from '../domain/utils/query_utils';
import { ExternalUseCrudParams, useCrud } from './useCrud';
import { ResponseEscalaDto } from '../domain/dtos/Escala/escala.response';
import { CreateEscalaDto } from '../domain/dtos/Escala/escala.create';
import { UpdateEscalaDto } from '../domain/dtos/Escala/escala.update';
import { EscalaFormData } from '../domain/schemas/escalaSchema';

export function useEscalasCrud({
  autoFetch = false,
  initialParams = undefined,
}: ExternalUseCrudParams = {}) {
  const crud = useCrud<ResponseEscalaDto, EscalaFormData, CreateEscalaDto, UpdateEscalaDto>({
    queryKey: 'escalas',
    autoFetch,
    initialParams,
    fetchAll: () => EscalaRepository.getAll(),
    search: (query) => EscalaRepository.search(query),
    fetchOne: async (id) => {
      const result = await EscalaRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: id },
            },
          ],
        },
        relations: [],
      });
      return result[0];
    },

    add: (data) => EscalaRepository.add(data),
    update: (id, data) => EscalaRepository.update(id, data),
    remove: (id) => EscalaRepository.remove(id),
    messages: {
      successCreate: 'Escala criada com sucesso!',
      errorCreate: 'Erro ao criar escala.',
      successUpdate: 'Escala atualizada com sucesso!',
      errorUpdate: 'Erro ao atualizar escala.',
      successDelete: 'Escala removida com sucesso!',
      errorDelete: 'Erro ao remover escala.',
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: CreateEscalaDto) => EscalaRepository.generate(data),
    onSuccess: async () => {
      // No assistente, a confirmação visual é a própria etapa "Resultado".
      await crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: (error) => {
      const responseData = axios.isAxiosError(error) ? (error.response?.data as any) : null;
      const responseStatus = axios.isAxiosError(error) ? error.response?.status : null;
      const errorCode = responseData?.error?.code || responseData?.errorCode;
      const isDuplicateName =
        errorCode === 'ESCALA_NOME_DUPLICADO' ||
        responseData?.statusCode === 409 ||
        responseStatus === 409;

      Toast.show({
        type: 'error',
        text1: isDuplicateName ? 'Nome de escala em uso' : 'Erro ao gerar escala.',
        text2: isDuplicateName
          ? 'Já existe uma escala com esse nome neste ministério.'
          : getApiErrorMessage(error, 'Não foi possível gerar a escala.'),
      });

      if (__DEV__) {
        console.log('[useEscalasCrud] generate error:', error);
      }
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (escalaId: string) => EscalaRepository.regenerate(escalaId),
    onSuccess: async () => {
      await crud.queryClient.invalidateQueries({ queryKey: [crud.queryKey] });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Erro ao regerar escala.',
        text2: getApiErrorMessage(error, 'Não foi possível regerar a escala.'),
      });

      if (__DEV__) {
        console.log('[useEscalasCrud] regenerate error:', error);
      }
    },
  });

  return {
    ...crud,
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    regenerate: regenerateMutation.mutateAsync,
    isRegenerating: regenerateMutation.isPending,
  };
}
