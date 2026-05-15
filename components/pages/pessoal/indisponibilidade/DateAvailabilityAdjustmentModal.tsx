import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyToggle from '../../../fields/FancyToggle';
import { ThemePalette } from '../../../../constants/colors';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';
import DateUtils from '../../../../utils/date_utils';

const schema = z.object({
  motivo: z
    .string()
    .max(500, 'O motivo deve ter no maximo 500 caracteres')
    .refine((value) => value.trim().length === 0 || value.trim().length >= 3, {
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
  conflictSummary?: string;
  onConfirm: (mode: 'mark' | 'unmark', date: Date, motivo?: string) => void;
};

export default function DateAvailabilityAdjustmentModal({
  data,
  modalProps,
  conflictSummary,
  onConfirm,
}: DateAvailabilityAdjustmentModalProps) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
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

  const submitToMarkUnavailable = handleSubmit((formData) => {
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
      title='Detalhes da data'
      closeOnBackdropPress={false}
      dismissKeyboardOnBackdropPress
      avoidKeyboard
      containerStyle={styles.modalContainer}
      centerContainerStyle={styles.centerContainer}
      buttonContainerStyle={styles.buttonContainer}
      onButton2Press={handleConfirmPress}
      button2={{ disabled: !canSubmit }}
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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

        <FancyTextInput label='Data' value={DateUtils.formatStableDateBR(data.date)} readonly disabled />

        {conflictSummary && (
          <View style={styles.conflictNotice}>
            <DefaultIcons.Custom library='MaterialCommunityIcons' name='calendar-alert' size={18} color={Pallete.warning} />
            <FancyText size='extraSmall' type='semiBold' color={Pallete.fonts.inactive} style={styles.conflictText}>
              {conflictSummary}
            </FancyText>
          </View>
        )}

        {shouldShowMotivoForm && (
          <ControlledTextArea
            control={control}
            name='motivo'
            label='Motivo'
            placeholder='Descreva o motivo'
          />
        )}
      </ScrollView>
    </FancyModalDialog>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    modalContainer: {
      maxHeight: '82%',
    },
    centerContainer: {
      maxHeight: 360,
    },
    buttonContainer: {
      marginTop: 4,
    },
    content: {
      gap: 12,
      paddingHorizontal: 5,
      paddingBottom: 8,
    },
    toggleContainer: {
      width: '100%',
    },
    conflictNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      padding: 10,
      borderRadius: 12,
      backgroundColor: `${palette.warning}14`,
    },
    conflictText: {
      flex: 1,
      lineHeight: 16,
    },
  });
}
