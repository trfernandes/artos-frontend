import { LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import { TabItem } from './FancyTabs';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { ThemePalette } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ColorUtils } from '../../utils/color_utils';

export type FancyTabHeaderItemProps = {
  status: 'active' | 'inactive';
  onPress?: () => void;
  onMeasuredLayout?: (layout: { x: number; width: number }) => void;
  equalWidth?: boolean;
  calculatedWidth?: number;
  compact?: boolean;
} & TabItem;

const ACTIVE_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
  },
  android: {
    elevation: 1,
  },
  default: {},
});

export default function FancyTabHeaderItem({
  status = 'active',
  onMeasuredLayout,
  equalWidth = false,
  calculatedWidth,
  compact = false,
  ...props
}: FancyTabHeaderItemProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isActive = status === 'active';

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    onMeasuredLayout?.({ x, width });
  };

  return (
    <Pressable
      onPress={props.onPress}
      onLayout={handleLayout}
      style={[
        styles.container,
        equalWidth && styles.containerEqualWidth,
        calculatedWidth ? { width: calculatedWidth } : undefined,
        compact && styles.containerCompact,
        isActive ? [styles.active, ACTIVE_SHADOW] : styles.inactive,
      ]}
      accessibilityRole='tab'
      accessibilityState={{ selected: isActive }}
    >
      <View style={[styles.innerContent, equalWidth && styles.innerContentEqualWidth]}>
        {props.icon ? (
          <View style={styles.iconContainer}>
            <DefaultIcons.Custom
              {...props.icon}
              size={compact ? 12 : 14}
              color={isActive ? palette.fonts.light : palette.fonts.inactive}
            />
          </View>
        ) : null}

        <FancyText
          type='semiBold'
          size='extraSmall'
          numberOfLines={1}
          style={[
            styles.title,
            compact && styles.titleCompact,
            equalWidth && styles.titleEqualWidth,
            {
              color: isActive ? palette.fonts.light : palette.fonts.inactive,
            },
          ]}
        >
          {props.title}
        </FancyText>

        {typeof props.badgeCount === 'number' && props.badgeCount > 0 ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isActive
                  ? palette.fonts.light
                  : ColorUtils.withAlpha(palette.primary, 0.18),
              },
            ]}
          >
            <FancyText
              type='bold'
              size={9}
              numberOfLines={1}
              style={[
                styles.badgeText,
                {
                  color: palette.primary,
                },
              ]}
            >
              {props.badgeCount > 99 ? '99+' : props.badgeCount}
            </FancyText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      borderRadius: 12,
      minHeight: 34,
      justifyContent: 'center',
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.7),
      backgroundColor: palette.backgroundColor2,
    },
    containerEqualWidth: {
      flex: 1,
    },
    containerCompact: {
      minHeight: 30,
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    active: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    inactive: {
      backgroundColor: palette.backgroundColor2,
    },
    innerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    // com largura fixa (equalWidth), o conteúdo preenche a aba e o título usa
    // flex:1 para centralizar/truncar — o ícone segue no fluxo com o gap padrão,
    // garantindo espaçamento entre ícone e texto.
    innerContentEqualWidth: {
      alignSelf: 'stretch',
    },
    iconContainer: {
      width: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      lineHeight: 14,
      includeFontPadding: false,
      paddingTop: 0,
    },
    titleEqualWidth: {
      flex: 1,
      textAlign: 'center',
    },
    titleCompact: {
      lineHeight: 12,
      paddingTop: 0,
    },
    badge: {
      minWidth: 17,
      height: 17,
      borderRadius: 999,
      paddingHorizontal: 3,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 1,
    },
    badgeText: {
      lineHeight: 11,
      includeFontPadding: false,
      textAlign: 'center',
    },
  });
}
