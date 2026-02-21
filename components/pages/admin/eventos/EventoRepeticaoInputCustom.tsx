import { View, StyleSheet, ModalProps } from 'react-native';
import { Pallete } from '../../../../constants/colors';
import FancyScrollView from '../../../FancyScrollView';
import FancySettingItem from '../../../FancySettingItem';
import EventoRepeticaoInputCustomSemana from './EventoRepeticaoInputCustomSemana';
import FancyFullModal from '../../../modal/FancyFullModal';
import FancyButton from '../../../buttons/FancyButton';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import EventoRepeticaoInputCustomMensal from './EventoRepeticaoInputCustomMensal';
import { strfyObj } from '../../../../utils/text_utils';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecorrenciaDiaSemanaEnum } from '../../../../domain/enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../../../../domain/enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum, RecorrenciaEnumLabel } from '../../../../domain/enums/Evento/recorrencia.enum';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';

export const schema = z
  .object({
    recorrencia: z.enum(RecorrenciaEnum),
    recorrenciaSemanaDias: z.array(z.enum(RecorrenciaDiaSemanaEnum)).optional(),
    recorrenciaACadaMeses: z.coerce
      .number()
      .int('Informe um número inteiro')
      .min(1, 'O número de meses deve ser maior que 1')
      .max(12, 'O número de meses deve ser menor igual a 12'),
    recorrenciaSemanasMes: z.array(z.enum(RecorrenciaSemanaMesEnum)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.recorrencia === RecorrenciaEnum.Mensal) {
      if (!data.recorrenciaSemanaDias || data.recorrenciaSemanaDias.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaSemanaDias'],
          message: 'Selecione ao menos um dia da semana',
        });
      }
      if (!data.recorrenciaACadaMeses) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaACadaMeses'],
          message: 'Informe o número de meses',
        });
      }
      if (!data.recorrenciaSemanasMes || data.recorrenciaSemanasMes.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaSemanasMes'],
          message: 'Selecione ao menos uma semana do mês',
        });
      }
    } else if (data.recorrencia === RecorrenciaEnum.Semanal) {
      if (!data.recorrenciaSemanaDias || data.recorrenciaSemanaDias.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaSemanaDias'],
          message: 'Selecione ao menos um dia da semana',
        });
      }
    }
  });

export type EventoRepeticaoSchemaData = z.infer<typeof schema>;

export default function EventoRepeticaoInputCustom({ modalProps }: { modalProps?: ModalProps }) {
  const eventoForm = useFormContext<EventoFormData>();
  const recorrenciaForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      recorrencia: eventoForm.getValues('recorrencia') || RecorrenciaEnum.Semanal,
      recorrenciaACadaMeses: eventoForm.getValues('recorrenciaACadaMeses') || 1,
      recorrenciaSemanaDias: eventoForm.getValues('recorrenciaSemanaDias') || [],
      recorrenciaSemanasMes: eventoForm.getValues('recorrenciaSemanasMes') || [],
    },
  });

  const recorrencia = recorrenciaForm.watch('recorrencia');

  return (
    <FancyFullModal modalProps={modalProps} title='Parametrização de Recorrência'>
      <FancyScrollView fill style={{ flex: 1, borderWidth: 0, borderColor: 'coral' }}>
        <View style={styles.body}>
          <Controller
            control={recorrenciaForm.control}
            name='recorrencia'
            render={({ field: { value, onChange } }) => (
              <FancySettingItem
                label='Frequência'
                value={RecorrenciaEnumLabel[value]}
                options={[
                  {
                    label: RecorrenciaEnumLabel[RecorrenciaEnum.Semanal],
                    onPress: () => {
                      recorrenciaForm.setValue('recorrencia', RecorrenciaEnum.Semanal);
                      recorrenciaForm.resetField('recorrenciaACadaMeses', { defaultValue: '' });
                      recorrenciaForm.resetField('recorrenciaSemanaDias', { defaultValue: [] });
                      recorrenciaForm.resetField('recorrenciaSemanasMes', { defaultValue: [] });
                      onChange(RecorrenciaEnum.Semanal);
                    },
                  },
                  {
                    label: RecorrenciaEnumLabel[RecorrenciaEnum.Mensal],
                    onPress: () => {
                      recorrenciaForm.setValue('recorrencia', RecorrenciaEnum.Mensal);
                      recorrenciaForm.resetField('recorrenciaACadaMeses', { defaultValue: '1' });
                      recorrenciaForm.resetField('recorrenciaSemanaDias', { defaultValue: [] });
                      recorrenciaForm.resetField('recorrenciaSemanasMes', { defaultValue: [] });
                      onChange(RecorrenciaEnum.Mensal);
                    },
                  },
                ]}
              />
            )}
          />

          <FormProvider {...recorrenciaForm}>
            {/* SEMANAL */}
            {recorrencia === RecorrenciaEnum.Semanal && <EventoRepeticaoInputCustomSemana />}

            {/* MENSALMENTE */}
            {recorrencia === RecorrenciaEnum.Mensal && <EventoRepeticaoInputCustomMensal />}
          </FormProvider>
        </View>
      </FancyScrollView>
      <FancyButton
        label='Confirmar'
        icon={{ library: 'Feather', name: 'check', size: 16 }}
        containerStyle={styles.confirmarButton}
        onPress={async (e) => {
          await recorrenciaForm.handleSubmit(
            () => {
              eventoForm.reset({
                ...eventoForm.getValues(),
                ...(recorrenciaForm.getValues() as EventoRepeticaoSchemaData),
              });
              modalProps?.onRequestClose?.(e);
            },
            (errors) => console.log(strfyObj(errors)),
          )();
        }}
      />
    </FancyFullModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 15,
    paddingRight: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: Pallete.disabled,
  },
  body: {
    backgroundColor: 'transparent',
    flex: 1,
    paddingHorizontal: 15,
    gap: 10,
    width: '100%',
  },
  confirmarButton: { marginHorizontal: 20 },
});
