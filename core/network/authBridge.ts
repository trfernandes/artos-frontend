type UnauthorizedHandler = (reason: 'expired' | 'unauthorized') => void;

let token: string | null = null;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setAuthToken(next: string | null) {
  token = next;
}

export function getAuthToken() {
  return token;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

export function triggerUnauthorized(reason: 'expired' | 'unauthorized') {
  onUnauthorized?.(reason);
}
