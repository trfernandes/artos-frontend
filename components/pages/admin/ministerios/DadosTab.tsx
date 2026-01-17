import { StyleSheet } from 'react-native';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import { useFormContext } from 'react-hook-form';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledDropDown from '../../../forms/ControlledDropDown';

import FancyScrollView from '../../../FancyScrollView';
import { EnumUtils } from '../../../../utils/enum_utils';
import { MinisterioTipoEnum, MinisterioTipoLabel } from '../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { ControlledImagePicker } from '../../../forms/ControlledImagePicker';
import { AddMinisterioFormData } from '../../../../domain/schemas/ministerioAdminSchema';

export default function DadosTab(props: { mode: 'add' } | { mode: 'edit'; id: string }) {
  const { control, setValue } = useFormContext<AddMinisterioFormData>();

  return (
    <FancyScrollView contentContainerStyle={styles.fieldsContainer}>
      <ControlledImagePicker control={control} name='logoThumbUrl' uploadFieldName='logoUpload' setValue={setValue as any} />
      <ControlledTextInput control={control} name='nome' label='Nome' />
      <ControlledDropDown
        control={control}
        name='tipo'
        label='Tipo'
        disabled={props.mode === 'edit'}
        listItems={EnumUtils.getDropDownItems(MinisterioTipoEnum, MinisterioTipoLabel)}
      />
      <ControlledTextArea control={control} name='descricao' label='Descrição' />
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  fieldsContainer: { width: '100%', gap: 15, flex: 1 },
});
