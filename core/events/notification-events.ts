export type NotificationEventMap = {
  notification_received_foreground: { payload: Record<string, any> };
  notification_opened: { payload: Record<string, any>; source: 'push' | 'inbox' | 'unknown' };
  notification_marked_read: { id: string };
  notifications_marked_all_read: Record<string, never>;
};

type NotificationEventName = keyof NotificationEventMap;
type NotificationListener<K extends NotificationEventName> = (
  payload: NotificationEventMap[K],
) => void;

const listeners: {
  [K in NotificationEventName]: Set<NotificationListener<K>>;
} = {
  notification_received_foreground: new Set(),
  notification_opened: new Set(),
  notification_marked_read: new Set(),
  notifications_marked_all_read: new Set(),
};

export function emitNotificationEvent<K extends NotificationEventName>(
  eventName: K,
  payload: NotificationEventMap[K],
) {
  for (const listener of listeners[eventName]) {
    try {
      listener(payload);
    } catch (error) {
      if (__DEV__) {
        console.warn(`[NotificationEvents] listener error on "${eventName}"`, error);
      }
    }
  }
}

export function onNotificationEvent<K extends NotificationEventName>(
  eventName: K,
  listener: NotificationListener<K>,
) {
  listeners[eventName].add(listener);
  return () => {
    listeners[eventName].delete(listener);
  };
}
