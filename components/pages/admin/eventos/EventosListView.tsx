import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyList, { FancyListProps } from '../../../list/FancyList';
import { Pallete } from '../../../../constants/colors';
import { DefaultIconsNames } from '../../../../constants/icons';
import { generateRecorrenciaJoinableDescription } from '../../../../hooks/useEventosCrud';
import { format } from 'date-fns';
import { ResponseEventoDto } from '../../../../domain/dtos/Evento/evento.response';
import { RecorrenciaDiaSemanaEnumMap } from '../../../../domain/enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnumMap } from '../../../../domain/enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnumMap } from '../../../../domain/enums/Evento/recorrencia.enum';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import { FancyAlert } from '../../../modal/FancyAlert';
import { DateUtilsApi } from '../../../../utils/date_utils';
import FancyBaseCard from '../../../cards/Horizontal/FancyBaseCard';
import {
    ActionButtonProps,
    FancyActionButtons,
} from '../../../cards/Horizontal/FancyCardActionButtons';

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
  return (
    <View style={containerStyle}>
      <FancyList
        data={data}
        fadingEdgeLength={200}
        bottomSpace={80}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }: { item: ResponseEventoDto; index: number }) => {
          const actionButtons: ActionButtonProps[] = [
            {
              icon: {
                library: DefaultIconsNames.edit.library,
                name: DefaultIconsNames.edit.name,
                size: 18,
              },
              onPress: () => onEditItem?.(item),
            },
            {
              icon: {
                library: DefaultIconsNames.delete.library,
                name: DefaultIconsNames.delete.name,
                size: 18,
                backgroundColor: Pallete.error,
              },
              onPress: () => {
                FancyAlert.alert(
                  'Exclusão de Evento',
                  `Tem certeza que deseja remover o evento "${item.nome}?"`,
                  [
                    {
                      text: 'Não',
                      style: 'destructive',
                    },
                    {
                      text: 'Sim',
                      style: 'default',
                      onPress: () => {
                        onDeleteItem?.(item);
                      },
                    },
                  ],
                );
              },
            },
          ];

          return (
            <FancyBaseCard
              key={index}
              title={item.nome}
              subtitle={
                <View style={styles.firstInfoRow}>
                  <FancyTextDisplayCard
                    value={format(
                      DateUtilsApi.dateTimeFromApi(item.dataInicio),
                      'dd/MM/yyyy HH:mm',
                    )}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'calendar-clock',
                      size: 13,
                      color: Pallete.primary,
                    }}
                    containerStyle={styles.dataRow}
                  />
                </View>
              }
              additionalData1={
                <FancyTextDisplayCard
                  value={
                    item.dataTermino
                      ? format(DateUtilsApi.dateTimeFromApi(item.dataTermino), 'dd/MM/yyyy HH:mm')
                      : 'Sem término'
                  }
                  icon={{
                    library: 'MaterialCommunityIcons',
                    name: 'calendar-check',
                    size: 13,
                    color: Pallete.primary,
                  }}
                  containerStyle={styles.dataRow}
                />
              }
              additionalData2={
                <FancyTextDisplayCard
                  value={generateRecorrenciaJoinableDescription(
                    RecorrenciaEnumMap[item.recorrencia!],
                    item.recorrenciaSemanaDias?.map((i) => RecorrenciaDiaSemanaEnumMap[i]) || [],
                    item.recorrenciaACadaMeses!,
                    item.recorrenciaSemanasMes?.map((i) => RecorrenciaSemanaMesEnumMap[i]) || [],
                  )}
                  icon={{
                    library: 'MaterialCommunityIcons',
                    name: 'calendar-sync',
                    size: 13,
                    color: Pallete.primary,
                  }}
                  containerStyle={styles.dataRow}
                  valueStyle={{}}
                />
              }
              leftItem={
                <View
                  style={[styles.eventColorLine, { backgroundColor: item.cor || Pallete.primary }]}
                />
              }
              rightItem={<FancyActionButtons actions={actionButtons} />}
            />
          );
        }}
        {...listProps}
      />
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
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
  dataRow: {
    alignItems: 'center',
    gap: 6,
  },
  firstInfoRow: {
    marginTop: 4,
  },
  eventColorLine: {
    width: 3,
    flex: 1,
    marginVertical: 10,
    borderRadius: 3,
  },
});
