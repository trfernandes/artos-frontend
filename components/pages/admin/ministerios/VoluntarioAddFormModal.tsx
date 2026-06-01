import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import {
  VoluntarioHierarquiaEnumLabel,
  VoluntarioHierarquiaEnumList,
} from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import ControlledBottomSheetSelect from '../../../forms/ControlledBottomSheetSelect';
import { useScreenReadyLoading } from '../../../../hooks/useScreenReadyLoading';
import { View } from 'react-native';
import FancyText from '../../../FancyText';
import { useMemo } from 'react';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useIgrejaVoluntariosCrud } from '../../../../hooks/useIgrejaVoluntariosCrud';
import { OrderDirection } from '../../../../domain/utils/query_utils';
import {
  AddMinisterioVoluntarioFormData,
  AddMinisterioVoluntarioSchema,
} from '../../../../domain/schemas/ministerioAdminSchema';
import { AppImages } from '../../../../assets/app_images';

export default function VoluntarioAddFormModal({
  ministerioId,
  ...props
}: {
  ministerioId: string;
  existingVoluntarios?: string[];
} & FancyModalDialogProps<AddMinisterioVoluntarioFormData>) {
  const form = useForm({
    resolver: zodResolver(AddMinisterioVoluntarioSchema),
  });

  const voluntariosDoMinisterioCrud = useIgrejaVoluntariosCrud({
    autoFetch: true,
    initialParams: { orderBy: [{ path: 'nome', direction: OrderDirection.ASC }] },
  });

  const dataReady =
    !voluntariosDoMinisterioCrud.isLoading && !voluntariosDoMinisterioCrud.isLoadingMutation;

  const { onLayout } = useScreenReadyLoading({
    dataReady,
    resetKey: ministerioId,
    waitTransition: true,
  });

  const ministerioVoluntariosDropDownList = useMemo<DropDownItemProps<string>[]>(() => {
    const existingIds = props.existingVoluntarios || [];
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
  }, [props.existingVoluntarios, voluntariosDoMinisterioCrud.data]);

  const hierarquiaWatch = form.watch('hierarquia');

  if (voluntariosDoMinisterioCrud.isLoading || voluntariosDoMinisterioCrud.isLoadingMutation) {
    return null;
  }

  return (
    <View onLayout={onLayout}>
      <FancyText>{VoluntarioHierarquiaEnumLabel[hierarquiaWatch]}</FancyText>
      <FancyModalDialog
        title={'Adicionar Voluntário'}
        {...props}
        centerContainerStyle={{ gap: 15 }}
        onButton2Press={() =>
          form.handleSubmit(
            (data) => {
              props.onButton2Press?.(data);
            },
            (errors) => console.log('VoluntarioAddFormModal form errors', errors),
          )()
        }
      >
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
        <ControlledBottomSheetSelect
          control={form.control}
          name='hierarquia'
          label='Função'
          listItems={VoluntarioHierarquiaEnumList}
        />
      </FancyModalDialog>
    </View>
  );
}
