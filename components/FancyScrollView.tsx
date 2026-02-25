import React, { useRef, useState, useEffect } from 'react';
import {
    ScrollViewProps,
    StyleSheet,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Animated,
    StyleProp,
    ViewStyle,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FADE } from './list/FancyList';
import { LinearGradient } from 'expo-linear-gradient';
import { usePallete } from '../hooks/usePallete';
import { ColorUtils } from '../utils/color_utils';

export type FancyScrollViewProps = ScrollViewProps & {
  children?: React.ReactNode;
  fill?: boolean; // <= NOVO: controla se deve ocupar o espaço do pai
  containerStyle?: StyleProp<ViewStyle>;

  topFade?: { active?: boolean; style?: StyleProp<ViewStyle> };
  bottomFade?: { active?: boolean; style?: StyleProp<ViewStyle> };
};

export default function FancyScrollView(props: FancyScrollViewProps) {
  const { fill = false } = props;
  const palette = usePallete();

  const [layoutReady, setLayoutReady] = useState(false);
  const contentHeight = useRef(0);
  const listHeight = useRef(0);

  const topFadeAnim = useRef(new Animated.Value(0)).current;
  const bottomFadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = (anim: Animated.Value) => {
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const fadeOut = (anim: Animated.Value) => {
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const updateFadeVisibility = (scrollY: number) => {
    const scrollable = contentHeight.current > listHeight.current;

    if (scrollable && scrollY > 10) fadeIn(topFadeAnim);
    else fadeOut(topFadeAnim);

    if (scrollable && scrollY + listHeight.current < contentHeight.current - 10)
      fadeIn(bottomFadeAnim);
    else fadeOut(bottomFadeAnim);
  };

  const handleContentSizeChange = (w: number, h: number) => {
    contentHeight.current = h;
    if (listHeight.current) setLayoutReady(true);
    props.onContentSizeChange?.(w, h); // chama o do usuário também
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    listHeight.current = e.nativeEvent.layout.height;
    if (contentHeight.current) setLayoutReady(true);
    props.onLayout?.(e); // chama o do usuário também
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    updateFadeVisibility(scrollY);
    props.onScroll?.(e); // chama o do usuário também
  };

  useEffect(() => {
    if (layoutReady) updateFadeVisibility(0);
  }, [layoutReady]);

  const topFadeEnabled =
    !props.topFade || props.topFade.active === undefined || props.topFade.active === true;

  const bottomFadeEnabled =
    !props.bottomFade || props.bottomFade.active === undefined || props.bottomFade.active === true;

  const topFadeColors = [
    ColorUtils.withAlpha(palette.backgroundColor, 1),
    ColorUtils.withAlpha(palette.backgroundColor, 0),
  ] as const;
  const bottomFadeColors = [
    ColorUtils.withAlpha(palette.backgroundColor, 0),
    ColorUtils.withAlpha(palette.backgroundColor, 1),
  ] as const;

  return (
    <View
      style={[
        fill ? styles.fillContainer : undefined,
        { overflow: 'hidden' },
        props.containerStyle,
      ]}
    >
      <KeyboardAwareScrollView
        {...props}
        // Se fill=false, NÃO force flex/altura aqui.
        style={[fill ? styles.fillScroll : undefined, props.style]}
        contentContainerStyle={[{ paddingBottom: 40 }, props.contentContainerStyle]}
        keyboardShouldPersistTaps={props.keyboardShouldPersistTaps ?? 'handled'}
        keyboardDismissMode={props.keyboardDismissMode ?? 'on-drag'}
        onScroll={handleScroll}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? true}
      >
        {props.children}
      </KeyboardAwareScrollView>

      {topFadeEnabled && (
        <Animated.View
          pointerEvents='none'
          style={[styles.fade, { top: 0, opacity: topFadeAnim }]}
        >
          <LinearGradient
            colors={topFadeColors}
            style={[StyleSheet.absoluteFill, props.topFade?.style]}
          />
        </Animated.View>
      )}

      {bottomFadeEnabled && (
        <Animated.View
          pointerEvents='none'
          style={[styles.fade, { bottom: 0, opacity: bottomFadeAnim }]}
        >
          <LinearGradient
            colors={bottomFadeColors}
            style={[StyleSheet.absoluteFill, props.bottomFade?.style]}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // modo “fill”: ocupa o espaço do pai e rola dentro
  fillContainer: {
    flex: 1,
    minHeight: 0, // ajuda em layouts flex
  },
  fillScroll: {
    flex: 1,
    minHeight: 0,
  },

  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE.height,
    zIndex: 1,
    overflow: 'hidden',
  },
});
