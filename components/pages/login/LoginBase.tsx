import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { DismissKeyboard } from '../../DismissKeyboard';

export function AuthGradientBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  const palette = usePallete();

  return (
    <LinearGradient
      colors={palette.gradients.auth}
      style={[styles.gradient, style]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
    />
  );
}

export default function LoginBase({
  children,
  containerStyle,
}: {
  children: React.ReactNode | React.ReactNode[];
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <DismissKeyboard>
      <View style={[styles.container, containerStyle]}>
        <AuthGradientBackground style={{ height: 800, width: 500 }} />
        {children}
      </View>
    </DismissKeyboard>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    borderWidth: DESIGN_MODE,
    borderColor: 'gold',
    gap: 25,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [{ skewY: '140deg' }, { translateY: -240 }],
    borderRadius: 10,
  },
  container: { backgroundColor: 'transparent', flex: 1 },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    flex: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
    justifyContent: 'center',
  },
  centerContainer: { flex: 3, borderWidth: DESIGN_MODE, borderColor: 'chocolate' },
  bottomSpacer: { flex: 1, borderWidth: DESIGN_MODE, borderColor: 'deepskyblue' },
});

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.backgroundColor,
      flex: 1,
    },
  });
}
