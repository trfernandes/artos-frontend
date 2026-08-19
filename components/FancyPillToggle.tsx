import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { usePallete } from '../hooks/usePallete';
import { ColorUtils } from '../utils/color_utils';

interface FancyPillToggleProps {
  value: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const TRACK_WIDTH = 59;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 6; // margin 3px each side

export default function FancyPillToggle({ value, onPress, disabled, style }: FancyPillToggleProps) {
  const palette = usePallete();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      bounciness: 4,
      speed: 20,
    }).start();
  }, [value]);

  const thumbLeft = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, THUMB_TRAVEL + 3],
  });

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [ColorUtils.withAlpha(palette.borderCard, 0.35), palette.primary],
  });

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[styles.track, style]}
      accessibilityRole='switch'
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.trackFill, { backgroundColor: trackColor }]}
      />

      {/* Thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            backgroundColor: palette.backgroundColor,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  trackFill: {
    borderRadius: 999,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
});
