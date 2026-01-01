import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledToggle from '../../../forms/ControlledFancyToggle';
import { View } from 'react-native';
import { useEffect, useMemo } from 'react';
import { MinisterioFuncaoModel, MinisterioFuncaoStatusEnum } from '../../../../domain/models/MinisterioFuncao';

const schema = z.object({
    id: z.uuid().optional(),
    nome: z.string('Campo Obrigatório'),
    descricao: z.string().optional(),
    status: z.enum(MinisterioFuncaoStatusEnum).optional(),
});

export default function FuncaoFormModal(
    props: FancyModalDialogProps<{ mode: 'add' | 'edit'; data: MinisterioFuncaoModel }> & {
        ministerioId: string;
    } & {
        mode: 'add' | 'edit';
        editValues: MinisterioFuncaoModel;
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
            reset({ id: props.editValues?.id, nome: props.editValues.nome, descricao: props.editValues.descricao, status: props.editValues.status });
        } else if (props.mode === 'add') {
            reset({ id: undefined, nome: '', descricao: '', status: MinisterioFuncaoStatusEnum.Ativo });
        }
    }, [props.mode, props.editValues]);

    const handleConfirm = useMemo(
        () =>
            handleSubmit(async (data) => {
                props.onButton2Press?.({
                    mode: props.mode,
                    data: {
                        ...data,
                        status: data.status!,
                        ministerioId: props.ministerioId,
                    },
                });
            }),
        [props],
    );

    return (
        <FancyModalDialog {...props} onButton2Press={handleConfirm}>
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
