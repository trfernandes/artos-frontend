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
    <View style={{}}>
      {qtdNaoLidas > 0 && (
        <View style={styles.hasNotificationContainer}>
          <View style={styles.hasNotification} />
        </View>
      )}

      <FancyHeaderButton
        icon={{ library: 'Feather', name: 'bell', size: 20 }}
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
    right: 14,
    top: 4,
    padding: 1.2,
    borderRadius: 4,
    backgroundColor: 'white',
    zIndex: 1,
  },
});
