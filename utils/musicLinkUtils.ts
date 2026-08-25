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

export function detectMusicLinkService(url: string): MusicLinkService {
  const host = safeHostname(url);
  if (!host) return 'generic';
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
  if (host.includes('spotify.com')) return 'spotify';
  return 'generic';
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
