import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledToggle from '../../../forms/ControlledFancyToggle';
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

export type FuncaoFormResult = {
  mode: 'add' | 'edit';
  data: CreateMinisterioFuncaoDto | UpdateMinisterioFuncaoDto;
};

type Props = {
  visible: boolean;
  mode: 'add' | 'edit';
  editValues?: ResponseMinisterioFuncaoDto;
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (result: FuncaoFormResult) => void;
};

export default function FuncaoFormModal({
  visible,
  mode,
  editValues,
  isSaving,
  onClose,
  onSubmit,
}: Props) {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!visible) return;

    if (mode === 'edit' && editValues) {
      reset({
        id: editValues.id,
        nome: editValues.nome,
        descricao: editValues.descricao || '',
        status: editValues.status,
      });
    } else {
      reset({ id: undefined, nome: '', descricao: '', status: MinisterioFuncaoStatusEnum.Ativo });
    }
  }, [visible, mode, editValues]);

  const handleConfirm = useMemo(
    () =>
      handleSubmit(
        async (data) => onSubmit({ mode, data }),
        (errors) => console.log('Erros do Função Form', strfyObj(errors)),
      ),
    [handleSubmit, mode, onSubmit],
  );

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Função' : 'Nova Função'}
      footer={
        <FancyButton
          label={mode === 'edit' ? 'Salvar' : 'Adicionar'}
          type='contained'
          isLoading={isSaving}
          onPress={handleConfirm}
          containerStyle={{ marginBottom: 8 }}
        />
      }
    >
      <View style={{ gap: 15 }}>
        <ControlledTextInput control={control} name='nome' label='Nome' />
        <ControlledTextArea control={control} name='descricao' label='Descrição' />
        {mode === 'edit' && (
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
    </FancyBottomSheetModal>
  );
}
