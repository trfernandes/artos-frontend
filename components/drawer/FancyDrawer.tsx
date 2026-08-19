import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, View, ActivityIndicator, Linking, Platform } from 'react-native';
import { useMemo, useCallback } from 'react';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import FancyDrawerHeader from './FancyDrawerHeader';
import FancyDrawerItem from './FancyDrawerItem';
import FancyDrawerSeparator from './FancyDrawerSeparator';
import FancyScrollView from '../FancyScrollView';
import FancyText from '../FancyText';
import { useAuth } from '../../contexts/AuthContext';
import { useMinisteriosDrawer } from '../../hooks/useMinisteriosDrawer';
import { getMenuForIgreja } from './MenuData';
import { ThemePalette } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

// Android não distingue "versão" de "build" como o iOS (buildNumber) — o
// versionCode É o build, então Constants.nativeBuildVersion (nativo) ou o
// expoConfig.android.versionCode (fallback em Expo Go/dev) já cobrem os dois.
function getAppVersionLabel() {
  const version = Constants.nativeAppVersion || Constants.expoConfig?.version || '?';
  const build =
    Constants.nativeBuildVersion ||
    (Platform.OS === 'android'
      ? Constants.expoConfig?.android?.versionCode
      : Constants.expoConfig?.ios?.buildNumber) ||
    '?';

  return `Versão ${version} (build ${build})`;
}

export type FancyDrawerProps = {} & DrawerContentComponentProps;

export default function FancyDrawer(props: FancyDrawerProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { signOut, isSigningOut } = useAuth();
  const { igrejaAtiva, isLoading, isAdmin } = useMinisteriosDrawer();
  const { navigation } = props;

  const handleOpenStoreReview = useCallback(() => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id6759353187',
      android: 'https://play.google.com/store/apps/details?id=com.church.artos',
    });

    if (!storeUrl || storeUrl.includes('__APP_ID__')) {
      Toast.show({
        type: 'info',
        text1: 'Avaliação indisponível',
        text2: 'A avaliação da App Store será habilitada após a publicação.',
      });
      return;
    }

    Linking.openURL(storeUrl);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const menuSections = useMemo(() => getMenuForIgreja(igrejaAtiva), [igrejaAtiva]);
  const appVersionLabel = useMemo(() => getAppVersionLabel(), []);

  const sections = useMemo(() => {
    return menuSections.map((section, sectionIndex) => (
      <View key={sectionIndex}>
        <FancyDrawerSeparator label={section.section} />
        {section.items.map((item, itemIndex) => {
          const isExpandable = Boolean(item.items && item.items.length);
          const defaultCollapsed = isExpandable ? true : undefined;

          return (
            <FancyDrawerItem
              key={`${sectionIndex}-${itemIndex}`}
              {...item}
              isDefaultCollapsed={defaultCollapsed}
              onNavigate={() => navigation.closeDrawer?.()}
            />
          );
        })}
      </View>
    ));
  }, [menuSections, navigation]);

  // Mostra loading enquanto busca os ministérios para admins
  const showMinisteriosLoading = isAdmin && isLoading;

  return (
    <View style={styles.container}>
      <FancyDrawerHeader />
      <View
        style={{
          width: '100%',
          flex: 1,
          zIndex: 10,
        }}
      >
        <FancyScrollView
          topFade={{
            style: {
              borderTopStartRadius: 15,
              borderTopEndRadius: 15,
              borderTopRightRadius: 15,
              borderTopLeftRadius: 15,
              borderWidth: 0,
            },
          }}
          bottomFade={{
            style: { borderBottomStartRadius: 15, borderBottomEndRadius: 15, borderWidth: 0 },
          }}
          showsVerticalScrollIndicator={false}
          style={styles.menuContainer}
          contentContainerStyle={{ borderRadius: 15, paddingHorizontal: 8, paddingTop: 10 }}
        >
          {sections}

          {showMinisteriosLoading && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size='small' color={palette.primary} />
            </View>
          )}

          <FancyDrawerSeparator label={'Outros'} />
          <FancyDrawerItem
            title='Ajuda'
            logo={{
              type: 'icon',
              value: { name: 'help-circle-outline', library: 'MaterialCommunityIcons', size: 17 },
            }}
            onPress={{ type: 'GoToRoute', routeName: '/ajuda' }}
            onNavigate={() => navigation.closeDrawer?.()}
          />
          <FancyDrawerItem
            title='Avaliar o App'
            logo={{
              type: 'icon',
              value: { name: 'star-outline', library: 'MaterialCommunityIcons', size: 17 },
            }}
            onPress={{ type: 'RunMethod', method: handleOpenStoreReview }}
            onNavigate={() => navigation.closeDrawer?.()}
          />
          <FancyDrawerItem
            title='Sair'
            logo={{
              type: 'icon',
              value: {
                name: isSigningOut ? 'progress-clock' : 'exit-to-app',
                library: 'MaterialCommunityIcons',
                size: isSigningOut ? 17 : 15,
              },
            }}
            disabled={isSigningOut}
            subtitle={isSigningOut ? 'Saindo...' : undefined}
            onPress={{ type: 'RunMethod', method: handleSignOut }}
            onNavigate={() => navigation.closeDrawer?.()}
          />

          <View style={styles.versionContainer}>
            <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
              {appVersionLabel}
            </FancyText>
          </View>
        </FancyScrollView>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: { alignItems: 'center', flex: 1, backgroundColor: palette.backgroundColor },
    menuContainer: {
      backgroundColor: palette.backgroundColor,
      paddingHorizontal: 3,
      borderRadius: 15,
    },
    versionContainer: {
      alignItems: 'center',
      paddingTop: 14,
      paddingBottom: 6,
    },
  });
}
