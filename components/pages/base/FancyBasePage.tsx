import { StyleProp, ViewStyle, StyleSheet } from 'react-native';
import React from 'react';
import FancyFab, { FABProps } from '../../buttons/FancyFab';
import FancyPageView from '../../containers/FancyPageView';
import FancySearchBar, { FancySearchBarProps } from '../../FancySearchBar';

export type FancyBasePageProps = {
  showSearchBar?: boolean;
  showFab?: boolean;
  searchBarProps?: FancySearchBarProps;
  fabProps?: FABProps;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FancyBasePage({
  showFab = true,
  showSearchBar = true,
  fabProps,
  searchBarProps,
  children,
  containerStyle,
}: FancyBasePageProps) {
  return (
    <FancyPageView style={[styles.container, containerStyle]}>
      {showSearchBar && (
        <FancySearchBar
          {...searchBarProps}
          containerStyle={[{ paddingHorizontal: 15 }, searchBarProps?.containerStyle]}
        />
      )}
      {children}
      {showFab && <FancyFab {...fabProps} right={10} bottom={10} />}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, borderWidth: 0 },
});
