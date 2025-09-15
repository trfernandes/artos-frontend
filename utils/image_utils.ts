import * as FileSystem from 'expo-file-system';
import z from 'zod';

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
      console.error('Falha na conversão da imagem para Base64:', error);
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
};

const base64Regex =
  /^data:([a-z]+\/[a-z0-9-+.]+;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==)?([A-Za-z0-9+/]{3}=)?$/;

export const base64StringSchema = z
  .string()
  .regex(base64Regex, 'O formato da imagem deve ser Base64.')
  .optional();
