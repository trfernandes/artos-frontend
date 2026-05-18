import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import React from 'react';

export function FancyTextDisplay({
  title,
  titleStyle,
  value,
  valueStyle,
  icon,
  containerStyle,
}: {
  title: string;
  titleStyle?: Pick<FancyTextProps, 'size' | 'type' | 'color'>;
  value: string | React.ReactNode;
  valueStyle?: Pick<FancyTextProps, 'size' | 'type' | 'color' | 'style'>;
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
      <FancyText size={'small'} type='bold' style={styles.keyText} {...titleStyle}>
        {title}
      </FancyText>
      {React.isValidElement(value) ? (
        value
      ) : (
        <FancyText size='small' type='medium' style={styles.valueText} {...valueStyle}>
          {value}
        </FancyText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dataContainer: { flexDirection: 'row', gap: 6, justifyContent: 'flex-start', alignItems: 'center' },
  keyText: {
    lineHeight: 20,
    borderWidth: 0,
    opacity: 0.9,
  },
  valueText: { lineHeight: 20, flexShrink: 1, borderWidth: 0 },
});
