import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheData<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = 'v1';

/**
 * Obtém dados do cache se ainda forem válidos
 * @param key Chave do cache
 * @param expirationDays Dias até expiração (padrão: 30)
 * @returns Dados do cache ou null se expirado/não encontrado
 */
export async function getCachedData<T>(
  key: string,
  expirationDays: number = 30,
): Promise<T | null> {
  try {
    const cachedString = await AsyncStorage.getItem(key);
    if (!cachedString) return null;

    const cached: CacheData<T> = JSON.parse(cachedString);

    // Verifica versão
    if (cached.version !== CACHE_VERSION) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    // Verifica expiração
    const now = Date.now();
    const expirationMs = expirationDays * 24 * 60 * 60 * 1000;
    if (now - cached.timestamp > expirationMs) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Salva dados no cache
 * @param key Chave do cache
 * @param data Dados a serem salvos
 */
export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

/**
 * Remove dados do cache
 * @param key Chave do cache
 */
export async function removeCachedData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing cache:', error);
  }
}

/**
 * Limpa todo o cache que corresponde a um padrão
 * @param pattern Padrão para buscar chaves (ex: 'cidades_')
 */
export async function clearCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const matchingKeys = keys.filter((key) => key.startsWith(pattern));
    await AsyncStorage.multiRemove(matchingKeys);
  } catch (error) {
    console.error('Error clearing cache by pattern:', error);
  }
}
