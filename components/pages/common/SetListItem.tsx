import { memo, useEffect, useRef, useState } from 'react';
import { Animated, Linking, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import FancyText from '../../FancyText';
import { usePallete } from '../../../hooks/usePallete';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ColorUtils } from '../../../utils/color_utils';
import {
  detectMusicLinkService,
  isOpenableMusicUrl,
  toOpenableMusicUrl,
} from '../../../utils/musicLinkUtils';

const LIST_GAP = 2;

export type SetListItemProps = {
  order: number;
  total: number;
  name: string;
  artist?: string | null;
  totalSecoes?: number | null;
  tom?: string | null;
  bpm?: number | null;
  versaoUrl?: string | null;
  observacoes?: string | null;
  hasEstruturaOverride?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onActionsPress?: () => void;
  onLongPress?: () => void;
  isEditable: boolean;
  isActive?: boolean;
  isLast?: boolean;
  reorderMode?: boolean;
  cardHeight?: number;
  nextCardHeight?: number;
  onMeasureHeight?: (height: number) => void;
};

function SetListItem({
  order,
  name,
  artist,
  tom,
  bpm,
  versaoUrl,
  observacoes,
  onPress,
  onActionsPress,
  onLongPress,
  isEditable,
  isActive = false,
  isLast = false,
  reorderMode = false,
  cardHeight,
  nextCardHeight,
  onMeasureHeight,
}: SetListItemProps) {
  const palette = usePallete();
  const { isDark } = useAppTheme();
  const [notaExpandida, setNotaExpandida] = useState(false);
  const orderLabel = String(order).padStart(2, '0');
  const musicMetaLabel = [tom ? `Tom ${tom}` : null, bpm ? `BPM ${bpm}` : null]
    .filter(Boolean)
    .join(', ');
  const musicMetaText = [tom?.trim() || null, bpm ? `${bpm} BPM` : null]
    .filter(Boolean)
    .join(' · ');

  const trimmedUrl = versaoUrl?.trim() || '';
  const hasUrl = trimmedUrl.length > 0 && isOpenableMusicUrl(trimmedUrl);
  const listenService = hasUrl ? detectMusicLinkService(trimmedUrl) : null;
  const listenIconName =
    listenService === 'spotify'
      ? 'spotify'
      : listenService === 'youtube'
        ? 'youtube'
        : 'play-circle-outline';
  const listenColor = hasUrl ? palette.primary : palette.fonts.inactive2;

  const trimmedNota = observacoes?.trim() || '';
  const hasNota = trimmedNota.length > 0;

  const surfaceBackground = isDark ? palette.backgroundColor3 : palette.backgroundColor;

  const activeOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(activeOpacity, {
      toValue: isActive ? 0.84 : 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isActive, activeOpacity]);

  const handleCardLayout = onMeasureHeight
    ? (e: LayoutChangeEvent) => onMeasureHeight(e.nativeEvent.layout.height)
    : undefined;

  const lineStyle =
    cardHeight != null && nextCardHeight != null
      ? { top: cardHeight / 2, bottom: -(LIST_GAP + nextCardHeight / 2) }
      : { top: 0, bottom: -LIST_GAP };

  return (
    <View style={styles.row}>
      <View style={styles.railCol}>
        {!isLast ? (
          <LinearGradient
            colors={[palette.primary, ColorUtils.withAlpha(palette.primary, 0.25)]}
            style={[styles.line, lineStyle]}
          />
        ) : null}
        <View style={[styles.dot, { backgroundColor: palette.primary }]}>
          <FancyText
            type='bold'
            size='extraSmall'
            color={palette.fonts.light}
            style={styles.dotText}
          >
            {orderLabel}
          </FancyText>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: activeOpacity }}>
        <Pressable
          onPress={reorderMode ? undefined : onPress}
          onLongPress={isEditable && reorderMode ? onLongPress : undefined}
          onLayout={handleCardLayout}
          delayLongPress={300}
          disabled={reorderMode}
          accessibilityRole='button'
          accessibilityLabel={`Música ${order}, ${name}${musicMetaLabel ? `, ${musicMetaLabel}` : ''}. Toque para ${isEditable ? 'editar' : 'visualizar'}.`}
          style={[
            styles.card,
            !isLast && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: palette.border,
            },
            isActive && { backgroundColor: surfaceBackground },
          ]}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardCenter}>
              <FancyText
                type='semiBold'
                size='small'
                numberOfLines={2}
                color={palette.fonts.dark}
                style={styles.title}
              >
                {name}
              </FancyText>
              <FancyText
                type='medium'
                size='small'
                numberOfLines={1}
                color={palette.fonts.inactive}
                style={styles.subtitle}
              >
                {artist || 'Sem intérprete'}
              </FancyText>
              {musicMetaText ? (
                <FancyText
                  type='bold'
                  size='extraSmall'
                  numberOfLines={1}
                  color={palette.fonts.dark}
                  style={styles.metaText}
                >
                  {musicMetaText}
                </FancyText>
              ) : null}
            </View>

            <View style={styles.actionsCol}>
              <Pressable
                onPress={hasUrl ? () => Linking.openURL(toOpenableMusicUrl(trimmedUrl)) : undefined}
                disabled={!hasUrl}
                hitSlop={8}
                accessibilityRole='button'
                accessibilityLabel='Ouvir música'
                style={[
                  styles.actionButton,
                  { backgroundColor: ColorUtils.withAlpha(listenColor, 0.08) },
                ]}
              >
                <MaterialCommunityIcons name={listenIconName} size={18} color={listenColor} />
              </Pressable>
              {reorderMode ? (
                <Pressable
                  onLongPress={onLongPress}
                  delayLongPress={150}
                  hitSlop={8}
                  accessibilityRole='button'
                  accessibilityLabel='Arrastar para reordenar'
                  style={[
                    styles.actionButton,
                    { backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08) },
                  ]}
                >
                  <MaterialCommunityIcons
                    name='drag-horizontal-variant'
                    size={18}
                    color={palette.fonts.inactive}
                  />
                </Pressable>
              ) : isEditable ? (
                <Pressable
                  onPress={onActionsPress}
                  hitSlop={8}
                  accessibilityRole='button'
                  accessibilityLabel='Opções da música'
                  style={[
                    styles.actionButton,
                    { backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08) },
                  ]}
                >
                  <MaterialCommunityIcons
                    name='dots-vertical'
                    size={18}
                    color={palette.fonts.inactive}
                  />
                </Pressable>
              ) : (
                <Pressable
                  onPress={onPress}
                  hitSlop={8}
                  accessibilityRole='button'
                  accessibilityLabel='Ver detalhes da música'
                  style={[styles.actionButton, { backgroundColor: palette.primary }]}
                >
                  <MaterialCommunityIcons
                    name='chevron-right'
                    size={18}
                    color={palette.fonts.light}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {hasNota ? (
            <Pressable
              onPress={() => setNotaExpandida((prev) => !prev)}
              hitSlop={4}
              style={styles.noteToggle}
              accessibilityRole='button'
              accessibilityLabel={
                notaExpandida ? 'Ocultar orientação da música' : 'Ver orientação da música'
              }
            >
              <MaterialCommunityIcons
                name='note-text-outline'
                size={13}
                color={palette.fonts.inactive}
              />
              <FancyText type='semiBold' size='extraSmall' color={palette.fonts.inactive}>
                {notaExpandida ? 'ocultar orientação' : 'orientação desta música'}
              </FancyText>
              <MaterialCommunityIcons
                name={notaExpandida ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={palette.fonts.inactive}
              />
            </Pressable>
          ) : null}
          {hasNota && notaExpandida ? (
            <View style={[styles.noteBox, { borderColor: palette.border }]}>
              <FancyText
                type='medium'
                size='small'
                color={palette.fonts.dark}
                style={styles.noteText}
              >
                {trimmedNota}
              </FancyText>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  railCol: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotText: {
    fontSize: 9,
    includeFontPadding: false,
  },
  line: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardCenter: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 13,
    lineHeight: 17,
    includeFontPadding: false,
  },
  subtitle: {
    includeFontPadding: false,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
    includeFontPadding: false,
    marginTop: 2,
  },
  actionsCol: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  noteBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  noteText: {
    lineHeight: 18,
  },
});

export default memo(SetListItem);
