import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';

type Option<T extends string = string> = { label: string; value: T };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  size?: 'sm' | 'md';
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const TRACK_PADDING = 2;
const BORDER_RADIUS_TRACK = 10;
const BORDER_RADIUS_PILL = 8;

export default function FancySegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  containerStyle,
  disabled = false,
}: Props<T>) {
  const palette = usePallete();
  const height = size === 'sm' ? 36 : 40;
  const pillHeight = height - TRACK_PADDING * 2;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const pillWidth = containerWidth > 0 ? (containerWidth - TRACK_PADDING * 2) / options.length : 0;

  useEffect(() => {
    if (pillWidth > 0) {
      Animated.timing(translateX, {
        toValue: selectedIndex * pillWidth,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, pillWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={containerStyle}>
      {label && (
        <FancyText
          size='extraSmall'
          type='semiBold'
          color={palette.fonts.inactive}
          style={{ marginBottom: 6 }}
        >
          {label}
        </FancyText>
      )}

      <View
        onLayout={handleLayout}
        style={[
          styles.track,
          {
            backgroundColor: palette.backgroundColor2,
            height,
          },
        ]}
      >
        {/* Sliding pill */}
        {pillWidth > 0 && (
          <Animated.View
            style={[
              styles.pill,
              {
                width: pillWidth,
                height: pillHeight,
                backgroundColor: palette.backgroundColor,
                transform: [{ translateX }],
                ...pillShadow,
              },
            ]}
          />
        )}

        {/* Options */}
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={styles.option}
              onPress={() => !disabled && onChange(option.value)}
              disabled={disabled}
              accessibilityRole='tab'
              accessibilityState={{ selected: isSelected }}
            >
              <FancyText
                size='extraSmall'
                type={isSelected ? 'semiBold' : 'normal'}
                color={isSelected ? palette.fonts.dark : palette.fonts.inactive}
              >
                {option.label}
              </FancyText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const pillShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2.5,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

const styles = StyleSheet.create({
  track: {
    borderRadius: BORDER_RADIUS_TRACK,
    padding: TRACK_PADDING,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: BORDER_RADIUS_PILL,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
