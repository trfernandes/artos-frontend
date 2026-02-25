import { useFormContext } from 'react-hook-form';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { MinVoluntarioFuncaoFormData } from '../../../../domain/schemas/ministerioVoluntariosSchema';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useMemo } from 'react';
import { EnumUtils } from '../../../../utils/enum_utils';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import ControlledBottomSheetSelect from '../../../forms/ControlledBottomSheetSelect';

interface IntegranteFormModalProps {
  funcoesDropDownList?: DropDownItemProps<string>[];
  mode: 'add' | 'edit';
}

export default function IntegranteFormModal(
  props: IntegranteFormModalProps & FancyModalDialogProps<string>,
) {
  const { control } = useFormContext<MinVoluntarioFuncaoFormData>();

  const experiencaList = useMemo<DropDownItemProps<EscalaTemplateExperienciaEnum>[]>(() => {
    return EnumUtils.getDropDownItems(
      EscalaTemplateExperienciaEnum,
      EscalaTemplateExperienciaLabel,
    ).sort(
      (a, b) => Number(a.value) - Number(b.value),
    ) as DropDownItemProps<EscalaTemplateExperienciaEnum>[];
  }, []);

  return (
    <FancyModalDialog centerContainerStyle={{ gap: 15 }} {...props}>
      <ControlledSearchSelect
        name='id'
        label='Função'
        control={control}
        listItems={props.funcoesDropDownList}
        disabled={props.mode === 'edit'}
        searchPlaceholder='Buscar função...'
      />
      <ControlledBottomSheetSelect
        control={control}
        name='experiencia'
        label='Experiência'
        listItems={experiencaList}
      />
    </FancyModalDialog>
  );
}
