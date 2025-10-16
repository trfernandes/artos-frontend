import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FieldValues, Resolver, useForm, UseFormReturn } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useEffect, useMemo, useRef, useState } from 'react';
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

type CrudQueryKind = 'none' | 'query' | 'id';

export interface UseCrudOptions<T, TForm extends FieldValues, CreateDto = Partial<T>, UpdateDto = Partial<T>> {
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
  initialParams?: DynamicQuery | string;
}

export function useCrud<
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
  autoFetch = false,
  initialParams,
}: UseCrudOptions<T, TForm, CreateDto, UpdateDto>) {
  const queryClient = useQueryClient();
  const [currentItem, setCurrentItem] = useState<T | null>(null);

  const [searchParams, setSearchParams] = useState<DynamicQuery | null>(
    typeof initialParams === 'string' ? null : initialParams ?? null
  );
  const [hasBootstrappedInitialParams, setHasBootstrappedInitialParams] = useState(() => !initialParams);
  const [isFetchingInitialItem, setIsFetchingInitialItem] = useState(false);

  const appliedInitialParamsKeyRef = useRef<string | null>(null);

  const initialParamsSnapshot = useMemo((): {
    key: string | null;
    kind: CrudQueryKind;
    value?: DynamicQuery | string;
  } => {
    if (!initialParams) {
      return { key: null, kind: 'none' };
    }

    if (typeof initialParams === 'string') {
      return { key: `id:${initialParams}`, kind: 'id', value: initialParams };
    }

    let serialized = '';
    try {
      serialized = JSON.stringify(initialParams);
    } catch (error) {
      console.warn('useCrud: falha ao serializar initialParams', error);
      serialized = JSON.stringify({ ...initialParams });
    }

    return { key: `query:${serialized}`, kind: 'query', value: initialParams };
  }, [initialParams]);

  const form: UseFormReturn<any> = useForm<TForm>({
    resolver,
  });

  useEffect(() => {
    const { key, kind, value } = initialParamsSnapshot;

    if (!key) {
      if (appliedInitialParamsKeyRef.current !== key) {
        appliedInitialParamsKeyRef.current = key;
        setSearchParams(prev => (prev === null ? prev : null));
      }
      setHasBootstrappedInitialParams(true);
      return;
    }

    if (appliedInitialParamsKeyRef.current === key) {
      return;
    }

    appliedInitialParamsKeyRef.current = key;

    if (kind === 'id') {
      if (!fetchOne || typeof value !== 'string') {
        setHasBootstrappedInitialParams(true);
        return;
      }

      let isMounted = true;
      setIsFetchingInitialItem(true);

      fetchOne(value)
        .then(item => {
          if (!isMounted || !item) {
            return;
          }
          setCurrentItem(item);
        })
        .finally(() => {
          if (!isMounted) {
            return;
          }
          setIsFetchingInitialItem(false);
          setHasBootstrappedInitialParams(true);
        });

      return () => {
        isMounted = false;
      };
    }

    if (kind === 'query' && value && typeof value !== 'string') {
      setSearchParams(value);
    }

    setHasBootstrappedInitialParams(true);
  }, [initialParamsSnapshot, fetchOne]);

  const dataQuery = useQuery<T[], Error>({
    queryKey: [queryKey, searchParams],
    queryFn: async () => {
      if (searchParams && search) {
        return await search(searchParams);
      }
      return await fetchAll();
    },
    enabled: hasBootstrappedInitialParams && (autoFetch || searchParams !== null),
  });

  const hasReceivedData = dataQuery.data !== undefined;
  const combinedLoading =
    !hasBootstrappedInitialParams ||
    (!hasReceivedData && (dataQuery.isLoading || dataQuery.isFetching)) ||
    isFetchingInitialItem;
  const combinedRefetching = hasReceivedData && dataQuery.isFetching && !dataQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: add,
    onSuccess: () => {
      Toast.show({ type: 'success', text1: messages?.successCreate || 'Item criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: error => {
      Toast.show({ type: 'error', text1: messages?.errorCreate || 'Erro ao criar item.' });
      console.log(error);
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
      console.log(error);
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
      console.log(error);
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
    queryClient,
    messages,
    queryKey,
    form,
    data: dataQuery.data || [],
    currentItem,
    setCurrentItem,
    setSearchParams,
    add: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    handleSubmit,
    isLoading: combinedLoading,
    isLoadingMutation: createMutation.isPending || updateMutation.isPending || removeMutation.isPending,
    isRefetching: combinedRefetching,
    isError: dataQuery.isError,
    error: dataQuery.error || createMutation.error || updateMutation.error || removeMutation.error,
    refetch: dataQuery.refetch,
  };
}
