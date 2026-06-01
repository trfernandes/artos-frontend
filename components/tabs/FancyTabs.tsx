import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyTabsHeader from './FancyTabsHeader';
import { CustomIconProps } from '../FancyIcons';
import { ReactNode, useEffect, useState } from 'react';
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
};

export default function FancyTabs(props: FancyTabsProps) {
  const styles = useThemedStyles(createStyles);
  const variant = props.variant ?? (props.compactHeader ? 'compact' : 'page');
  const isCompact = variant === 'compact';
  const shouldApplyContentGutter = props.contentGutter ?? !isCompact;
  const maxIndex = Math.max((props.items?.length ?? 1) - 1, 0);
  const initialIndex = Math.min(Math.max(props.initialIndex ?? 0, 0), maxIndex);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const handleTabChange = (index: number) => {
    setIndex(index);
    props.items?.[index]?.onChange?.(index);
    props.onTabChange?.(index);
  };

  // Proteção contra items undefined ou vazio
  if (!props.items || props.items.length === 0) {
    return null;
  }

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
      <View
        style={[
          styles.contentContainer,
          isCompact ? styles.compactContentContainer : styles.pageContentContainer,
          shouldApplyContentGutter && styles.contentGutter,
          props.contentContainerStyle,
        ]}
      >
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
    </View>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    container: {
      paddingTop: 2,
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
