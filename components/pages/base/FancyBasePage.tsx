import { StyleProp, ViewStyle, StyleSheet, View } from 'react-native';
import React from 'react';
import FancyFab, { FABProps } from '../../buttons/FancyFab';
import FancyPageView from '../../containers/FancyPageView';
import FancySearchBar, { FancySearchBarProps } from '../../FancySearchBar';
import { TutorialTarget } from '../../tutorial/TutorialTarget';

export type FancyBasePageProps = {
  showSearchBar?: boolean;
  showFab?: boolean;
  searchBarProps?: FancySearchBarProps;
  fabProps?: FABProps;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** Registra o FAB no tour da tela, quando a tela tiver um `useScreenTutorial`. */
  fabTutorialTarget?: {
    id: string;
    registerTarget: (id: string, ref: React.RefObject<View | null>) => void;
    unregisterTarget: (id: string) => void;
  };
};

export default function FancyBasePage({
  showFab = true,
  showSearchBar = true,
  fabProps,
  searchBarProps,
  children,
  containerStyle,
  fabTutorialTarget,
}: FancyBasePageProps) {
  const fab = <FancyFab {...fabProps} right={10} bottom={10} />;

  return (
    <FancyPageView style={[styles.container, containerStyle]}>
      {showSearchBar && (
        <FancySearchBar
          {...searchBarProps}
          containerStyle={[{ paddingHorizontal: 15 }, searchBarProps?.containerStyle]}
        />
      )}
      {children}
      {showFab &&
        (fabTutorialTarget ? (
          <TutorialTarget
            id={fabTutorialTarget.id}
            registerTarget={fabTutorialTarget.registerTarget}
            unregisterTarget={fabTutorialTarget.unregisterTarget}
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              width: fabProps?.size ?? 50,
              height: fabProps?.size ?? 50,
            }}
            pointerEvents='box-none'
          >
            <FancyFab {...fabProps} right={0} bottom={0} />
          </TutorialTarget>
        ) : (
          fab
        ))}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, borderWidth: 0, paddingTop: 5 },
});
