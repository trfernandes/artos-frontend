import { ReactNode, isValidElement } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Pallete } from '../../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';

export interface ActionButton {
  icon: CustomIconProps & { backgroundColor?: string };
  size?: number;
  onPress?: () => void;
}

export function FancyActionButtons({ actions }: { actions?: ActionButton | ActionButton[] | ReactNode }): ReactNode {
  function generateButtonsComponent(buttons: ActionButton[]): ReactNode {
    return buttons.map((item, idx) => (
      <View
        key={idx}
        style={[
          styles.actionButton,
          {
            width: item.size || 30,
            height: item.size || 30,
            backgroundColor: item.icon.backgroundColor || Pallete.primary,
          },
        ]}
      >
        <TouchableOpacity onPress={item.onPress}>
          <DefaultIcons.Custom {...item.icon} size={item.icon.size || 22} color={item.icon.color || Pallete.fonts.light} />
        </TouchableOpacity>
      </View>
    ));
  }

  return (
    <View style={styles.actionButtonsContainer}>
      {isValidElement(actions) ? actions : Array.isArray(actions) ? generateButtonsComponent(actions) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: { borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
});
