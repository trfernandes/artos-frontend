import { useMemo } from 'react';
import { DropDownItemProps } from '../components/fields/FancyDropDownItem';
import { VoluntarioModel } from '../domain/models/Voluntario';
import { Operator, ValueType, DynamicQuery, OrderDirection } from '../domain/utils/query_utils';
import { useMinisterioVoluntariosCrud } from './useMinisterioVoluntariosCrud';
import { MinisterioVoluntarioStatusEnum } from '../domain/models/MinisterioVoluntario';

export function useVoluntariosDoMinisterioCrud(
  ministerioId?: string,
  status: MinisterioVoluntarioStatusEnum = MinisterioVoluntarioStatusEnum.Ativo
) {
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
          {
            path: 'status',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: status },
          },
        ],
      },
      orderBy: [{ path: 'voluntario.nome', direction: OrderDirection.ASC }],
      relations: ['voluntario'],
    } as DynamicQuery;
  }, [ministerioId]);

  const { data: ministerioVoluntariosList, isLoading } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams,
  });

  const ministerioVoluntariosDropDownList = useMemo(() => {
    if (!ministerioVoluntariosList) return [];
    return ministerioVoluntariosList.map(mv => ({
      title: mv.voluntario?.nome,
      value: mv.id,
      left: mv.voluntario?.foto
        ? { type: 'image', source: mv.voluntario.foto }
        : { source: require('../assets/images/empty_profile_image.png') },
    })) as DropDownItemProps<string>[];
  }, [ministerioVoluntariosList, ministerioId]);

  const voluntariosList = useMemo((): VoluntarioModel[] => {
    if (!ministerioVoluntariosList) return [];
    return ministerioVoluntariosList.map(mv => mv.voluntario) as VoluntarioModel[];
  }, [ministerioVoluntariosList]);

  const voluntariosDropDownList = useMemo(() => {
    if (!ministerioId) return [];

    return voluntariosList.map(voluntario => ({
      title: voluntario?.nome,
      value: voluntario?.id,
      left: voluntario?.foto
        ? { type: 'image', source: voluntario.foto }
        : { source: require('../assets/images/empty_profile_image.png') },
    })) as DropDownItemProps<string>[];
  }, [voluntariosList, ministerioId]);

  return {
    voluntariosList,
    voluntariosDropDownList,
    ministerioVoluntariosList,
    ministerioVoluntariosDropDownList,
    isLoading,
  };
}
