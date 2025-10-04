import { useFormContext } from 'react-hook-form';
import { View } from 'react-native';
import { EscalaTemplateFuncaoFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import { useCallback, useMemo } from 'react';
import { EnumUtils } from '../../../../utils/enum_utils';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../domain/models/EscalaTemplate';

type TemplateFuncoesFormProps = FancyModalDialogProps<void> & {
  voluntarioList?: DropDownItemProps<string>[];
  funcoesList?: DropDownItemProps<string>[];
};

export default function TemplateFuncoesForm({
  voluntarioList,
  funcoesList,
  ...props
}: TemplateFuncoesFormProps) {
  const { control, handleSubmit } = useFormContext<EscalaTemplateFuncaoFormData>();
  const experiencaList = useMemo<DropDownItemProps<EscalaTemplateExperienciaEnum>[]>(() => {
    return EnumUtils.getDropDownItems(
      EscalaTemplateExperienciaEnum,
      EscalaTemplateExperienciaLabel
    ).sort(
      (a, b) => Number(a.value) - Number(b.value)
    ) as DropDownItemProps<EscalaTemplateExperienciaEnum>[];
  }, []);

  const handleConfirm = useCallback(
    handleSubmit(
      _ => {
        props.onConfirm?.();
      },
      errors => console.log('Erros do Funcoes Form', JSON.stringify(errors))
    ),
    [props]
  );

  return (
    <FancyModalDialog {...props} title="Adicionar Função" onConfirm={handleConfirm}>
      <View style={{ gap: 15 }}>
        <ControlledDropDown
          control={control}
          name="funcaoId"
          label="Função"
          listItems={funcoesList}
        />
        <ControlledTextInput
          inputProps={{ textAlign: 'right' }}
          control={control}
          name="quantidade"
          label="Quantidade"
        />
        <ControlledDropDown
          control={control}
          name="experiencia"
          label="Experiência"
          listItems={experiencaList}
        />
      </View>
    </FancyModalDialog>
  );
}
