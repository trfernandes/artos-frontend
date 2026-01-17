import z from 'zod';
import { Buffer } from 'buffer';
import { ImageSourcePropType } from 'react-native';
import { cloudinaryAvatarThumb, uploadToCloudinaryUnsigned } from '../services/cloudinary_upload';

const DATA_URI_PREFIX_REGEX = /^data:[^;]+;base64,/i;
const URL_LIKE_REGEX = /^(?:https?:|file:|content:|asset:)/i;
const BASE64_BODY_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;

const isNullishString = (value: string) => ['null', 'undefined'].includes(value.toLowerCase());

const sanitizeBase64Body = (value: string) => value.replace(/\s/g, '');

const isBase64Value = (value: string) => {
  if (!value) {
    return false;
  }

  if (!BASE64_BODY_REGEX.test(value)) {
    return false;
  }

  try {
    Buffer.from(value, 'base64');
    return true;
  } catch (error) {
    return false;
  }
};

const guessMimeTypeFromBase64 = (value: string): string | undefined => {
  const signature = value.slice(0, 10);
  if (value.startsWith('/9j/')) {
    return 'image/jpeg';
  }
  if (value.startsWith('iVBORw0KG')) {
    return 'image/png';
  }
  if (value.startsWith('R0lGOD')) {
    return 'image/gif';
  }
  if (value.startsWith('UklGR')) {
    return 'image/webp';
  }
  if (value.startsWith('Qk')) {
    return 'image/bmp';
  }
  if (signature.startsWith('AAABAA')) {
    return 'image/x-icon';
  }
  return undefined;
};

const buildDataUri = (base64: string, mimeType?: string) => {
  const sanitized = sanitizeBase64Body(base64);
  const resolvedMime = mimeType ?? guessMimeTypeFromBase64(sanitized) ?? 'image/jpeg';
  return `data:${resolvedMime};base64,${sanitized}`;
};

export const ImageUtils = {
  async uriToBase64(uri: string) {
//     return await FileSystem.readAsStringAsync(uri, {
//       encoding: FileSystem.EncodingType.Base64,
//     });
  },
  stringToBase64(base64: string, mimeType?: string) {
    const sanitized = base64?.trim();

    if (!sanitized) {
      return undefined;
    }

    if (DATA_URI_PREFIX_REGEX.test(sanitized)) {
      return sanitized;
    }

    if (URL_LIKE_REGEX.test(sanitized)) {
      return sanitized;
    }

    return buildDataUri(sanitized, mimeType);
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
            reject(new Error('Erro ao ler a imagem. O resultado esta vazio.'));
          }
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Falha na conversao da imagem para Base64:', error);
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
  rawToDataUri(raw: unknown, mimeType?: string): string | undefined {
    if (typeof raw === 'string') {
      const trimmed = raw.trim();

      if (!trimmed || isNullishString(trimmed)) {
        return undefined;
      }

      if (DATA_URI_PREFIX_REGEX.test(trimmed)) {
        return trimmed;
      }

      if (/^data:/i.test(trimmed)) {
        return trimmed;
      }

      if (URL_LIKE_REGEX.test(trimmed)) {
        return trimmed;
      }

      const sanitized = sanitizeBase64Body(trimmed);
      if (isBase64Value(sanitized)) {
        return buildDataUri(sanitized, mimeType);
      }

      return trimmed;
    }

    if (raw instanceof Uint8Array) {
      const base64String = Buffer.from(raw).toString('base64');
      return buildDataUri(base64String, mimeType);
    }

    if (raw instanceof ArrayBuffer) {
      const base64String = Buffer.from(new Uint8Array(raw)).toString('base64');
      return buildDataUri(base64String, mimeType);
    }

    if (raw && typeof raw === 'object') {
      const maybeBuffer = raw as { type?: string; data?: unknown };
      if (maybeBuffer.type === 'Buffer' && Array.isArray(maybeBuffer.data)) {
        const base64String = Buffer.from(maybeBuffer.data as number[]).toString('base64');
        return buildDataUri(base64String, mimeType);
      }
    }

    return undefined;
  },
  normalizeImageSource(source?: string | ImageSourcePropType, options?: { mimeType?: string }): ImageSourcePropType | undefined {
    if (source === undefined || source === null) {
      return undefined;
    }

    if (typeof source === 'number') {
      return source;
    }

    const mimeType = options?.mimeType;

    if (typeof source === 'string') {
      const uri = ImageUtils.rawToDataUri(source, mimeType);
      return uri ? { uri } : undefined;
    }

    if (Array.isArray(source)) {
      const normalized = source
        .map((item) => ImageUtils.normalizeImageSource(item as any, { mimeType }))
        .filter((item): item is ImageSourcePropType => Boolean(item));

      return normalized.length > 0 ? (normalized as unknown as ImageSourcePropType) : undefined;
    }

    if (typeof source === 'object' && 'uri' in source && typeof (source as any).uri === 'string') {
      const uriValue = (source as any).uri as string;
      const normalizedUri = ImageUtils.rawToDataUri(uriValue, mimeType) ?? uriValue;
      return { ...(source as any), uri: normalizedUri } as ImageSourcePropType;
    }

    return source as ImageSourcePropType;
  },
};

const base64Regex = /^(?:data:[^;]+;base64,)?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const base64StringSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) {
      return true;
    }

    if (isNullishString(value)) {
      return true;
    }

    if (DATA_URI_PREFIX_REGEX.test(value)) {
      return true;
    }

    if (URL_LIKE_REGEX.test(value)) {
      return true;
    }

    return base64Regex.test(sanitizeBase64Body(value));
  }, 'O formato da imagem deve ser Base64.')
  .transform((value) => {
    if (!value || isNullishString(value)) {
      return undefined;
    }

    return ImageUtils.rawToDataUri(value) ?? value;
  })
  .optional();

export async function sendImageToServer(
  folderName: string,
  image: { uri: string; type: string; name: string },
): Promise<{ imageUrl: string; imageThumbUrl: string }> {
  const up = await uploadToCloudinaryUnsigned(image, {
    cloudName: 'djwptbgbm',
    uploadPreset: 'artos_voluntarios',
    folder: `artos/${folderName}`,
  });

  return { imageUrl: up.secureUrl, imageThumbUrl: cloudinaryAvatarThumb(up.secureUrl, 200) };
}
