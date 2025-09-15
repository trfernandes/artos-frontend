import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TabItem } from './FancyTabs';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { Pallete } from '../../constants/colors';

export type FancyTabHeaderItemProps = {
  status: 'active' | 'inactive';
  onPress?: () => void;
} & TabItem;

export default function FancyTabHeaderItem({
  status = 'active',
  ...props
}: FancyTabHeaderItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        status === 'active' ? styles.containerActive : styles.containerInactive,
      ]}
      onPress={props.onPress}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {props.icon && (
          <View style={styles.iconContainer}>
            <DefaultIcons.Custom
              {...props.icon}
              size={props.icon.size || 18}
              color={
                props.icon.color || status === 'active'
                  ? Pallete.fonts.light
                  : Pallete.fonts.inactive
              }
            />
          </View>
        )}
        <View style={styles.titleContaner}>
          <FancyText
            type={status === 'active' ? 'semiBold' : 'semiBoldItalic'}
            size={'extraSmall'}
            style={{
              borderWidth: 0,
              lineHeight: 17,
              color: status === 'active' ? Pallete.fonts.light : Pallete.fonts.inactive,
            }}
          >
            {props.title}
          </FancyText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    flex: 1,
    gap: 6,
  },
  containerActive: { backgroundColor: Pallete.primary },
  containerInactive: {
    borderWidth: 0.2,
    borderColor: Pallete.border,
    backgroundColor: Pallete.backgroundColor2,
  },
  iconContainer: { borderWidth: 0, justifyContent: 'center', width: 20, alignItems: 'center' },
  titleContaner: { borderWidth: 0, justifyContent: 'center' },
});
