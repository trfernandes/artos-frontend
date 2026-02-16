import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { AddLiderSchema, AddLiderFormData, AddMinisterioFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import ControlledBottomSheetSelect from '../../../forms/ControlledBottomSheetSelect';
import { useVoluntariosCrud } from '../../../../hooks/useVoluntariosCrud';
import { useCallback, useMemo } from 'react';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { VoluntarioHierarquiaLideresEnumList } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { OrderDirection } from '../../../../domain/utils/query_utils';
import { AppImages } from '../../../../assets/app_images';

export default function AddLiderancaFormModal(props: {} & FancyModalDialogProps<AddLiderFormData>) {
  const mainForm = useFormContext<AddMinisterioFormData>();
  const lideresForm = useFieldArray({
    control: mainForm.control,
    name: 'voluntarios',
    keyName: 'fieldId',
  });
  const form = useForm<AddLiderFormData>({ resolver: zodResolver(AddLiderSchema) });

  const { data } = useVoluntariosCrud({ autoFetch: true, initialParams: { orderBy: [{ path: 'nome', direction: OrderDirection.ASC }] } });

  const voluntariosDropDownList = useMemo<DropDownItemProps<string>[]>(() => {
    return (
      data
        ?.filter((v) => lideresForm.fields.some((l) => l.voluntarioId === v.id) === false)
        .map(
          (v) =>
            ({
              title: v.nome,
              value: v.id,
              left: {
                type: 'image',
                source: v.fotoUrl || v.fotoThumbUrl ? { uri: v.fotoUrl || v.fotoThumbUrl || '' } : AppImages.emptyProfile,
              },
            } as DropDownItemProps<string>),
        ) || []
    );
  }, [data, lideresForm.fields]);

  const onSubmit = useCallback(() => {
    form.handleSubmit(
      (formData) => {
        props.onButton2Press?.(formData);
      },
      (errors) => console.log(errors),
    )();
  }, [props.onButton2Press, mainForm, lideresForm.append, lideresForm.fields]);

  return (
    <FancyModalDialog {...props} title='Adicionar Líder' centerContainerStyle={{ gap: 15 }} onButton2Press={onSubmit}>
      <ControlledSearchSelect
        control={form.control}
        name='voluntarioId'
        label='Voluntário:'
        searchPlaceholder='Buscar voluntário...'
        listItems={voluntariosDropDownList}
        onChange={(data) => {
          const nome = voluntariosDropDownList.find((v) => v.value === data)?.title || '';
          form.setValue('voluntarioNome', nome);
        }}
      />
      <ControlledBottomSheetSelect control={form.control} name='hierarquia' label='Função:' listItems={VoluntarioHierarquiaLideresEnumList} />
    </FancyModalDialog>
  );
}
