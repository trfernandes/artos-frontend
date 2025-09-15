import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import FancySearchBar, { FancySearchBarProps } from '../../FancySearchBar';
import FancyFab, { FABProps } from '../../buttons/FancyFab';
import FancyList, { FancyListProps } from '../../list/FancyList';
import FancyPageView from '../../containers/FancyPageView';

interface Props<ItemT> {
  showSearchBar?: boolean;
  showFab?: boolean;
  searchBarProps?: FancySearchBarProps;
  fabProps?: FABProps;
  listProps: FancyListProps<ItemT>;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FancyBaseListPage<ItemT>({
  showFab = true,
  showSearchBar = true,
  fabProps,
  listProps,
  searchBarProps,
  children,
  containerStyle,
}: Props<ItemT>) {
  return (
    <FancyPageView style={[styles.container, containerStyle]}>
      {showSearchBar && <FancySearchBar {...searchBarProps} />}
      <FancyList {...listProps} contentContainerStyle={{ flex: 1, gap: 10 }} containerStyle={{ flex: 1 }} />
      {showFab && <FancyFab {...fabProps} />}
      {children}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10, gap: 15, borderWidth: 0 },
});
