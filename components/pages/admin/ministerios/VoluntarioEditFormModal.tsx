import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import {
    VoluntarioHierarquiaEnum,
    VoluntarioHierarquiaEnumList,
    VoluntarioHierarquiaEnumMap,
} from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import FancyDropDown from '../../../fields/FancyDropDown';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { EditMinisterioVoluntarioFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import { AppImages } from '../../../../assets/app_images';

const EditSchema = z.object({
  hierarquia: z.enum(VoluntarioHierarquiaEnum, { error: 'Campo Obrigatório' }),
});

export default function VoluntarioEditFormModal({
  ministerioId,
  ...props
}: {
  ministerioId: string;
  data: EditMinisterioVoluntarioFormData;
} & FancyModalDialogProps<EditMinisterioVoluntarioFormData>) {
  const form = useForm({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      hierarquia: VoluntarioHierarquiaEnumMap[props.data.hierarquia],
    },
  });

  return (
    <FancyModalDialog
      title={'Editar Voluntário'}
      {...props}
      centerContainerStyle={{ gap: 15 }}
      onButton2Press={() => {
        form.handleSubmit(
          (data) => {
            props.onButton2Press?.({ ...props.data, hierarquia: data.hierarquia });
            form.reset();
          },
          (error) => console.log('VoluntarioEditFormModal form error', error),
        )();
      }}
    >
      <FancyDropDown
        label='Voluntário'
        disabled
        listItems={[
          {
            title: props.data.voluntarioNome,
            value: props.data.id,
            left: {
              type: 'image',
              source:
                props.data.fotoThumbUrl || props.data.fotoUrl ? { uri: props.data.fotoThumbUrl || props.data.fotoUrl || '' } : AppImages.emptyProfile,
            },
          },
        ]}
        value={props.data.id}
      />
      <ControlledDropDown label='Função' control={form.control} name='hierarquia' listItems={VoluntarioHierarquiaEnumList} />
    </FancyModalDialog>
  );
}
