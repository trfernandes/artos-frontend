import { StyleSheet, View } from 'react-native';
import FancyVerticalContainerCard, { DataType } from '../../../../cards/Vertical/FancyVerticalContainerCard';
import { useMemo } from 'react';
import { useEscalaItensCrud } from '../../../../../hooks/useEscalaItensCrud';
import { DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import FancyLoading from '../../../../FancyLoading';
import { useAuth } from '../../../../../contexts/AuthContext';
import { AppImages } from '../../../../../assets/app_images';

export default function EscalaEventoEquipeTab({ eventoId, dataOcorrencia }: { eventoId: string; dataOcorrencia: Date }) {
  const { user } = useAuth();

  const searchParams: DynamicQuery = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [
          {
            path: 'evento.id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: eventoId,
            },
          },
          {
            path: 'dataOcorrencia',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: format(toZonedTime(new Date(dataOcorrencia), 'America/Sao_Paulo'), 'yyyy-MM-dd HH:mm:ss'),
            },
          },
        ],
      },
      relations: ['voluntario.voluntario', 'funcao'],
      orderBy: [{ path: 'funcao.nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, [eventoId, dataOcorrencia]);

  const { data, isLoading } = useEscalaItensCrud({
    autoFetch: true,
    initialParams: searchParams,
    includeFotos: true,
  });

  const voluntariosData = useMemo<DataType<'image'>[]>(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => {
      return {
        key: item.voluntario?.voluntario?.id,
        title: user?.user?.id === item.voluntario?.voluntario?.id ? 'Você' : item.voluntario?.voluntario?.nome,
        subtitle: item.funcao?.nome,
        highlighted: user?.user?.id === item.voluntario?.voluntario?.id,
        source:
          item.voluntario?.voluntario?.fotoUrl || item.voluntario?.voluntario?.fotoThumbUrl
            ? { uri: item.voluntario?.voluntario?.fotoThumbUrl || item.voluntario?.voluntario?.fotoUrl || '' }
            : AppImages.emptyProfile,
        linkedData: item,
      } as DataType<'image'>;
    });
  }, [data]);

  if (isLoading) return <FancyLoading />;

  return (
    <View style={styles.container}>
      <FancyVerticalContainerCard
        topElementType='image'
        containerStyle={{ borderWidth: 0 }}
        contentContainerStyle={{ borderWidth: 0, borderColor: 'red', flex: 1 }}
        data={voluntariosData}
        numColumns={3}
        columnSpacing={8}
        rowSpacing={8}
        // onChangeValue={handleChangeValue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderWidth: 0 },
});
