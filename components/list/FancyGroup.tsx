import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { ThemePalette } from '../../constants/colors';
import { BOLD_FONT, SMALL_SIZE_FONT } from '../../constants/font';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ColorUtils } from '../../utils/color_utils';

export interface FancyGroupProps {
  title?: string;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'accentedSummary';
  accentColor?: string;
}

export default function FancyGroup({
  title,
  children,
  contentContainerStyle,
  variant = 'default',
  accentColor,
}: FancyGroupProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isAccentedSummary = variant === 'accentedSummary';
  const resolvedAccentColor = accentColor || palette.primary;
  const titleBackgroundColor = isAccentedSummary ? palette.backgroundColor2 : palette.backgroundColor;
  const summaryCardBorderColor = ColorUtils.withAlpha(resolvedAccentColor, 0.16);

  return (
    <View>
      {title && (
        <View style={[styles.groupTitleContainer, { backgroundColor: titleBackgroundColor }]}>
          <FancyText style={styles.groupTitleText} color={palette.fonts.inactive}>
            {title}
          </FancyText>
        </View>
      )}

      <View
        style={[
          styles.groupContentContainer,
          { flexDirection: 'column' },
          isAccentedSummary && [
            styles.groupContentContainerAccentedSummary,
            {
              backgroundColor: palette.backgroundColor2,
              borderColor: summaryCardBorderColor,
            },
          ],
          contentContainerStyle,
        ]}
      >
        {isAccentedSummary && (
          <View
            pointerEvents='none'
            style={[styles.groupContentAccentBorder, { backgroundColor: resolvedAccentColor }]}
          />
        )}
        {children}
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    groupTitleText: { fontFamily: BOLD_FONT, fontSize: SMALL_SIZE_FONT },
    groupTitleContainer: {
      position: 'absolute',
      top: -6,
      left: 10,
      zIndex: 1000,
      paddingHorizontal: 5,
    },
    groupContentContainer: {
      borderColor: palette.border,
      ...palette.shadows[200],
      backgroundColor: palette.backgroundColor,
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
    },
    groupContentContainerAccentedSummary: {
      borderRadius: 8,
      overflow: 'hidden',
      paddingHorizontal: 14,
      paddingVertical: 8,
      elevation: 0,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    groupContentAccentBorder: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
    },
  });
}
