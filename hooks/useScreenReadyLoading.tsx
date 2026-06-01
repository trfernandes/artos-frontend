import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from 'expo-router';
import { useLoading } from '../contexts/LoadingContext';

type Params = {
  dataReady: boolean;
  waitTransition?: boolean; // default true
  resetKey?: any; // quando mudar (ex: params.id), reseta o controle
  enabled?: boolean; // default true
};

export function useScreenReadyLoading(params: Params) {
  const { hideLoading } = useLoading();
  const navigation = useNavigation();

  const enabled = params.enabled ?? true;
  const waitTransition = params.waitTransition ?? true;

  const [layoutReady, setLayoutReady] = useState(false);
  const [transitionDone, setTransitionDone] = useState(!waitTransition);

  const didHideRef = useRef(false);
  const raf1Ref = useRef<number | null>(null);
  const raf2Ref = useRef<number | null>(null);

  const cancelFrames = useCallback(() => {
    if (raf1Ref.current != null) cancelAnimationFrame(raf1Ref.current);
    if (raf2Ref.current != null) cancelAnimationFrame(raf2Ref.current);
    raf1Ref.current = null;
    raf2Ref.current = null;
  }, []);

  const runAfterTwoFrames = useCallback(
    (cb: () => void) => {
      cancelFrames();
      raf1Ref.current = requestAnimationFrame(() => {
        raf2Ref.current = requestAnimationFrame(() => {
          cb();
        });
      });
    },
    [cancelFrames],
  );

  // ✅ reset quando trocar o "contexto" da tela (ex: id da rota)
  useEffect(() => {
    didHideRef.current = false;
    setLayoutReady(false);
    setTransitionDone(!waitTransition);
    cancelFrames();
  }, [params.resetKey, waitTransition, cancelFrames]);

  // ✅ espera a transição terminar (opcional)
  useEffect(() => {
    if (!waitTransition) return;

    const unsub = (navigation as any).addListener?.('transitionEnd', (e: any) => {
      if (e?.data?.closing) return;
      setTransitionDone(true);
    });

    return unsub;
  }, [navigation, waitTransition]);

  const ready = useMemo(() => {
    if (!enabled) return false;
    return params.dataReady && layoutReady && transitionDone;
  }, [enabled, layoutReady, params.dataReady, transitionDone]);

  useEffect(() => {
    if (!ready) return;
    if (didHideRef.current) return;

    runAfterTwoFrames(() => {
      hideLoading();
      didHideRef.current = true;
    });

    return cancelFrames;
  }, [ready, hideLoading, runAfterTwoFrames, cancelFrames]);

  // pluga isso no container principal da tela
  const onLayout = useCallback(() => {
    setLayoutReady(true);
  }, []);

  return { onLayout };
}
