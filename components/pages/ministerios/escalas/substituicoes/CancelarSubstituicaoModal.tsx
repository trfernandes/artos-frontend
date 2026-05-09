import { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyText from '../../../../FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyButton from '../../../../buttons/FancyButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (motivo?: string) => void;
  isLoading?: boolean;
};

export default function CancelarSubstituicaoModal({ visible, onClose, onConfirm, isLoading }: Props) {
  const palette = usePallete();
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    onConfirm(motivo.trim() || undefined);
    setMotivo('');
  };

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

  return (
    <FancyBottomSheetModal visible={visible} onClose={handleClose} title='Cancelar substituição'>
      <View style={styles.content}>
        <FancyText size='small' color={palette.fonts.inactive} style={styles.description}>
          O solicitante e o substituto serão notificados sobre o cancelamento.
        </FancyText>

        <FancyText type='semiBold' size='small' style={styles.label}>
          Motivo (opcional)
        </FancyText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: palette.backgroundColor2,
              borderColor: palette.borderCard,
              color: palette.fonts.dark,
            },
          ]}
          placeholder='Informe o motivo do cancelamento...'
          placeholderTextColor={palette.fonts.inactive}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
          value={motivo}
          onChangeText={setMotivo}
        />

        <View style={styles.buttons}>
          <FancyButton
            label='Voltar'
            type='outlined'
            onPress={handleClose}
            containerStyle={styles.btnFlex}
          />
          <FancyButton
            label='Confirmar cancelamento'
            type='contained'
            containerStyle={[styles.btnFlex, { backgroundColor: palette.error }]}
            onPress={handleConfirm}
            disabled={isLoading}
          />
        </View>
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
    gap: 12,
  },
  description: {
    lineHeight: 20,
  },
  label: {
    marginBottom: -4,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnFlex: {
    flex: 1,
  },
});
