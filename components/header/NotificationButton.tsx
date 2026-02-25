import { router } from 'expo-router';
import FancyHeaderButton from './FancyHeaderButton';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import FancyText from '../FancyText';
import { onNotificationEvent } from '../../core/events/notification-events';

const NOTIFICATION_ICON_SIZE = 20;
const BUTTON_HITBOX_SIZE = 35;

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
    <View style={styles.container}>
      {showBadge && (
        <View style={styles.badgeWrapper}>
          <View style={styles.badgeContainer}>
            <FancyText size='extraSmall' type='bold' style={styles.badgeLabel}>
              {badgeLabel}
            </FancyText>
          </View>
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
      marginRight: -3,
    },
    badgeLabel: {
      color: palette.fonts.light,
      lineHeight: 12,
      textAlign: 'center',
      minWidth: 10,
      paddingHorizontal: 0,
      includeFontPadding: false,
    },
    badgeContainer: {
      minWidth: 14,
      height: 14,
      paddingHorizontal: 2,
      borderRadius: 10,
      backgroundColor: palette.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeWrapper: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      right: -2,
      top: -1,
      borderRadius: 4,
      backgroundColor: palette.backgroundColor,
      zIndex: 1,
    },
  });
}
