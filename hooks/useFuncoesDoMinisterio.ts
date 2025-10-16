import { useMemo } from 'react';
import { DropDownItemProps } from '../components/fields/FancyDropDownItem';
import { Operator, ValueType, DynamicQuery, OrderDirection } from '../domain/utils/query_utils';
import { useMinisterioFuncoesCrud } from './useMinisterioFuncoesCrud';
import { MinisterioFuncao } from '../domain/models/MinisterioFuncao';

export function useFuncoesDoMinisterio(ministerioId?: string) {
  const initialParams = useMemo(() => {
    if (!ministerioId) return undefined;

    return {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
        ],
      },
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, [ministerioId]);

  const { data: ministerioFuncoesList, isLoading } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams,
  });

  const funcoesList = useMemo((): MinisterioFuncao[] => {
    if (!ministerioFuncoesList) return [];
    return ministerioFuncoesList as MinisterioFuncao[];
  }, [ministerioFuncoesList]);

  const funcoesDropDownList = useMemo(() => {
    if (!ministerioId) return [];

    return funcoesList.map(funcao => ({
      title: funcao?.nome,
      value: funcao?.id,
    })) as DropDownItemProps<string>[];
  }, [funcoesList, ministerioId]);

  return { funcoesList, funcoesDropDownList, isLoading };
}
