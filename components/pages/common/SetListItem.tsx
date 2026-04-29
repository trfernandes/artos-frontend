import { memo } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyText from '../../FancyText';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { EventoSetlistItemOrigemEnum } from '../../../domain/dtos/Evento/evento-setlist-item.response';

export type SetListItemProps = {
  order: number;
  total: number;
  name: string;
  artist?: string | null;
  tipoOrigem: EventoSetlistItemOrigemEnum;
  totalSecoes?: number | null;
  tom?: string | null;
  bpm?: number | null;
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
};

function SetListItem({
  order,
  name,
  artist,
  tipoOrigem,
  totalSecoes,
  tom,
  bpm,
  onPress,
  onActionsPress,
  onLongPress,
  isEditable,
  isActive = false,
}: SetListItemProps) {
  const palette = usePallete();
  const isAuto = tipoOrigem === EventoSetlistItemOrigemEnum.REPERTORIO;
  const orderLabel = String(order).padStart(2, '0');
  const musicMetaParts = [tom ? `Tom ${tom}` : null, bpm ? `BPM ${bpm}` : null].filter(Boolean) as string[];
  const musicMetaLabel = musicMetaParts.join(', ');
  const orderWrapColor = ColorUtils.withAlpha(palette.primary, 0.16);
  const orderFillColor = palette.primary;
  const typeColor = isAuto ? palette.confirm : palette.primary;
  const tomColor = palette.secondary;
  const bpmColor = palette.terciary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={isEditable ? onLongPress : undefined}
      delayLongPress={300}
      accessibilityRole='button'
      accessibilityLabel={`Música ${order}, ${name}${musicMetaLabel ? `, ${musicMetaLabel}` : ''}. Toque para abrir.`}
      style={[
        styles.card,
        {
          backgroundColor: palette.backgroundColor4,
          borderColor: ColorUtils.withAlpha(palette.primary, 0.12),
          ...palette.shadows[200],
        },
        isActive && styles.cardActive,
      ]}
    >
      <View style={[styles.orderAvatarWrap, { borderColor: orderWrapColor }]}>
        <View style={[styles.orderAvatar, { backgroundColor: orderFillColor }]}>
          <FancyText type='bold' size='small' style={styles.orderLabel}>
            {orderLabel}
          </FancyText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.nameBlock}>
          <FancyText
            type='semiBold'
            size='small'
            numberOfLines={2}
            ellipsizeMode='tail'
            color={palette.fonts.dark}
            style={styles.title}
          >
            {name}
          </FancyText>
          {artist ? (
            <FancyText
              type='medium'
              size='extraSmall'
              numberOfLines={1}
              ellipsizeMode='tail'
              color={palette.fonts.inactive}
              style={styles.artist}
            >
              {artist}
            </FancyText>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: ColorUtils.withAlpha(typeColor, 0.12),
                borderColor: ColorUtils.withAlpha(typeColor, 0.22),
              },
            ]}
          >
            <View style={[styles.badgeDot, { backgroundColor: typeColor }]} />
            <FancyText
              type='bold'
              size='extraSmall'
              numberOfLines={1}
              color={typeColor}
              style={styles.badgeText}
            >
              {isAuto ? 'AUTO' : 'MANUAL'}
            </FancyText>
          </View>

          {tom ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: ColorUtils.withAlpha(tomColor, 0.10),
                  borderColor: ColorUtils.withAlpha(tomColor, 0.22),
                },
              ]}
            >
              <MaterialCommunityIcons
                name='music-clef-treble'
                size={11}
                color={tomColor}
                style={styles.badgeIcon}
              />
              <FancyText
                type='bold'
                size='extraSmall'
                numberOfLines={1}
                color={tomColor}
                style={styles.badgeText}
              >
                {`TOM ${tom}`}
              </FancyText>
            </View>
          ) : null}
          {bpm ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: ColorUtils.withAlpha(bpmColor, 0.10),
                  borderColor: ColorUtils.withAlpha(bpmColor, 0.22),
                },
              ]}
            >
              <MaterialCommunityIcons
                name='metronome'
                size={11}
                color={bpmColor}
                style={styles.badgeIcon}
              />
              <FancyText
                type='bold'
                size='extraSmall'
                numberOfLines={1}
                color={bpmColor}
                style={styles.badgeText}
              >
                {`BPM ${bpm}`}
              </FancyText>
            </View>
          ) : null}
        </View>
      </View>

      {isEditable ? (
        <Pressable
          onPress={onActionsPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole='button'
          accessibilityLabel={`Ações da música ${name}`}
          style={styles.moreButton}
        >
          <MaterialCommunityIcons
            name='dots-vertical'
            size={20}
            color={palette.fonts.inactive || '#4B5563'}
          />
        </Pressable>
      ) : (
        <View style={styles.trailingSpacer} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 0.6,
  },
  cardActive: {
    opacity: 0.84,
  },
  orderAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  orderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  nameBlock: {
    gap: 1,
  },
  title: {
    fontSize: 13,
    lineHeight: 17,
    includeFontPadding: false,
  },
  artist: {
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 5,
    minWidth: 0,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    height: 22,
    borderRadius: 999,
    borderWidth: 0.6,
    gap: 4,
    flexShrink: 0,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeIcon: {
    includeFontPadding: false,
    marginTop: -1,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  trailingSpacer: {
    width: 32,
    height: 32,
    flexShrink: 0,
    marginTop: 2,
  },
});

export default memo(SetListItem);
