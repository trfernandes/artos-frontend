import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FieldValues, Resolver, useForm, UseFormReturn } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
import { Identifiable } from '../domain/models/Indentifiable';
import { DynamicQuery } from '../domain/utils/query_utils';

export type CrudFormMessages = {
  successCreate?: string;
  successUpdate?: string;
  successDelete?: string;
  errorCreate?: string;
  errorUpdate?: string;
  errorDelete?: string;
};

export interface UseCrudFormOptions<
  T,
  TForm extends FieldValues,
  CreateDto = Partial<T>,
  UpdateDto = Partial<T>
> {
  queryKey: string;
  fetchAll: () => Promise<T[]>;
  fetchOne?: (id: string) => Promise<T>;
  add: (data: CreateDto) => Promise<T>;
  update: (id: string, data: UpdateDto) => Promise<T>;
  remove: (id: string) => Promise<void>;
  search?: (params: DynamicQuery) => Promise<T[]>;
  resolver?: Resolver<TForm, any, TForm>;
  messages?: CrudFormMessages;
  autoFetch?: boolean; // busca automática padrão
  initialParams?: DynamicQuery | string; // nova flag: busca inicial (search ou fetchOne)
}

export function useCrudForm<
  T extends Identifiable,
  TForm extends FieldValues,
  CreateDto = Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  UpdateDto = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
>({
  queryKey,
  fetchAll,
  fetchOne,
  add,
  update,
  remove,
  search,
  resolver,
  messages,
  autoFetch = true,
  initialParams,
}: UseCrudFormOptions<T, TForm, CreateDto, UpdateDto>) {
  const queryClient = useQueryClient();
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [searchParams, setSearchParams] = useState<DynamicQuery | null>(null);

  // Formulário genérico
  const form: UseFormReturn<any> = useForm<TForm>({
    resolver,
  });

  // Query única (lista normal ou busca)
  const dataQuery = useQuery<T[], Error>({
    queryKey: [queryKey, searchParams],
    queryFn: async () => {
      if (searchParams && search) {
        return await search(searchParams);
      }
      return await fetchAll();
    },
    enabled: autoFetch || !!initialParams, // habilita a query somente se autoFetch=true ou se houver busca inicial
  });

  // Faz fetch inicial se passou initialParams
  useState(() => {
    if (initialParams) {
      if (typeof initialParams === 'string' && fetchOne) {
        fetchOne(initialParams).then(item => {
          if (item) setCurrentItem(item);
        });
      } else if (search && typeof initialParams !== 'string') {
        setSearchParams(initialParams);
      }
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: add,
    onSuccess: () => {
      Toast.show({ type: 'success', text1: messages?.successCreate || 'Item criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: error => {
      Toast.show({ type: 'error', text1: messages?.errorCreate || 'Erro ao criar item.' });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDto }) => update(id, data),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: messages?.successUpdate || 'Item atualizado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: error => {
      Toast.show({ type: 'error', text1: messages?.errorUpdate || 'Erro ao atualizar item.' });
      console.error(error);
    },
  });

  const removeMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      Toast.show({ type: 'success', text1: messages?.successDelete || 'Item removido com sucesso!' });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: error => {
      Toast.show({ type: 'error', text1: messages?.errorDelete || 'Erro ao remover item.' });
      console.error(error);
    },
  });

  const handleSubmit = async (data: any) => {
    if (currentItem?.id) {
      await updateMutation.mutateAsync({ id: currentItem.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return {
    form,
    data: dataQuery.data || [],
    currentItem,
    setCurrentItem,
    setSearchParams,
    add: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    handleSubmit,
    isLoading: dataQuery.isLoading,
    isLoadingMutation: createMutation.isPending || updateMutation.isPending || removeMutation.isPending,
    isRefetching: dataQuery.isRefetching,
    isError: dataQuery.isError,
    error: dataQuery.error || createMutation.error || updateMutation.error || removeMutation.error,
    refetch: dataQuery.refetch,
  };
}
