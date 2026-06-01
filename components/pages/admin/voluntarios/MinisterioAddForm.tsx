import { useMemo } from 'react';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useMinisteriosCrud } from '../../../../hooks/useMinisteriosCrud';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { View } from 'react-native';
import { ResponseMinisterioVoluntarioDto } from '../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import {
  VoluntarioHierarquiaEnumLabel,
  VoluntarioHierarquiaEnum,
} from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';

const schema = z.object({
  ministerioVoluntarioId: z.string().optional(),
  ministerioId: z.string('Campo Obrigatório'),
  hierarquia: z.enum(VoluntarioHierarquiaEnum, 'Campo Obrigatório'),
});
export type MinisterioAddFormData = z.infer<typeof schema>;

export default function MinisterioAddForm(
  props: {
    ministerios: ResponseMinisterioVoluntarioDto[] | null | undefined;
    mode: 'add' | 'edit';
    defaultValues?: MinisterioAddFormData;
  } & FancyModalDialogProps<MinisterioAddFormData & { mode: 'add' | 'edit' }>,
) {
  const { data: ministeriosData, isLoading } = useMinisteriosCrud({ autoFetch: true });

  const ministeriosList = useMemo<DropDownItemProps<string>[]>(() => {
    const list =
      ministeriosData
        ?.filter(
          (ministerio) =>
            props.mode === 'edit' ||
            !props.ministerios?.some((mv) => mv.ministerio?.id! === ministerio.id),
        )
        .map(
          (ministerio) =>
            ({
              title: ministerio.nome,
              value: ministerio.id,
              left: {
                type: 'image',
                source: ministerio.logoThumbUrl || ministerio.logoUrl || undefined,
              },
            }) as DropDownItemProps<string>,
        ) || [];

    return list;
  }, [ministeriosData]);

  const form = useForm({ resolver: zodResolver(schema), defaultValues: props.defaultValues });

  return (
    <FancyModalDialog
      {...props}
      onButton2Press={() =>
        form.handleSubmit((data) => props.onButton2Press?.({ ...data, mode: props.mode }))()
      }
      centerContainerStyle={{ minHeight: isLoading ? 100 : undefined, justifyContent: 'center' }}
      button2={{ disabled: isLoading }}
    >
      <View style={{ gap: 15 }}>
        <ControlledDropDown
          label='Ministério'
          listItems={ministeriosList}
          control={form.control}
          name='ministerioId'
          disabled={props.mode === 'edit'}
          isLoading={isLoading}
        />
        <ControlledDropDown
          label='Função'
          listItems={[
            {
              title: VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Lider],
              value: VoluntarioHierarquiaEnum.Lider,
            },
            {
              title: VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Voluntario],
              value: VoluntarioHierarquiaEnum.Voluntario,
            },
          ]}
          control={form.control}
          name='hierarquia'
        />
      </View>
    </FancyModalDialog>
  );
}
