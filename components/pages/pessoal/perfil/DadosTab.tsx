import { View } from 'react-native';
import FancyScrollView from '../../../FancyScrollView';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyImagePicker from '../../../images/FancyImagePicker';
import { Pallete } from '../../../../constants/colors';
import { DefaultIconsNames } from '../../../../constants/icons';
import FancyFab from '../../../buttons/FancyFab';

export default function DadosTab() {
  return (
    <View style={{ flex: 1 }}>
      <FancyScrollView contentContainerStyle={{ paddingTop: 10, gap: 15 }}>
        <FancyImagePicker
          value={undefined}
          emptyImage={require('../../../../assets/images/empty_profile_image.png')}
          disabled
        />
        <FancyTextInput label="Nome" disabled />
        <FancyTextInput label="E-mail" disabled />

        <FancyTextInput label="Data de Nascimento" disabled />
        <FancyTextInput label="Endereço" disabled />
      </FancyScrollView>
      <FancyFab right={0} icon={{ ...DefaultIconsNames.edit, size: 30 }} backgroundColor={Pallete.primary} />
    </View>
  );
}
