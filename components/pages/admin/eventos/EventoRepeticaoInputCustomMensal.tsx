import { View, StyleSheet } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import FancyAccordeon from '../../../FancyAccordeon';
import { Controller, useFormContext } from 'react-hook-form';

import FancyListSelection from '../../../FancyListSelection';
import FancyErrorText from '../../../forms/FancyErrorText';
import { EventoRepeticaoSchemaData } from './EventoRepeticaoInputCustom';
import {
  RecorrenciaDiaSemanaEnum,
  RecorrenciaDiaSemanaEnumLabel,
  RecorrenciaDiaSemanaEnumOrder,
} from '../../../../domain/enums/Evento/recorrencia-dia-semana.enum';
import {
  RecorrenciaSemanaMesEnum,
  RecorrenciaSemanaMesEnumLabel,
  RecorrenciaSemanaMesEnumOrder,
} from '../../../../domain/enums/Evento/recorrencia-semana-mes.enum';
import { FancyMonthsSlider } from '../../../FancyMonthsSlider';
import FancyText from '../../../FancyText';

export default function EventoRepeticaoInputCustomMensal() {
  const form = useFormContext<EventoRepeticaoSchemaData>();

  return (
    <View style={{ gap: 10 }}>
      <Controller
        control={form.control}
        name='recorrenciaACadaMeses'
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <View style={{ gap: 5 }}>
            <View
              style={[
                styles.container,
                {
                  gap: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 15,
                },
              ]}
            >
              <FancyMonthsSlider
                title={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <FancyText type='semiBold' style={{ opacity: 0.7 }}>
                      A frequência será de:
                    </FancyText>
                    <FancyText numberOfLines={1} style={{ flex: 1 }} type='bold'>{`${value}${
                      value === 1 ? ' mês' : ' meses'
                    }`}</FancyText>
                  </View>
                }
                onChange={onChange}
                value={value}
              />
            </View>
            {error && <FancyErrorText message={error.message!} />}
          </View>
        )}
      />
      <>
        <Controller
          control={form.control}
          name='recorrenciaSemanasMes'
          render={({ field: { value, onChange }, fieldState: { error } }) => {
            const semanaMes = value || [];
            const mesEnumKeys = Object.keys(RecorrenciaSemanaMesEnum).filter((item) => isNaN(Number(item)));
            let subtitle = '';
            if (semanaMes.length === 0) {
              subtitle = 'Nenhum';
            } else if (semanaMes.length === mesEnumKeys.length) {
              subtitle = 'Todos';
            } else {
              subtitle = value
                ?.sort((a, b) => {
                  const aIndex = RecorrenciaSemanaMesEnumOrder.indexOf(a);
                  const bIndex = RecorrenciaSemanaMesEnumOrder.indexOf(b);
                  return aIndex - bIndex;
                })
                .map((item) => RecorrenciaSemanaMesEnumLabel[item].abreviado)
                .join(', ')!;
            }
            return (
              <View style={{ gap: 5 }}>
                <FancyAccordeon title='Semanas do Mês' subtitle={subtitle} contentContainerStyle={{ paddingTop: 2 }}>
                  <FancyListSelection
                    showDividers
                    items={mesEnumKeys.map((item, index) => ({
                      index: index,
                      label:
                        RecorrenciaSemanaMesEnumLabel[RecorrenciaSemanaMesEnum[item as keyof typeof RecorrenciaSemanaMesEnum]]
                          .extenso,
                      checked: !!value?.includes(RecorrenciaSemanaMesEnum[item as keyof typeof RecorrenciaSemanaMesEnum]),
                    }))}
                    onPress={(index) => {
                      const item = RecorrenciaSemanaMesEnum[mesEnumKeys[index] as keyof typeof RecorrenciaSemanaMesEnum];
                      if (value?.includes(item)) {
                        onChange(value.filter((i: any) => i !== item));
                      } else {
                        onChange([...(value || []), item]);
                      }
                    }}
                  />
                </FancyAccordeon>
                {error && <FancyErrorText message={error.message!} />}
              </View>
            );
          }}
        />
      </>
      <>
        <Controller
          control={form.control}
          name='recorrenciaSemanaDias'
          render={({ field: { value, onChange }, fieldState: { error } }) => {
            const semanaDias = value || [];
            const semanaEnumKeys = Object.keys(RecorrenciaDiaSemanaEnum).filter((item) => isNaN(Number(item)));
            let subtitle = '';
            if (semanaDias.length === 0) {
              subtitle = 'Nenhum';
            } else if (semanaDias.length === semanaEnumKeys.length) {
              subtitle = 'Todos';
            } else {
              subtitle = value
                ?.sort((a, b) => {
                  const aIndex = RecorrenciaDiaSemanaEnumOrder.indexOf(a);
                  const bIndex = RecorrenciaDiaSemanaEnumOrder.indexOf(b);
                  return aIndex - bIndex;
                })
                .map((item) => RecorrenciaDiaSemanaEnumLabel[item].abreviado)
                .join(', ')!;
            }
            return (
              <View style={{ gap: 5 }}>
                <FancyAccordeon title='Dias da Semana' subtitle={subtitle} isExpanded={true}>
                  <FancyListSelection
                    showDividers
                    items={semanaEnumKeys.map((item, index) => ({
                      index: index,
                      label:
                        RecorrenciaDiaSemanaEnumLabel[RecorrenciaDiaSemanaEnum[item as keyof typeof RecorrenciaDiaSemanaEnum]]
                          .extenso,
                      checked: !!value?.includes(RecorrenciaDiaSemanaEnum[item as keyof typeof RecorrenciaDiaSemanaEnum]),
                    }))}
                    onPress={(index) => {
                      const item = RecorrenciaDiaSemanaEnum[semanaEnumKeys[index] as keyof typeof RecorrenciaDiaSemanaEnum];
                      if (value?.includes(item)) {
                        onChange(value.filter((i: any) => i !== item));
                      } else {
                        onChange([...(value || []), item]);
                      }
                    }}
                  />
                </FancyAccordeon>
                {error && <FancyErrorText message={error.message!} />}
              </View>
            );
          }}
        />
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
