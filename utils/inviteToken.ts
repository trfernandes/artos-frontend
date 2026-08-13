export function extractInviteToken(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const deeplinkMatch = trimmed.match(/(?:diakonia|artos):\/\/invite\/([^\/\s?#]+)/i);
  if (deeplinkMatch) {
    return deeplinkMatch[1];
  }

  const expoDeeplinkMatch = trimmed.match(/exp\+[^:]+:\/\/invite\/([^\/\s?#]+)/i);
  if (expoDeeplinkMatch) {
    return expoDeeplinkMatch[1];
  }

  const httpsMatch = trimmed.match(/https?:\/\/[^\/\s]+\/invite\/([^\/\s?#]+)/i);
  if (httpsMatch) {
    return httpsMatch[1];
  }

  // Formato legado (?token=) — mantido pra links antigos já compartilhados.
  const queryMatch = trimmed.match(/[?&]token=([^&\s#]+)/i);
  if (queryMatch) {
    return decodeURIComponent(queryMatch[1]);
  }

  const lastSlashIndex = trimmed.lastIndexOf('/');
  if (lastSlashIndex !== -1 && lastSlashIndex < trimmed.length - 1) {
    return trimmed.substring(lastSlashIndex + 1).split(/[?#]/)[0];
  }

  return trimmed;
}
