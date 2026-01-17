import FancyAccordeon from '../../../FancyAccordeon';
import FancyListSelection from '../../../FancyListSelection';
import { Controller, useFormContext } from 'react-hook-form';

import { View } from 'react-native';
import FancyErrorText from '../../../forms/FancyErrorText';
import { EventoRepeticaoSchemaData } from './EventoRepeticaoInputCustom';
import {
  RecorrenciaDiaSemanaEnum,
  RecorrenciaDiaSemanaEnumLabel,
  RecorrenciaDiaSemanaEnumOrder,
} from '../../../../domain/enums/Evento/recorrencia-dia-semana.enum';

export default function EventoRepeticaoInputCustomSemana() {
  const repeticaoForm = useFormContext<EventoRepeticaoSchemaData>();

  return (
    <>
      <Controller
        control={repeticaoForm.control}
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
              .map((item) => {
                return RecorrenciaDiaSemanaEnumLabel[item]?.abreviado;
              })
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
                    checked: !!value
                      ?.map((item) => item)
                      .includes(RecorrenciaDiaSemanaEnum[item as keyof typeof RecorrenciaDiaSemanaEnum]),
                  }))}
                  onPress={(index) => {
                    const item: RecorrenciaDiaSemanaEnum =
                      RecorrenciaDiaSemanaEnum[semanaEnumKeys[index] as keyof typeof RecorrenciaDiaSemanaEnum];
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
  );
}
