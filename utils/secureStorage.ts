// Salva um objeto como JSON
export async function setJSON(key: string, value: any): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

// Recupera um objeto JSON, retorna null se não existir ou se for inválido
export async function getJSON<T = any>(key: string): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
import * as SecureStore from 'expo-secure-store';

export async function setItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
