import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { Pallete } from '../../constants/colors';
import { BOLD_FONT, SMALL_SIZE_FONT } from '../../constants/font';
import FancyText from '../FancyText';

export interface FancyGroupProps {
  title?: string;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function FancyGroup({ title, children, contentContainerStyle }: FancyGroupProps) {
  return (
    <View>
      {title && (
        <View style={styles.groupTitleContainer}>
          <FancyText style={styles.groupTitleText}>{title}</FancyText>
        </View>
      )}

      <View style={[styles.groupContentContainer, { flexDirection: 'column' }, contentContainerStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupTitleText: { color: Pallete.fonts.inactive, fontFamily: BOLD_FONT, fontSize: SMALL_SIZE_FONT },
  groupTitleContainer: {
    position: 'absolute',
    top: -6,
    left: 10,
    zIndex: 1000,
    backgroundColor: 'white',
    paddingHorizontal: 5,
  },
  groupContentContainer: { borderColor: Pallete.border, borderWidth: 1, borderRadius: 10, padding: 15 },
});
