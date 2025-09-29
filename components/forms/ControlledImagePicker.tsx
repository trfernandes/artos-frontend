import { Control, Controller, FieldValues, Path, UseFormSetValue } from 'react-hook-form';
import FancyImagePicker from '../images/FancyImagePicker';
import { ImageUtils } from '../../utils/image_utils';

type ControlledFancyImagePickerProps<FormData extends FieldValues> = {
  control: Control<FormData>;
  name: Path<FormData>;
  setValue: UseFormSetValue<FormData>;
  uploadFieldName?: Path<FormData>;
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
          value={field.value}
          onChange={image => {
            // Atualiza o campo principal (base64)
            field.onChange(image?.base64 ? ImageUtils.stringToBase64(image.base64) : undefined);

            // Atualiza o campo extra (URI), se existir
            if (uploadFieldName && image?.uri) {
              setValue(uploadFieldName, image.uri as any); 
            }
          }}
        />
      )}
    />
  );
}
