import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, StyleProp, ImageStyle, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import FancyText from '../FancyText';
import FancyAvatarImage from '../images/FancyImage';
import FancyDrawerIgrejaSelector from './FancyDrawerIgrejaSelector';
import { ThemePalette } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { AppImages } from '../../assets/app_images';
import { useTopSafeInset } from '../../hooks/useTopSafeInset';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import DefaultIcons from '../FancyIcons';

export default function FancyDrawerHeader() {
  const auth = useAuth();
  const topInset = useTopSafeInset();
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  const nomeCompleto = auth.user?.user?.nome ?? '';
  const handleOpenProfile = () => router.push('pessoal/perfil');

  return (
    <LinearGradient
      colors={palette.gradients.drawerHeader}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.container, { paddingTop: topInset + 12 }]}
    >
      <View style={styles.identityStrip}>
        <TouchableOpacity
          onPress={handleOpenProfile}
          activeOpacity={0.82}
          accessibilityRole='button'
          accessibilityLabel={`Perfil de ${nomeCompleto || 'usuário'}`}
          accessibilityHint='Toque para abrir seu perfil'
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <FancyAvatarImage
            size={44}
            source={
              auth.user?.user?.fotoThumbUrl || auth.user?.user?.fotoUrl
                ? { uri: auth.user?.user?.fotoThumbUrl || auth.user?.user?.fotoUrl || '' }
                : AppImages.emptyProfile
            }
            style={styles.avatar as StyleProp<ImageStyle>}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleOpenProfile}
            activeOpacity={0.82}
            style={styles.profileButton}
            accessibilityRole='button'
            accessibilityLabel={`Perfil de ${nomeCompleto || 'usuário'}`}
            accessibilityHint='Toque para abrir seu perfil'
          >
            <View style={styles.profileTextColumn}>
              <FancyText
                size='large'
                type='bold'
                color={palette.fonts.light}
                numberOfLines={1}
              >
                {nomeCompleto || 'Meu perfil'}
              </FancyText>
              <FancyText size='extraSmall' type='medium' color='rgba(255, 255, 255, 0.72)' numberOfLines={1}>
                Ver meu perfil
              </FancyText>
            </View>

            <View style={styles.profileChevron}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='chevron-right'
                size={18}
                color='rgba(255, 255, 255, 0.74)'
              />
            </View>
          </TouchableOpacity>

        </View>
      </View>

      <View style={styles.selectorRow}>
        <FancyDrawerIgrejaSelector />
      </View>
    </LinearGradient>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 14,
      gap: 10,
    },
    identityStrip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      width: '100%',
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
      gap: 7,
      paddingTop: 1,
    },
    profileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: 8,
    },
    profileTextColumn: {
      flex: 1,
      gap: 1,
      justifyContent: 'center',
      minWidth: 0,
    },
    profileChevron: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    selectorRow: {
      alignItems: 'flex-start',
    },
    avatar: {
      backgroundColor: palette.backgroundColor2,
      height: 44,
      width: 44,
      aspectRatio: 1,
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.35)',
      boxShadow: 'none',
    },
  });
}
