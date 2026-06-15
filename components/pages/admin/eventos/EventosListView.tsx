import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useState } from 'react';
import FancyList, { FancyListProps } from '../../../list/FancyList';
import { DefaultIconsNames } from '../../../../constants/icons';
import { generateRecorrenciaJoinableDescription } from '../../../../hooks/useEventosCrud';
import { ResponseEventoDto } from '../../../../domain/dtos/Evento/evento.response';
import { RecorrenciaDiaSemanaEnumMap } from '../../../../domain/enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnumMap } from '../../../../domain/enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnumMap } from '../../../../domain/enums/Evento/recorrencia.enum';
import { FancyAlert } from '../../../modal/FancyAlert';
import { DateUtilsApi } from '../../../../utils/date_utils';
import FancyListItemCard from '../../../cards/FancyListItemCard';
import FancyText from '../../../FancyText';
import { formatInTimeZone } from 'date-fns-tz';
import { APP_TZ } from '../../../../utils/date_utils';
import FancyActionSheet from '../../../actions/FancyActionSheet';
import { usePallete } from '../../../../hooks/usePallete';
import { ColorUtils } from '../../../../utils/color_utils';

export type EventosListProps = {
  data: ResponseEventoDto[];
  listProps?: Omit<FancyListProps<ResponseEventoDto>, 'data' | 'renderItem'>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onEditItem: (item: ResponseEventoDto) => void;
  onDeleteItem: (item: ResponseEventoDto) => void;
};

export default function EventosListView({
  data,
  listProps,
  containerStyle,
  contentContainerStyle,
  onDeleteItem,
  onEditItem,
}: EventosListProps) {
  const palette = usePallete();
  const [actionsEvento, setActionsEvento] = useState<ResponseEventoDto | null>(null);
  const { containerStyle: listContainerStyle, listEmptyProps, ...restListProps } = listProps || {};
  const formatEventoTime = (value?: string) =>
    value ? formatInTimeZone(DateUtilsApi.dateTimeFromApi(value), APP_TZ, 'HH:mm') : '--:--';

  return (
    <View style={[styles.container, containerStyle]}>
      <FancyList
        data={data}
        containerStyle={[styles.listContainer, listContainerStyle]}
        listEmptyProps={
          listEmptyProps || {
            label: 'Nenhum evento cadastrado',
            icon: { library: 'MaterialCommunityIcons', name: 'calendar-blank-outline', size: 68 },
          }
        }
        fadingEdgeLength={200}
        bottomSpace={80}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }: { item: ResponseEventoDto; index: number }) => {
          const inicio = DateUtilsApi.dateOnlyFromApi(item.dataInicio);
          const eventoCor = item.cor || palette.primary;
          const recorrenciaDescricao = generateRecorrenciaJoinableDescription(
            RecorrenciaEnumMap[item.recorrencia!],
            item.recorrenciaSemanaDias?.map((i) => RecorrenciaDiaSemanaEnumMap[i]) || [],
            item.recorrenciaACadaMeses!,
            item.recorrenciaSemanasMes?.map((i) => RecorrenciaSemanaMesEnumMap[i]) || [],
          );

          return (
            <FancyListItemCard
              onPress={() => onEditItem(item)}
              leading={{
                type: 'date',
                day: String(inicio.getDate()).padStart(2, '0'),
                month: inicio.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
                color: eventoCor,
                backgroundColor: ColorUtils.withAlpha(eventoCor, 0.12),
              }}
              title={item.nome}
              subtitle={`${formatEventoTime(item.dataInicio)} — ${formatEventoTime(item.dataTermino)}`}
              meta={
                recorrenciaDescricao ? (
                  <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                    {recorrenciaDescricao}
                  </FancyText>
                ) : undefined
              }
              trailing={{ type: 'menu', onPress: () => setActionsEvento(item) }}
            />
          );
        }}
        {...restListProps}
      />
      <FancyActionSheet
        visible={!!actionsEvento}
        onClose={() => setActionsEvento(null)}
        actions={[
          {
            label: 'Editar',
            icon: {
              library: DefaultIconsNames.edit.library,
              name: DefaultIconsNames.edit.name,
              size: 18,
            },
            onPress: () => {
              if (actionsEvento) onEditItem?.(actionsEvento);
            },
          },
          {
            label: 'Excluir',
            destructive: true,
            icon: {
              library: DefaultIconsNames.delete.library,
              name: DefaultIconsNames.delete.name,
              size: 18,
            },
            onPress: () => {
              if (!actionsEvento) return;
              const evento = actionsEvento;
              FancyAlert.alert(
                'Exclusão de Evento',
                `Tem certeza que deseja remover o evento "${evento.nome}?"`,
                [
                  {
                    text: 'Não',
                    style: 'destructive',
                  },
                  {
                    text: 'Sim',
                    style: 'default',
                    onPress: () => {
                      onDeleteItem?.(evento);
                    },
                  },
                ],
              );
            },
          },
        ]}
      />
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    gap: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'indigo',
  },
  header: {
    borderWidth: DESIGN_MODE,
    borderColor: 'hotpink',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 15,
  },
  separator: {
    height: 10,
  },
});
