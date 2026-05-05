import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useFormContext } from 'react-hook-form';
import { EscalaTemplateVoluntarioFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { View } from 'react-native';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useMemo } from 'react';

type TemplateFixoEquipeFormProps = FancyModalDialogProps<void> & {
  voluntarioList?: DropDownItemProps<string>[];
  funcoesList?: DropDownItemProps<string>[];
};

export default function TemplateFixoEquipeForm({ voluntarioList, funcoesList, ...props }: TemplateFixoEquipeFormProps) {
  const { control } = useFormContext<EscalaTemplateVoluntarioFormData>();
  const sortedVoluntarioList = useMemo(
    () =>
      [...(voluntarioList ?? [])].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'pt-BR', {
          sensitivity: 'base',
        }),
      ),
    [voluntarioList],
  );
  const sortedFuncoesList = useMemo(
    () =>
      [...(funcoesList ?? [])].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'pt-BR', {
          sensitivity: 'base',
        }),
      ),
    [funcoesList],
  );

  return (
    <FancyModalDialog {...props} title='Adicionar Voluntário' onButton2Press={props.onButton2Press}>
      <View style={{ gap: 15 }}>
        <ControlledDropDown
          control={control}
          name='voluntarioId'
          label='Voluntário'
          listItems={sortedVoluntarioList}
          renderMode='modal'
        />
        <ControlledDropDown control={control} name='funcaoId' label='Função' listItems={sortedFuncoesList} renderMode='modal' />
      </View>
    </FancyModalDialog>
  );
}
