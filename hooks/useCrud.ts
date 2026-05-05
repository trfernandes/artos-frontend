import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useState, useRef, useMemo, useEffect } from 'react';
import { FieldValues, Resolver, UseFormReturn, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
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

export type CrudIdentifiable = { id?: string | null };

export interface ExternalUseCrudParams {
  autoFetch?: boolean;
  initialParams?: DynamicQuery | string | null;
  messages?: CrudFormMessages;
  muteMessages?: boolean;
}

export interface UseCrudOptions<TResponse extends CrudIdentifiable, TForm extends FieldValues, TCreate, TUpdate> {
  queryKey: string;

  fetchAll: () => Promise<TResponse[]>;
  fetchOne?: (id: string) => Promise<TResponse>;

  add?: (data: TCreate) => Promise<TResponse>;
  update?: (id: string, data: TUpdate) => Promise<TResponse>;
  remove?: (id: string) => Promise<void>;

  search?: (params: DynamicQuery) => Promise<TResponse[]>;

  resolver?: Resolver<TForm, any, TForm>;
  messages?: CrudFormMessages;
  muteMessages?: boolean;

  /**
   * Se o TForm não for exatamente o CreateDto/UpdateDto, use estes mappers.
   * Por padrão, faz cast direto.
   */
  toCreateDto?: (form: TForm) => TCreate;
  toUpdateDto?: (form: TForm, current: TResponse) => TUpdate;
}

export function useCrud<TResponse extends CrudIdentifiable, TForm extends FieldValues, TCreate = TForm, TUpdate = Partial<TForm>>({
  queryKey,
  fetchAll,
  fetchOne,
  add,
  update,
  remove,
  search,
  resolver,
  muteMessages = false,
  messages,
  autoFetch = false,
  initialParams,
  toCreateDto,
  toUpdateDto,
}: UseCrudOptions<TResponse, TForm, TCreate, TUpdate> & ExternalUseCrudParams) {
  const queryClient = useQueryClient();

  const [currentItem, setCurrentItem] = useState<TResponse | null>(null);

  const [searchParams, setSearchParams] = useState<DynamicQuery | null>(typeof initialParams === 'string' ? null : initialParams ?? null);
  const [hasBootstrappedInitialParams, setHasBootstrappedInitialParams] = useState(() => !initialParams);
  const [isFetchingInitialItem, setIsFetchingInitialItem] = useState(false);

  const appliedInitialParamsKeyRef = useRef<string | null>(null);

  const initialParamsSnapshot = useMemo((): {
    key: string | null;
    kind: CrudQueryKind;
    value?: DynamicQuery | string;
  } => {
    if (!initialParams) return { key: null, kind: 'none' };

    if (typeof initialParams === 'string') {
      return { key: `id:${initialParams}`, kind: 'id', value: initialParams };
    }

    let serialized = '';
    try {
      serialized = JSON.stringify(initialParams);
    } catch {
      serialized = JSON.stringify({ ...initialParams });
    }

    return { key: `query:${serialized}`, kind: 'query', value: initialParams };
  }, [initialParams]);

  const form: UseFormReturn<TForm> = useForm<TForm>({ resolver });

  useEffect(() => {
    const { key, kind, value } = initialParamsSnapshot;

    if (!key) {
      if (appliedInitialParamsKeyRef.current !== key) {
        appliedInitialParamsKeyRef.current = key;
        setSearchParams((prev) => (prev === null ? prev : null));
      }
      setHasBootstrappedInitialParams(true);
      return;
    }

    if (appliedInitialParamsKeyRef.current === key) return;
    appliedInitialParamsKeyRef.current = key;

    if (kind === 'id') {
      if (!fetchOne || typeof value !== 'string') {
        setHasBootstrappedInitialParams(true);
        return;
      }

      let isMounted = true;
      setIsFetchingInitialItem(true);

      fetchOne(value)
        .then((item) => {
          if (!isMounted || !item) return;
          setCurrentItem(item);
        })
        .finally(() => {
          if (!isMounted) return;
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

  const dataQuery = useQuery<TResponse[], Error>({
    queryKey: [queryKey, searchParams],
    queryFn: async () => {
      if (searchParams && search) return await search(searchParams);
      return await fetchAll();
    },
    enabled: hasBootstrappedInitialParams && (autoFetch || searchParams !== null),
  });

  const hasReceivedData = dataQuery.data !== undefined;
  const combinedLoading =
    !hasBootstrappedInitialParams || (!hasReceivedData && (dataQuery.isLoading || dataQuery.isFetching)) || isFetchingInitialItem;
  const combinedRefetching = hasReceivedData && dataQuery.isFetching && !dataQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: add,
    onSuccess: async () => {
      if (!muteMessages) Toast.show({ type: 'success', text1: messages?.successCreate || 'Item criado com sucesso!' });
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      if (!muteMessages) Toast.show({ type: 'error', text1: messages?.errorCreate || 'Erro ao criar item.' });
      if (__DEV__) {
        console.log('[useCrud] Create error:', error);
      }
    },
  });

  const updateMutation = update && useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) => update(id, data),
    onSuccess: async () => {
      if (!muteMessages) Toast.show({ type: 'success', text1: messages?.successUpdate || 'Item atualizado com sucesso!' });
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      if (!muteMessages) Toast.show({ type: 'error', text1: messages?.errorUpdate || 'Erro ao atualizar item.' });
      if (__DEV__) {
        console.log('[useCrud] Update error:', error);
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: remove,
    onSuccess: async () => {
      if (!muteMessages) Toast.show({ type: 'success', text1: messages?.successDelete || 'Item removido com sucesso!' });
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      if (!muteMessages) Toast.show({ type: 'error', text1: messages?.errorDelete || 'Erro ao remover item.' });
      if (__DEV__) {
        console.log('[useCrud] Delete error:', error);
      }
    },
  });

  const handleSubmit = async (formValues: TForm) => {
    if (currentItem?.id) {
      const payload = toUpdateDto ? toUpdateDto(formValues, currentItem) : (formValues as unknown as TUpdate);
      await updateMutation?.mutateAsync({ id: currentItem.id, data: payload });
    } else {
      const payload = toCreateDto ? toCreateDto(formValues) : (formValues as unknown as TCreate);
      await createMutation.mutateAsync(payload);
    }
  };

  return {
    queryClient,
    queryKey,
    form,
    data: dataQuery.data || [],
    currentItem,
    setCurrentItem,
    setSearchParams,

    add: createMutation.mutateAsync,
    update: updateMutation?.mutateAsync,
    remove: removeMutation.mutateAsync,

    handleSubmit,

    isLoading: combinedLoading,
    isLoadingMutation: createMutation.isPending || updateMutation?.isPending || removeMutation.isPending,
    isRefetching: combinedRefetching,
    isError: dataQuery.isError,
    error: dataQuery.error || createMutation.error || updateMutation?.error || removeMutation.error,
    refetch: dataQuery.refetch,
  };
}
