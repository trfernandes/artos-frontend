import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '../core/network/connectivity/ConnectivityProvider';
import FancyText from './FancyText';
import FancyButton from './buttons/FancyButton';
import { DefaultIconsNames } from '../constants/icons';
import { usePallete } from '../hooks/usePallete';

export function ConnectivityBanner() {
  const palette = usePallete();
  const { status, recheck } = useConnectivity();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);

  if (status === 'ok') return null;

  const title = status === 'offline' ? 'Sem internet' : 'Servidor indisponível';
  const subtitle =
    status === 'offline'
      ? 'Verifique sua conexão para continuar.'
      : 'Tente novamente em instantes.';

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
        backgroundColor: palette.error,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <FancyText size='small' type='bold' color='white'>
          {title}
        </FancyText>
        <FancyText size='extraSmall' style={{ color: 'white', opacity: 0.9, marginTop: 2 }}>
          {subtitle}
        </FancyText>
      </View>

      <FancyButton
        type='outlined'
        containerStyle={{
          borderColor: 'white',
          borderWidth: 0.8,
          height: 28,
          gap: 6,
          paddingHorizontal: 10,
          marginLeft: 12,
          flexShrink: 0,
        }}
        labelStyle={{ color: 'white' }}
        onPress={recheck}
        labelProps={{ size: 'extraSmall' }}
        label='Atualizar'
        icon={{ ...DefaultIconsNames.refresh, color: 'white', size: 12 }}
      />
    </View>
  );
}
