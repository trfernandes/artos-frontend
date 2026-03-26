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
  multiline = false,
}: {
  title: string;
  value: string;
  showSeparator?: boolean;
  titleStyle?: Pick<FancyTextProps, 'size' | 'type' | 'color'>;
  valueStyle?: Pick<FancyTextProps, 'size' | 'type' | 'color' | 'style'>;
  dataContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  multiline?: boolean;
}) {
  return (
    <View style={[{ gap: 14 }, containerStyle]}>
      <View style={[multiline ? styles.dataContainerMultiline : styles.dataContainer, dataContainerStyle]}>
        <FancyText size={'small'} type='bold' style={styles.keyText} {...titleStyle}>
          {title}
        </FancyText>
        <FancyText size='small' type='medium' style={multiline ? styles.valueTextMultiline : styles.valueText} {...valueStyle}>
          {value}
        </FancyText>
      </View>
      {showSeparator && <FancySeparator />}
    </View>
  );
}

const styles = StyleSheet.create({
  dataContainer: { flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'flex-start', borderWidth: 0 },
  dataContainerMultiline: { flexDirection: 'column', gap: 4, justifyContent: 'flex-start', borderWidth: 0 },
  dataDisplay: { width: '100%', justifyContent: 'space-between' },
  keyText: {
    borderWidth: 0,
    opacity: 0.9,
  },
  valueText: { textAlign: 'right', flex: 1, flexShrink: 1, borderWidth: 0 },
  valueTextMultiline: { borderWidth: 0 },
});
