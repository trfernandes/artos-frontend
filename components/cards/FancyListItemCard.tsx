import { ReactNode } from 'react';
import { Image, ImageProps } from 'expo-image';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ColorUtils } from '../../utils/color_utils';

type Leading =
  | { type: 'image'; source?: ImageProps['source']; size?: number }
  | { type: 'icon'; icon: CustomIconProps; color?: string; backgroundColor?: string; size?: number }
  | { type: 'letter'; letter: string; color?: string; backgroundColor?: string }
  | { type: 'date'; day: string; month: string; color?: string; backgroundColor?: string };

type Trailing =
  { type: 'chevron'; onPress?: () => void } | { type: 'menu'; onPress: () => void } | ReactNode;

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
  const { palette, isDark } = useAppTheme();
  const Container = onPress ? Pressable : View;
  // Claro: card branco sobre página cinza. Escuro: card levemente mais claro que a página
  // (#1A1A1A sobre #121212) — mantém a elevação correta nos dois temas.
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: ColorUtils.withAlpha(palette.borderCard ?? palette.border, 0.45),
          ...palette.shadows[200],
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
  const fallbackColor =
    leading.type === 'image' ? palette.primary : (leading.color ?? palette.primary);
  const fallbackBg =
    leading.type === 'image'
      ? ColorUtils.withAlpha(palette.primary, 0.12)
      : (leading.backgroundColor ?? ColorUtils.withAlpha(fallbackColor, 0.12));

  if (leading.type === 'image') {
    const size = leading.size ?? 46;
    return (
      <View
        style={[
          styles.leading,
          styles.leadingCircle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: fallbackBg },
        ]}
      >
        <Image
          source={leading.source}
          style={{ width: size, height: size }}
          cachePolicy='memory-disk'
          transition={120}
        />
      </View>
    );
  }

  if (leading.type === 'letter') {
    return (
      <View style={[styles.leading, styles.leadingCircle, { backgroundColor: fallbackBg }]}>
        <FancyText type='bold' size='small' color={fallbackColor} numberOfLines={1}>
          {leading.letter}
        </FancyText>
      </View>
    );
  }

  if (leading.type === 'date') {
    return (
      <View style={[styles.leading, styles.leadingSquircle, { backgroundColor: fallbackBg }]}>
        <FancyText
          type='bold'
          size='large'
          color={fallbackColor}
          numberOfLines={1}
          style={styles.dateDay}
        >
          {leading.day}
        </FancyText>
        <FancyText
          type='medium'
          size='extraSmall'
          color={fallbackColor}
          numberOfLines={1}
          style={styles.dateMonth}
        >
          {leading.month.toUpperCase()}
        </FancyText>
      </View>
    );
  }

  const containerSize = leading.size;
  return (
    <View
      style={[
        styles.leading,
        styles.leadingSquircle,
        { backgroundColor: fallbackBg },
        containerSize
          ? { width: containerSize, height: containerSize, borderRadius: containerSize / 3 }
          : null,
      ]}
    >
      <DefaultIcons.Custom
        {...leading.icon}
        size={leading.icon.size ?? 20}
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
  const trailingType =
    typeof trailing === 'object' && trailing && 'type' in trailing
      ? (trailing as { type?: string }).type
      : undefined;

  if (trailingType !== 'menu' && trailingType !== 'chevron') {
    return <View style={styles.trailing}>{trailing as ReactNode}</View>;
  }

  const actionTrailing = trailing as { type: 'menu' | 'chevron'; onPress?: () => void };
  const isMenu = actionTrailing.type === 'menu';
  const onPress = isMenu ? actionTrailing.onPress : (actionTrailing.onPress ?? defaultPress);

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
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leading: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  leadingCircle: {
    borderRadius: 23,
  },
  leadingSquircle: {
    borderRadius: 14,
  },
  image: {
    width: 46,
    height: 46,
  },
  dateDay: {
    lineHeight: 19,
    includeFontPadding: false,
  },
  dateMonth: {
    lineHeight: 11,
    includeFontPadding: false,
    letterSpacing: 0.4,
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
