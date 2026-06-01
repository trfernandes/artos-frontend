import { useFormContext } from 'react-hook-form';
import { View } from 'react-native';
import { EscalaTemplateFuncaoFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import ControlledBottomSheetSelect from '../../../forms/ControlledBottomSheetSelect';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useCallback, useMemo } from 'react';
import { EnumUtils } from '../../../../utils/enum_utils';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import ControlledNumberInput from '../../../forms/ControlledNumberInput';

type TemplateFuncoesFormProps = FancyModalDialogProps<void> & {
  mode: 'add' | 'edit';
  voluntarioList?: DropDownItemProps<string>[];
  funcoesList?: DropDownItemProps<string>[];
};

export default function TemplateFuncoesForm({
  mode = 'add',
  voluntarioList,
  funcoesList,
  ...props
}: TemplateFuncoesFormProps) {
  const { control, handleSubmit } = useFormContext<EscalaTemplateFuncaoFormData>();
  const sortedFuncoesList = useMemo(
    () =>
      [...(funcoesList ?? [])].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'pt-BR', {
          sensitivity: 'base',
        }),
      ),
    [funcoesList],
  );

  const experiencaList = useMemo<DropDownItemProps<EscalaTemplateExperienciaEnum>[]>(() => {
    return EnumUtils.getDropDownItems(
      EscalaTemplateExperienciaEnum,
      EscalaTemplateExperienciaLabel,
    ).sort(
      (a, b) => Number(a.value) - Number(b.value),
    ) as DropDownItemProps<EscalaTemplateExperienciaEnum>[];
  }, []);

  const handleConfirm = useCallback(
    handleSubmit(
      (_) => {
        props.onButton2Press?.();
      },
      (errors) => console.log('Erros do Funcoes Form', JSON.stringify(errors)),
    ),
    [props],
  );

  return (
    <FancyModalDialog
      {...props}
      title={mode === 'add' ? 'Adicionar Função' : 'Editar Função'}
      onButton2Press={handleConfirm}
    >
      <View style={{ gap: 15 }}>
        <ControlledSearchSelect
          control={control}
          name='funcaoId'
          label='Função'
          listItems={sortedFuncoesList}
          disabled={mode === 'edit'}
          searchPlaceholder='Buscar função...'
        />
        <ControlledBottomSheetSelect
          control={control}
          name='experiencia'
          label='Experiência'
          listItems={experiencaList}
        />
        <ControlledNumberInput
          control={control}
          name='quantidade'
          title='Quantidade'
          min={1}
          max={10}
        />
      </View>
    </FancyModalDialog>
  );
}
