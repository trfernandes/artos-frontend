import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledToggle from '../../../forms/ControlledFancyToggle';
import { View } from 'react-native';
import { useEffect, useMemo } from 'react';
import { MinisterioFuncao, MinisterioFuncaoStatusEnum } from '../../../../domain/models/MinisterioFuncao';

const schema = z.object({
  id: z.uuid().optional(),
  nome: z.string('Campo Obrigatório'),
  descricao: z.string().optional(),
  status: z.enum(MinisterioFuncaoStatusEnum).optional(),
});

export default function FuncaoFormModal(
  props: FancyModalDialogProps<{ mode: 'add' | 'edit'; data: MinisterioFuncao }> & {
    ministerioId: string;
  } & {
    mode: 'add' | 'edit';
    editValues: MinisterioFuncao;
  }
) {
  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (props.mode === 'edit' && props.editValues) {
      setValue('id', props.editValues.id);
      setValue('nome', props.editValues.nome);
      setValue('descricao', props.editValues.descricao ?? '');
      setValue('status', props.editValues.status);
    } else if (props.mode === 'add') {
      setValue('status', MinisterioFuncaoStatusEnum.Ativo);
    }
  }, [props.mode, props.editValues]);

  const handleConfirm = useMemo(
    () =>
      handleSubmit(async data => {
        props.onConfirm?.({
          mode: props.mode,
          data: {
            ...data,
            status: data.status!,
            ministerioId: props.ministerioId,
          },
        });
      }),
    [props]
  );

  return (
    <FancyModalDialog {...props} onConfirm={handleConfirm}>
      <View style={{ gap: 15 }}>
        <ControlledTextInput control={control} name="nome" label="Nome" />
        <ControlledTextArea control={control} name="descricao" label="Descrição" />
        {props.mode === 'edit' && (
          <ControlledToggle
            control={control}
            name="status"
            label="Status"
            option1={{
              title: 'Ativo',
              value: MinisterioFuncaoStatusEnum.Ativo,
            }}
            option2={{
              title: 'Inativo',
              value: MinisterioFuncaoStatusEnum.Inativo,
            }}
          />
        )}
      </View>
    </FancyModalDialog>
  );
}
