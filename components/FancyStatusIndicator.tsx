import { View } from 'react-native';
import DefaultIcons from './FancyIcons';
import FancyText from './FancyText';
import { Pallete } from '../constants/colors';

export default function FancyStatusIndicator({ value, label }: { value: boolean; label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 0,
        paddingTop: 2,
      }}
    >
      <DefaultIcons.Custom
        library={'Octicons'}
        name={'dot-fill'}
        color={value ? 'forestgreen' : 'indianred'}
        size={12}
        style={{
          borderWidth: 0,
          height: 11,
          justifyContent: 'flex-start',
          lineHeight: 10.5,
        }}
      />
      <FancyText
        size={'extraSmall'}
        type="semiBold"
        color={Pallete.fonts.inactive}
        style={{ lineHeight: 10, borderWidth: 0, height: 11 }}
      >
        {label}
      </FancyText>
    </View>
  );
}
