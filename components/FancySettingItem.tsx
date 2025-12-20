import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Pallete } from '../constants/colors';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import FancyText from './FancyText';
import FancyPopup from './popup/FancyPopup';

export type SettingItemProps = {
  label: string;
  icon?: CustomIconProps;
  children?: React.ReactNode;
  value?: string;
  rightComponent?: React.ReactNode;
  options: { label: string; onPress?: () => void }[];
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FancySettingItem({
  icon,
  label,
  children,
  options,
  value,
  rightComponent,
  disabled = false,
  containerStyle,
}: SettingItemProps) {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled, containerStyle]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {icon && <DefaultIcons.Custom size={16} color={Pallete.fonts.inactive} {...icon} />}
          <FancyText
            size={'small'}
            type="semiBold"
            color={disabled ? Pallete.fonts.inactive2 : Pallete.fonts.inactive}
            style={{ lineHeight: 18, borderWidth: 0 }}
          >
            {label}
          </FancyText>
        </View>
        {rightComponent || (
          <FancyPopup
            disabled={disabled}
            items={options}
            triggerComponent={
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  paddingRight: 0,
                  borderRadius: 10,
                }}
              >
                <FancyText size="small" type="medium" color={Pallete.fonts.inactive}>
                  {value}
                </FancyText>
                <DefaultIcons.Custom
                  library="MaterialCommunityIcons"
                  name="unfold-more-horizontal"
                  color={Pallete.icons.inactive}
                  size={22}
                  style={{ borderWidth: 0, width: 19 }}
                />
              </View>
            }
          />
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Pallete.border,
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  header: {
    borderWidth: 0,
    borderColor: 'deepskyblue',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  containerDisabled: { backgroundColor: Pallete.backgroundColor3 },
  textDisabled: { color: Pallete.fonts.inactive2 },
});
