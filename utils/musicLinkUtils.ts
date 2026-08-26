export type MusicLinkService = 'youtube' | 'spotify' | 'generic';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function safeHostname(url: string): string | null {
  try {
    return new URL(normalizeUrl(url)).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isHostOrSubdomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

export function detectMusicLinkService(url: string): MusicLinkService {
  const host = safeHostname(url);
  if (!host) return 'generic';
  if (isHostOrSubdomain(host, 'youtube.com') || isHostOrSubdomain(host, 'youtu.be')) return 'youtube';
  if (isHostOrSubdomain(host, 'spotify.com')) return 'spotify';
  return 'generic';
}

export function isOpenableMusicUrl(url: string): boolean {
  try {
    const protocol = new URL(normalizeUrl(url)).protocol;
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

export function toOpenableMusicUrl(url: string): string {
  return normalizeUrl(url);
}

export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
      if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/').filter(Boolean)[1] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}
