import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { CustomIconProps } from '../FancyIcons';
import FancyTabsHeader from './FancyTabsHeader';
import { TabItem } from './FancyTabs';

export type FancySegmentedTabOption<Value extends string> = {
  title: string;
  value: Value;
  icon?: CustomIconProps;
};

type FancySegmentedTabsProps<Value extends string> = {
  options: FancySegmentedTabOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  variant?: 'page' | 'compact';
  style?: StyleProp<ViewStyle>;
};

export default function FancySegmentedTabs<Value extends string>({
  options,
  value,
  onChange,
  variant = 'compact',
  style,
}: FancySegmentedTabsProps<Value>) {
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const items: TabItem[] = options.map((option) => ({
    title: option.title,
    icon: option.icon,
  }));

  return (
    <FancyTabsHeader
      titles={items}
      index={selectedIndex}
      compact={variant === 'compact'}
      headerStyle={[styles.container, style]}
      onChangeTab={(index) => onChange(options[index].value)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
