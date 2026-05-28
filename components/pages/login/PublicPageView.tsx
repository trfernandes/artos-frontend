import React from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginBase from './LoginBase';
import FancyButton from '../../buttons/FancyButton';
import { DefaultIconsNames } from '../../../constants/icons';
import { usePallete } from '../../../hooks/usePallete';

const BACK_BUTTON_SIZE = 35;

type PublicPageViewProps = {
  children: React.ReactNode;
  showBackButton?: boolean;
  onPressBack?: () => void;
};

/**
 * Layout wrapper para telas públicas (sem formulário de login).
 * Usa o fundo gradiente do LoginBase sem a lógica complexa de teclado do AuthScreen.
 */
export default function PublicPageView({
  children,
  showBackButton,
  onPressBack,
}: PublicPageViewProps) {
  const palette = usePallete();
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const safeTop = Math.max(insets.top, androidStatusBarHeight);
  const backButtonTop = safeTop + 10;

  return (
    <LoginBase enableDismissKeyboard={false}>
      {showBackButton && (
        <View style={[styles.backButton, { top: backButtonTop }]}>
          <FancyButton
            icon={{ ...DefaultIconsNames['chevron-left'], color: palette.icons.dark }}
            size={30}
            onPress={onPressBack || (() => router.back())}
            containerStyle={{
              backgroundColor: palette.backgroundColor3,
              width: BACK_BUTTON_SIZE,
              height: BACK_BUTTON_SIZE,
              borderRadius: BACK_BUTTON_SIZE / 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </View>
      )}

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: showBackButton ? backButtonTop + BACK_BUTTON_SIZE + 16 : safeTop + 20 },
        ]}
      >
        {children}
      </KeyboardAwareScrollView>
    </LoginBase>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    left: 25,
    zIndex: 1000,
    elevation: 1000,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
});
