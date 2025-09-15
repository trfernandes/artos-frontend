import FancyAccordeon from '../../../FancyAccordeon';
import FancyListSelection from '../../../FancyListSelection';
import { Controller, useFormContext } from 'react-hook-form';
import { EventoFormData } from '../../../../hooks/useEventos';
import {
  RecorrenciaDiaSemanaEnum,
  RecorrenciaDiaSemanaEnumLabel,
} from '../../../../domain/models/Evento';
import { View } from 'react-native';
import FancyErrorText from '../../../forms/FancyErrorText';

export default function EventoRepeticaoInputCustomSemana() {
  const form = useFormContext<EventoFormData>();

  return (
    <Controller
      control={form.control}
      name="recorrenciaSemanaDias"
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const semanaDias = value || [];
        const semanaEnumKeys = Object.keys(RecorrenciaDiaSemanaEnum).filter(item =>
          isNaN(Number(item))
        );
        let subtitle = '';
        if (semanaDias.length === 0) {
          subtitle = 'Nenhum';
        } else if (semanaDias.length === semanaEnumKeys.length) {
          subtitle = 'Todos';
        } else {
          subtitle = value
            ?.sort((a, b) => a - b)
            .map(item => RecorrenciaDiaSemanaEnumLabel[item].abreviado)
            .join(', ')!;
        }
        return (
          <View style={{ gap: 5 }}>
            <FancyAccordeon title="Dias da Semana" subtitle={subtitle} isExpanded={true}>
              <FancyListSelection
                showDividers
                items={semanaEnumKeys.map((item, index) => ({
                  index: index,
                  label:
                    RecorrenciaDiaSemanaEnumLabel[
                      RecorrenciaDiaSemanaEnum[
                        item as keyof typeof RecorrenciaDiaSemanaEnum
                      ]
                    ].extenso,
                  checked: !!value?.includes(
                    RecorrenciaDiaSemanaEnum[
                      item as keyof typeof RecorrenciaDiaSemanaEnum
                    ]
                  ),
                }))}
                onPress={index => {
                  const item =
                    RecorrenciaDiaSemanaEnum[
                      semanaEnumKeys[index] as keyof typeof RecorrenciaDiaSemanaEnum
                    ];
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
  );
}
