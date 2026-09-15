import { useEffect, useState } from 'react';
import { useSubstituicaoPedidosCrud } from './useSubstituicaoPedidosCrud';
import { getSeenPedidoIds } from '../domain/utils/substituicoesSeenStorage';

export function useSubstituicoesDrawerDot() {
  const { meusPedidos } = useSubstituicaoPedidosCrud();
  const [showDot, setShowDot] = useState(false);

  const aguardandoIds = meusPedidos
    .filter((p) => p.aguardandoAcaoDoUsuario)
    .map((p) => p.pedido.id)
    .sort()
    .join(',');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seenIds = new Set(await getSeenPedidoIds());
      const currentIds = aguardandoIds ? aguardandoIds.split(',') : [];
      const hasUnseen = currentIds.some((id) => !seenIds.has(id));
      if (!cancelled) setShowDot(hasUnseen);
    })();
    return () => {
      cancelled = true;
    };
  }, [aguardandoIds]);

  return showDot;
}
