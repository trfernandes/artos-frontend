import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyCalendarVertical from '../../../../../components/calendar/FancyCalendarVertical';
import FancyFab from '../../../../../components/buttons/FancyFab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Pallete } from '../../../../../constants/colors';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import DateUtils from '../../../../../utils/data_utils';
import Toast from 'react-native-toast-message';

export default function IndisponibilidadeIndexPage() {
  const dataAtual = new Date();
  const dataInicial = new Date(dataAtual.getFullYear() - 1, dataAtual.getMonth(), dataAtual.getDate());
  const dataFinal = new Date(dataAtual.getFullYear() + 1, dataAtual.getMonth(), dataAtual.getDate());
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <FancyPageView style={styles.container}>
      <FancyCalendarVertical
        startDate={dataInicial}
        endDate={dataFinal}
        markedDates={markedDates}
        onSelectDate={date => {
          if (mode === 'view') return;

          if (markedDates.some(d => DateUtils.compareOnlyDate(d, date))) {
            setMarkedDates(markedDates.filter(d => !DateUtils.compareOnlyDate(d, date)));
          } else {
            setMarkedDates([...markedDates, date]);
          }
        }}
        listProps={{ bottomSpace: 70 }}
      />
      <FancyFab
        icon={mode === 'view' ? { ...DefaultIconsNames.edit, size: 26 } : { ...DefaultIconsNames.save, size: 24 }}
        backgroundColor={mode === 'view' ? Pallete.terciary : Pallete.confirm}
        onPress={() => {
          setMode(value => {
            const newValue = value === 'view' ? 'edit' : 'view';

            Toast.show({
              position: 'top',
              text2: newValue === 'view' ? 'Alterações Salvas com Sucesso' : 'Modo de Edição ativado',
              type: newValue === 'view' ? 'success' : 'info',
            });

            return newValue;
          });
        }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18 },
});
