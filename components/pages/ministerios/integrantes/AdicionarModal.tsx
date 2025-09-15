import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import FancyDropDown from '../../../fields/FancyDropDown';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';

export interface DataType {
  foto?: string;
  nome: string;
}

interface Props {
  voluntarioList: DataType[];
}

export default function AdicionarModal(props: Props & FancyModalDialogProps) {
  return (
    <FancyModalDialog {...props}>
      <FancyDropDown
        label="Voluntário"
        listItems={props.voluntarioList.map((value, index) => {
          return { title: value.nome, value: index.toString(), left: { type: 'image', url: value.foto } } as DropDownItemProps;
        })}
      />
    </FancyModalDialog>
  );
}
