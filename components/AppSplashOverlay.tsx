import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

type AppSplashOverlayProps = {
  visible: boolean;
  // iOS only: called after the overlay is ready. The caller uses this to
  // trigger SplashScreen.hideAsync() only after the first paint, preventing a
  // 1-frame gap where the native splash is gone but the app hasn't rendered.
  onImageReady?: () => void;
};

// Usamos o Animated embutido do React Native (não o react-native-reanimated).
// Os presets de layout do Reanimated (`entering`/`exiting`) interceptam a
// remoção do componente pra tocar a animação de saída — e na New Architecture
// (Fabric) essa interceptação trava: o overlay some do estado React mas nunca é
// desmontado de fato, deixando a splash presa pra sempre por cima do app. O
// Animated embutido é dirigido por JS com callback explícito de fim, sem essa
// mágica de ciclo de vida, então a saída sempre completa e desmonta.
export default function AppSplashOverlay({ visible, onImageReady }: AppSplashOverlayProps) {
  // No Android a splash nativa é só o fundo navy (sem logo), então o overlay
  // exibe a imagem full-screen com fade-in. No iOS a splash nativa (storyboard)
  // já mostra o logo centralizado; o overlay serve apenas como fundo sólido
  // para cobrir o intervalo entre o fim da splash nativa e o primeiro render
  // do app, evitando o efeito "logo grande → logo pequeno".
  const isAndroid = Platform.OS === 'android';
  const [rendered, setRendered] = useState(true);
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(isAndroid ? 0 : 1)).current;
  const logoScale = useRef(new Animated.Value(isAndroid ? 0.92 : 1)).current;

  // iOS: notifica prontidão no primeiro frame, sem depender de imagem alguma.
  useEffect(() => {
    if (isAndroid) return;
    onImageReady?.();
  }, [isAndroid, onImageReady]);

  // entrada única da logo (fade + leve crescimento) — sem loop, pra não correr
  // risco de ser cortada no meio de um ciclo quando a splash sai. Só no Android.
  useEffect(() => {
    if (!isAndroid) return;
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
  }, [isAndroid, logoOpacity, logoScale]);

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
      {isAndroid && (
        <Animated.Image
          source={require('../assets/images/splash-icon.png')}
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
          resizeMode='cover'
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#151A2C',
  },
});
