import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyToggle from '../../../fields/FancyToggle';
import { Pallete } from '../../../../constants/colors';

const schema = z.object({
  motivo: z
    .string()
    .max(500, 'O motivo deve ter no maximo 500 caracteres')
    .refine(value => value.trim().length === 0 || value.trim().length >= 3, {
      message: 'O motivo deve ter ao menos 3 caracteres',
    }),
});

type DateAvailabilityForm = z.infer<typeof schema>;

export type DateAvailabilityAdjustmentModalProps = {
  data: {
    id?: string;
    date: Date;
    status: 'available' | 'unavailable';
    motivo?: string | null;
  };
  modalProps?: FancyModalDialogProps<any>;
  onConfirm: (mode: 'mark' | 'unmark', date: Date, motivo?: string) => void;
};

export default function DateAvailabilityAdjustmentModal({
  data,
  modalProps,
  onConfirm,
}: DateAvailabilityAdjustmentModalProps) {
  // console.log('DateAvailabilityAdjustmentModal render for date:', data.date);

  const [selectedStatus, setSelectedStatus] = useState<'available' | 'unavailable'>(data.status);

  const { control, handleSubmit, reset, watch } = useForm<DateAvailabilityForm>({
    resolver: zodResolver(schema),
    defaultValues: { motivo: data.motivo ?? '' },
  });

  useEffect(() => {
    reset({ motivo: data.motivo ?? '' });
    setSelectedStatus(data.status);
  }, [data.date.getTime(), data.motivo, data.status, reset]);

  const motivoValue = watch('motivo');
  const trimmedCurrentMotivo = (motivoValue ?? '').trim();
  const trimmedOriginalMotivo = (data.motivo ?? '').trim();

  const hasSelectionChanged = selectedStatus !== data.status;
  const hasMotivoChanged = trimmedCurrentMotivo !== trimmedOriginalMotivo;
  const canSubmit = hasSelectionChanged || (selectedStatus === 'unavailable' && hasMotivoChanged);
  const shouldShowMotivoForm = selectedStatus === 'unavailable';

  const submitToMarkUnavailable = handleSubmit(formData => {
    const trimmedMotivo = formData.motivo.trim();
    onConfirm('mark', data.date, trimmedMotivo.length > 0 ? trimmedMotivo : undefined);
  });

  const handleConfirmPress = () => {
    if (!canSubmit) {
      return;
    }

    if (selectedStatus === 'unavailable') {
      submitToMarkUnavailable();
      return;
    }

    onConfirm('unmark', data.date);
  };

  const handleModalClose = () => {
    reset({ motivo: data.motivo ?? '' });
    setSelectedStatus(data.status);
    modalProps?.onButton1Press?.();
  };

  return (
    <FancyModalDialog
      {...modalProps}
      onButton1Press={handleModalClose}
      showCloseButton={false}
      title="Detalhes da data"
      OnButton2Press={handleConfirmPress}
      button2={{ disabled: !canSubmit }}
    >
      <View style={styles.content}>
        <View style={styles.toggleContainer}>
          <FancyToggle<'available' | 'unavailable'>
            option1={{
              title: 'Disponível',
              value: 'available',
              activeContainerStyle: { backgroundColor: Pallete.primary },
              activeLabelProps: { color: Pallete.fonts.light },
            }}
            option2={{
              title: 'Indisponível',
              value: 'unavailable',
              activeContainerStyle: { backgroundColor: Pallete.error },
              activeLabelProps: { color: Pallete.fonts.light },
            }}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </View>

        <FancyTextInput label="Data" value={data.date.toLocaleDateString()} readonly disabled />

        {shouldShowMotivoForm && (
          <ControlledTextArea control={control} name="motivo" label="Motivo" placeholder="Descreva o motivo" />
        )}
      </View>
    </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingHorizontal: 5,
  },
  toggleContainer: {
    width: '100%',
  },
});
