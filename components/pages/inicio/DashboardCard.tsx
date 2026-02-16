import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FancyText from '../../FancyText';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { Pallete } from '../../../constants/colors';

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
  const content = (
    <View
      style={[
        styles.container,
        surfaceVariant === 'infoBlue' && styles.infoBlueContainer,
        surfaceVariant === 'scaleCard' && styles.scaleCardContainer,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor || `${Pallete.primary}15` }]}>
        <DefaultIcons.Custom
          library={icon.library}
          name={icon.name}
          size={icon.size || 12}
          color={icon.color || Pallete.primary}
        />
      </View>

      <View style={styles.centerContent}>
        <FancyText
          size={16}
          type="bold"
          color={Pallete.fonts.dark}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          style={[styles.fitText, styles.valueText]}
        >
          {value}
        </FancyText>

        <FancyText
          size="extraSmall"
          type="medium"
          color={Pallete.fonts.inactive}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.88}
          style={styles.fitText}
        >
          {title}
        </FancyText>

        {subtitle && (
          <FancyText
            size="extraSmall"
            type="normal"
            color={Pallete.fonts.inactive}
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

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 16,
    padding: 10,
    minHeight: 80,
    ...Pallete.shadows[100],
  },
  infoBlueContainer: {
    backgroundColor: Pallete.backgroundColor4,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.22)',
  },
  scaleCardContainer: {
    borderWidth: 1,
    borderColor: 'rgba(191,191,191,0.45)',
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
