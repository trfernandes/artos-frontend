import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useFormContext } from 'react-hook-form';
import { EscalaTemplateVoluntarioFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { View } from 'react-native';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';


type TemplateFixoEquipeFormProps = FancyModalDialogProps<void> & {
  voluntarioList?: DropDownItemProps<string>[];
  funcoesList?: DropDownItemProps<string>[];
};

export default function TemplateFixoEquipeForm({
  voluntarioList,
  funcoesList,
  ...props
}: TemplateFixoEquipeFormProps) {
  const { control } = useFormContext<EscalaTemplateVoluntarioFormData>();

  return (
    <FancyModalDialog {...props} title="Adicionar Voluntário" OnButton2Press={props.OnButton2Press}>
      <View style={{ gap: 15 }}>
        <ControlledDropDown
          control={control}
          name="voluntarioId"
          label="Voluntário"
          listItems={voluntarioList}
          showSelectedImage
        />
        <ControlledDropDown control={control} name="funcaoId" label="Função" listItems={funcoesList} />
      </View>
    </FancyModalDialog>
  );
}
