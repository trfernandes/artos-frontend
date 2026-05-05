import { View, StyleSheet, Modal } from 'react-native';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import DefaultIcons from '../../../FancyIcons';
import { Pallete } from '../../../../constants/colors';
import { ResponseIgrejaConviteDto } from '../../../../domain/dtos/Igreja/response-igreja-convite.dto';

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
  if (!convite) return null;

  return (
    <Modal
      visible={!!convite}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ícone de sucesso */}
          <View style={styles.successIconContainer}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='check-circle'
              size={56}
              color={Pallete.confirm}
            />
          </View>

          {/* Título */}
          <FancyText type='bold' size='extraLarge' style={styles.title}>
            Convite Criado!
          </FancyText>

          <FancyText size='small' color={Pallete.fonts.inactive} style={styles.subtitle}>
            Compartilhe o código ou link com quem deseja convidar
          </FancyText>

          {/* Token Box */}
          <View style={styles.conviteBox}>
            <FancyText size='small' type='bold' color={Pallete.fonts.inactive}>
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
                color: Pallete.primary,
              }}
              onPress={onCopiarToken}
              containerStyle={styles.copyActionButton}
            />
          </View>

          {/* Link Box */}
          <View style={styles.conviteBox}>
            <FancyText size='small' type='bold' color={Pallete.fonts.inactive}>
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
                color: Pallete.primary,
              }}
              onPress={onCopiarLink}
              containerStyle={styles.copyActionButton}
            />
          </View>

          {/* Chip de tipo de entrada */}
          <View style={styles.entryTypeContainer}>
            <View style={styles.entryTypeIcon}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name={convite.autoApprove ? 'flash-on' : 'hourglass-empty'}
                size={16}
                color={convite.autoApprove ? Pallete.confirm : Pallete.warning}
              />
            </View>
            <FancyText
              size='small'
              type='semiBold'
              color={convite.autoApprove ? Pallete.confirm : Pallete.warning}
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
                color: Pallete.fonts.light,
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
                color: Pallete.primary,
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Pallete.backgroundColor,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 12,
    ...Pallete.shadows[300],
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
    backgroundColor: `${Pallete.primary}08`,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  copyActionButton: {
    paddingHorizontal: 8,
  },
  entryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingVertical: 4,
    width: '100%',
  },
  entryTypeIcon: {
    marginTop: 2,
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
