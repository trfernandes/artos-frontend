import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import FancyVerticalContainerCard, { DataType } from '../../../cards/Vertical/FancyVerticalContainerCard';
import FancyListEmpty from '../../../list/FancyListEmpty';
import FancyLoading from '../../../FancyLoading';
import { AppImages } from '../../../../assets/app_images';
import { useEscalaItensCrud } from '../../../../hooks/useEscalaItensCrud';
import { Conjunction, Operator, OrderDirection, ValueType } from '../../../../domain/utils/query_utils';
import { DateUtilsApi } from '../../../../utils/date_utils';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AgendaDetailsEscalaTab({
  eventoId,
  dataOcorrencia,
}: {
  eventoId: string;
  dataOcorrencia: Date;
}) {
  const { user } = useAuth();

  const searchParams = useMemo(
    () => ({
      where: {
        conditions: [
          {
            path: 'evento.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: eventoId },
          },
          {
            path: 'dataOcorrencia',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: DateUtilsApi.dateOnlyToApi(dataOcorrencia) },
          },
        ],
        conjunction: Conjunction.AND,
      },
      relations: ['voluntario', 'voluntario.voluntario', 'funcao'],
      orderBy: [{ path: 'funcao.nome', direction: OrderDirection.ASC }],
    }),
    [eventoId, dataOcorrencia],
  );

  const { data, isLoading, isError } = useEscalaItensCrud({
    autoFetch: true,
    initialParams: searchParams,
    includeFotos: true,
  });

  const voluntariosData = useMemo<DataType<'image'>[]>(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      key: item.voluntario?.voluntario?.id,
      title: user?.user?.id === item.voluntario?.voluntario?.id ? 'Você' : item.voluntario?.voluntario?.nome,
      subtitle: item.funcao?.nome,
      highlighted: user?.user?.id === item.voluntario?.voluntario?.id,
      source:
        item.voluntario?.voluntario?.fotoUrl || item.voluntario?.voluntario?.fotoThumbUrl
          ? { uri: item.voluntario?.voluntario?.fotoThumbUrl || item.voluntario?.voluntario?.fotoUrl || '' }
          : AppImages.emptyProfile,
      linkedData: item,
    } as DataType<'image'>));
  }, [data, user?.user?.id]);

  if (isLoading) return <FancyLoading />;
  if (isError) return <FancyListEmpty label='Não foi possível carregar a equipe.' />;

  if (!data || data.length === 0) {
    return (
      <FancyListEmpty
        icon={{ library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 55 }}
        label='Nenhuma equipe escalada para este evento'
      />
    );
  }

  return (
    <View style={styles.container}>
      <FancyVerticalContainerCard
        topElementType='image'
        containerStyle={{ borderWidth: 0 }}
        contentContainerStyle={{ borderWidth: 0, flex: 1 }}
        data={voluntariosData}
        numColumns={3}
        columnSpacing={8}
        rowSpacing={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
