import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledDateInput from '../../../forms/ControlledDateInput';
import { differenceInDays } from 'date-fns';
import { FancyAlert } from '../../../modal/FancyAlert';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import { usePallete } from '../../../../hooks/usePallete';

const schema = z
  .object({
    dataInicio: z
      .date()
      .nullable()
      .refine((d) => !!d, { message: 'Data inicial obrigatória' }),
    dataTermino: z
      .date()
      .nullable()
      .refine((d) => !!d, { message: 'Data final obrigatória' }),
    motivo: z
      .string()
      .min(3, 'Informe pelo menos 3 caracteres')
      .max(500, 'Máximo de 500 caracteres'),
  })
  .refine((data) => data.dataInicio && data.dataTermino && data.dataTermino >= data.dataInicio, {
    path: ['dataTermino'],
    message: 'Data final deve ser maior ou igual à inicial',
  });

export type AddPeriodoModalProps = {
  visible: boolean;
  modalProps?: FancyModalDialogProps<any>;
  onConfirm: (inicio: Date, fim: Date, motivo: string) => void;
};

export default function AddPeriodoModal({ visible, modalProps, onConfirm }: AddPeriodoModalProps) {
  const palette = usePallete();
  const { control, handleSubmit, setValue, trigger } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      dataInicio: new Date(),
      dataTermino: new Date(),
      motivo: '',
    },
  });

  const dataInicio = useWatch({ control, name: 'dataInicio' });
  const dataTermino = useWatch({ control, name: 'dataTermino' });
  useEffect(() => {
    if (dataInicio && dataTermino && dataInicio > dataTermino) {
      setValue('dataTermino', dataInicio, { shouldValidate: true });
    }
  }, [dataInicio, dataTermino, setValue]);

  const submit = (values: z.infer<typeof schema>) => {
    onConfirm(values.dataInicio as Date, values.dataTermino as Date, values.motivo);
  };

  const currentDate = new Date();
  const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 4, 0);

  const applyShortcut = (type: 'weekend' | 'sevenDays' | 'restOfMonth') => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);

    if (type === 'weekend') {
      const daysUntilSaturday = (6 - start.getDay() + 7) % 7;
      start.setDate(start.getDate() + daysUntilSaturday);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 1);
    }

    if (type === 'sevenDays') {
      end.setDate(start.getDate() + 6);
    }

    if (type === 'restOfMonth') {
      end.setFullYear(start.getFullYear(), start.getMonth() + 1, 0);
    }

    setValue('dataInicio', start, { shouldValidate: true, shouldDirty: true });
    setValue('dataTermino', end, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <FancyModalDialog
      {...modalProps}
      title='Adicionar Período de Indisponibilidade'
      closeOnBackdropPress={false}
      dismissKeyboardOnBackdropPress
      dismissKeyboardOnContentBlankPress
      button1={{ label: 'Cancelar' }}
      button2={{
        label: 'Salvar',
        onPress: async () => {
          if (differenceInDays(dataTermino || new Date(), dataInicio || new Date()) > 31) {
            FancyAlert.alert('Erro', 'O período não pode ser maior que 31 dias.');
            return;
          }

          const valid = await trigger();

          if (!valid) return;

          FancyAlert.alert(
            'Confirmação',
            <View style={{ paddingBottom: 20, gap: 15 }}>
              <FancyText type='medium' size='medium'>
                Deseja realmente adicionar este período de indisponibilidade?
              </FancyText>
              <FancyText type='bold' size='small'>
                Atenção! Se houver alguma data já indisponível ela será sobreescrevida!
              </FancyText>
            </View>,
            [
              {
                text: 'Não',
                style: 'destructive',
              },
              {
                text: 'Sim, estou ciente',

                onPress: () => handleSubmit(submit)(),
              },
            ],
          );
        },
      }}
    >
      <View style={{ gap: 16 }}>
        <View style={styles.shortcuts}>
          <FancyText size='extraSmall' type='bold' color={palette.fonts.inactive}>
            Atalhos rápidos
          </FancyText>
          <View style={styles.shortcutRow}>
            <FancyButton
              label='Fim de semana'
              type='light'
              size={{ w: 0, h: 34 }}
              onPress={() => applyShortcut('weekend')}
              containerStyle={styles.shortcutButton}
              labelProps={{ size: 'extraSmall' }}
              icon={{ library: 'MaterialCommunityIcons', name: 'calendar-weekend', size: 15 }}
            />
            <FancyButton
              label='7 dias'
              type='light'
              size={{ w: 0, h: 34 }}
              onPress={() => applyShortcut('sevenDays')}
              containerStyle={styles.shortcutButton}
              labelProps={{ size: 'extraSmall' }}
              icon={{ library: 'MaterialCommunityIcons', name: 'calendar-range', size: 15 }}
            />
            <FancyButton
              label='Mês'
              type='light'
              size={{ w: 0, h: 34 }}
              onPress={() => applyShortcut('restOfMonth')}
              containerStyle={styles.shortcutButton}
              labelProps={{ size: 'extraSmall' }}
              icon={{ library: 'MaterialCommunityIcons', name: 'calendar-end', size: 15 }}
            />
          </View>
        </View>
        <ControlledDateInput
          control={control}
          name='dataInicio'
          label='Data Início'
          calendarProps={{
            dayViewProps: {
              disablePastDates: true,
              maximumDate: maxDate,
            },
          }}
        />
        <ControlledDateInput
          control={control}
          name='dataTermino'
          label='Data Fim'
          calendarProps={{
            dayViewProps: {
              disablePastDates: true,
              maximumDate: maxDate,
            },
          }}
        />
        <ControlledTextArea control={control} name='motivo' label='Motivo' />
      </View>
    </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  shortcuts: {
    gap: 8,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shortcutButton: {
    flex: 1,
    paddingHorizontal: 6,
  },
});
