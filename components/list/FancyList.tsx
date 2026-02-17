import { LinearGradient } from 'expo-linear-gradient';
import { LegendList, LegendListProps } from '@legendapp/list';
import { useState, useRef } from 'react';
import {
    ActivityIndicator,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import FancyListEmpty, { FancyListEmptyProps } from './FancyListEmpty';
import { RefreshControl } from 'react-native-gesture-handler';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

export const FADE = {
  height: 40,
};

export type FancyListProps<ItemT> = {
  containerStyle?: StyleProp<ViewStyle>;
  listEmptyProps?: FancyListEmptyProps;
  bottomSpace?: number;
  showFade?: boolean;
} & Omit<LegendListProps<ItemT>, 'refreshControl'>;

export default function FancyList<ItemT>({ showFade = true, ...props }: FancyListProps<ItemT>) {
  const palette = usePallete();
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const contentHeight = useRef(0);
  const listHeight = useRef(0);

  const handleContentSizeChange = (_w: number, h: number) => {
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

  const hasData = props.data && props.data.length > 0;
  const topFadeColors = [
    ColorUtils.withAlpha(palette.backgroundColor, 1),
    ColorUtils.withAlpha(palette.backgroundColor, 0),
  ] as const;
  const bottomFadeColors = [
    ColorUtils.withAlpha(palette.backgroundColor, 0),
    ColorUtils.withAlpha(palette.backgroundColor, 1),
  ] as const;

  return (
    <View style={props.containerStyle} onLayout={handleLayout}>
      {hasData ? (
        <>
          {props.refreshing ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size='large' color={palette.primary} />
            </View>
          ) : (
            <LegendList
              data={props.data!}
              extraData={props.extraData}
              renderItem={props.renderItem!}
              recycleItems={props.recycleItems ?? true}
              maintainVisibleContentPosition={props.maintainVisibleContentPosition ?? true}
              initialScrollIndex={props.initialScrollIndex}
              ListFooterComponent={
                props.ListFooterComponent || <View style={{ height: props.bottomSpace || 10 }} />
              }
              onContentSizeChange={handleContentSizeChange}
              contentContainerStyle={[styles.list_content, props.contentContainerStyle]}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyExtractor={props.keyExtractor}
              keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={props.refreshing || false}
                  onRefresh={props.onRefresh || undefined}
                />
              }
              ItemSeparatorComponent={props.ItemSeparatorComponent}
            />
          )}

          {showFade && showTopFade && (
            <LinearGradient
              colors={topFadeColors}
              style={[styles.fade, { top: 0 }]}
              pointerEvents='none'
            />
          )}

          {showFade && showBottomFade && (
            <LinearGradient
              colors={bottomFadeColors}
              style={[styles.fade, { bottom: 0 }]}
              pointerEvents='none'
            />
          )}
        </>
      ) : (
        <FancyListEmpty {...props.listEmptyProps} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE.height,
    zIndex: 1,
    borderRadius: 10,
    // borderWidth: 1,
  },
  list_content: { gap: 10 },
});
