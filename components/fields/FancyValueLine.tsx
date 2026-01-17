import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancySeparator from '../FancySeparator';
import FancyText, { FancyTextProps } from '../FancyText';

export default function FancyValueLine({
  title,
  value,
  showSeparator = false,
  titleStyle,
  valueStyle,
  containerStyle,
  dataContainerStyle,
}: {
  title: string;
  value: string;
  showSeparator?: boolean;
  titleStyle?: Pick<FancyTextProps, 'size' | 'type' | 'color'>;
  valueStyle?: Pick<FancyTextProps, 'size' | 'type' | 'color' | 'style'>;
  dataContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ gap: 14 }, containerStyle]}>
      <View style={[styles.dataContainer, dataContainerStyle]}>
        <FancyText size={'small'} type='bold' style={styles.keyText} {...titleStyle}>
          {title}
        </FancyText>
        <FancyText size='small' type='medium' style={styles.valueText} {...valueStyle}>
          {value}
        </FancyText>
      </View>
      {showSeparator && <FancySeparator />}
    </View>
  );
}

const styles = StyleSheet.create({
  dataContainer: { flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center', borderWidth: 0 },
  dataDisplay: { width: '100%', justifyContent: 'space-between' },
  keyText: {
    lineHeight: 12,
    borderWidth: 0,
    opacity: 0.9,
  },
  valueText: { textAlign: 'right', flex: 1, lineHeight: 12, flexShrink: 1, borderWidth: 0 },
});
