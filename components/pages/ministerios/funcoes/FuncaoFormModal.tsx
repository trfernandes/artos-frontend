import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledToggle from '../../../forms/ControlledFancyToggle';
import { View } from 'react-native';
import { useEffect, useMemo } from 'react';
import { MinisterioFuncaoStatusEnum } from '../../../../domain/enums/MinisterioFuncao/ministerio-funcao-status.enum';
import { ResponseMinisterioFuncaoDto } from '../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.response';
import { CreateMinisterioFuncaoDto } from '../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.create';
import { UpdateMinisterioFuncaoDto } from '../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.update';
import { strfyObj } from '../../../../utils/text_utils';

const schema = z.object({
  id: z.uuid().optional(),
  nome: z.string('Campo Obrigatório'),
  descricao: z.string().optional(),
  status: z.enum(MinisterioFuncaoStatusEnum).optional(),
});

export default function FuncaoFormModal(
  props: FancyModalDialogProps<{
    mode: 'add' | 'edit';
    data: CreateMinisterioFuncaoDto | UpdateMinisterioFuncaoDto;
  }> & {
    ministerioId: string;
  } & {
    mode: 'add' | 'edit';
    editValues?: ResponseMinisterioFuncaoDto;
  },
) {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!props.editValues) {
      return;
    }

    if (props.mode === 'edit') {
      reset({
        id: props.editValues?.id,
        nome: props.editValues.nome,
        descricao: props.editValues.descricao || '',
        status: props.editValues.status,
      });
    } else if (props.mode === 'add') {
      reset({ id: undefined, nome: '', descricao: '', status: MinisterioFuncaoStatusEnum.Ativo });
    }
  }, [props.mode, props.editValues]);

  const handleConfirm = useMemo(
    () =>
      handleSubmit(
        async (data) => {
          props.onButton2Press?.({
            mode: props.mode,
            data,
          });
        },
        (errors) => console.log('Erros do Função Form', strfyObj(errors)),
      ),
    [props],
  );

  return (
    <FancyModalDialog {...props} avoidKeyboard onButton2Press={handleConfirm}>
      <View style={{ gap: 15 }}>
        <ControlledTextInput control={control} name='nome' label='Nome' />
        <ControlledTextArea control={control} name='descricao' label='Descrição' />
        {props.mode === 'edit' && (
          <ControlledToggle
            control={control}
            name='status'
            label='Status'
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
