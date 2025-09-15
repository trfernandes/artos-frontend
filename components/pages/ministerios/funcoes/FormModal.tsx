import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import FancyTextInput from '../../../fields/FancyTextInput';

export default function FormModal(props: FancyModalDialogProps) {
  return (
    <FancyModalDialog {...props}>
      <FancyTextInput label="Nome" />
    </FancyModalDialog>
  );
}
