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
  return (
    <View style={[styles.container, props.headerStyle]}>
      {props.titles?.map((item, index) => (
        <FancyTabHeaderItem
          status={index === props.index ? 'active' : 'inactive'}
          key={index}
          {...item}
          onPress={() => props.onChangeTab?.(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', borderWidth: 0 },
});
