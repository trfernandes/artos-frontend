import { View, StyleSheet, Modal } from 'react-native';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import DefaultIcons from '../../../FancyIcons';
import { ResponseIgrejaConviteDto } from '../../../../domain/dtos/Igreja/response-igreja-convite.dto';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';

type ConviteGeradoModalProps = {
  convite: ResponseIgrejaConviteDto | null;
  onClose: () => void;
  onCompartilhar: () => void;
  onCopiarToken: () => void;
  onCopiarLink: () => void;
};

export default function ConviteGeradoModal({
  convite,
  onClose,
  onCompartilhar,
  onCopiarToken,
  onCopiarLink,
}: ConviteGeradoModalProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  if (!convite) return null;

  return (
    <Modal visible={!!convite} transparent animationType='fade' onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ícone de sucesso */}
          <View style={styles.successIconContainer}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='check-circle'
              size={56}
              color={palette.confirm}
            />
          </View>

          {/* Título */}
          <FancyText type='bold' size='extraLarge' style={styles.title}>
            Convite Criado!
          </FancyText>

          <FancyText size='small' color={palette.fonts.inactive} style={styles.subtitle}>
            Compartilhe o código ou link com quem deseja convidar
          </FancyText>

          {/* Token Box */}
          <View style={styles.conviteBox}>
            <FancyText size='small' type='bold' color={palette.fonts.inactive}>
              Código do convite
            </FancyText>
            <FancyButton
              label='Copiar'
              type='text'
              size={32}
              icon={{
                library: 'MaterialIcons',
                name: 'content-copy',
                size: 14,
                color: palette.primary,
              }}
              onPress={onCopiarToken}
              containerStyle={styles.copyActionButton}
            />
          </View>

          {/* Link Box */}
          <View style={styles.conviteBox}>
            <FancyText size='small' type='bold' color={palette.fonts.inactive}>
              Link de convite
            </FancyText>
            <FancyButton
              label='Copiar'
              type='text'
              size={32}
              icon={{
                library: 'MaterialIcons',
                name: 'content-copy',
                size: 14,
                color: palette.primary,
              }}
              onPress={onCopiarLink}
              containerStyle={styles.copyActionButton}
            />
          </View>

          {/* Chip de tipo de entrada */}
          <View style={styles.entryTypeContainer}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name={convite.autoApprove ? 'flash-on' : 'hourglass-empty'}
              size={16}
              color={convite.autoApprove ? palette.confirm : palette.warning}
            />
            <FancyText
              size='small'
              type='semiBold'
              color={convite.autoApprove ? palette.confirm : palette.warning}
            >
              {convite.autoApprove ? 'Entrada Imediata' : 'Requer Aprovação'}
            </FancyText>
          </View>

          {/* Botões de ação */}
          <View style={styles.actions}>
            <FancyButton
              label='Compartilhar'
              icon={{
                library: 'MaterialIcons',
                name: 'share',
                size: 18,
                color: palette.fonts.light,
              }}
              onPress={onCompartilhar}
              containerStyle={styles.shareButton}
            />

            <FancyButton
              label='Fechar'
              type='text'
              icon={{
                library: 'MaterialIcons',
                name: 'close',
                size: 18,
                color: palette.primary,
              }}
              onPress={onClose}
              containerStyle={styles.closeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: palette.backgroundColor,
      borderRadius: 24,
      padding: 28,
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
      gap: 12,
      ...palette.shadows[300],
    },
    successIconContainer: {
      marginBottom: 4,
    },
    title: {
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 8,
    },
    conviteBox: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: `${palette.primary}12`,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    copyActionButton: {
      paddingHorizontal: 8,
    },
    entryTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 4,
      width: '100%',
    },
    actions: {
      width: '100%',
      gap: 8,
      marginTop: 12,
    },
    shareButton: {
      width: '100%',
    },
    closeButton: {
      width: '100%',
    },
  });
}
