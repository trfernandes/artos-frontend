import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import { DefaultIconsNames } from '../constants/icons';
import { useCallback, useState } from 'react';
import FancyContainer from './FancyContainer';

export type FancyAccordeonProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  isExpanded?: boolean;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  headerExpandedContainerStyle?: StyleProp<ViewStyle>;
  containerContainerStyle?: StyleProp<ViewStyle>;
  containerExpandedContainerStyle?: StyleProp<ViewStyle>;
  iconProps?: Partial<CustomIconProps>;
};

export default function FancyAccordeon({
  title,
  subtitle,
  isExpanded = false,
  children,
  contentContainerStyle,
  headerContainerStyle,
  headerExpandedContainerStyle,
  containerContainerStyle,
  containerExpandedContainerStyle,
  iconProps,
}: FancyAccordeonProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  const toggleExpand = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <FancyContainer containerStyle={[styles.container, containerContainerStyle, expanded && containerExpandedContainerStyle]}>
      <TouchableOpacity
        onPress={toggleExpand}
        style={[
          styles.header,
          {
            borderRadius: 10,
            borderBottomStartRadius: expanded ? 0 : 10,
            borderBottomEndRadius: expanded ? 0 : 10,
            borderBottomWidth: expanded ? 0.5 : 0,
          },
          expanded ? headerExpandedContainerStyle : headerContainerStyle,
        ]}
      >
        {typeof title === 'string' ? (
          <FancyText size={'small'} type='bold' style={{ lineHeight: 16, borderWidth: 0, opacity: 0.9 }}>
            {title}
          </FancyText>
        ) : (
          title
        )}
        {typeof subtitle === 'string' ? (
          <FancyText
            size={'extraSmall'}
            color={Pallete.fonts.inactive}
            type='medium'
            style={{ lineHeight: 16, paddingTop: 2, flex: 1, borderWidth: 0, textAlign: 'right' }}
            numberOfLines={2}
          >
            {subtitle}
          </FancyText>
        ) : (
          subtitle
        )}
        <View
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
        >
          <DefaultIcons.Custom
            library={expanded ? DefaultIconsNames['chevron-up'].library : DefaultIconsNames['chevron-down'].library}
            name={expanded ? DefaultIconsNames['chevron-up'].name : DefaultIconsNames['chevron-down'].name}
            size={20}
            color={Pallete.icons.inactive}
            style={{}}
            {...iconProps}
          />
        </View>
      </TouchableOpacity>
      {expanded && <View style={contentContainerStyle}>{children}</View>}
    </FancyContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Pallete.border,
    ...Pallete.shadows[200],
  },
  header: {
    borderColor: Pallete.border,
    paddingLeft: 15,
    backgroundColor: '#f9f9f9ff',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    flexDirection: 'row',
  },
});
