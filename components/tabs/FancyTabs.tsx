import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyTabsHeader from './FancyTabsHeader';
import { CustomIconProps } from '../FancyIcons';
import { ReactNode, useState } from 'react';
import { Pallete } from '../../constants/colors';

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
};

export default function FancyTabs(props: FancyTabsProps) {
  const [index, setIndex] = useState(0);

  const handleTabChange = (index: number) => {
    setIndex(index);
    props.items?.[index].onChange?.(index);
    props.onTabChange?.(index);
  };

  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={styles.headerContainer}>
        <FancyTabsHeader titles={props.items} index={index} onChangeTab={handleTabChange} headerStyle={props.headerStyle} />
      </View>
      <View style={[styles.contentContainer, props.contentContainerStyle]}>{props.items?.[index].content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
    borderWidth: 0,
    borderColor: 'red',
    backgroundColor: Pallete.backgroundColor,
  },
  headerContainer: { paddingHorizontal: 0 },
  contentContainer: { borderWidth: 0 },
});
