import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@diakonia/substituicoes_pedidos_seen_ids';

export async function getSeenPedidoIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function markPedidoIdsAsSeen(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // silencioso — pior caso o dot reaparece na próxima abertura
  }
}
