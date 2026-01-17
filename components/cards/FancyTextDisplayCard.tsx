import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import React from 'react';

export function FancyTextDisplayCard({
  title,
  titleStyle,
  value,
  valueStyle,
  icon,
  containerStyle,
}: {
  title?: string;
  titleStyle?: Pick<FancyTextProps, 'size' | 'type' | 'color'>;
  value: string | React.ReactNode;
  valueStyle?: FancyTextProps;
  icon?: CustomIconProps;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.dataContainer, containerStyle]}>
      {icon && (
        <DefaultIcons.Custom
          {...icon}
          style={[
            {
              marginLeft: -1,
              textAlign: 'left',
            },
            icon.style,
          ]}
        />
      )}
      {title && (
        <FancyText size={'extraSmall'} type='normal' style={styles.keyText} {...titleStyle}>
          {title}
        </FancyText>
      )}
      {React.isValidElement(value) ? (
        value
      ) : (
        <FancyText size='extraSmall' type='semiBold' style={styles.valueText} {...valueStyle}>
          {value}
        </FancyText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dataContainer: { flexDirection: 'row', gap: 3, justifyContent: 'flex-start', alignItems: 'flex-start' },
  keyText: {
    lineHeight: 12,
    borderWidth: 0,
  },
  valueText: { lineHeight: 12, flexShrink: 1, opacity: 0.8 },
});
