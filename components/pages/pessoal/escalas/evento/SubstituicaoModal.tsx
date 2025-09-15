import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import FancyDropDown from '../../../../fields/FancyDropDown';
import { PEOPLE_DATA } from '../../../admin/eventos/EventosEscalaEquipe';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';

export default function SubstituicaoModal(props: Omit<FancyModalDialogProps, 'title'>) {
  return (
    <FancyModalDialog title="Solicitar Substituição" {...props}>
      <FancyDropDown
        label="Voluntário"
        placeholder="Selecione o voluntário que irá o substituir"
        listItems={PEOPLE_DATA.map((value, index) => {
          return { title: value.nome, value: index.toString(), left: { type: 'image', url: value.image } } as DropDownItemProps;
        })}
      />
    </FancyModalDialog>
  );
}
