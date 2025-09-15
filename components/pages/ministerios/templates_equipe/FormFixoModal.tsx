import FancyDropDown from '../../../fields/FancyDropDown';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { PEOPLE_DATA } from '../../admin/eventos/EventosEscalaEquipe';

export default function FormFixoModal(props: FancyModalDialogProps) {
  return (
    <FancyModalDialog {...props}>
      <FancyDropDown
        listItems={PEOPLE_DATA.map(
          (value, index) =>
            ({ title: value.nome, value: index.toString(), left: { type: 'image', url: value.image } } as DropDownItemProps)
        )}
      />
    </FancyModalDialog>
  );
}
