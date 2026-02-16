import { useMemo } from 'react';
import { DropDownItemProps } from '../components/fields/FancyDropDownItem';
import {
     Conjunction,
     Operator,
     ValueType,
     DynamicQuery,
     OrderDirection,
} from '../domain/utils/query_utils';
import { useMinisterioVoluntariosCrud } from './useMinisterioVoluntariosCrud';
import { MinisterioVoluntarioStatusEnum } from '../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { ResponseVoluntarioDto } from '../domain/dtos/Voluntario/voluntario.response';
import { AppImages } from '../assets/app_images';
import { useAuth } from '../contexts/AuthContext';

export function useVoluntariosDoMinisterioCrud(
  ministerioId?: string,
  status: MinisterioVoluntarioStatusEnum = MinisterioVoluntarioStatusEnum.Ativo,
) {
  const { igrejaAtiva } = useAuth();

  const initialParams = useMemo(() => {
    if (!ministerioId || !igrejaAtiva?.id) return undefined;

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
          {
            path: 'ministerio.igrejaId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: igrejaAtiva.id },
          },
        ],
        conjunction: Conjunction.AND,
      },
      orderBy: [{ path: 'voluntario.nome', direction: OrderDirection.ASC }],
      relations: ['voluntario', 'funcoes', 'funcoes.funcao'],
    } as DynamicQuery;
  }, [ministerioId, igrejaAtiva?.id]);

  const {
    data: ministerioVoluntariosList,
    isLoading: isLoadingMinisterioVoluntarios,
    isLoadingMutation: isLoadingMinisterioVoluntariosMutation,
    add: addMinisterioVoluntario,
    update: updateMinisterioVoluntario,
    remove: removeMinisterioVoluntario,
  } = useMinisterioVoluntariosCrud({
    autoFetch: !!ministerioId && !!igrejaAtiva?.id,
    initialParams,
  });

  const ministerioVoluntariosDropDownList = useMemo(() => {
    if (!ministerioVoluntariosList) return [];
    return ministerioVoluntariosList.map((mv) => {
      const voluntario = mv.voluntario as ResponseVoluntarioDto | null | undefined;
      return {
        title: voluntario?.nome ?? '',
        value: mv.id ?? '',
        left: {
          type: 'image',
          source:
            voluntario?.fotoThumbUrl || voluntario?.fotoUrl
              ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl || '' }
              : AppImages.emptyProfile,
        },
      };
    }) as DropDownItemProps<string>[];
  }, [ministerioVoluntariosList, ministerioId]);

  const voluntariosList = useMemo<ResponseVoluntarioDto[]>(() => {
    if (!ministerioVoluntariosList) return [];
    return ministerioVoluntariosList
      .map((mv) => mv.voluntario as ResponseVoluntarioDto | null | undefined)
      .filter((v): v is ResponseVoluntarioDto => Boolean(v));
  }, [ministerioVoluntariosList]);

  const voluntariosDropDownList = useMemo(() => {
    if (!ministerioId) return [];

    return voluntariosList.map((voluntario) => ({
      title: voluntario.nome ?? '',
      value: voluntario.id ?? '',
      left: {
        type: 'image',
        source:
          voluntario.fotoThumbUrl || voluntario.fotoUrl
            ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl || '' }
            : AppImages.emptyProfile,
      },
    })) as DropDownItemProps<string>[];
  }, [voluntariosList, ministerioId]);

  return {
    voluntariosList,
    voluntariosDropDownList,
    ministerioVoluntariosList,
    ministerioVoluntariosDropDownList,
    isLoadingMinisterioVoluntarios,
    isLoadingMinisterioVoluntariosMutation,
    addMinisterioVoluntario,
    updateMinisterioVoluntario,
    removeMinisterioVoluntario,
  };
}
