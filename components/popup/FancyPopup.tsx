import { ReactNode } from 'react';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { Menu, MenuOption, MenuOptions, MenuProps, MenuTrigger } from 'react-native-popup-menu';
import { StyleSheet, View } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import FancySeparator from '../FancySeparator';

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
              }}
            >
              <MenuOption
                key={index}
                onSelect={item.onPress}
                customStyles={{ optionWrapper: { borderWidth: 0, paddingVertical: 0 } }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1, borderWidth: 0 }}>
                    <FancyText
                      size={'small'}
                      type={'medium'}
                      style={styles.optionText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {item.label}
                    </FancyText>
                  </View>
                  <View style={{ width: 20, borderWidth: 0, justifyContent: 'flex-end' }}>
                    {item.icon && (
                      <DefaultIcons.Custom
                        {...item.icon}
                        size={item.icon.size || 20}
                        color={item.icon.color || Pallete.fonts.dark}
                        style={[
                          {
                            width: 20,
                            height: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            lineHeight: 18,
                          },
                          item.icon.style,
                        ]}
                      />
                    )}
                  </View>
                </View>
              </MenuOption>
              {showSeparator && index < items.length - 1 && <FancySeparator style={{ paddingVertical: 8 }} />}
            </View>
          ))}
        </View>
      </MenuOptions>
    </Menu>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Pallete.border,
    ...Pallete.shadows[200],
  },
  menuOption: {},
  optionText: { borderWidth: 0, lineHeight: 15, flex: 1 },
});
