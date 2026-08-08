import { useForm } from 'react-hook-form';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { AddLiderSchema, AddLiderFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { useVoluntariosCrud } from '../../../../hooks/useVoluntariosCrud';
import { useCallback, useMemo } from 'react';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { VoluntarioHierarquiaLideresEnumList } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { AppImages } from '../../../../assets/app_images';

export default function EditLiderancaFormModal(
  props: { data: AddLiderFormData } & FancyModalDialogProps<AddLiderFormData>,
) {
  const form = useForm<AddLiderFormData>({
    resolver: zodResolver(AddLiderSchema),
    defaultValues: props.data,
  });

  const { data } = useVoluntariosCrud({ autoFetch: true });

  const voluntariosDropDownList = useMemo<DropDownItemProps<string>[]>(() => {
    return (
      data?.map(
        (v) =>
          ({
            title: v.nome,
            value: v.id,
            left: {
              type: 'image',
              source:
                v.fotoUrl || v.fotoThumbUrl
                  ? { uri: v.fotoThumbUrl || v.fotoUrl || '' }
                  : AppImages.emptyProfile,
            },
          }) as DropDownItemProps<string>,
      ) || []
    );
  }, [data]);

  const onSubmit = useCallback(() => {
    form.handleSubmit((formData) => {
      props.onButton2Press?.(formData);
    })();
  }, [props.onButton2Press]);

  return (
    <FancyModalDialog
      {...props}
      title='Editar Líder'
      centerContainerStyle={{ gap: 15 }}
      onButton2Press={onSubmit}
    >
      <ControlledDropDown
        control={form.control}
        name='voluntarioId'
        label='Voluntário:'
        listItems={voluntariosDropDownList}
        disabled
      />
      <ControlledDropDown
        control={form.control}
        name='hierarquia'
        label='Função:'
        listItems={VoluntarioHierarquiaLideresEnumList}
      />
    </FancyModalDialog>
  );
}
