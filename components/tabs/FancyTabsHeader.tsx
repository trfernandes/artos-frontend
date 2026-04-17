import {
  LayoutChangeEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import FancyTabHeaderItem from './FancyTabHeaderItem';
import { TabItem } from './FancyTabs';

export type FancyTabsHeaderProps = {
  titles?: TabItem[];
  index: number;
  onChangeTab?: (index: number) => void;
  headerStyle?: StyleProp<ViewStyle>;
};

type TabLayout = {
  x: number;
  width: number;
};

export default function FancyTabsHeader(props: FancyTabsHeaderProps) {
  const scrollRef = useRef<ScrollView>(null);
  const previousIndexRef = useRef(props.index);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayout>>({});

  if (!props.titles || props.titles.length === 0) {
    return null;
  }
  const titles = props.titles;
  const shouldStretchTabs = titles.length <= 2;

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const handleTabLayout = useCallback((tabIndex: number, layout: TabLayout) => {
    setTabLayouts((current) => {
      const previous = current[tabIndex];
      if (previous && previous.x === layout.x && previous.width === layout.width) {
        return current;
      }

      return {
        ...current,
        [tabIndex]: layout,
      };
    });
  }, []);

  useEffect(() => {
    if (containerWidth <= 0) {
      return;
    }

    const activeLayout = tabLayouts[props.index];
    if (!activeLayout) {
      return;
    }

    const target = Math.max(activeLayout.x - Math.max((containerWidth - activeLayout.width) / 2, 0), 0);
    const indexChanged = previousIndexRef.current !== props.index;
    const shouldCenterInitially = previousIndexRef.current === props.index && Object.keys(tabLayouts).length === titles.length;

    if (!indexChanged && !shouldCenterInitially) {
      return;
    }

    scrollRef.current?.scrollTo({ x: target, animated: true });
    previousIndexRef.current = props.index;
  }, [containerWidth, props.index, tabLayouts, titles.length]);

  return (
    <View style={props.headerStyle} onLayout={handleHeaderLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces
        contentContainerStyle={[
          styles.scrollContent,
          shouldStretchTabs && styles.scrollContentStretch,
        ]}
        decelerationRate='fast'
      >
        {titles.map((item, index) => (
          <FancyTabHeaderItem
            key={`${item.title}-${index}`}
            status={index === props.index ? 'active' : 'inactive'}
            stretch={shouldStretchTabs}
            {...item}
            onPress={() => props.onChangeTab?.(index)}
            onMeasuredLayout={(layout) => handleTabLayout(index, layout)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingRight: 18,
  },
  scrollContentStretch: {
    minWidth: '100%',
    paddingRight: 2,
  },
});
