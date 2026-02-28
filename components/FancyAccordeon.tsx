import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { ThemePalette } from '../constants/colors';
import FancyText from './FancyText';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import { DefaultIconsNames } from '../constants/icons';
import { useCallback, useEffect, useState } from 'react';
import FancyContainer from './FancyContainer';
import { LinearGradient } from 'expo-linear-gradient';
import { usePallete } from '../hooks/usePallete';
import { useThemedStyles } from '../hooks/useThemedStyles';

export type FancyAccordeonProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  isExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  headerExpandedContainerStyle?: StyleProp<ViewStyle>;
  containerContainerStyle?: StyleProp<ViewStyle>;
  containerExpandedContainerStyle?: StyleProp<ViewStyle>;
  iconProps?: Partial<CustomIconProps>;
  headerColor?: string;
  expandedHeaderColor?: string;
  headerGradientColors?: string[];
  headerExpandedGradientColors?: string[];
  headerGradientStart?: { x: number; y: number };
  headerGradientEnd?: { x: number; y: number };
};

export default function FancyAccordeon({
  title,
  subtitle,
  isExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  contentContainerStyle,
  headerContainerStyle,
  headerExpandedContainerStyle,
  containerContainerStyle,
  containerExpandedContainerStyle,
  iconProps,
  headerColor,
  expandedHeaderColor,
  headerGradientColors,
  headerExpandedGradientColors,
  headerGradientStart = { x: 0, y: 0.5 },
  headerGradientEnd = { x: 1, y: 0.5 },
}: FancyAccordeonProps) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const [internalExpanded, setInternalExpanded] = useState(isExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? !!controlledExpanded : internalExpanded;

  useEffect(() => {
    if (!isControlled) {
      setInternalExpanded(isExpanded);
    }
  }, [isExpanded, isControlled]);

  const toggleExpand = useCallback(() => {
    const nextExpanded = !expanded;

    if (!isControlled) {
      setInternalExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  }, [expanded, isControlled, onExpandedChange]);
  const gradientColors =
    expanded && headerExpandedGradientColors?.length
      ? headerExpandedGradientColors
      : headerGradientColors;
  const resolvedHeaderColor = expanded ? expandedHeaderColor ?? headerColor : headerColor;

  return (
    <FancyContainer containerStyle={[styles.container, containerContainerStyle, expanded && containerExpandedContainerStyle]}>
      <TouchableOpacity
        onPress={toggleExpand}
        style={[
          styles.header,
          resolvedHeaderColor ? { backgroundColor: resolvedHeaderColor } : undefined,
          {
            borderRadius: 10,
            borderBottomStartRadius: expanded ? 0 : 10,
            borderBottomEndRadius: expanded ? 0 : 10,
            borderBottomWidth: expanded ? 0.5 : 0,
          },
          expanded ? headerExpandedContainerStyle : headerContainerStyle,
        ]}
      >
        {gradientColors?.length && gradientColors.length >= 2 ? (
          <LinearGradient
            colors={gradientColors as [string, string, ...string[]]}
            start={headerGradientStart}
            end={headerGradientEnd}
            style={styles.headerGradient}
            pointerEvents='none'
          />
        ) : null}
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

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
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
      backgroundColor: Pallete.backgroundColor2,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 15,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    headerGradient: {
      ...StyleSheet.absoluteFillObject,
    },
  });
}
