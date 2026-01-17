import apiClient from '../../domain/api/api-client';

export async function pingHealth(timeoutMs = 2500): Promise<boolean> {
  try {
    const res = await apiClient.get('/health', { timeout: timeoutMs });
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}
