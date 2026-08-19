import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancyText from '../../../FancyText';
import { ControlledImagePicker } from '../../../forms/ControlledImagePicker';
import {
  MinisterioFotoSchema,
  MinisterioFotoFormData,
} from '../../../../domain/schemas/ministerioAdminSchema';
import { usePallete } from '../../../../hooks/usePallete';
import { sendImageToServer } from '../../../../utils/image_utils';

type Props = {
  visible: boolean;
  logoUrl?: string | null;
  logoThumbUrl?: string | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: { logoUrl: string; logoThumbUrl: string }) => Promise<void>;
};

export default function MinisterioFotoEditorSheet({
  visible,
  logoUrl,
  logoThumbUrl,
  isSaving = false,
  onClose,
  onSave,
}: Props) {
  const palette = usePallete();
  const { control, handleSubmit, setValue, reset, watch } = useForm<MinisterioFotoFormData>({
    resolver: zodResolver(MinisterioFotoSchema),
    defaultValues: { logoUrl: null, logoThumbUrl: null, logoUpload: null },
  });

  useEffect(() => {
    if (!visible) return;
    reset({
      logoUrl: logoUrl ?? null,
      logoThumbUrl: logoThumbUrl ?? null,
      logoUpload: null,
    });
  }, [visible, logoUrl, logoThumbUrl, reset]);

  const logoUpload = watch('logoUpload');
  const canSave = !!logoUpload?.uri;

  const submit = handleSubmit(async (data) => {
    if (!data.logoUpload?.uri) return;
    const { imageUrl, imageThumbUrl } = await sendImageToServer('ministerios', data.logoUpload);
    await onSave({ logoUrl: imageUrl, logoThumbUrl: imageThumbUrl });
  });

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Foto do ministério'
      closeDisabled={isSaving}
      footer={
        <View style={styles.footerRow}>
          <FancyButton
            label='Cancelar'
            type='text'
            onPress={onClose}
            disabled={isSaving}
            containerStyle={styles.footerButton}
          />
          <FancyButton
            label='Salvar'
            type='contained'
            loadingText='Salvando...'
            isLoading={isSaving}
            disabled={!canSave}
            onPress={() => void submit()}
            containerStyle={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.content}>
        <FancyText size='small' color={palette.fonts.inactive} style={styles.helperText}>
          Essa foto aparece no menu lateral e nas telas do ministério para todos os membros.
        </FancyText>
        <View style={styles.pickerWrap}>
          <ControlledImagePicker
            control={control}
            name='logoThumbUrl'
            uploadFieldName='logoUpload'
            setValue={setValue}
          />
        </View>
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingBottom: 8,
  },
  helperText: {
    textAlign: 'center',
  },
  pickerWrap: {
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  footerButton: {
    flex: 1,
  },
});
