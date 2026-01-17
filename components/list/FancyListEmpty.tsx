import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';

export type FancyListEmptyProps = {
  label?: string;
  labelColor?: string;
  icon?: CustomIconProps;
};

export default function FancyListEmpty(props: FancyListEmptyProps) {
  return (
    <View style={styles.container}>
      <DefaultIcons.Custom
        library={props.icon?.library || 'FontAwesome6'}
        name={props.icon?.name || 'robot'}
        size={props.icon?.size || 55}
        color={props.icon?.color || Pallete.fonts.inactive2}
      />
      <FancyText size={'large'} type='bold' color={props.labelColor || Pallete.fonts.inactive2}>
        {props.label || 'Não há nada por aqui...'}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    opacity: 0.4,
  },
});
