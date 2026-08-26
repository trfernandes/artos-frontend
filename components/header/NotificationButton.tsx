import { router } from 'expo-router';
import FancyHeaderButton from './FancyHeaderButton';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { onNotificationEvent } from '../../core/events/notification-events';
const NOTIFICATION_ICON_SIZE = 19;
const BADGE_DIAMETER = 8;

export default function NotificationButton() {
  const styles = useThemedStyles(createStyles);
  const { quantidadeNaoLidas, refetchQuantidadeNaoLidas } = useNotificacoesCrud({
    enabled: true,
    includeList: false,
    includeUnreadCount: true,
  });
  const showBadge = quantidadeNaoLidas > 0;
  const badgeLabel = quantidadeNaoLidas > 99 ? '99+' : String(quantidadeNaoLidas);

  useEffect(() => {
    const unsubscribeReceived = onNotificationEvent('notification_received_foreground', () => {
      void refetchQuantidadeNaoLidas();
    });
    const unsubscribeOpened = onNotificationEvent('notification_opened', () => {
      void refetchQuantidadeNaoLidas();
    });
    const unsubscribeMarkedRead = onNotificationEvent('notification_marked_read', () => {
      void refetchQuantidadeNaoLidas();
    });
    const unsubscribeMarkedAll = onNotificationEvent('notifications_marked_all_read', () => {
      void refetchQuantidadeNaoLidas();
    });

    return () => {
      unsubscribeReceived();
      unsubscribeOpened();
      unsubscribeMarkedRead();
      unsubscribeMarkedAll();
    };
  }, [refetchQuantidadeNaoLidas]);

  return (
    // container sem dimensões fixas — ocupa exatamente o espaço do FancyHeaderButton
    <View
      style={styles.container}
      accessibilityRole='button'
      accessibilityLabel={`Notificações${showBadge ? `, ${badgeLabel} não lidas` : ''}`}
    >
      <FancyHeaderButton
        icon={{ library: 'MaterialCommunityIcons', name: 'bell', size: NOTIFICATION_ICON_SIZE }}
        onPress={() => router.push('/notifications')}
        buttonProps={{
          containerStyle: styles.headerButton,
        }}
      />

      {showBadge && (
        // badge posicionado relativo ao container (que envolve o botão de 24×30)
        <View style={styles.badgeWrapper} pointerEvents='none' />
      )}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: 24,
      height: 30,
      borderWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      // sem marginRight — o rightContainer da FancyHeader já aplica os 15px
    },
    headerButton: {
      // espelha exatamente o containerStyle do HeaderMenuButton: só width/minWidth = 24
      width: 24,
      minWidth: 24,
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    badgeWrapper: {
      // sobrepõe o canto superior-direito do sino (ícone 19px centralizado no
      // container 24×30) em vez de flutuar acima dele
      position: 'absolute',
      right: 2,
      top: 4,
      width: BADGE_DIAMETER,
      height: BADGE_DIAMETER,
      borderRadius: 999,
      backgroundColor: palette.error,
      zIndex: 1,
    },
  });
}
