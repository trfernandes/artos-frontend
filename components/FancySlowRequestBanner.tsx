import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSlowRequest } from '../hooks/useSlowRequest';
import { useConnectivity } from '../core/network/connectivity/ConnectivityProvider';
import FancyText from './FancyText';
import { usePallete } from '../hooks/usePallete';

export function SlowRequestBanner() {
  const palette = usePallete();
  const isSlow = useSlowRequest();
  const { status } = useConnectivity();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);

  // Se já tem banner de offline/servidor indisponível, não empilha outro
  if (!isSlow || status !== 'ok') return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingBottom: 10,
        paddingTop: 10,
        paddingHorizontal: 16,
        backgroundColor: palette.warning,
      }}
    >
      <FancyText size='small' type='bold' color='white'>
        Servidor iniciando...
      </FancyText>
      <FancyText size='extraSmall' style={{ color: 'white', opacity: 0.9, marginTop: 2 }}>
        Primeira consulta do dia pode levar alguns segundos.
      </FancyText>
    </View>
  );
}
