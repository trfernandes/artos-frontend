import { ReactNode } from 'react';
import { Image, ImageProps } from 'expo-image';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

type Leading =
  | { type: 'image'; source?: ImageProps['source'] }
  | { type: 'icon'; icon: CustomIconProps; color?: string; backgroundColor?: string }
  | { type: 'letter'; letter: string; color?: string; backgroundColor?: string };

type Trailing =
  | { type: 'chevron'; onPress?: () => void }
  | { type: 'menu'; onPress: () => void }
  | ReactNode;

type FancyListItemCardProps = {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  leading?: Leading;
  trailing?: Trailing;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleProps?: FancyTextProps;
  subtitleProps?: FancyTextProps;
  accessibilityLabel?: string;
};

export default function FancyListItemCard({
  title,
  subtitle,
  meta,
  status,
  leading,
  trailing,
  onPress,
  containerStyle,
  contentStyle,
  titleProps,
  subtitleProps,
  accessibilityLabel,
}: FancyListItemCardProps) {
  const palette = usePallete();
  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: palette.backgroundColor2,
          borderColor: ColorUtils.withAlpha(palette.borderCard ?? palette.border, 0.72),
          ...palette.shadows[100],
        },
        containerStyle,
      ]}
      {...(onPress
        ? {
            onPress,
            accessibilityRole: 'button' as const,
            accessibilityLabel,
          }
        : {})}
    >
      {leading ? <LeadingItem leading={leading} /> : null}

      <View style={[styles.content, contentStyle]}>
        <View style={styles.titleRow}>
          {typeof title === 'string' ? (
            <FancyText
              size='small'
              type='semiBold'
              color={palette.fonts.dark}
              numberOfLines={2}
              {...titleProps}
              style={[styles.title, titleProps?.style]}
            >
              {title}
            </FancyText>
          ) : (
            <View style={styles.titleNode}>{title}</View>
          )}
          {status ? <View style={styles.status}>{status}</View> : null}
        </View>

        {subtitle ? (
          typeof subtitle === 'string' ? (
            <FancyText
              size='extraSmall'
              type='medium'
              color={palette.fonts.inactive}
              numberOfLines={2}
              {...subtitleProps}
              style={[styles.subtitle, subtitleProps?.style]}
            >
              {subtitle}
            </FancyText>
          ) : (
            subtitle
          )
        ) : null}

        {meta ? <View style={styles.meta}>{meta}</View> : null}
      </View>

      {trailing ? <TrailingItem trailing={trailing} defaultPress={onPress} /> : null}
    </Container>
  );
}

function LeadingItem({ leading }: { leading: Leading }) {
  const palette = usePallete();
  const fallbackColor = leading.type === 'image' ? palette.primary : leading.color ?? palette.primary;
  const fallbackBg =
    leading.type === 'image'
      ? ColorUtils.withAlpha(palette.primary, 0.12)
      : leading.backgroundColor ?? ColorUtils.withAlpha(fallbackColor, 0.12);

  if (leading.type === 'image') {
    return (
      <View style={[styles.leading, { backgroundColor: fallbackBg }]}>
        <Image source={leading.source} style={styles.image} cachePolicy='memory-disk' transition={120} />
      </View>
    );
  }

  if (leading.type === 'letter') {
    return (
      <View style={[styles.leading, { backgroundColor: fallbackBg }]}>
        <FancyText type='bold' size='extraSmall' color={fallbackColor} numberOfLines={1}>
          {leading.letter}
        </FancyText>
      </View>
    );
  }

  return (
    <View style={[styles.leading, { backgroundColor: fallbackBg }]}>
      <DefaultIcons.Custom
        {...leading.icon}
        size={leading.icon.size ?? 18}
        color={leading.icon.color ?? fallbackColor}
      />
    </View>
  );
}

function TrailingItem({
  trailing,
  defaultPress,
}: {
  trailing: Trailing;
  defaultPress?: () => void;
}) {
  const palette = usePallete();
  const trailingType = typeof trailing === 'object' && trailing && 'type' in trailing
    ? (trailing as { type?: string }).type
    : undefined;

  if (trailingType !== 'menu' && trailingType !== 'chevron') {
    return <View style={styles.trailing}>{trailing as ReactNode}</View>;
  }

  const actionTrailing = trailing as { type: 'menu' | 'chevron'; onPress?: () => void };
  const isMenu = actionTrailing.type === 'menu';
  const onPress = isMenu ? actionTrailing.onPress : actionTrailing.onPress ?? defaultPress;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={styles.trailingButton}
      accessibilityRole='button'
      accessibilityLabel={isMenu ? 'Abrir opções' : 'Abrir detalhes'}
    >
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name={isMenu ? 'dots-vertical' : 'chevron-right'}
        size={isMenu ? 20 : 22}
        color={palette.fonts.inactive}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    borderRadius: 22,
    borderWidth: 0.7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leading: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  image: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  title: {
    flex: 1,
    lineHeight: 17,
    includeFontPadding: false,
  },
  titleNode: {
    flex: 1,
    minWidth: 0,
  },
  status: {
    flexShrink: 0,
  },
  subtitle: {
    lineHeight: 15,
    includeFontPadding: false,
  },
  meta: {
    marginTop: 2,
  },
  trailing: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingButton: {
    width: 30,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
