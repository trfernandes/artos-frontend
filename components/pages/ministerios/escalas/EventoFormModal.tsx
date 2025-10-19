import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { EscalaEventoFormData, EscalaEventoTemplateFormData, EscalaEventoTemplateSchema } from '../../../../domain/schemas/escalaSchema';
import { format } from 'date-fns';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FancyContainerList from '../../../container_list/FancyContainerList';
import { StyleSheet } from 'react-native';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import FancyVerticalSpacer from '../../../FancyVerticalSpacer';
import { EnumUtils } from '../../../../utils/enum_utils';
import { EscalaTemplate, EscalaTemplateTipoEnum, EscalaTemplateTipoLabel } from '../../../../domain/models/EscalaTemplate';

interface DataResult {
  id: string;
}

export default function EventoFormModal({
  modalProps,
  data,
  templateSelectionList,
  templateList,
}: {
  modalProps?: FancyModalDialogProps<DataResult>;
  data?: EscalaEventoFormData;
  templateSelectionList?: DropDownItemProps<string>[];
  templateList?: EscalaTemplate[];
}) {
  const formTemplate = useForm<EscalaEventoTemplateFormData>({ resolver: zodResolver(EscalaEventoTemplateSchema) });

  // console.log('Templates', strfyObj(templateList!));

  // formTemplate.register('templateBase.id', {
  //   onChange: data => {
  //     const templateInfo = templateList?.find(t => t.id === data.target.value);

  //     console.log(
  //       'id do template mudou',
  //       `Data: ${strfyObj(data)}`,
  //       `achou template? ${templateInfo ? 'sim' : 'não'}`,
  //       `template: ${strfyObj(template)}`
  //     );

  //     if (!templateInfo) return;

  //     formTemplate.setValue('templateBase.nome', templateInfo.nome);
  //     formTemplate.setValue('templateBase.tipo', templateInfo.tipo);
  //   },
  // });

  const funcoesArray = useFieldArray({
    control: formTemplate.control,
    name: 'funcoes',
    keyName: 'funKey',
  });

  const fixosArray = useFieldArray({
    control: formTemplate.control,
    name: 'fixos',
    keyName: 'fixKey',
  });

  const templateBaseIdWatch = formTemplate.watch('templateBase.id');

  return (
    <FancyModalDialog
      {...modalProps}
      title={`${data?.nome} - ${format(data?.data!, 'dd/MM/yyyy HH:ss')}`}
      centerContainerStyle={styles.container}
    >
      <ControlledDropDown label="Template" control={formTemplate.control} name="templateBase.id" listItems={templateSelectionList} />
      <FancyVerticalSpacer height={12} />
      <ControlledDropDown
        control={formTemplate.control}
        name="tipo"
        label="Tipo"
        listItems={EnumUtils.getDropDownItems(EscalaTemplateTipoEnum, EscalaTemplateTipoLabel)}
        disabled={templateBaseIdWatch !== ''}
      />
      <FancyVerticalSpacer height={16} />
      <FancyContainerList title={'Equipe'} data={undefined} renderItem={undefined} />
    </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
  },
});
