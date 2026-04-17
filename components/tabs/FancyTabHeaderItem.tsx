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
  stretch?: boolean;
} & TabItem;

const ACTIVE_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

export default function FancyTabHeaderItem({
  status = 'active',
  onMeasuredLayout,
  stretch = false,
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
        stretch && styles.containerStretch,
        isActive ? [styles.active, ACTIVE_SHADOW] : styles.inactive,
      ]}
      accessibilityRole='tab'
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.innerContent}>
        {props.icon ? (
          <View style={styles.iconContainer}>
            <DefaultIcons.Custom
              {...props.icon}
              size={16}
              color={isActive ? palette.fonts.light : palette.fonts.inactive}
            />
          </View>
        ) : null}

        <FancyText
          type={isActive ? 'semiBold' : 'semiBoldItalic'}
          size='extraSmall'
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: isActive ? palette.fonts.light : palette.fonts.inactive,
            },
          ]}
        >
          {props.title}
        </FancyText>
      </View>
    </Pressable>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      borderRadius: 16,
      minHeight: 42,
      justifyContent: 'center',
      overflow: 'hidden',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.7),
      backgroundColor: palette.backgroundColor2,
    },
    containerStretch: {
      flex: 1,
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
      gap: 6,
    },
    iconContainer: {
      width: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      lineHeight: 16,
      includeFontPadding: false,
      paddingTop: 1,
    },
  });
}
