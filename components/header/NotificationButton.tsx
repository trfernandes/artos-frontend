import { router } from 'expo-router';
import FancyHeaderButton from './FancyHeaderButton';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import FancyText from '../FancyText';
import { onNotificationEvent } from '../../core/events/notification-events';

const NOTIFICATION_ICON_SIZE = 18;

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
        <View style={styles.badgeWrapper} pointerEvents='none'>
          <FancyText size={9} type='bold' style={styles.badgeLabel}>
            {badgeLabel}
          </FancyText>
        </View>
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
    badgeLabel: {
      color: palette.fonts.light,
      lineHeight: 11,
      textAlign: 'center',
      minWidth: 10,
      paddingHorizontal: 0,
      includeFontPadding: false,
    },
    badgeWrapper: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      right: -2,
      top: 0,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 3,
      borderRadius: 999,
      borderWidth: 0,
      backgroundColor: palette.error,
      zIndex: 1,
    },
  });
}
