import { StyleSheet } from 'react-native';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import { useFormContext } from 'react-hook-form';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import ControlledFancyDropDown from '../../../forms/ControlledFancyDropDown';
import { MinisterioStatusEnum, MinisterioStatusLabel, MinisterioTipoEnum, MinisterioTipoLabel } from '../../../../domain/models/Ministerio';
import FancyScrollView from '../../../FancyScrollView';
import { MinisterioFormData } from '../../../../app/(app)/(drawer)/admin/ministerios/add';
import { EnumUtils } from '../../../../utils/enum_utils';
import ControlledFancyToggle from '../../../forms/ControlledFancyToggle';
import FancyImagePicker from '../../../images/FancyImagePicker';
import { ImageUtils } from '../../../../utils/image_utils';

export default function DadosTab(props: { mode: 'add' } | { mode: 'edit'; id: string }) {
  const { watch, control, setValue } = useFormContext<MinisterioFormData>();
  const logoWatch = watch('logo');

  return (
    <FancyScrollView contentContainerStyle={styles.fieldsContainer}>
      <FancyImagePicker
        value={logoWatch}
        onChange={image => {
          setValue('logo', image && image?.base64 ? ImageUtils.stringToBase64(image.base64) : undefined);
          setValue('uploadLogo', image?.uri);
        }}
      />
      <ControlledTextInput control={control} name="nome" label="Nome" />
      <ControlledFancyDropDown
        control={control}
        name="tipo"
        label="Tipo"
        disabled={props.mode === 'edit'}
        listItems={EnumUtils.getDropDownItems(MinisterioTipoEnum, MinisterioTipoLabel)}
      />
      <ControlledTextArea control={control} name="descricao" label="Descrição" />
      <ControlledFancyToggle
        control={control}
        name="status"
        label="Status"
        option1={{
          title: MinisterioStatusLabel[MinisterioStatusEnum.Ativo],
          value: MinisterioStatusEnum.Ativo,
        }}
        option2={{
          title: MinisterioStatusLabel[MinisterioStatusEnum.Inativo],
          value: MinisterioStatusEnum.Inativo,
        }}
      />
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  fieldsContainer: { width: '100%', gap: 15, flex: 1 },
});
