import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';

type DashboardCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: CustomIconProps;
  iconBackgroundColor?: string;
  onPress?: () => void;
  layout?: 'center' | 'horizontal';
  accentColor?: string;
  /** @deprecated use layout + iconBackgroundColor instead */
  surfaceVariant?: 'default' | 'infoBlue' | 'scaleCard';
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  iconBackgroundColor,
  onPress,
  layout = 'horizontal',
  accentColor,
}: DashboardCardProps) {
  const styles = useThemedStyles(createStyles);

  const content =
    layout === 'horizontal' ? (
      <View style={styles.container}>
        <View
          style={[
            styles.squircle,
            {
              backgroundColor:
                iconBackgroundColor || ColorUtils.withAlpha(accentColor ?? '#534ab7', 0.12),
            },
          ]}
        >
          <DefaultIcons.Custom
            library={icon.library}
            name={icon.name}
            size={icon.size || 20}
            color={icon.color || accentColor}
          />
        </View>

        <View style={styles.rightContent}>
          <FancyText
            size={20}
            type='bold'
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {value}
          </FancyText>
          <FancyText
            size='small'
            type='medium'
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {title}
          </FancyText>
          {subtitle ? (
            <FancyText size='extraSmall' type='normal' numberOfLines={1}>
              {subtitle}
            </FancyText>
          ) : null}
        </View>
      </View>
    ) : (
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.centerIcon,
            {
              backgroundColor:
                iconBackgroundColor || ColorUtils.withAlpha(accentColor ?? '#534ab7', 0.15),
            },
          ]}
        >
          <DefaultIcons.Custom
            library={icon.library}
            name={icon.name}
            size={icon.size || 12}
            color={icon.color || accentColor}
          />
        </View>
        <View style={styles.centerContent}>
          <FancyText
            size={16}
            type='bold'
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            style={styles.fitText}
          >
            {value}
          </FancyText>
          <FancyText size='extraSmall' type='semiBold' numberOfLines={2} style={styles.fitText}>
            {title}
          </FancyText>
          {subtitle ? (
            <FancyText
              size='extraSmall'
              type='normal'
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.88}
              style={styles.fitText}
            >
              {subtitle}
            </FancyText>
          ) : null}
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: palette.backgroundColor,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45),
      padding: 12,
      ...palette.shadows[200],
    },
    squircle: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rightContent: {
      flex: 1,
      gap: 1,
    },
    centerContainer: {
      flex: 1,
      backgroundColor: palette.backgroundColor,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45),
      padding: 8,
      minHeight: 80,
      ...palette.shadows[200],
    },
    centerIcon: {
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
  });
}
