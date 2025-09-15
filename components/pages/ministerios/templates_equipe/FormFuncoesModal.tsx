import { FUNCOES_DATA } from '../../../../app/(app)/(drawer)/ministerios/templates_equipe/form';
import FancyDropDown from '../../../fields/FancyDropDown';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';

export default function FormFuncoesModal(props: { mode: 'add' | 'edit' } & FancyModalDialogProps) {
  return (
    <FancyModalDialog centerContainerStyle={{ gap: 15 }} {...props}>
      <FancyDropDown
        disabled={props.mode === 'edit'}
        label="Função"
        listItems={FUNCOES_DATA.map(item => ({ title: item.nome, value: item.nome }))}
      />
      <FancyTextInput label="Quantidade" inputProps={{ keyboardType: 'numeric', maxLength: 2, textAlign: 'right' }} />
    </FancyModalDialog>
  );
}
