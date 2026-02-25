import { useEffect } from 'react';
import { View } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledDateInput from '../../../forms/ControlledDateInput';
import { differenceInDays } from 'date-fns';
import { FancyAlert } from '../../../modal/FancyAlert';
import FancyText from '../../../FancyText';

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
    motivo: z.string().min(3, 'Informe pelo menos 3 caracteres').max(500, 'Máximo de 500 caracteres'),
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

  return (
    <FancyModalDialog
      {...modalProps}
      title='Adicionar Período de Indisponibilidade'
      closeOnBackdropPress={false}
      dismissKeyboardOnBackdropPress
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
