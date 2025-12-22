import { View } from 'react-native';
import { useConnectivity } from '../core/network/connectivity/ConnectivityProvider';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';
import FancyButton from './buttons/FancyButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DefaultIconsNames } from '../constants/icons';

export function ConnectivityBanner() {
  const { status, recheck } = useConnectivity();

  if (status === 'ok') return null;

  const title = status === 'offline' ? 'Sem internet' : 'Servidor indisponível';

  const subtitle = status === 'offline' ? 'Verifique sua conexão para continuar.' : 'Tente novamente em instantes.';

  return (
    <SafeAreaView>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: Pallete.error,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <FancyText size="small" type="bold" color="white">
            {title}
          </FancyText>
          <FancyText size="extraSmall" style={{ color: 'white', opacity: 0.9, marginTop: 2 }}>
            {subtitle}
          </FancyText>
        </View>

        {status === 'serverDown' ? (
          <FancyButton
            type="outlined"
            containerStyle={{ borderColor: 'white', borderWidth: 0.8, height: 28, gap: 6, paddingHorizontal: 10 }}
            labelStyle={{ color: 'white' }}
            onPress={recheck}
            labelProps={{ size: 'extraSmall' }}
            label="Tentar novamente"
            // iconPosition="right"
            icon={{ ...DefaultIconsNames.refresh, color: 'white', size: 12 }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
