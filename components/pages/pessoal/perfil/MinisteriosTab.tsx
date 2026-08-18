import { useMemo } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { DynamicQuery, Operator, ValueType } from '../../../../domain/utils/query_utils';
import { useMinisterioVoluntariosCrud } from '../../../../hooks/useMinisterioVoluntariosCrud';
import VoluntarioMinisterioTab from '../../admin/voluntarios/VoluntarioMinisterioTab';
import FancyLoading from '../../../FancyLoading';

export default function MinisteriosTab() {
  const { user } = useAuth();

  const minVoluntariosSearchParams = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [
          {
            path: 'voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: user?.user?.id ?? '' },
          },
        ],
      },
      relations: ['ministerio', 'voluntario', 'funcoes', 'funcoes.funcao'],
    };
  }, [user?.user?.id]);

  const { data: ministeriosData, isLoading } = useMinisterioVoluntariosCrud({
    initialParams: minVoluntariosSearchParams,
    autoFetch: true,
  });

  if (isLoading) return <FancyLoading />;

  return <VoluntarioMinisterioTab ministerios={ministeriosData} mode={'view'} />;
}
