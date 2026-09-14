export const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
export const POSTHOG_HOST = 'https://eu.i.posthog.com';

export const POSTHOG_ENABLED = POSTHOG_API_KEY.length > 0;
