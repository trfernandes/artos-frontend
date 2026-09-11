import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import FancyText from './FancyText';
import FancyButton from './buttons/FancyButton';
import { usePallete } from '../hooks/usePallete';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { ThemePalette } from '../constants/colors';

interface FeedbackSheetProps {
  visible: boolean;
  nota: 'RUIM' | 'BOM' | 'EXCELENTE' | null;
  onSubmit: (nota: 'RUIM' | 'BOM' | 'EXCELENTE', texto?: string) => Promise<void>;
  onDismiss: () => void;
}

export default function FeedbackSheet({ visible, nota, onSubmit, onDismiss }: FeedbackSheetProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const [texto, setTexto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (nota) {
        await onSubmit(nota, texto);
      }
      setTexto('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  const isExcelente = nota === 'EXCELENTE';
  const title = isExcelente
    ? 'Obrigado!'
    : nota === 'RUIM'
      ? 'O que não está funcionando?'
      : 'Alguma sugestão?';
  const subtitle = isExcelente
    ? 'Fico feliz que você esteja curtindo o Diakonia'
    : 'Seu feedback nos ajuda a melhorar';

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onDismiss}>
      <View style={[styles.backdrop, { backgroundColor: palette.overlays.backdrop }]}>
        <View style={[styles.container, { backgroundColor: palette.backgroundColor }]}>
          <FancyText type='bold' size='largeMedium' color={palette.fonts.dark} style={styles.title}>
            {title}
          </FancyText>
          <FancyText
            type='medium'
            size='small'
            color={palette.fonts.inactive}
            style={styles.subtitle}
          >
            {subtitle}
          </FancyText>

          {!isExcelente && (
            <>
              <View
                style={[
                  styles.inputContainer,
                  { borderColor: palette.border, backgroundColor: palette.backgroundColor2 },
                ]}
              >
                <FancyText
                  type='normal'
                  size='small'
                  color={texto ? palette.fonts.dark : palette.fonts.inactive}
                  style={styles.input}
                  onPress={() => {
                    /* Placeholder for text input */
                  }}
                >
                  {texto || 'Conte mais detalhes... (opcional)'}
                </FancyText>
              </View>
            </>
          )}

          <View style={styles.buttonContainer}>
            {!isExcelente && (
              <FancyButton
                label='Cancelar'
                type='outlined'
                onPress={onDismiss}
                disabled={isSubmitting}
              />
            )}
            <FancyButton
              label={isExcelente ? 'Fechar' : 'Enviar'}
              type='contained'
              onPress={isExcelente ? onDismiss : handleSubmit}
              isLoading={isSubmitting}
              disableOnLoading={true}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      marginHorizontal: 16,
      paddingHorizontal: 20,
      paddingVertical: 24,
      borderRadius: 12,
      gap: 12,
      ...palette.shadows[200],
    },
    title: {
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 8,
    },
    inputContainer: {
      borderRadius: 8,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    input: {
      minHeight: 100,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'center',
      marginTop: 12,
    },
  });
}
