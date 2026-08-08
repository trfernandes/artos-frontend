import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Refaz fetch toda vez que a tela ganha foco (entrada ou retorno de navegação),
 * expondo um loading próprio, desacoplado do refreshing do pull-to-refresh manual.
 */
export function useFocusRefetch(refetch: () => Promise<unknown>) {
  const [isFocusLoading, setIsFocusLoading] = useState(false);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsFocusLoading(true);
      Promise.resolve(refetchRef.current()).finally(() => {
        if (active) setIsFocusLoading(false);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return { isFocusLoading };
}
