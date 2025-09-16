import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, RefAttributes } from 'react';
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import FancyListEmpty from './FancyListEmpty';

export const FADE = { colors: { dark: 'rgba(255,255,255,0)', light: 'rgba(255,255,255,0.6)' }, height: 20 };

export type FancyListProps<ItemT> = {
  containerStyle?: StyleProp<ViewStyle>;
  bottomSpace?: number;
} & Omit<FlatListProps<ItemT> & RefAttributes<FlatList<ItemT>>, 'refreshControl'>;

export default function FancyList<ItemT>(props: FancyListProps<ItemT>) {
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const contentHeight = useRef(0);
  const listHeight = useRef(0);

  const handleContentSizeChange = (w: number, h: number) => {
    contentHeight.current = h;
    updateFadeVisibility(0);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    listHeight.current = e.nativeEvent.layout.height;
    updateFadeVisibility(0);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    updateFadeVisibility(scrollY);
  };

  const updateFadeVisibility = (scrollY: number) => {
    const scrollable = contentHeight.current > listHeight.current;

    setShowTopFade(scrollable && scrollY > 10);
    setShowBottomFade(scrollable && scrollY + listHeight.current < contentHeight.current - 10);
  };

  return (
    <View style={props.containerStyle}>
      {props.data && props.data?.length > 0 ? (
        <>
          {props.refreshing ? (
            <View style={{ borderWidth: 0, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size={'large'} />
            </View>
          ) : (
            <FlatList
              ListFooterComponent={<View style={{ height: props.bottomSpace || 40 }} />}
              onContentSizeChange={handleContentSizeChange}
              contentContainerStyle={[styles.list_content, props.contentContainerStyle]}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              refreshControl={<RefreshControl refreshing={props.refreshing || false} onRefresh={props.onRefresh || undefined} />}
              {...props}
            />
          )}
          {showTopFade && (
            <LinearGradient colors={[FADE.colors.light, FADE.colors.dark]} style={[styles.fade, { top: 0 }]} pointerEvents="none" />
          )}

          {showBottomFade && (
            <LinearGradient
              colors={[FADE.colors.dark, FADE.colors.light]}
              style={[styles.fade, { bottom: 0, borderWidth: 0 }]}
              pointerEvents="none"
            />
          )}
        </>
      ) : (
        <FancyListEmpty />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  item: {
    padding: 20,
    fontSize: 18,
  },
  fade: {
    borderWidth: 0,
    borderColor: 'lightpink',
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE.height,
    zIndex: 1,
  },
  list_content: { gap: 10 },
});
