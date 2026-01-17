import { View, StyleSheet, TouchableOpacity } from 'react-native';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import FancySeparator from '../FancySeparator';
import FancyButton from '../buttons/FancyButton';

export type ActionItemData = {
  icon?: CustomIconProps;
  label: string;
  onPress?: () => void;
};

export default function FancyActionsList(props: { actions?: ActionItemData[] }) {
  return (
    <View style={styles.container}>
      {props.actions?.map((action, index) => (
        <View key={index} style={styles.actionContainer}>
          <TouchableOpacity style={styles.action} onPress={action.onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {action.icon && (
                <DefaultIcons.Custom {...action.icon} color={Pallete.icons.dark} style={{ opacity: 0.9, lineHeight: 20 }} />
              )}
              <FancyText size={'medium'} type={'bold'} style={styles.actionLabel}>
                {action.label}
              </FancyText>
            </View>
            <FancyButton
              icon={{ library: 'FontAwesome6', name: 'chevron-right', color: Pallete.fonts.dark, size: 14 }}
              mode='icon'
              type='text'
              onPress={action.onPress}
            />
          </TouchableOpacity>
          {index < (props.actions?.length || 0) - 1 && <FancySeparator />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: Pallete.borderCard,
    borderRadius: 10,
    backgroundColor: Pallete.backgroundColor2,
    paddingVertical: 2,
  },
  actionContainer: { borderWidth: 0, justifyContent: 'center' },
  action: { paddingLeft: 20, height: 49, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  actionLabel: { opacity: 0.9, lineHeight: 20, borderWidth: 0 },
});
