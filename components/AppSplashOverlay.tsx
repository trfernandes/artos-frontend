import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

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
  // No iOS a splash NATIVA (storyboard) já mostra a mesma splash-icon.png cheia e
  // estática antes do JS carregar. Se o overlay reanimar a entrada da logo
  // (opacity 0→1, scale 0.92→1), o usuário vê a logo aparecer, encolher/sumir e
  // voltar — um "duplo splash". Por isso a entrada só roda no Android, onde a
  // splash nativa é só o fundo navy (sem logo) e a entrada evita que ela fique
  // estática. No iOS o overlay nasce com a logo já cheia, continuando o nativo
  // sem pulo; só o fade-out (comum aos dois) executa.
  const isAndroid = Platform.OS === 'android';
  const [rendered, setRendered] = useState(true);
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(isAndroid ? 0 : 1)).current;
  const logoScale = useRef(new Animated.Value(isAndroid ? 0.92 : 1)).current;

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
