import { useFormContext } from 'react-hook-form';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { MinVoluntarioFuncaoFormData } from '../../../../domain/schemas/ministerioVoluntariosSchema';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useMemo } from 'react';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../domain/models/EscalaTemplate';
import { EnumUtils } from '../../../../utils/enum_utils';

interface IntegranteFormModalProps {
  funcoesDropDownList?: DropDownItemProps<string>[];
  mode: 'add' | 'edit';
}

export default function IntegranteFormModal(
  props: IntegranteFormModalProps & FancyModalDialogProps<string>
) {
  const { control } = useFormContext<MinVoluntarioFuncaoFormData>();

  const experiencaList = useMemo<DropDownItemProps<EscalaTemplateExperienciaEnum>[]>(() => {
    return EnumUtils.getDropDownItems(
      EscalaTemplateExperienciaEnum,
      EscalaTemplateExperienciaLabel
    ).sort(
      (a, b) => Number(a.value) - Number(b.value)
    ) as DropDownItemProps<EscalaTemplateExperienciaEnum>[];
  }, []);

  return (
    <FancyModalDialog centerContainerStyle={{ gap: 15 }} {...props}>
      <ControlledDropDown
        name="id"
        label="Função"
        control={control}
        listItems={props.funcoesDropDownList}
        disabled={props.mode === 'edit'}
      />
      <ControlledDropDown
        control={control}
        name="experiencia"
        label="Experiência"
        listItems={experiencaList}
      />
    </FancyModalDialog>
  );
}
