import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  ScrollViewProps,
  StyleSheet,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FADE } from './list/FancyList';

export type FancyScrollViewProps = ScrollViewProps & {
  children?: React.ReactNode;
  topFade?: { active?: boolean; style?: StyleProp<ViewStyle> };
  bottomFade?: { active?: boolean; style?: StyleProp<ViewStyle> };
};

export default function FancyScrollView(props: FancyScrollViewProps) {
  const [layoutReady, setLayoutReady] = useState(false);
  const contentHeight = useRef(0);
  const listHeight = useRef(0);

  const topFadeAnim = useRef(new Animated.Value(0)).current;
  const bottomFadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = (anim: Animated.Value) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (anim: Animated.Value) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const updateFadeVisibility = (scrollY: number) => {
    const scrollable = contentHeight.current > listHeight.current;

    if (scrollable && scrollY > 10) {
      fadeIn(topFadeAnim);
    } else {
      fadeOut(topFadeAnim);
    }

    if (scrollable && scrollY + listHeight.current < contentHeight.current - 10) {
      fadeIn(bottomFadeAnim);
    } else {
      fadeOut(bottomFadeAnim);
    }
  };

  const handleContentSizeChange = (w: number, h: number) => {
    contentHeight.current = h;
    if (listHeight.current) setLayoutReady(true);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    listHeight.current = e.nativeEvent.layout.height;
    if (contentHeight.current) setLayoutReady(true);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    updateFadeVisibility(scrollY);
  };

  useEffect(() => {
    if (layoutReady) {
      updateFadeVisibility(0); // Avalia a posição inicial
    }
  }, [layoutReady]);

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        {...props}
        style={[{ flex: 1 }, props.style]}
        contentContainerStyle={[{ paddingBottom: 40 }, props.contentContainerStyle]}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        onScroll={handleScroll}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
      >
        {props.children}
      </KeyboardAwareScrollView>

      {(!props.topFade ||
        (props.topFade && props.topFade!.active === undefined) ||
        (props.topFade && props.topFade!.active === true)) && (
        <Animated.View pointerEvents="none" style={[styles.fade, { top: 0 }, { opacity: topFadeAnim }]}>
          <LinearGradient
            colors={[FADE.colors.light, FADE.colors.dark]}
            style={[StyleSheet.absoluteFill, props.topFade?.style]}
          />
        </Animated.View>
      )}

      {(!props.bottomFade ||
        (props.bottomFade && props.bottomFade!.active === undefined) ||
        (props.bottomFade && props.bottomFade!.active === true)) && (
        <Animated.View pointerEvents="none" style={[styles.fade, { bottom: 0 }, { opacity: bottomFadeAnim }]}>
          <LinearGradient
            colors={[FADE.colors.dark, FADE.colors.light]}
            style={[StyleSheet.absoluteFill, props.bottomFade?.style]}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE.height,
    zIndex: 1,
    // borderWidth: 1,
  },
});
