import { View, StyleSheet } from 'react-native';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import DefaultIcons from '../../../FancyIcons';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyListItemCard from '../../../cards/FancyListItemCard';
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
    <FancyBottomSheetModal
      visible={!!convite}
      onClose={onClose}
      footer={
        <View style={styles.footer}>
          <FancyButton
            label='Compartilhar'
            icon={{ library: 'MaterialIcons', name: 'share', size: 18 }}
            onPress={onCompartilhar}
          />
          <FancyButton
            label='Fechar'
            type='text'
            icon={{ library: 'MaterialIcons', name: 'close', size: 18, color: palette.primary }}
            onPress={onClose}
          />
        </View>
      }
    >
      {/* Header de sucesso */}
      <View style={styles.header}>
        <DefaultIcons.Custom
          library='MaterialIcons'
          name='check-circle'
          size={48}
          color={palette.confirm}
        />
        <FancyText type='bold' size='extraLarge' style={styles.title}>
          Convite Criado!
        </FancyText>
        <FancyText size='small' color={palette.fonts.inactive} style={styles.subtitle}>
          Compartilhe o código ou link com quem deseja convidar
        </FancyText>
        <View style={styles.entryChip}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name={convite.autoApprove ? 'flash-on' : 'hourglass-empty'}
            size={14}
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
      </View>

      <View style={styles.cardsStack}>
        <FancyListItemCard
          leading={{ type: 'icon', icon: { library: 'MaterialCommunityIcons', name: 'qrcode' } }}
          title={convite.token}
          titleProps={{ numberOfLines: 1 }}
          subtitle='Código do convite'
          onPress={onCopiarToken}
          accessibilityLabel='Copiar código do convite'
          trailing={<CopyTrailing palette={palette} />}
        />

        <FancyListItemCard
          leading={{ type: 'icon', icon: { library: 'MaterialCommunityIcons', name: 'link-variant' } }}
          title={convite.inviteLink}
          titleProps={{ numberOfLines: 1 }}
          subtitle='Link de convite'
          onPress={onCopiarLink}
          accessibilityLabel='Copiar link de convite'
          trailing={<CopyTrailing palette={palette} />}
        />
      </View>
    </FancyBottomSheetModal>
  );
}

function CopyTrailing({ palette }: { palette: ThemePalette }) {
  return (
    <View style={staticStyles.copyTrailing}>
      <DefaultIcons.Custom
        library='MaterialIcons'
        name='content-copy'
        size={15}
        color={palette.primary}
      />
      <FancyText size='extraSmall' type='semiBold' color={palette.primary}>
        Copiar
      </FancyText>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      gap: 6,
      paddingBottom: 4,
    },
    title: {
      textAlign: 'center',
      marginTop: 4,
    },
    subtitle: {
      textAlign: 'center',
    },
    entryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
    },
    cardsStack: {
      gap: 8,
      marginTop: -10,
      marginBottom: 14,
    },
    footer: {
      gap: 8,
    },
  });
}

const staticStyles = StyleSheet.create({
  copyTrailing: {
    alignItems: 'center',
    gap: 2,
  },
});
