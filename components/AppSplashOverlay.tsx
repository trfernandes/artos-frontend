import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

type AppSplashOverlayProps = {
  visible: boolean;
};

// Usamos o Animated embutido do React Native (não o react-native-reanimated).
// Os presets de layout do Reanimated (`entering`/`exiting`) interceptam a
// remoção do componente pra tocar a animação de saída — e na New Architecture
// (Fabric) essa interceptação trava: o overlay some do estado React mas nunca é
// desmontado de fato, deixando a splash presa pra sempre por cima do app. O
// Animated embutido é dirigido por JS com callback explícito de fim, sem essa
// mágica de ciclo de vida, então a saída sempre completa e desmonta.
export default function AppSplashOverlay({ visible }: AppSplashOverlayProps) {
  const [rendered, setRendered] = useState(true);
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;

  // entrada única da logo (fade + leve crescimento) — sem loop, pra não correr
  // risco de ser cortada no meio de um ciclo quando a splash sai.
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale]);

  // saída: fade-out do overlay inteiro e só então desmonta.
  useEffect(() => {
    if (visible) return;
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setRendered(false));
  }, [visible, containerOpacity]);

  if (!rendered) return null;

  return (
    <Animated.View
      pointerEvents='none'
      style={[StyleSheet.absoluteFillObject, styles.background, { opacity: containerOpacity }]}
    >
      <Animated.Image
        source={require('../assets/images/splash-icon.png')}
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
        resizeMode='cover'
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#151A2C',
  },
});
