import { View, StyleSheet } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import FancyAccordeon from '../../../FancyAccordeon';
import FancyText from '../../../FancyText';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import { EventoFormData } from '../../../../hooks/useEventos';
import { useFormContext } from 'react-hook-form';

export default function EventoRepeticaoInputCustomMensal() {
  const { control, watch } = useFormContext<EventoFormData>();
  // const [semanasMesList, setSemanasMesList] = useState<{ index: number; label: string; checked: boolean }[]>(
  //   Object.keys(SEMANAS_MES).map(item => ({
  //     index: +item,
  //     label: SEMANAS_MES[+item].extenso,
  //     checked: value?.semanasDoMes && value.semanasDoMes.includes(+item) ? true : false,
  //   }))
  // );
  // const [diasSemanaList, setDiasSemanaList] = useState<{ index: number; label: string; checked: boolean }[]>(
  //   Object.keys(DIAS_SEMANA).map(item => ({
  //     index: +item,
  //     label: DIAS_SEMANA[+item].extenso,
  //     checked: value?.diasSemana && value.diasSemana.includes(+item) ? true : false,
  //   }))
  // );

  // const recWatch = watch('recorrenciaACadaMeses');

  return (
    <View style={{ gap: 10 }}>
      <>
        {/* <Text> {recWatch}</Text> */}
        <View
          style={[
            styles.container,
            {
              gap: 15,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}
        >
          <FancyText type="semiBold" size={'small'}>
            A Cada
          </FancyText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 0 }}>
            <ControlledTextInput
              control={control}
              name="recorrenciaACadaMeses"
              showErrorMessage={false}
              inputContainerStyle={{
                width: 60,
              }}
              inputProps={{
                textAlign: 'center',
                keyboardType: 'numeric',
                maxLength: 2,
              }}
            />

            <FancyText type="mediumItalic" size={'extraSmall'} color={Pallete.fonts.inactive}>
              mês(es)
            </FancyText>
          </View>
        </View>
      </>
      <>
        <FancyAccordeon
          title="Semanas do Mês"
          contentContainerStyle={{ paddingTop: 2 }}
          // subtitle={
          //   semanasMesList.filter(item => item.checked).length === 0
          //     ? 'Nenhum'
          //     : semanasMesList.filter(item => item.checked).length === 5
          //     ? 'Todas'
          //     : semanasMesList
          //         .filter(item => item.checked)
          //         .map(item => SEMANAS_MES[item.index].abreviado)
          //         .join(' | ')
          // }
        >
          {/* <FancyListSelection
            showDividers
            items={semanasMesList}
            onPress={index => {
              const updatedList = semanasMesList.map(item => ({
                ...item,
                checked: item.index === index ? !item.checked : item.checked,
              }));
              const checkeds = updatedList.filter(item => item.checked).map(item => item.index);
              setSemanasMesList(updatedList);
              setResult(prev => ({
                ...prev,
                semanasDoMes: checkeds,
              }));
              onChange({ ...result, semanasDoMes: checkeds });
            }}
          /> */}
        </FancyAccordeon>
      </>
      <>
        <FancyAccordeon
          title="Dias da Semana"
          // subtitle={
          //   diasSemanaList.filter(item => item.checked).length === 0
          //     ? 'Nenhum'
          //     : diasSemanaList.filter(item => item.checked).length === 7
          //     ? 'Todos'
          //     : diasSemanaList
          //         .filter(item => item.checked)
          //         .map(item => DIAS_SEMANA[item.index].abreviado)
          //         .join(' | ')
          // }
          contentContainerStyle={{ paddingTop: 2 }}
        >
          {/* <FancyListSelection
            showDividers
            items={diasSemanaList}
            onPress={index => {
              const updatedList = diasSemanaList.map((item, i) => ({
                ...item,
                checked: i === index ? !item.checked : item.checked,
              }));
              const checkeds = updatedList.filter(item => item.checked).map(item => item.index);
              setDiasSemanaList(updatedList);
              setResult(prev => ({
                ...prev,
                diasSemana: checkeds,
              }));
              onChange({ ...result, diasSemana: checkeds });
            }}
          /> */}
        </FancyAccordeon>
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 15,
    paddingRight: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Pallete.border,
  },
});
