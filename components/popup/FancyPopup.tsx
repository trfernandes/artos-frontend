import { ReactNode } from 'react';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { Menu, MenuOption, MenuOptions, MenuProps, MenuTrigger } from 'react-native-popup-menu';
import { StyleSheet, View } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';

type Item = {
  icon?: CustomIconProps;
  label: string;
  onPress?: () => void;
};

export type FancyPopupProps = {
  items?: Item[];
  showSeparator?: boolean;
  triggerComponent?: ReactNode;
  menuProps?: MenuProps;
  disabled?: boolean;
};

export default function FancyPopup({
  items,
  showSeparator = false,
  triggerComponent,
  menuProps,
  disabled = false,
}: FancyPopupProps) {
  return (
    <Menu {...menuProps}>
      <MenuTrigger disabled={disabled}>{triggerComponent}</MenuTrigger>
      <MenuOptions optionsContainerStyle={styles.menuContainer}>
        <View style={{}}>
          {items?.map((item, index) => (
            <View
              key={index}
              style={{
                borderColor: Pallete.disabled,
                borderBottomWidth: showSeparator && index < items.length - 1 ? 0.2 : 0,
              }}
            >
              <MenuOption
                key={index}
                onSelect={item.onPress}
                customStyles={{ optionWrapper: { borderWidth: 0, paddingVertical: 8 } }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                  }}
                >
                  {item.icon && (
                    <DefaultIcons.Custom
                      {...item.icon}
                      size={item.icon.size || 20}
                      color={item.icon.color || Pallete.fonts.dark}
                    />
                  )}
                  <FancyText size={'small'} type={'medium'} style={styles.optionText}>
                    {item.label}
                  </FancyText>
                </View>
              </MenuOption>
            </View>
          ))}
        </View>
      </MenuOptions>
    </Menu>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Pallete.border,
    ...Pallete.shadows[200],
  },
  menuOption: {},
  optionText: { borderWidth: 0, lineHeight: 15 },
});
