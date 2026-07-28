import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import FancyTabsHeader from './FancyTabsHeader';
import { CustomIconProps } from '../FancyIcons';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const PAGE_HORIZONTAL_GUTTER = 15;

export type TabItem = {
  title: string;
  badgeCount?: number;
  icon?: CustomIconProps;
  content?: ReactNode;
  onChange?: (index: number) => void;
};

export type FancyTabsProps = {
  items?: TabItem[];
  variant?: 'page' | 'compact';
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentGutter?: boolean;
  compactHeader?: boolean;
  onTabChange?: (index: number) => void;
  initialIndex?: number;
  keepMounted?: boolean;
  swipeable?: boolean;
};

export default function FancyTabs(props: FancyTabsProps) {
  const styles = useThemedStyles(createStyles);
  const variant = props.variant ?? (props.compactHeader ? 'compact' : 'page');
  const isCompact = variant === 'compact';
  const shouldApplyContentGutter = props.contentGutter ?? !isCompact;
  const isSwipeable = props.swipeable ?? !isCompact;
  const maxIndex = Math.max((props.items?.length ?? 1) - 1, 0);
  const initialIndex = Math.min(Math.max(props.initialIndex ?? 0, 0), maxIndex);
  const [index, setIndex] = useState(initialIndex);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const translateX = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(index);
  const widthRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    widthRef.current = containerSize.width;
    translateX.setValue(-index * containerSize.width);
  }, [containerSize.width]);

  useEffect(() => {
    goToIndex(initialIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex]);

  const goToIndex = (newIndex: number, animated = true) => {
    if (newIndex === indexRef.current) return;
    const target = -newIndex * widthRef.current;
    if (animated) {
      Animated.spring(translateX, {
        toValue: target,
        useNativeDriver: true,
        bounciness: 0,
        speed: 16,
      }).start();
    } else {
      translateX.setValue(target);
    }
    indexRef.current = newIndex;
    setIndex(newIndex);
    props.items?.[newIndex]?.onChange?.(newIndex);
    props.onTabChange?.(newIndex);
  };

  const handleTabChange = (newIndex: number) => {
    goToIndex(newIndex, true);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderMove: (_, g) => {
          const width = widthRef.current;
          if (!width) return;
          const base = -indexRef.current * width;
          let next = base + g.dx;
          const min = -maxIndex * width;
          // resistência leve nas bordas
          if (next > 0) next = next * 0.3;
          if (next < min) next = min + (next - min) * 0.3;
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const width = widthRef.current;
          if (!width) return;
          const threshold = width * 0.22;
          let newIndex = indexRef.current;
          if (g.dx < -threshold && indexRef.current < maxIndex) {
            newIndex = indexRef.current + 1;
          } else if (g.dx > threshold && indexRef.current > 0) {
            newIndex = indexRef.current - 1;
          }
          if (newIndex !== indexRef.current) {
            goToIndex(newIndex, true);
          } else {
            Animated.spring(translateX, {
              toValue: -indexRef.current * width,
              useNativeDriver: true,
              bounciness: 0,
              speed: 16,
            }).start();
          }
        },
      }),
    [maxIndex],
  );

  if (!props.items || props.items.length === 0) return null;

  const baseContentStyle = [
    styles.contentContainer,
    isCompact ? styles.compactContentContainer : styles.pageContentContainer,
    props.contentContainerStyle,
  ];
  const gutterStyle = shouldApplyContentGutter && styles.contentGutter;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  return (
    <View
      style={[
        styles.container,
        isCompact ? styles.compactContainer : styles.pageContainer,
        props.containerStyle,
      ]}
    >
      <View style={styles.headerContainer}>
        <FancyTabsHeader
          titles={props.items}
          index={index}
          onChangeTab={handleTabChange}
          headerStyle={[isCompact ? styles.compactHeader : styles.pageHeader, props.headerStyle]}
          compact={isCompact}
        />
      </View>

      {isSwipeable ? (
        <View style={baseContentStyle} onLayout={handleLayout} {...panResponder.panHandlers}>
          {containerSize.width > 0 && (
            <Animated.View
              style={{
                flexDirection: 'row',
                width: containerSize.width * props.items.length,
                flex: 1,
                transform: [{ translateX }],
              }}
            >
              {props.items.map((item, itemIndex) => (
                <View
                  key={`${item.title}-${itemIndex}`}
                  style={[
                    { width: containerSize.width, height: containerSize.height || undefined },
                    gutterStyle,
                  ]}
                >
                  {item.content}
                </View>
              ))}
            </Animated.View>
          )}
        </View>
      ) : (
        <View style={[baseContentStyle, gutterStyle]}>
          {props.keepMounted
            ? props.items.map((item, itemIndex) => (
                <View
                  key={`${item.title}-${itemIndex}`}
                  style={itemIndex === index ? styles.visibleContent : styles.hiddenContent}
                >
                  {item.content}
                </View>
              ))
            : props.items[index]?.content}
        </View>
      )}
    </View>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    container: {
      paddingTop: 4,
      gap: 8,
      backgroundColor: Pallete.backgroundColor,
    },
    pageContainer: {
      flex: 1,
    },
    compactContainer: {
      flexShrink: 1,
    },
    headerContainer: { paddingHorizontal: 0 },
    pageHeader: { paddingHorizontal: PAGE_HORIZONTAL_GUTTER },
    compactHeader: { paddingHorizontal: 0 },
    contentContainer: { borderWidth: 0 },
    pageContentContainer: { flex: 1, paddingTop: 8 },
    compactContentContainer: { paddingTop: 4 },
    contentGutter: { paddingHorizontal: PAGE_HORIZONTAL_GUTTER },
    visibleContent: { flex: 1 },
    hiddenContent: { display: 'none' },
  });
}
