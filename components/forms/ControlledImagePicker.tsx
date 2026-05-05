import { Control, Controller, FieldValues, Path, UseFormSetValue } from 'react-hook-form';
import FancyImagePicker from '../images/FancyImagePicker';
import * as ImagePicker from 'expo-image-picker';

export type FormImageFile = {
  uri: string;
  name: string;
  type: string;
};

type ControlledFancyImagePickerProps<FormData extends FieldValues> = {
  control: Control<FormData>;
  name: Path<FormData>; // string (fotoUrl preview)
  setValue: UseFormSetValue<FormData>;
  uploadFieldName?: Path<FormData>; // FormImageFile | null
};

const assetToFormFile = (asset: ImagePicker.ImagePickerAsset): FormImageFile => {
  const uri = asset.uri;

  const ext = uri.split('.').pop()?.toLowerCase();
  const name = asset.fileName ?? `foto_${Date.now()}.${ext || 'jpg'}`;

  const type = asset.mimeType ?? (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');

  return { uri, name, type };
};

export function ControlledImagePicker<FormData extends FieldValues>({
  control,
  name,
  setValue,
  uploadFieldName,
}: ControlledFancyImagePickerProps<FormData>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FancyImagePicker
          value={field.value as any}
          onChange={(asset) => {
            if (!asset) {
              field.onChange(null);

              if (uploadFieldName) {
                setValue(uploadFieldName, null as any, { shouldDirty: true, shouldValidate: true });
              }
              return;
            }

            // 1) Preview: string
            field.onChange(asset.uri);

            // 2) Upload file: objeto
            if (uploadFieldName) {
              const file = assetToFormFile(asset);
              setValue(uploadFieldName, file as any, { shouldDirty: true, shouldValidate: true });
            }
          }}
        />
      )}
    />
  );
}
