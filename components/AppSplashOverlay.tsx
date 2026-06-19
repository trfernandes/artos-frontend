import { Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('screen');

export default function AppSplashOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Image
      source={require('../assets/images/splash-icon.png')}
      style={[StyleSheet.absoluteFillObject, { width, height }]}
      contentFit='cover'
      transition={null}
    />
  );
}
