import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';
import DefaultIcons from './FancyIcons';
import { DefaultIconsNames } from '../constants/icons';
import { useState } from 'react';

export type FancyAccordeonProps = {
  title: string;
  subtitle?: string;
  isExpanded?: boolean;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function FancyAccordeon({
  title,
  subtitle,
  isExpanded = false,
  children,
  contentContainerStyle,
}: FancyAccordeonProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomWidth: expanded ? 0.5 : 0 }]}>
        <FancyText size={'small'} type="bold" style={{ lineHeight: 16, borderWidth: 0 }}>
          {title}
        </FancyText>
        <FancyText
          size={'extraSmall'}
          color={Pallete.fonts.inactive}
          type="medium"
          style={{ lineHeight: 16, paddingTop: 2, flex: 1, borderWidth: 0, textAlign: 'right' }}
          numberOfLines={2}
        >
          {subtitle}
        </FancyText>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            borderColor: 'coral',
            paddingLeft: 20,
            paddingRight: 13,
            paddingTop: 15,
            paddingBottom: 13,
          }}
          onPress={() => setExpanded(!expanded)}
        >
          <DefaultIcons.Custom
            library={expanded ? DefaultIconsNames['chevron-up'].library : DefaultIconsNames['chevron-down'].library}
            name={expanded ? DefaultIconsNames['chevron-up'].name : DefaultIconsNames['chevron-down'].name}
            size={18}
            color={Pallete.icons.inactive}
            style={{}}
          />
        </TouchableOpacity>
      </View>
      {expanded && <View style={contentContainerStyle}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Pallete.border,
  },
  header: {
    borderColor: Pallete.border,
    paddingLeft: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    flexDirection: 'row',
  },
});
