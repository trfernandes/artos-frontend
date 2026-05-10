import { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyText from '../../FancyText';
import FancyButton from '../../buttons/FancyButton';
import { usePallete } from '../../../hooks/usePallete';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  buttonLabel?: string;
  placeholderText?: string;
  errorMessage?: string;
};

export default function RecusarSubstituicaoModal({
  visible,
  onClose,
  onConfirm,
  isLoading,
  title = 'Recusar substituição',
  description = 'Informe o motivo da recusa. As pessoas envolvidas serão notificadas.',
  buttonLabel = 'Confirmar recusa',
  placeholderText = 'Explique o motivo da recusa...',
  errorMessage = 'Informe um motivo para a recusa.',
}: Props) {
  const palette = usePallete();
  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);

  const trimmed = motivo.trim();
  const hasError = touched && trimmed.length === 0;

  const handleConfirm = () => {
    if (trimmed.length === 0) {
      setTouched(true);
      return;
    }
    onConfirm(trimmed);
    setMotivo('');
    setTouched(false);
  };

  const handleClose = () => {
    setMotivo('');
    setTouched(false);
    onClose();
  };

  return (
    <FancyBottomSheetModal visible={visible} onClose={handleClose} title={title}>
      <View style={styles.content}>
        <FancyText size='small' color={palette.fonts.inactive} style={styles.description}>
          {description}
        </FancyText>

        <FancyText type='semiBold' size='small' style={styles.label}>
          Motivo
        </FancyText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: palette.backgroundColor2,
              borderColor: hasError ? palette.error : palette.borderCard,
              color: palette.fonts.dark,
            },
          ]}
          placeholder={placeholderText}
          placeholderTextColor={palette.fonts.inactive}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
          value={motivo}
          onChangeText={(t) => {
            setMotivo(t);
            if (touched) setTouched(false);
          }}
        />
        {hasError ? (
          <FancyText size='extraSmall' color={palette.error}>
            {errorMessage}
          </FancyText>
        ) : null}

        <View style={styles.buttons}>
          <FancyButton
            label='Voltar'
            type='outlined'
            onPress={handleClose}
            containerStyle={styles.btnFlex}
          />
          <FancyButton
            label={buttonLabel}
            type='contained'
            containerStyle={[styles.btnFlex, { backgroundColor: palette.error }]}
            onPress={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
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
