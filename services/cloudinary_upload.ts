type FormImageFile = { uri: string; name: string; type: string };

export function cloudinaryLogoThumb(secureUrl: string, size: number) {
  const t = `c_fit,w_${size},h_${size},f_auto,q_auto`;
  return cloudinaryWithTransform(secureUrl, t);
}

export function cloudinaryWithTransform(secureUrl: string, transform: string) {
  // injeta logo após "/upload/"
  return secureUrl.replace('/upload/', `/upload/${transform}/`);
}

export function cloudinaryAvatarThumb(secureUrl: string, size: number) {
  const t = `c_fill,g_face,w_${size},h_${size},f_auto,q_auto`;
  return cloudinaryWithTransform(secureUrl, t);
}

export async function uploadToCloudinaryUnsigned(
  file: FormImageFile,
  opts: { cloudName: string; uploadPreset: string; folder?: string },
) {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
  form.append('upload_preset', opts.uploadPreset);
  if (opts.folder) form.append('folder', opts.folder);

  const url = `https://api.cloudinary.com/v1_1/${opts.cloudName}/image/upload`;

  const resp = await fetch(url, { method: 'POST', body: form });
  const json = await resp.json();

  if (!resp.ok) {
    throw new Error(json?.error?.message ?? 'Falha ao enviar imagem para Cloudinary');
  }

  return {
    secureUrl: json.secure_url as string,
    publicId: json.public_id as string,
    format: json.format as string | undefined,
  };
}
