import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { usePallete } from '../../hooks/usePallete';

type Props = {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthScreenScaffold({ header, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const palette = usePallete();

  return (
    <LinearGradient
      colors={palette.gradients.auth}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAwareScrollView
          bottomOffset={20}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerWrap}>{header}</View>
          <View style={styles.bodyWrap}>{children}</View>
        </KeyboardAwareScrollView>

        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <View style={[styles.footerWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {footer}
          </View>
        </KeyboardStickyView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
  },
  headerWrap: { alignItems: 'center', gap: 8 },
  bodyWrap: { gap: 16 },
  footerWrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
});
