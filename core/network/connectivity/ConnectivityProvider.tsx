import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { pingHealth } from '../health';

export type ConnectivityStatus = 'ok' | 'offline' | 'serverDown';

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
      setIsOffline(offline);
    });
    return () => unsub();
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
        void runHealthCheck();
        startPolling();
      }
      if (next !== 'active') {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    });

    return () => sub.remove();
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
