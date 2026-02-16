import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyTabHeaderItem from './FancyTabHeaderItem';
import { TabItem } from './FancyTabs';

export type FancyTabsHeaderProps = {
  titles?: TabItem[];
  index: number;
  onChangeTab?: (index: number) => void;
  headerStyle?: StyleProp<ViewStyle>;
};

export default function FancyTabsHeader(props: FancyTabsHeaderProps) {
  // Proteção contra undefined
  if (!props.titles || props.titles.length === 0) {
    return null;
  }

  const isMultiRow = props.titles.length > 3;

  return (
    <View style={[styles.container, props.headerStyle]}>
      {props.titles.map((item, index) => (
        <FancyTabHeaderItem
          status={index === props.index ? 'active' : 'inactive'}
          key={index}
          {...item}
          multiRow={isMultiRow}
          onPress={() => props.onChangeTab?.(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    rowGap: 8,
    columnGap: 8,
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
});
