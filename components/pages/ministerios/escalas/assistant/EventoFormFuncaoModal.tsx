import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledDropDown from '../../../../forms/ControlledDropDown';
import { EnumUtils } from '../../../../../utils/enum_utils';
import ControlledTextInput from '../../../../forms/ControlledTextInput';
import { EscalaEventoTemplateFuncaoFormData, EscalaEventoTemplateFuncaoSchema } from '../../../../../domain/schemas/escalaSchema';
import { strfyObj } from '../../../../../utils/text_utils';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';

export interface EventoFormFuncaoModalProps {
  mode: 'add' | 'edit';
  data?: EscalaEventoTemplateFuncaoFormData;
  modalProps?: FancyModalDialogProps<EscalaEventoTemplateFuncaoFormData>;
  funcoesSelectionList: DropDownItemProps<string>[];
}

export default function EventoFormFuncaoModal({ mode, data, modalProps, funcoesSelectionList }: EventoFormFuncaoModalProps) {
  const form = useForm<EscalaEventoTemplateFuncaoFormData>({
    resolver: zodResolver(EscalaEventoTemplateFuncaoSchema),
    defaultValues: data || { quantidade: 1 },
  });

  return (
    <FancyModalDialog
      {...modalProps}
      title={mode === 'add' ? 'Nova Função' : 'Editar Função'}
      centerContainerStyle={{ gap: 12, paddingBottom: 5, paddingHorizontal: 5 }}
      onButton2Press={() => {
        form.handleSubmit(
          (data) => {
            modalProps?.onButton2Press?.(data);
          },
          (errors) => {
            console.log('Erro no formulário de adição de equipe', strfyObj(errors));
          },
        )();
      }}
    >
      <ControlledDropDown
        control={form.control}
        name='funcaoId'
        listItems={funcoesSelectionList}
        label='Função'
        disabled={mode === 'edit'}
      />
      <ControlledDropDown
        control={form.control}
        name='experiencia'
        label='Experiência'
        listItems={EnumUtils.getDropDownItems(EscalaTemplateExperienciaEnum, EscalaTemplateExperienciaLabel)}
      />
      <ControlledTextInput
        control={form.control}
        name='quantidade'
        label='Quantidade'
        inputProps={{ textAlign: 'right', keyboardType: 'numeric', maxLength: 2 }}
      />
    </FancyModalDialog>
  );
}
