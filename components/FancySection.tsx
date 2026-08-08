import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import FancyText from './FancyText';
import { ThemePalette } from '../constants/colors';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { ColorUtils } from '../utils/color_utils';

export default function FancySection({
  icon,
  title,
  children,
  containerStyle,
  contentStyle,
}: {
  icon: CustomIconProps;
  title?: string;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.sectionContainer, containerStyle]}>
      {title && (
        <View style={styles.sectionHeader}>
          <FancyText size='medium' type='bold' style={{ opacity: 0.8 }}>
            {title}
          </FancyText>
        </View>
      )}
      <View style={[styles.sectionContent, contentStyle]}>
        <View style={styles.iconContainer}>
          <DefaultIcons.Custom {...icon} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>{children}</View>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    sectionContainer: { gap: 12, borderWidth: 0, borderColor: 'red' },
    sectionHeader: { flexDirection: 'row', gap: 8 },
    sectionContent: { flexDirection: 'row', gap: 15, alignItems: 'center' },
    iconContainer: {
      backgroundColor: ColorUtils.lightenColor(palette.primary, 0.95),
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
