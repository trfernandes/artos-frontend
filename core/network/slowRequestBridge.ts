const WAKE_THRESHOLD_MS = 3000;

let activeCount = 0;
let isSlow = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function setSlow(next: boolean) {
  if (isSlow === next) return;
  isSlow = next;
  notify();
}

// Todo caminho que chama beginRequest() precisa garantir endRequest() em
// sucesso E erro (inclusive timeout/abort) — se algum chamador não fechar o
// ciclo, o banner "Servidor iniciando..." fica preso pra sempre, já que
// activeCount nunca volta a 0.
export function beginRequest(): () => void {
  activeCount += 1;
  const timer = setTimeout(() => setSlow(true), WAKE_THRESHOLD_MS);

  return function endRequest() {
    clearTimeout(timer);
    activeCount = Math.max(0, activeCount - 1);
    if (activeCount === 0) setSlow(false);
  };
}

export function subscribeSlowRequest(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getIsSlowRequest() {
  return isSlow;
}
