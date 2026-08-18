import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import { VoluntarioHierarquiaEnum } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useIgrejaVoluntariosCrud } from '../../../../hooks/useIgrejaVoluntariosCrud';
import { OrderDirection } from '../../../../domain/utils/query_utils';
import {
  AddMinisterioVoluntarioFormData,
  AddMinisterioVoluntarioSchema,
} from '../../../../domain/schemas/ministerioAdminSchema';
import { AppImages } from '../../../../assets/app_images';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';

export default function VoluntarioAddFormModal({
  ministerioId,
  existingVoluntarios,
  visible,
  onClose,
  onSubmit,
}: {
  ministerioId: string;
  existingVoluntarios?: string[];
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AddMinisterioVoluntarioFormData) => void;
}) {
  const palette = usePallete();
  const form = useForm<AddMinisterioVoluntarioFormData>({
    resolver: zodResolver(AddMinisterioVoluntarioSchema),
    defaultValues: { hierarquia: VoluntarioHierarquiaEnum.Voluntario },
  });

  const voluntariosDoMinisterioCrud = useIgrejaVoluntariosCrud({
    autoFetch: true,
    initialParams: { orderBy: [{ path: 'nome', direction: OrderDirection.ASC }] },
  });

  useEffect(() => {
    if (!visible) return;
    form.reset({ hierarquia: VoluntarioHierarquiaEnum.Voluntario });
  }, [visible]);

  const ministerioVoluntariosDropDownList = useMemo<DropDownItemProps<string>[]>(() => {
    const existingIds = existingVoluntarios || [];
    const filteredList = voluntariosDoMinisterioCrud.data.filter(
      (item) => !existingIds.includes(item.id),
    );
    return filteredList.map(
      (item) =>
        ({
          title: item.nome,
          value: item.id,
          left: {
            type: 'image',
            source:
              item.fotoThumbUrl || item.fotoUrl
                ? { uri: item.fotoThumbUrl || item.fotoUrl || '' }
                : AppImages.emptyProfile,
          },
        }) as DropDownItemProps<string>,
    );
  }, [existingVoluntarios, voluntariosDoMinisterioCrud.data]);

  const handleConfirm = () => {
    form.handleSubmit(
      (data) => onSubmit(data),
      (errors) => console.log('VoluntarioAddFormModal form errors', errors),
    )();
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Adicionar Voluntário'
      footer={
        <FancyButton
          label='Adicionar'
          type='contained'
          isLoading={voluntariosDoMinisterioCrud.isLoadingMutation}
          onPress={handleConfirm}
        />
      }
    >
      <View style={{ gap: 12 }}>
        <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
          Mostrando voluntários que ainda não fazem parte deste ministério
        </FancyText>
        <ControlledSearchSelect
          control={form.control}
          name='voluntarioId'
          label='Voluntário'
          searchPlaceholder='Buscar voluntário...'
          listItems={ministerioVoluntariosDropDownList}
          onChange={(value) => {
            const voluntarioNome =
              voluntariosDoMinisterioCrud.data.find((v) => v.id === value)?.nome || '';
            form.setValue('voluntarioNome', voluntarioNome);
          }}
        />
      </View>
    </FancyBottomSheetModal>
  );
}
