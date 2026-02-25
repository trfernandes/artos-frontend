import { ReactNode } from 'react';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { Menu, MenuOption, MenuOptions, MenuProps, MenuTrigger } from 'react-native-popup-menu';
import { StyleSheet, View } from 'react-native';
import { ThemePalette } from '../../constants/colors';
import FancyText from '../FancyText';
import FancySeparator from '../FancySeparator';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Item = {
  icon?: CustomIconProps;
  label: string;
  labelColor?: string;
  onPress?: () => void;
};

export type FancyPopupProps = {
  items?: Item[];
  showSeparator?: boolean;
  triggerComponent?: ReactNode;
  menuProps?: MenuProps;
  disabled?: boolean;
  title?: string;
};

export default function FancyPopup({
  items,
  showSeparator = false,
  triggerComponent,
  menuProps,
  disabled = false,
  title,
}: FancyPopupProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <Menu {...menuProps}>
      <MenuTrigger disabled={disabled}>{triggerComponent}</MenuTrigger>
      <MenuOptions optionsContainerStyle={styles.menuContainer}>
        <View>
          {title && (
            <FancyText type='mediumItalic' size='small' style={styles.popupTitle} numberOfLines={2} adjustsFontSizeToFit>
              {title}
            </FancyText>
          )}
          {items?.map((item, index) => (
            <View
              key={index}
              style={{
                borderColor: palette.disabled,
              }}
            >
              <MenuOption
                key={index}
                onSelect={item.onPress}
                customStyles={{
                  optionWrapper: {
                    borderWidth: 0,
                    minHeight: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: palette.backgroundColor2,
                    paddingVertical: 8,
                  },
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    gap: 10,
                  }}
                >
                  <View style={{ width: 20, borderWidth: 0, justifyContent: 'flex-end' }}>
                    {item.icon && (
                        <DefaultIcons.Custom
                          {...item.icon}
                          size={item.icon.size || 20}
                          color={item.icon.color || palette.fonts.dark}
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
                  <View style={{ flex: 1, borderWidth: 0 }}>
                    <FancyText
                      size={'small'}
                      type={'medium'}
                      color={item.labelColor || palette.fonts.dark}
                      style={styles.optionText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {item.label}
                    </FancyText>
                  </View>
                </View>
              </MenuOption>
              {showSeparator && index < items.length - 1 && <FancySeparator style={{ paddingVertical: 4 }} />}
            </View>
          ))}
        </View>
      </MenuOptions>
    </Menu>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    menuContainer: {
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: palette.border,
      backgroundColor: palette.backgroundColor2,
      ...palette.shadows[200],
    },
    optionText: { borderWidth: 0 },
    popupTitle: {
      marginTop: 8,
      marginBottom: 6,
      color: palette.fonts.dark,
      paddingHorizontal: 16,
      opacity: 0.8,
    },
  });
}
