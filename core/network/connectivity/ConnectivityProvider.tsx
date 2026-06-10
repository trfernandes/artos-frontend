import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { pingHealth } from '../health';

export type ConnectivityStatus = 'ok' | 'offline' | 'serverDown';

// Evita "piscar" o banner com estados transitórios ao voltar do background,
// enquanto a rede ainda está reconectando.
const OFFLINE_DEBOUNCE_MS = 1200;
const FOREGROUND_HEALTHCHECK_DELAY_MS = 1500;

type ConnectivityContextValue = {
  status: ConnectivityStatus;
  isOffline: boolean;
  isServerDown: boolean;
  recheck: () => Promise<void>;
};

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [isServerDown, setIsServerDown] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const offlineDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const foregroundDelayRef = useRef<NodeJS.Timeout | null>(null);

  const runHealthCheck = useCallback(async () => {
    if (isOffline) {
      setIsServerDown(false);
      return;
    }
    const ok = await pingHealth(2500);
    setIsServerDown(!ok);
  }, [isOffline]);

  const startPolling = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // ok -> 60s | serverDown -> 15s
    const interval = isServerDown ? 15000 : 60000;
    timerRef.current = setInterval(() => {
      void runHealthCheck();
    }, interval);
  }, [isServerDown, runHealthCheck]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);

      if (offlineDebounceRef.current) {
        clearTimeout(offlineDebounceRef.current);
        offlineDebounceRef.current = null;
      }

      if (!offline) {
        setIsOffline(false);
        return;
      }

      // Espera um pouco antes de marcar como offline: ao voltar do
      // background o NetInfo pode reportar offline momentaneamente
      // enquanto a rede ainda está reconectando.
      offlineDebounceRef.current = setTimeout(() => {
        setIsOffline(true);
      }, OFFLINE_DEBOUNCE_MS);
    });
    return () => {
      unsub();
      if (offlineDebounceRef.current) clearTimeout(offlineDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    // Ao ficar online, checa já
    void runHealthCheck();
  }, [isOffline, runHealthCheck]);

  useEffect(() => {
    startPolling();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startPolling]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      const wentForeground = prev.match(/inactive|background/) && next === 'active';
      if (wentForeground) {
        if (foregroundDelayRef.current) clearTimeout(foregroundDelayRef.current);
        // Dá um tempo para a rede reconectar antes de checar o servidor,
        // evitando falso "servidor indisponível" logo após voltar ao app.
        foregroundDelayRef.current = setTimeout(() => {
          void runHealthCheck();
          startPolling();
        }, FOREGROUND_HEALTHCHECK_DELAY_MS);
      }
      if (next !== 'active') {
        if (timerRef.current) clearInterval(timerRef.current);
        if (foregroundDelayRef.current) clearTimeout(foregroundDelayRef.current);
      }
    });

    return () => {
      sub.remove();
      if (foregroundDelayRef.current) clearTimeout(foregroundDelayRef.current);
    };
  }, [runHealthCheck, startPolling]);

  const status: ConnectivityStatus = isOffline ? 'offline' : isServerDown ? 'serverDown' : 'ok';

  const value = useMemo<ConnectivityContextValue>(() => {
    return {
      status,
      isOffline,
      isServerDown,
      recheck: async () => {
        await runHealthCheck();
      },
    };
  }, [status, isOffline, isServerDown, runHealthCheck]);

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be used inside ConnectivityProvider');
  return ctx;
}
