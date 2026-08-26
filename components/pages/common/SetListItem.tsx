import { memo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyText from '../../FancyText';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { ResponseRepertorioEtiquetaDto } from '../../../domain/dtos/Repertorio/repertorio-etiqueta.response';
import { FancyCard } from '../../cards/Horizontal/FancyCard';
import { detectMusicLinkService } from '../../../utils/musicLinkUtils';

export type SetListItemProps = {
  order: number;
  total: number;
  name: string;
  artist?: string | null;
  etiquetas?: ResponseRepertorioEtiquetaDto[];
  totalSecoes?: number | null;
  tom?: string | null;
  bpm?: number | null;
  versaoUrl?: string | null;
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
  etiquetas,
  totalSecoes,
  tom,
  bpm,
  versaoUrl,
  onPress,
  onActionsPress,
  onLongPress,
  isEditable,
  isActive = false,
}: SetListItemProps) {
  const palette = usePallete();
  const orderLabel = String(order).padStart(2, '0');
  const musicMetaParts = [tom ? `Tom ${tom}` : null, bpm ? `BPM ${bpm}` : null].filter(
    Boolean,
  ) as string[];
  const musicMetaLabel = musicMetaParts.join(', ');
  const tomColor = palette.secondary;
  const bpmColor = palette.terciary;

  const trimmedUrl = versaoUrl?.trim() || '';
  const hasUrl = trimmedUrl.length > 0;
  const listenService = hasUrl ? detectMusicLinkService(trimmedUrl) : null;
  const listenIconName = listenService === 'spotify' ? 'spotify' : listenService === 'youtube' ? 'youtube' : 'play-circle-outline';
  const listenColor = hasUrl ? palette.primary : palette.fonts.inactive2;
  const listenAction = {
    icon: {
      library: 'MaterialCommunityIcons' as const,
      name: listenIconName,
      size: 20,
      color: listenColor,
      backgroundColor: ColorUtils.withAlpha(listenColor, 0.08),
    },
    onPress: hasUrl ? () => Linking.openURL(trimmedUrl) : undefined,
    size: 'medium' as const,
  };

  return (
    <FancyCard.Image
      type='letter'
      props={{
        letter: orderLabel,
        title: name,
        subtitle: artist || 'Sem intérprete',
        additionalData1: (
          <View style={styles.metaRow}>
            {tom ? (
              <MusicBadge label={`TOM ${tom}`} color={tomColor} icon='music-clef-treble' />
            ) : null}
            {bpm ? <MusicBadge label={`BPM ${bpm}`} color={bpmColor} icon='metronome' /> : null}
          </View>
        ),
        content:
          etiquetas && etiquetas.length > 0 ? (
            <View style={styles.etiquetasRow}>
              {etiquetas.map((etiqueta) => (
                <MusicBadge key={etiqueta.id} label={etiqueta.nome} color={etiqueta.cor} />
              ))}
            </View>
          ) : undefined,
        titleProps: {
          type: 'semiBold' as const,
          size: 'small' as const,
          numberOfLines: 2,
          color: palette.fonts.dark,
          style: styles.title,
        },
        subtitleProps: {
          type: 'medium' as const,
          size: 'small' as const,
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
        actionButtons: [
          ...(listenAction ? [listenAction] : []),
          ...(isEditable
            ? [
                {
                  icon: {
                    library: 'MaterialCommunityIcons' as const,
                    name: 'dots-vertical',
                    size: 20,
                    color: palette.fonts.inactive,
                    backgroundColor: ColorUtils.withAlpha(palette.fonts.inactive, 0.08),
                  },
                  onPress: onActionsPress,
                  size: 'medium' as const,
                },
              ]
            : [
                {
                  icon: {
                    library: 'MaterialCommunityIcons' as const,
                    name: 'chevron-right',
                    size: 20,
                    backgroundColor: palette.primary,
                  },
                  onPress,
                  size: 'medium' as const,
                },
              ]),
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
      {icon ? (
        <MaterialCommunityIcons name={icon} size={11} color={color} style={styles.badgeIcon} />
      ) : null}
      <FancyText
        type='bold'
        size='extraSmall'
        numberOfLines={1}
        color={color}
        style={styles.badgeText}
      >
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
  etiquetasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    minWidth: 0,
    marginTop: 2,
    maxHeight: 49,
    overflow: 'hidden',
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
});

export default memo(SetListItem);
