import { router } from 'expo-router';
import FancyHeaderButton from './FancyHeaderButton';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import { useEffect, useState } from 'react';
import { Pallete } from '../../constants/colors';
import { StyleSheet, View } from 'react-native';

export default function NotificationButton() {
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);

  const { quantidadeNaoLidas } = useNotificacoesCrud({ apenasNaoLidas });

  const [qtdNaoLidas, setQtdNaoLidas] = useState(1);

  useEffect(() => {
    setQtdNaoLidas(quantidadeNaoLidas);
  }, [quantidadeNaoLidas]);

  return (
    <View style={{borderWidth:0, width:22, height:22, alignItems:'center', justifyContent:'center'}}>
      {qtdNaoLidas > 0 && (
        <View style={styles.hasNotificationContainer}>
          <View style={styles.hasNotification} />
        </View>
      )}

      <FancyHeaderButton
        icon={{ library: 'Feather', name: 'bell', size: 20, style: { borderWidth: 0 } }}
        onPress={function (): void {
          router.push('/notifications');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hasNotification: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: Pallete.error,
  },
  hasNotificationContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
    top: 0,
    padding: 1.2,
    borderRadius: 4,
    backgroundColor: 'white',
    zIndex: 1,
  },
});
