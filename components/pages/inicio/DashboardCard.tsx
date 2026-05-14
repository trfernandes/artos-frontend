import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';

type DashboardCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: CustomIconProps;
  iconBackgroundColor?: string;
  onPress?: () => void;
  surfaceVariant?: 'default' | 'infoBlue' | 'scaleCard';
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  iconBackgroundColor,
  onPress,
  surfaceVariant = 'default',
}: DashboardCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  const content = (
    <View
      style={[
        styles.container,
        surfaceVariant === 'infoBlue' && styles.infoBlueContainer,
        surfaceVariant === 'scaleCard' && styles.scaleCardContainer,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor || ColorUtils.withAlpha(palette.primary, 0.15) }]}>
        <DefaultIcons.Custom
          library={icon.library}
          name={icon.name}
          size={icon.size || 12}
          color={icon.color || palette.primary}
        />
      </View>

      <View style={styles.centerContent}>
        <FancyText
          size={16}
          type="bold"
          color={palette.fonts.dark}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          style={[styles.fitText, styles.valueText]}
        >
          {value}
        </FancyText>

        <FancyText
          size="small"
          type="semiBold"
          color={palette.fonts.inactive}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={styles.fitText}
        >
          {title}
        </FancyText>

        {subtitle && (
          <FancyText
            size="extraSmall"
            type="normal"
            color={palette.fonts.inactive}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.88}
            style={styles.fitText}
          >
            {subtitle}
          </FancyText>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    pressable: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: palette.backgroundColor2,
      borderRadius: 16,
      padding: 8,
      minHeight: 80,
      ...palette.shadows[100],
    },
    infoBlueContainer: {
      backgroundColor: palette.backgroundColor4,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
    },
    scaleCardContainer: {
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.45),
    },
    iconContainer: {
      position: 'absolute',
      top: 8,
      left: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 10,
      gap: 5,
    },
    fitText: {
      width: '100%',
      textAlign: 'center',
    },
    valueText: {
      opacity: 0.8,
    },
  });
}
