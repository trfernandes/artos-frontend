import {
  LayoutChangeEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import FancyTabHeaderItem from './FancyTabHeaderItem';
import { TabItem } from './FancyTabs';

export type FancyTabsHeaderProps = {
  titles?: TabItem[];
  index: number;
  onChangeTab?: (index: number) => void;
  headerStyle?: StyleProp<ViewStyle>;
  compact?: boolean;
};

const TAB_GAP = 8;

export default function FancyTabsHeader(props: FancyTabsHeaderProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  if (!props.titles || props.titles.length === 0) {
    return null;
  }
  const titles = props.titles;
  const shouldUseScroll = titles.length > 3;

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const computedTabWidth = useMemo(() => {
    if (containerWidth <= 0 || titles.length === 0) {
      return undefined;
    }

    const totalGapWidth = TAB_GAP * Math.max(titles.length - 1, 0);
    return Math.max((containerWidth - totalGapWidth) / titles.length, 0);
  }, [containerWidth, titles.length]);

  return (
    <View style={props.headerStyle} onLayout={handleHeaderLayout}>
      {shouldUseScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces
          decelerationRate='fast'
          contentContainerStyle={styles.scrollContent}
        >
          {titles.map((item, index) => (
            <FancyTabHeaderItem
              key={`${item.title}-${index}`}
              status={index === props.index ? 'active' : 'inactive'}
              compact={props.compact}
              {...item}
              onPress={() => props.onChangeTab?.(index)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.row}>
          {titles.map((item, index) => (
            <FancyTabHeaderItem
              key={`${item.title}-${index}`}
              status={index === props.index ? 'active' : 'inactive'}
              equalWidth
              calculatedWidth={computedTabWidth}
              compact={props.compact}
              {...item}
              onPress={() => props.onChangeTab?.(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TAB_GAP,
    paddingHorizontal: 2,
    paddingRight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: TAB_GAP,
    width: '100%',
  },
});
