import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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
  hideChevron?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
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
  hideChevron = false,
  disabled = false,
  isLoading = false,
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
    if (disabled || isLoading) return;
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
  const shouldRenderTrailing = !!subtitle || isLoading || !hideChevron;

  const renderTrailingContent = () => {
    if (typeof subtitle === 'string') {
      return (
        <FancyText
          size='extraSmall'
          color={Pallete.fonts.inactive}
          type='medium'
          style={styles.subtitleText}
          numberOfLines={2}
        >
          {subtitle}
        </FancyText>
      );
    }

    if (subtitle) {
      return <View style={styles.subtitleNode}>{subtitle}</View>;
    }

    return null;
  };

  return (
    <FancyContainer
      containerStyle={[
        styles.container,
        containerContainerStyle,
        expanded && containerExpandedContainerStyle,
      ]}
    >
      <TouchableOpacity
        onPress={toggleExpand}
        disabled={disabled || isLoading}
        style={[
          styles.header,
          disabled && styles.headerDisabled,
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
        <View style={styles.headerLeft}>
          {typeof title === 'string' ? (
            <FancyText size='small' type='bold' style={styles.titleText}>
              {title}
            </FancyText>
          ) : (
            title
          )}
        </View>
        {shouldRenderTrailing ? (
          <View style={styles.headerRight}>
            {renderTrailingContent()}
            {isLoading ? (
              <ActivityIndicator size='small' color={iconProps?.color ?? Pallete.primary} />
            ) : hideChevron ? null : (
              <DefaultIcons.Custom
                library={
                  expanded
                    ? DefaultIconsNames['chevron-up'].library
                    : DefaultIconsNames['chevron-down'].library
                }
                name={
                  expanded
                    ? DefaultIconsNames['chevron-up'].name
                    : DefaultIconsNames['chevron-down'].name
                }
                size={20}
                color={Pallete.icons.inactive}
                {...iconProps}
              />
            )}
          </View>
        ) : null}
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
      paddingRight: 13,
      paddingVertical: 12,
      backgroundColor: Pallete.backgroundColor2,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    headerDisabled: {
      opacity: 0.92,
    },
    headerLeft: {
      flex: 1,
      minWidth: 0,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
      flexShrink: 0,
      minHeight: 24,
    },
    titleText: {
      lineHeight: 16,
      opacity: 0.9,
    },
    subtitleText: {
      lineHeight: 16,
      textAlign: 'right',
      maxWidth: 180,
    },
    subtitleNode: {
      flexShrink: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    headerGradient: {
      ...StyleSheet.absoluteFillObject,
    },
  });
}
