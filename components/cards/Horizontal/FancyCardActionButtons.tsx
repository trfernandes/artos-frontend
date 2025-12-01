import { ReactNode, isValidElement } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Pallete } from '../../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import FancyText from '../../FancyText';

interface FancyActionButtonsProps {
  actions?: ActionButtonProps | ActionButtonProps[] | ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  actionButtonContainerStyle?: StyleProp<ViewStyle>;
}

export interface ActionButtonProps {
  icon: CustomIconProps & { backgroundColor?: string };
  size?: number;
  onPress?: () => void;
  label?: string;
}

export function FancyActionButtons({ actions, actionButtonContainerStyle, containerStyle }: FancyActionButtonsProps): ReactNode {
  function generateButtonsComponent(buttons: ActionButtonProps[]): ReactNode {
    return buttons.map((item, idx) => {
      const buttonSize = item.size || 30;
      const hasLabel = Boolean(item.label);
      const iconColor = item.icon.color || Pallete.fonts.light;

      return (
        <TouchableOpacity
          onPress={item.onPress}
          key={idx}
          style={[
            styles.actionButton,
            {
              minWidth: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: item.icon.backgroundColor || Pallete.primary,
            },
            actionButtonContainerStyle,
          ]}
        >
          <View style={[styles.actionButtonContent, { borderRadius: buttonSize / 2, paddingHorizontal: hasLabel ? 10 : 0 }]}>
            <DefaultIcons.Custom
              {...item.icon}
              style={[
                {
                  borderWidth: 0,
                  textAlign: 'left',
                  // width: (item.icon.size || 22) + (hasLabel ? 1 : 1),
                  lineHeight: item.icon.size || 22,
                  height: '100%',
                  textAlignVertical: 'center',
                },
                item.icon.style,
              ]}
              size={item.icon.size || 22}
              color={iconColor}
            />
            {hasLabel ? (
              <FancyText
                color={iconColor}
                size="extraSmall"
                type="bold"
                style={[styles.actionButtonLabel, { borderWidth: 0, paddingRight: 2, height: '100%' }]}
              >
                {item.label}
              </FancyText>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    });
  }

  return (
    <View style={[styles.actionButtonsContainer, containerStyle]}>
      {isValidElement(actions) ? actions : Array.isArray(actions) ? generateButtonsComponent(actions) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actionButton: { borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
  actionButtonContent: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLabel: {
    marginLeft: 4,
  },
});
