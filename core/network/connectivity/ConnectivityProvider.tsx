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

export type ConnectivityStatus = 'ok' | 'offline' | 'connecting' | 'serverDown';

// Evita "piscar" o banner com estados transitórios ao voltar do background,
// enquanto a rede ainda está reconectando.
const OFFLINE_DEBOUNCE_MS = 1200;
const FOREGROUND_HEALTHCHECK_DELAY_MS = 1500;
// Render staging pode levar mais de 8s pra sair do cold start; recheck manual
// (botão "Atualizar" do banner) espera mais pra resolver num clique só.
const MANUAL_RECHECK_TIMEOUT_MS = 25000;
// Timeout de checagens periódicas (steady-state), depois que o servidor já respondeu uma vez.
const STEADY_STATE_TIMEOUT_MS = 8000;
// Primeira checagem depois do mount — cold start do Render costuma passar de 8s, então usa um
// timeout próprio, maior, só nessa checagem. Checagens seguintes voltam ao timeout normal.
const STARTUP_PROBE_TIMEOUT_MS = 20000;
// Só marca "servidor indisponível" depois de N falhas seguidas — uma falha isolada vira o estado
// neutro "connecting" em vez de erro direto (evita falso positivo por timeout/glitch pontual).
const FAILURE_THRESHOLD = 2;

type ConnectivityContextValue = {
  status: ConnectivityStatus;
  isOffline: boolean;
  isServerDown: boolean;
  isRechecking: boolean;
  recheck: () => Promise<void>;
};

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [isServerDown, setIsServerDown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const offlineDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const foregroundDelayRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFailuresRef = useRef(0);
  const hasRunStartupProbeRef = useRef(false);

  const runHealthCheck = useCallback(
    async (timeoutMs?: number) => {
      if (isOffline) {
        consecutiveFailuresRef.current = 0;
        setIsServerDown(false);
        setIsConnecting(false);
        return;
      }

      const isStartupProbe = !hasRunStartupProbeRef.current;
      hasRunStartupProbeRef.current = true;
      const effectiveTimeout =
        timeoutMs ?? (isStartupProbe ? STARTUP_PROBE_TIMEOUT_MS : STEADY_STATE_TIMEOUT_MS);

      const ok = await pingHealth(effectiveTimeout);

      if (ok) {
        consecutiveFailuresRef.current = 0;
        setIsServerDown(false);
        setIsConnecting(false);
        return;
      }

      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= FAILURE_THRESHOLD) {
        setIsServerDown(true);
        setIsConnecting(false);
      } else {
        setIsConnecting(true);
      }
    },
    [isOffline],
  );

  const startPolling = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // ok -> 60s | connecting/serverDown -> 15s (tenta resolver mais rápido)
    const interval = isServerDown || isConnecting ? 15000 : 60000;
    timerRef.current = setInterval(() => {
      void runHealthCheck();
    }, interval);
  }, [isServerDown, isConnecting, runHealthCheck]);

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

  const status: ConnectivityStatus = isOffline
    ? 'offline'
    : isServerDown
      ? 'serverDown'
      : isConnecting
        ? 'connecting'
        : 'ok';

  const value = useMemo<ConnectivityContextValue>(() => {
    return {
      status,
      isOffline,
      isServerDown,
      isRechecking,
      recheck: async () => {
        setIsRechecking(true);
        try {
          await runHealthCheck(MANUAL_RECHECK_TIMEOUT_MS);
        } finally {
          setIsRechecking(false);
        }
      },
    };
  }, [status, isOffline, isServerDown, isRechecking, runHealthCheck]);

  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be used inside ConnectivityProvider');
  return ctx;
}
