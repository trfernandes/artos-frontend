import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyText from '../../FancyText';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { EventoSetlistItemOrigemEnum } from '../../../domain/dtos/Evento/evento-setlist-item.response';
import { FancyCard } from '../../cards/Horizontal/FancyCard';

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
  const typeColor = isAuto ? palette.confirm : palette.primary;
  const tomColor = palette.secondary;
  const bpmColor = palette.terciary;

  return (
    <FancyCard.Image
      type='letter'
      props={{
        letter: orderLabel,
        title: name,
        subtitle: artist || undefined,
        additionalData1: (
          <View style={styles.metaRow}>
            <MusicBadge
              label={isAuto ? 'AUTO' : 'MANUAL'}
              color={typeColor}
              dot
            />
            {tom ? (
              <MusicBadge
                label={`TOM ${tom}`}
                color={tomColor}
                icon='music-clef-treble'
              />
            ) : null}
            {bpm ? (
              <MusicBadge
                label={`BPM ${bpm}`}
                color={bpmColor}
                icon='metronome'
              />
            ) : null}
          </View>
        ),
        titleProps: {
          type: 'semiBold' as const,
          size: 'small' as const,
          numberOfLines: 2,
          color: palette.fonts.dark,
          style: styles.title,
        },
        subtitleProps: {
          type: 'medium' as const,
          size: 'extraSmall' as const,
          numberOfLines: 1,
          color: palette.fonts.inactive,
          style: styles.subtitle,
        },
        containerStyle: [styles.card, isActive && styles.cardActive],
        contentContainerStyle: styles.cardContent,
        centerContainerStyle: styles.cardCenter,
        onPress,
        onLongPress: isEditable ? onLongPress : undefined,
        delayLongPress: 300,
        accessibilityRole: 'button',
        accessibilityLabel: `Música ${order}, ${name}${musicMetaLabel ? `, ${musicMetaLabel}` : ''}. Toque para ${isEditable ? 'editar' : 'visualizar'}.`,
        actionButtons: isEditable
          ? [
              {
                icon: {
                  library: 'MaterialCommunityIcons',
                  name: 'dots-vertical',
                  size: 20,
                  color: palette.fonts.inactive,
                  backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08),
                },
                onPress: onActionsPress,
                size: 'medium',
              },
            ]
          : [
              {
                icon: {
                  library: 'MaterialCommunityIcons',
                  name: 'chevron-right',
                  size: 20,
                  backgroundColor: palette.primary,
                },
                onPress,
                size: 'medium',
              },
            ],
      }}
    />
  );
}

function MusicBadge({
  label,
  color,
  icon,
  dot,
}: {
  label: string;
  color: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  dot?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: ColorUtils.withAlpha(color, 0.1),
          borderColor: ColorUtils.withAlpha(color, 0.22),
        },
      ]}
    >
      {dot ? <View style={[styles.badgeDot, { backgroundColor: color }]} /> : null}
      {icon ? <MaterialCommunityIcons name={icon} size={11} color={color} style={styles.badgeIcon} /> : null}
      <FancyText type='bold' size='extraSmall' numberOfLines={1} color={color} style={styles.badgeText}>
        {label}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    paddingVertical: 8,
  },
  cardActive: {
    opacity: 0.84,
  },
  cardContent: {
    paddingVertical: 3,
  },
  cardCenter: {
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    maxWidth: '100%',
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
});

export default memo(SetListItem);
