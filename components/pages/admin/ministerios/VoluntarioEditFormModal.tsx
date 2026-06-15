import { useEffect } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancyDropDown from '../../../fields/FancyDropDown';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import {
  VoluntarioHierarquiaEnum,
  VoluntarioHierarquiaEnumList,
} from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { EditMinisterioVoluntarioFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import { AppImages } from '../../../../assets/app_images';

const EditSchema = z.object({
  hierarquia: z.enum(VoluntarioHierarquiaEnum, { error: 'Campo Obrigatório' }),
});

export default function VoluntarioEditFormModal({
  data,
  visible,
  onClose,
  onSubmit,
}: {
  data: EditMinisterioVoluntarioFormData;
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: EditMinisterioVoluntarioFormData) => void;
}) {
  const form = useForm({
    resolver: zodResolver(EditSchema),
    defaultValues: { hierarquia: data.hierarquia },
  });

  useEffect(() => {
    if (!visible) return;
    form.reset({ hierarquia: data.hierarquia });
  }, [visible, data.hierarquia]);

  const handleConfirm = () => {
    form.handleSubmit(
      (formData) => onSubmit({ ...data, hierarquia: formData.hierarquia }),
      (error) => console.log('VoluntarioEditFormModal form error', error),
    )();
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Editar Voluntário'
      footer={<FancyButton label='Salvar' type='contained' onPress={handleConfirm} />}
    >
      <View style={{ gap: 12 }}>
        <FancyDropDown
          label='Voluntário'
          disabled
          listItems={[
            {
              title: data.voluntarioNome,
              value: data.id,
              left: {
                type: 'image',
                source:
                  data.fotoThumbUrl || data.fotoUrl
                    ? { uri: data.fotoThumbUrl || data.fotoUrl || '' }
                    : AppImages.emptyProfile,
              },
            },
          ]}
          value={data.id}
        />
        <ControlledDropDown
          label='Função'
          control={form.control}
          name='hierarquia'
          listItems={VoluntarioHierarquiaEnumList}
        />
      </View>
    </FancyBottomSheetModal>
  );
}
