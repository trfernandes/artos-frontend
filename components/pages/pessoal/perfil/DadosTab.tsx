import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../../contexts/AuthContext';
import FancyAvatarImage from '../../../images/FancyImage';
import FancyText from '../../../FancyText';
import { router } from 'expo-router';
import { AppImages } from '../../../../assets/app_images';
import { usePallete } from '../../../../hooks/usePallete';
import FancyButton from '../../../buttons/FancyButton';
import DefaultIcons, { CustomIconProps } from '../../../FancyIcons';
import { ThemePalette } from '../../../../constants/colors';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../utils/color_utils';
import * as WebBrowser from 'expo-web-browser';

const PRIVACY_POLICY_URL = 'https://diakonia.app.br/privacy-policy/';

type ProfileActionItemProps = {
  icon: CustomIconProps;
  label: string;
  description: string;
  onPress?: () => void;
  tone?: 'default' | 'danger';
};

function ProfileActionItem({
  icon,
  label,
  description,
  onPress,
  tone = 'default',
}: ProfileActionItemProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const color = tone === 'danger' ? palette.error : palette.fonts.dark;
  const iconColor = tone === 'danger' ? palette.error : palette.icons.dark;
  const accentColor = tone === 'danger' ? palette.error : palette.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityRole='button'
      accessibilityLabel={label}
      style={[
        styles.actionRow,
        {
          borderColor: ColorUtils.withAlpha(accentColor, tone === 'danger' ? 0.18 : 0.14),
          backgroundColor:
            tone === 'danger'
              ? ColorUtils.withAlpha(palette.error, 0.055)
              : palette.backgroundColor2,
        },
      ]}
    >
      <View style={styles.actionLeft}>
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: ColorUtils.withAlpha(accentColor, tone === 'danger' ? 0.12 : 0.1) },
          ]}
        >
          <DefaultIcons.Custom {...icon} color={iconColor} size={icon.size ?? 14} />
        </View>
        <View style={styles.actionTextBlock}>
          <FancyText
            size='medium'
            type='semiBold'
            color={color}
            numberOfLines={1}
            style={styles.actionLabel}
          >
            {label}
          </FancyText>
          <FancyText
            size='extraSmall'
            type='medium'
            color={palette.fonts.inactive}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.86}
            style={styles.actionDescription}
          >
            {description}
          </FancyText>
        </View>
      </View>
      <DefaultIcons.Custom
        library='FontAwesome6'
        name='chevron-right'
        size={11}
        color={
          tone === 'danger' ? ColorUtils.withAlpha(palette.error, 0.68) : palette.icons.inactive
        }
      />
    </TouchableOpacity>
  );
}

export default function DadosTab({
  onChangePasswordButtonPress,
  onDeleteAccountButtonPress,
}: {
  onChangePasswordButtonPress?: () => void;
  onDeleteAccountButtonPress?: () => void;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const handleOpenPrivacyPolicy = () => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
  const nome = user?.user?.nome || 'Usuário';
  const email = user?.user?.email || 'E-mail não informado';
  const handleEditProfile = () => router.push('/pessoal/perfil/edit');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <LinearGradient
            colors={palette.gradients.dashboard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCover}
          >
            <View style={styles.coverAccentLine} />
          </LinearGradient>

          <View style={styles.identityContent}>
            <View style={styles.avatarContainer}>
              <FancyAvatarImage
                source={
                  user?.user?.fotoThumbUrl || user?.user?.fotoUrl
                    ? { uri: user?.user?.fotoThumbUrl || user?.user?.fotoUrl || '' }
                    : AppImages.emptyProfile
                }
                size={72}
                style={styles.avatar}
              />
              <TouchableOpacity
                onPress={handleEditProfile}
                activeOpacity={0.72}
                accessibilityRole='button'
                accessibilityLabel='Editar foto e dados do perfil'
                style={styles.avatarEditButton}
              >
                <DefaultIcons.Custom
                  library='FontAwesome6'
                  name='pen'
                  size={10}
                  color={palette.fonts.light}
                />
              </TouchableOpacity>
            </View>

            <FancyText
              type='bold'
              size='largeMedium'
              color={palette.fonts.dark}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.86}
              style={styles.profileName}
            >
              {nome}
            </FancyText>
            <FancyText
              size='small'
              color={palette.fonts.inactive}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              style={styles.profileEmail}
            >
              {email}
            </FancyText>

            <FancyButton
              label='Editar perfil'
              icon={{ library: 'FontAwesome6', name: 'user-pen', size: 12 }}
              type='light'
              size={{ w: 142, h: 34 }}
              containerStyle={styles.editButton}
              labelStyle={styles.editButtonLabel}
              labelProps={{ size: 'small', numberOfLines: 1 }}
              accessibilityLabel='Editar perfil'
              onPress={handleEditProfile}
            />
          </View>
        </View>

        <View style={styles.section}>
          <FancyText
            size='small'
            type='bold'
            color={palette.fonts.inactive}
            style={styles.sectionTitle}
          >
            Segurança e conta
          </FancyText>
          <View style={styles.actionStack}>
            <ProfileActionItem
              icon={{ library: 'FontAwesome6', name: 'user-lock', size: 13 }}
              label='Alterar senha'
              description='Atualize sua senha de acesso'
              onPress={onChangePasswordButtonPress}
            />
            <ProfileActionItem
              icon={{ library: 'FontAwesome6', name: 'user-xmark', size: 13 }}
              label='Excluir conta'
              description='Remover permanentemente sua conta'
              onPress={onDeleteAccountButtonPress}
              tone='danger'
            />
          </View>
        </View>

        <View style={styles.section}>
          <FancyText
            size='small'
            type='bold'
            color={palette.fonts.inactive}
            style={styles.sectionTitle}
          >
            Legal
          </FancyText>
          <View style={styles.actionStack}>
            <ProfileActionItem
              icon={{ library: 'FontAwesome6', name: 'shield-halved', size: 13 }}
              label='Política de Privacidade'
              description='Como coletamos e usamos seus dados'
              onPress={handleOpenPrivacyPolicy}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      gap: 12,
    },
    profileCard: {
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor2,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    profileCover: {
      height: 66,
      width: '100%',
      overflow: 'hidden',
    },
    coverAccentLine: {
      position: 'absolute',
      left: -24,
      right: -24,
      bottom: -20,
      height: 42,
      borderRadius: 999,
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      transform: [{ rotate: '-5deg' }],
    },
    identityContent: {
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingTop: 0,
      paddingBottom: 14,
      gap: 5,
      marginTop: -36,
    },
    avatarContainer: {
      width: 82,
      height: 82,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 41,
      backgroundColor: palette.backgroundColor2,
    },
    avatar: {
      backgroundColor: palette.backgroundColor3,
      borderRadius: 999,
      borderWidth: 3,
      borderColor: palette.backgroundColor2,
    },
    avatarEditButton: {
      position: 'absolute',
      right: 4,
      bottom: 5,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primary,
      borderWidth: 2,
      borderColor: palette.backgroundColor2,
    },
    profileName: {
      maxWidth: '92%',
      textAlign: 'center',
    },
    profileEmail: {
      maxWidth: '92%',
      textAlign: 'center',
      marginTop: -1,
    },
    editButton: {
      marginTop: 6,
      alignSelf: 'center',
      borderWidth: 0,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
      minHeight: 34,
    },
    editButtonLabel: {
      color: palette.primary,
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      textTransform: 'uppercase',
      letterSpacing: 0,
      paddingHorizontal: 2,
    },
    actionStack: {
      gap: 8,
    },
    actionRow: {
      minHeight: 56,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
    },
    actionLeft: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    actionIconContainer: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionTextBlock: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    actionLabel: {
      flexShrink: 1,
    },
    actionDescription: {
      flexShrink: 1,
    },
  });
}
