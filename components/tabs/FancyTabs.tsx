import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyTabsHeader from './FancyTabsHeader';
import { CustomIconProps } from '../FancyIcons';
import { ReactNode, useEffect, useState } from 'react';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export type TabItem = {
  title: string;
  icon?: CustomIconProps;
  content?: ReactNode;
  onChange?: (index: number) => void;
};

export type FancyTabsProps = {
  items?: TabItem[];
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  onTabChange?: (index: number) => void;
  initialIndex?: number;
  keepMounted?: boolean;
};

export default function FancyTabs(props: FancyTabsProps) {
  const styles = useThemedStyles(createStyles);
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
    <View style={[styles.container, props.containerStyle]}>
      <View style={styles.headerContainer}>
        <FancyTabsHeader titles={props.items} index={index} onChangeTab={handleTabChange} headerStyle={props.headerStyle} />
      </View>
      <View style={[styles.contentContainer, props.contentContainerStyle]}>
        {props.keepMounted
          ? props.items.map((item, itemIndex) => (
              <View key={`${item.title}-${itemIndex}`} style={itemIndex === index ? styles.visibleContent : styles.hiddenContent}>
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
      gap: 10,
      backgroundColor: Pallete.backgroundColor,
    },
    headerContainer: { paddingHorizontal: 0 },
    contentContainer: { borderWidth: 0 },
    visibleContent: { flex: 1 },
    hiddenContent: { display: 'none' },
  });
}
