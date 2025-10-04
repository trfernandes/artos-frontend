import * as FileSystem from 'expo-file-system';
import z from 'zod';
import { Buffer } from 'buffer';

export const ImageUtils = {
  async uriToBase64(uri: string) {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  },
  stringToBase64(base64: string) {
    return `data:image/jpeg;base64,${base64}`;
  },
  async imageToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject(new Error('Erro ao ler a imagem. O resultado está vazio.'));
          }
        };

        reader.onerror = error => {
          reject(error);
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Falha na conversão da imagem para Base64:', error);
      throw error;
    }
  },
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  },
  rawToDataUri(raw: unknown): string | undefined {
    if (typeof raw === 'string') {
      return raw.trim().length > 0 ? raw : undefined;
    }

    if (raw && typeof raw === 'object') {
      const maybeBuffer = raw as { type?: string; data?: unknown };
      if (maybeBuffer.type === 'Buffer' && Array.isArray(maybeBuffer.data)) {
        const base64String = Buffer.from(maybeBuffer.data as number[]).toString('base64');
        return 'data:image/jpeg;base64,' + base64String;
      }
    }

    return undefined;
  },
};

const base64Regex =
  /^data:([a-z]+\/[a-z0-9-+.]+;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==)?([A-Za-z0-9+/]{3}=)?$/;

export const base64StringSchema = z
  .string()
  .regex(base64Regex, 'O formato da imagem deve ser Base64.')
  .optional();
