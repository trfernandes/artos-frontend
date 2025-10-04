import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useVoluntariosCrud } from '../../../../hooks/useVoluntariosCrud';
import { useMemo } from 'react';
import FancyLoading from '../../../FancyLoading';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { zodResolver } from '@hookform/resolvers/zod';
import { Voluntario } from '../../../../domain/models/Voluntario';

export const addIntegranteSchema = z.object({
  id: z.uuid('Campo obrigatório'),
});

export default function AddIntegranteModal(
  props: FancyModalDialogProps<Voluntario> & {
    ministerioId?: string;
  }
) {
  const params = useMemo(() => {
    return {
      where: {
        conditions: [],
      },
    };
  }, []);

  const { data: voluntarioList, isLoading } = useVoluntariosCrud({
    autoFetch: true,
    initialParams: params,    
  });

  const { control, handleSubmit } = useForm({ resolver: zodResolver(addIntegranteSchema) });

  const handleConfirm = useMemo(
    () =>
      handleSubmit(data => {
        const selectedVoluntario = voluntarioList?.find(vol => vol.id === data.id);
        if (selectedVoluntario) {
          props.onConfirm?.(selectedVoluntario);
        }
      }),
    [props]
  );

  if (isLoading) return <FancyLoading />;

  return (
    <FancyModalDialog {...props} onConfirm={handleConfirm} onClose={props.onClose}>
      <ControlledDropDown
        control={control}
        name="id"
        label="Voluntário"
        listItems={voluntarioList.map(
          vol =>
            ({
              title: vol.nome,
              value: vol.id,
              left: {
                type: 'image',
                source: vol.foto ? vol.foto : require('../../../../assets/images/empty_profile_image.png'),
              },
            } as DropDownItemProps<string>)
        )}
      />
    </FancyModalDialog>
  );
}
