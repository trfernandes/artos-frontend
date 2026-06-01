import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useState } from 'react';
import FancyList, { FancyListProps } from '../../../list/FancyList';
import { DefaultIconsNames } from '../../../../constants/icons';
import { generateRecorrenciaJoinableDescription } from '../../../../hooks/useEventosCrud';
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
  const formatEventoDateTime = (value?: string) =>
    value
      ? formatInTimeZone(DateUtilsApi.dateTimeFromApi(value), APP_TZ, 'dd/MM/yyyy HH:mm')
      : 'Sem término';

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
        renderItem={({ item, index }: { item: ResponseEventoDto; index: number }) => {
          const actionButtons: ActionButtonProps[] = [
            {
              icon: {
                library: 'MaterialCommunityIcons',
                name: 'dots-vertical',
                size: 20,
                color: palette.fonts.inactive,
                backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08),
              },
              onPress: () => setActionsEvento(item),
            },
          ];

          return (
            <FancyBaseCard
              key={index}
              title={item.nome}
              subtitle={
                <View style={styles.firstInfoRow}>
                  <FancyTextDisplayCard
                    value={formatEventoDateTime(item.dataInicio)}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'calendar-clock',
                      size: 13,
                      color: palette.primary,
                      style: styles.dataIcon,
                    }}
                    containerStyle={styles.dataRow}
                    valueStyle={{ type: 'medium' }}
                  />
                </View>
              }
              additionalData1={
                <FancyTextDisplayCard
                  value={formatEventoDateTime(item.dataTermino)}
                  icon={{
                    library: 'MaterialCommunityIcons',
                    name: 'calendar-check',
                    size: 13,
                    color: palette.primary,
                    style: styles.dataIcon,
                  }}
                  containerStyle={styles.dataRow}
                  valueStyle={{ type: 'medium' }}
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
                    color: palette.primary,
                    style: styles.dataIconTopAligned,
                  }}
                  containerStyle={styles.dataRowMultiline}
                  valueStyle={{ type: 'medium', style: styles.dataValueMultiline }}
                />
              }
              leftItem={
                <View
                  style={[styles.eventColorLine, { backgroundColor: item.cor || palette.primary }]}
                />
              }
              rightItem={<FancyActionButtons actions={actionButtons} />}
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
  dataRow: {
    alignItems: 'center',
    gap: 6,
  },
  dataRowMultiline: {
    alignItems: 'flex-start',
    gap: 6,
  },
  dataIcon: {
    marginTop: 0,
  },
  dataIconTopAligned: {
    marginTop: 1,
  },
  dataValueMultiline: {
    lineHeight: 13,
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
