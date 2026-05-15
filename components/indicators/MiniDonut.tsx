import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { usePallete } from '../../hooks/usePallete';

type MiniDonutProps = {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  centerColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function MiniDonut({
  percent,
  color,
  size = 15,
  strokeWidth = 2.5,
  trackColor,
  centerColor,
  style,
}: MiniDonutProps) {
  const palette = usePallete();
  const resolvedTrackColor = trackColor ?? palette.disabled2;
  const resolvedCenterColor = centerColor ?? palette.backgroundColor;
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const half = size / 2;
  const centerSize = size - strokeWidth * 2;

  // At 100%, render a simple full ring to avoid gaps from the clip-based approach
  if (clampedPercent >= 100) {
    return (
      <View style={[styles.wrapper, { width: size, height: size }, style]}>
        <View
          style={[
            styles.ring,
            { borderRadius: half, borderWidth: strokeWidth, borderColor: color },
          ]}
        />
        <View
          style={[
            styles.center,
            {
              top: strokeWidth,
              left: strokeWidth,
              width: centerSize,
              height: centerSize,
              borderRadius: centerSize / 2,
              backgroundColor: resolvedCenterColor,
            },
          ]}
        />
      </View>
    );
  }

  const rightDeg = Math.min(clampedPercent, 50) * 3.6;
  const leftDeg = Math.max(clampedPercent - 50, 0) * 3.6;
  const showLeft = clampedPercent > 50;

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      <View
        style={[
          styles.ring,
          { borderRadius: half, borderWidth: strokeWidth, borderColor: resolvedTrackColor },
        ]}
      />

      <View style={[styles.rightClip, { width: half, height: size }]}>
        <View
          style={[
            styles.halfCircle,
            {
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              right: 0,
              borderColor: color,
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [{ rotate: `${rightDeg}deg` }],
            },
          ]}
        />
      </View>

      {showLeft && (
        <View style={[styles.leftClip, { width: half, height: size }]}>
          <View
            style={[
              styles.halfCircle,
              {
                width: size,
                height: size,
                borderRadius: half,
                borderWidth: strokeWidth,
                left: 0,
                borderColor: color,
                borderRightColor: 'transparent',
                borderTopColor: 'transparent',
                transform: [{ rotate: `${leftDeg}deg` }],
              },
            ]}
          />
        </View>
      )}

      <View
        style={[
          styles.center,
          {
            top: strokeWidth,
            left: strokeWidth,
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
            backgroundColor: resolvedCenterColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
  },
  rightClip: {
    position: 'absolute',
    right: 0,
    overflow: 'hidden',
  },
  leftClip: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
  },
  halfCircle: {
    position: 'absolute',
  },
  center: {
    position: 'absolute',
  },
});
