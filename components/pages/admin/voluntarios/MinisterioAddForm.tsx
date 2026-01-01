import { useMemo } from 'react';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useMinisteriosCrud } from '../../../../hooks/useMinisteriosCrud';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { HierarquiaEnum, HierarquiaEnumLabel, MinisterioVoluntarioModel } from '../../../../domain/models/MinisterioVoluntario';
import { View } from 'react-native';

const schema = z.object({
  ministerioVoluntarioId: z.string().optional(),
  ministerioId: z.string('Campo Obrigatório'),
  hierarquia: z.enum(HierarquiaEnum, 'Campo Obrigatório'),
});
export type MinisterioAddFormData = z.infer<typeof schema>;

export default function MinisterioAddForm(
  props: {
    ministerios: MinisterioVoluntarioModel[] | null | undefined;
    mode: 'add' | 'edit';
    defaultValues?: MinisterioAddFormData;
  } & FancyModalDialogProps<MinisterioAddFormData & { mode: 'add' | 'edit' }>
) {
  const { data: ministeriosData, isLoading } = useMinisteriosCrud({ autoFetch: true });

  const ministeriosList = useMemo<DropDownItemProps<string>[]>(() => {
    const list =
      ministeriosData
        ?.filter(ministerio => props.mode === 'edit' || !props.ministerios?.some(mv => mv.ministerio?.id! === ministerio.id))
        .map(
          ministerio =>
            ({
              title: ministerio.nome,
              value: ministerio.id,
              left: { type: 'image', source: ministerio.logo },
            } as DropDownItemProps<string>)
        ) || [];

    return list;
  }, [ministeriosData]);

  const form = useForm({ resolver: zodResolver(schema), defaultValues: props.defaultValues });

  return (
    <FancyModalDialog
      {...props}
      onButton2Press={() => form.handleSubmit(data => props.onButton2Press?.({ ...data, mode: props.mode }))()}
      centerContainerStyle={{ minHeight: isLoading ? 100 : undefined, justifyContent: 'center' }}
      button2={{ disabled: isLoading }}
    >
      <View style={{ gap: 15 }}>
        <ControlledDropDown
          label="Ministério"
          listItems={ministeriosList}
          control={form.control}
          name="ministerioId"
          disabled={props.mode === 'edit'}
          isLoading={isLoading}
        />
        <ControlledDropDown
          label="Função"
          listItems={[
            { title: HierarquiaEnumLabel[HierarquiaEnum.Lider], value: HierarquiaEnum.Lider },
            { title: HierarquiaEnumLabel[HierarquiaEnum.Voluntario], value: HierarquiaEnum.Voluntario },
          ]}
          control={form.control}
          name="hierarquia"
        />
      </View>
    </FancyModalDialog>
  );
}
