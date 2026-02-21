import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { ThemePalette } from '../../constants/colors';
import { BOLD_FONT, SMALL_SIZE_FONT } from '../../constants/font';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export interface FancyGroupProps {
  title?: string;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function FancyGroup({ title, children, contentContainerStyle }: FancyGroupProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View>
      {title && (
        <View style={styles.groupTitleContainer}>
          <FancyText style={styles.groupTitleText} color={palette.fonts.inactive}>
            {title}
          </FancyText>
        </View>
      )}

      <View style={[styles.groupContentContainer, { flexDirection: 'column' }, contentContainerStyle]}>{children}</View>
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
      backgroundColor: palette.backgroundColor,
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
  });
}
