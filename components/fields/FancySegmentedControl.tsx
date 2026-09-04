import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

type Option<T extends string = string> = {
  label: string;
  value: T;
  /** Contagem opcional exibida como badge ao lado do label. */
  count?: number;
  /** Cor semântica opcional (dot + badge). Sem isso, badge fica neutro. */
  accentColor?: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  size?: 'sm' | 'md';
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Força modo scroll horizontal (sem pill animado). Default: auto quando > 3 opções. */
  scrollable?: boolean;
};

const TRACK_PADDING = 4;
const BORDER_RADIUS_TRACK = 10;
const BORDER_RADIUS_PILL = 8;
const SCROLL_GAP = 8;

export default function FancySegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  containerStyle,
  disabled = false,
  scrollable,
}: Props<T>) {
  const palette = usePallete();
  const height = size === 'sm' ? 36 : 40;
  const pillHeight = height - TRACK_PADDING * 2;
  const isScrollable = scrollable ?? options.length > 3;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const pillWidth = containerWidth > 0 ? (containerWidth - TRACK_PADDING * 2) / options.length : 0;

  useEffect(() => {
    if (!isScrollable && pillWidth > 0) {
      Animated.timing(translateX, {
        toValue: selectedIndex * pillWidth,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, pillWidth, isScrollable]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const renderOptionContent = (option: Option<T>, isSelected: boolean) => (
    <>
      <FancyText
        size='extraSmall'
        type={isSelected ? 'semiBold' : 'normal'}
        color={
          option.accentColor
            ? isSelected
              ? option.accentColor
              : palette.fonts.inactive
            : isSelected
              ? palette.fonts.dark
              : palette.fonts.inactive
        }
        numberOfLines={1}
      >
        {option.label}
      </FancyText>
      {option.count !== undefined && (
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: option.accentColor
                ? ColorUtils.withAlpha(option.accentColor, isSelected ? 0.2 : 0.12)
                : palette.backgroundColor3,
            },
          ]}
        >
          <FancyText
            size='extraSmall'
            type='bold'
            color={option.accentColor ? option.accentColor : palette.fonts.inactive}
          >
            {option.count}
          </FancyText>
        </View>
      )}
    </>
  );

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

      {isScrollable ? (
        <View
          style={[
            styles.scrollTrack,
            {
              backgroundColor: palette.backgroundColor2,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces
            decelerationRate='fast'
            contentContainerStyle={[styles.scrollContent, { paddingVertical: TRACK_PADDING }]}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => !disabled && onChange(option.value)}
                  disabled={disabled}
                  accessibilityRole='tab'
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.scrollOption,
                    {
                      height: pillHeight,
                      backgroundColor: isSelected ? palette.backgroundColor : 'transparent',
                      ...(isSelected ? pillShadow : {}),
                    },
                  ]}
                >
                  {renderOptionContent(option, isSelected)}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
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
                {renderOptionContent(option, isSelected)}
              </Pressable>
            );
          })}
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  scrollTrack: {
    borderRadius: BORDER_RADIUS_TRACK,
    paddingHorizontal: TRACK_PADDING,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SCROLL_GAP,
  },
  scrollOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS_PILL,
  },
  countBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 100,
    alignItems: 'center',
  },
});
