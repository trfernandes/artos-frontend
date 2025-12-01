import { View, StyleSheet } from 'react-native';
import React from 'react';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import FancyText from './FancyText';
import { Pallete } from '../constants/colors';
import { ColorUtils } from '../utils/color_utils';

export default function FancySection({
  icon,
  title,
  children,
}: {
  icon: CustomIconProps;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <FancyText size="medium" type="bold" style={{ opacity: 0.8 }}>
          {title}
        </FancyText>
      </View>
      <View style={styles.sectionContent}>
        <View style={styles.iconContainer}>
          <DefaultIcons.Custom {...icon} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { gap: 12, borderWidth: 0, borderColor: 'red' },
  sectionHeader: { flexDirection: 'row', gap: 8 },
  sectionContent: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  iconContainer: {
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.95),
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
