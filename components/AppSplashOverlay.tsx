import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function AppSplashOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Image
      source={require('../assets/images/splash-icon.png')}
      style={StyleSheet.absoluteFillObject}
      contentFit='cover'
    />
  );
}
