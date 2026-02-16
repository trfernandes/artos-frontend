import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '../core/network/connectivity/ConnectivityProvider';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';
import FancyButton from './buttons/FancyButton';
import { DefaultIconsNames } from '../constants/icons';

export function ConnectivityBanner() {
  const { status, recheck } = useConnectivity();
  const insets = useSafeAreaInsets();

  if (status === 'ok') return null;

  const title = status === 'offline' ? 'Sem internet' : 'Servidor indisponível';
  const subtitle = status === 'offline' ? 'Verifique sua conexão para continuar.' : 'Tente novamente em instantes.';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingBottom: insets.bottom + 8,
        paddingTop: 12,
        paddingHorizontal: 12,
        backgroundColor: Pallete.error,
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

      {status === 'serverDown' ? (
        <FancyButton
          type='outlined'
          containerStyle={{ borderColor: 'white', borderWidth: 0.8, height: 28, gap: 6, paddingHorizontal: 10 }}
          labelStyle={{ color: 'white' }}
          onPress={recheck}
          labelProps={{ size: 'extraSmall' }}
          label='Tentar novamente'
          icon={{ ...DefaultIconsNames.refresh, color: 'white', size: 12 }}
        />
      ) : null}
    </View>
  );
}
