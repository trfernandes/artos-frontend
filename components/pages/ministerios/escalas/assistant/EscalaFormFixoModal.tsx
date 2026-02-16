import { useForm } from 'react-hook-form';
import { EscalaEventoTemplateFixoFormData, EscalaEventoTemplateFixoSchema } from '../../../../../domain/schemas/escalaSchema';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';
import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { strfyObj } from '../../../../../utils/text_utils';

interface EscalaFormFixoModalProps {
  mode: 'add' | 'edit';
  data?: EscalaEventoTemplateFixoFormData;
  modalProps?: FancyModalDialogProps<EscalaEventoTemplateFixoFormData>;
  funcoesSelectionList: DropDownItemProps<string>[];
  voluntariosSelectionList: DropDownItemProps<string>[];
  validateUniqueFuncaoOnVoluntario: (data: EscalaEventoTemplateFixoFormData) => boolean;
}

export default function EscalaFormFixoModal({
  modalProps,
  data,
  mode,
  funcoesSelectionList,
  voluntariosSelectionList,
  validateUniqueFuncaoOnVoluntario,
}: EscalaFormFixoModalProps) {
  const form = useForm<EscalaEventoTemplateFixoFormData>({
    resolver: zodResolver(EscalaEventoTemplateFixoSchema),
    defaultValues: data || {},
  });

  return (
    <FancyModalDialog
      {...modalProps}
      title={mode === 'add' ? 'Novo Voluntário' : 'Editar Voluntário'}
      centerContainerStyle={{ gap: 12, paddingBottom: 5, paddingHorizontal: 5 }}
      onButton2Press={() => {
        form.handleSubmit(
          (data) => {
            const isValid = validateUniqueFuncaoOnVoluntario(data);
            if (!isValid) form.setError('funcaoId', { message: 'Essa função já foi cadastrada para o usuário' });
            else modalProps?.onButton2Press?.(data);
          },
          (errors) => {
            console.log('Erro no formulário de adição de equipe', strfyObj(errors));
          },
        )();
      }}
    >
      <ControlledSearchSelect
        control={form.control}
        name='minVolId'
        label='Voluntário'
        listItems={voluntariosSelectionList}
        disabled={mode === 'edit'}
        searchPlaceholder='Buscar voluntário...'
      />
      <ControlledSearchSelect
        control={form.control}
        name='funcaoId'
        label='Função'
        listItems={funcoesSelectionList}
        searchPlaceholder='Buscar função...'
      />
    </FancyModalDialog>
  );
}
