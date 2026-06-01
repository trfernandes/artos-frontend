import { View, StyleSheet } from 'react-native';
import React from 'react';
import { ThemePalette } from '../constants/colors';
import { useThemedStyles } from '../hooks/useThemedStyles';
import FancySeparator from './FancySeparator';
import FancyText from './FancyText';

export interface FancyTable {
  header: string[] | React.ReactNode[];
  data: string[][] | React.ReactNode[][];
}

export default function FancyTable({ ...props }: FancyTable) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
        {props.header.map((item, index) =>
          typeof item === 'string' ? (
            <FancyText
              key={index}
              size={'extraSmall'}
              type='semiBold'
              style={{ textAlign: 'left', flex: 1, borderWidth: 0 }}
              numberOfLines={2}
            >
              {item}
            </FancyText>
          ) : (
            <View key={index}>{item}</View>
          ),
        )}
      </View>
      <FancySeparator style={{ marginBottom: 4 }} />
      {props.data.map((item, index) => (
        <View
          key={index}
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}
        >
          {item.map((item, index) => (
            <FancyText
              key={index}
              size={'extraSmall'}
              type='medium'
              style={{ textAlign: 'left', flex: 1, borderWidth: 0 }}
              numberOfLines={2}
            >
              {item}
            </FancyText>
          ))}
        </View>
      ))}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.backgroundColor,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 3,
      gap: 6,
    },
  });
}
