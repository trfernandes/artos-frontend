import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { zodResolver } from '@hookform/resolvers/zod';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import { AddLiderFormData, AddLiderSchema } from '../../../../domain/schemas/ministerioAdminSchema';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import { AppImages } from '../../../../assets/app_images';
import { VoluntarioHierarquiaEnum } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';

type Props = FancyModalDialogProps<AddLiderFormData> & {
  volunteers: ResponseVoluntarioDto[];
};

export default function AddLiderancaFormModal({ volunteers, ...props }: Props) {
  const form = useForm<AddLiderFormData>({
    resolver: zodResolver(AddLiderSchema),
    defaultValues: { hierarquia: VoluntarioHierarquiaEnum.Lider },
  });
  const onConfirm = props.onButton2Press as ((data?: AddLiderFormData) => void) | undefined;

  const voluntariosDropDownList = useMemo<DropDownItemProps<string>[]>(
    () =>
      volunteers.map((v) => ({
        title: v.nome,
        value: v.id,
        left: {
          type: 'image',
          source:
            v.fotoThumbUrl || v.fotoUrl
              ? { uri: v.fotoThumbUrl || v.fotoUrl || '' }
              : AppImages.emptyProfile,
        } as any,
      })),
    [volunteers],
  );

  const onSubmit = useCallback(() => {
    form.handleSubmit(
      (formData) => {
        onConfirm?.({ ...formData, hierarquia: VoluntarioHierarquiaEnum.Lider });
      },
      () => {
        Toast.show({
          type: 'error',
          text1: 'Selecione um voluntário',
          text2: 'Toque em um nome da lista para continuar.',
        });
      },
    )();
  }, [form, onConfirm]);

  return (
    <FancyModalDialog
      {...props}
      title='Adicionar líder'
      centerContainerStyle={{ gap: 15 }}
      onButton2Press={onSubmit}
    >
      <ControlledSearchSelect
        control={form.control}
        name='voluntarioId'
        label='Voluntário'
        searchPlaceholder='Buscar voluntário...'
        listItems={voluntariosDropDownList}
        onChange={(value) => {
          const selected = voluntariosDropDownList.find((item) => item.value === value);
          const sourceUri = (selected?.left as any)?.source?.uri;
          const fotoUri = typeof sourceUri === 'string' ? sourceUri : null;
          form.setValue('voluntarioNome', selected?.title || '');
          form.setValue('fotoUrl', fotoUri);
          form.setValue('fotoThumbUrl', fotoUri);
          form.setValue('hierarquia', VoluntarioHierarquiaEnum.Lider);
        }}
      />
    </FancyModalDialog>
  );
}
