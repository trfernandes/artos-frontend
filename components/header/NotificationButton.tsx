import { router } from 'expo-router';
import FancyHeaderButton from './FancyHeaderButton';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const NOTIFICATION_ICON_SIZE = 20;
const BUTTON_HITBOX_SIZE = 35;

export default function NotificationButton() {
  const styles = useThemedStyles(createStyles);
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);

  const { quantidadeNaoLidas } = useNotificacoesCrud({ apenasNaoLidas });

  const [qtdNaoLidas, setQtdNaoLidas] = useState(1);

  useEffect(() => {
    setQtdNaoLidas(quantidadeNaoLidas);
  }, [quantidadeNaoLidas]);

  return (
    <View style={styles.container}>
      {qtdNaoLidas > 0 && (
        <View style={styles.hasNotificationContainer}>
          <View style={styles.hasNotification} />
        </View>
      )}

      <FancyHeaderButton
        icon={{ library: 'Feather', name: 'bell', size: NOTIFICATION_ICON_SIZE, style: { borderWidth: 0 } }}
        onPress={function (): void {
          router.push('/notifications');
        }}
      />
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      borderWidth: 0,
      width: BUTTON_HITBOX_SIZE,
      height: BUTTON_HITBOX_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hasNotification: {
      width: 6,
      height: 6,
      borderRadius: 4,
      backgroundColor: palette.error,
    },
    hasNotificationContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      right: 2,
      top: 2,
      padding: 1.2,
      borderRadius: 4,
      backgroundColor: palette.backgroundColor,
      zIndex: 1,
    },
  });
}
