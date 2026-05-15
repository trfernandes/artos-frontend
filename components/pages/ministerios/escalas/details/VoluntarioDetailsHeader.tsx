import { TouchableOpacity, View } from 'react-native';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyText from '../../../../FancyText';
import FancyAvatarImage from '../../../../images/FancyImage';
import DefaultIcons from '../../../../FancyIcons';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { ResponseVoluntarioDto } from '../../../../../domain/dtos/Voluntario/voluntario.response';

export default function VoluntarioDetailsHeader({
  voluntarioInfo,
  onClose,
}: {
  voluntarioInfo: ResponseVoluntarioDto;
  onClose?: () => void;
}) {
  const Pallete = usePallete();
  return (
    <View
      style={{
        backgroundColor: Pallete.primary,
        padding: 25,
        paddingBottom: 28,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <FancyAvatarImage source={{ uri: voluntarioInfo.fotoThumbUrl || voluntarioInfo.fotoUrl || '' }} size={50} />
      <View style={{ alignItems: 'center', gap: 2 }}>
        <FancyText color={Pallete.fonts.light} size='large' type='bold' style={{ opacity: 0.9 }}>
          {voluntarioInfo.nome}
        </FancyText>
        <FancyText color={Pallete.fonts.light} size='small' type='semiBold' style={{ opacity: 0.7 }}>
          {voluntarioInfo.email}
        </FancyText>
      </View>
      <TouchableOpacity style={{ position: 'absolute', top: 15, right: 15 }} onPress={onClose}>
        <DefaultIcons.Custom {...DefaultIconsNames.cancel} size={20} color={Pallete.icons.light} />
      </TouchableOpacity>
    </View>
  );
}
