import { useMemo } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { DynamicQuery, Operator, ValueType } from '../../../../domain/utils/query_utils';
import { useMinisterioVoluntariosCrud } from '../../../../hooks/useMinisterioVoluntariosCrud';
import VoluntarioMinisterioTab from '../../admin/voluntarios/VoluntarioMinisterioTab';

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
      relations: ['ministerio', 'voluntario'],
    };
  }, [user?.user?.id]);

  const { data: ministeriosData } = useMinisterioVoluntariosCrud({
    initialParams: minVoluntariosSearchParams,
    autoFetch: true,
  });

  return <VoluntarioMinisterioTab ministerios={ministeriosData} mode={'view'} />;
}
