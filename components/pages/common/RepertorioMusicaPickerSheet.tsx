import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyText from '../../FancyText';
import FancySeparator from '../../FancySeparator';
import DefaultIcons from '../../FancyIcons';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { ResponseRepertorioMusicaDto } from '../../../domain/dtos/Repertorio/repertorio-musica.response';

type Props = {
  visible: boolean;
  onClose: () => void;
  repertorio: ResponseRepertorioMusicaDto[];
  value?: string;
  onSelect: (musicaId: string) => void;
  statsPorMusicaId: Map<string, { totalExecucoes: number; ultimaExecucaoEm: string | null }>;
  hasStats: boolean;
};

function frequenciaLabel(totalExecucoes: number | undefined, hasStats: boolean): string | null {
  if (!hasStats) return null;
  if (!totalExecucoes) return 'Nunca tocada';
  if (totalExecucoes <= 2) return 'Raramente tocada';
  return 'Frequentemente tocada';
}

export default function RepertorioMusicaPickerSheet({
  visible,
  onClose,
  repertorio,
  value,
  onSelect,
  statsPorMusicaId,
  hasStats,
}: Props) {
  const palette = usePallete();

  const items = useMemo(
    () =>
      repertorio.map((musica) => {
        const stats = statsPorMusicaId.get(musica.id);
        return {
          musica,
          etiquetasAtivas: (musica.etiquetas ?? []).filter((etiqueta) => etiqueta.ativo !== false),
          frequencia: frequenciaLabel(stats?.totalExecucoes, hasStats),
          ultimaExecucaoLabel: stats?.ultimaExecucaoEm
            ? `última vez ${format(parseISO(stats.ultimaExecucaoEm), 'dd/MM')}`
            : null,
        };
      }),
    [repertorio, statsPorMusicaId, hasStats],
  );

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Selecionar música do repertório'
    >
      <View style={styles.list}>
        {items.map(({ musica, etiquetasAtivas, frequencia, ultimaExecucaoLabel }, index) => {
          const isSelected = musica.id === value;
          return (
            <View key={musica.id}>
              <Pressable
                style={({ pressed }) => [
                  styles.item,
                  isSelected && { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1) },
                  pressed && !isSelected && { backgroundColor: palette.backgroundColor4 },
                ]}
                onPress={() => {
                  onSelect(musica.id);
                  onClose();
                }}
              >
                <View style={styles.itemText}>
                  <View style={styles.titleRow}>
                    <FancyText
                      type='bold'
                      numberOfLines={1}
                      style={styles.title}
                      color={isSelected ? palette.primary : palette.fonts.dark}
                    >
                      {musica.nome}
                    </FancyText>

                    {etiquetasAtivas.length > 0 ? (
                      <View style={styles.badgesRow}>
                        {etiquetasAtivas.map((etiqueta) => (
                          <View
                            key={etiqueta.id}
                            style={[
                              styles.badge,
                              {
                                backgroundColor: ColorUtils.withAlpha(etiqueta.cor, 0.1),
                                borderColor: ColorUtils.withAlpha(etiqueta.cor, 0.22),
                              },
                            ]}
                          >
                            <FancyText
                              type='bold'
                              size='extraSmall'
                              numberOfLines={1}
                              color={etiqueta.cor}
                              style={styles.badgeText}
                            >
                              {etiqueta.nome}
                            </FancyText>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>

                  {musica.interprete ? (
                    <FancyText
                      type='mediumItalic'
                      size='extraSmall'
                      color={palette.fonts.inactive}
                      numberOfLines={1}
                    >
                      {musica.interprete}
                    </FancyText>
                  ) : null}

                  {frequencia && (
                    <FancyText
                      size='extraSmall'
                      color={palette.fonts.inactive}
                      style={styles.frequenciaText}
                    >
                      {frequencia}
                      {ultimaExecucaoLabel ? ` · ${ultimaExecucaoLabel}` : ''}
                    </FancyText>
                  )}
                </View>

                {isSelected && (
                  <DefaultIcons.Custom
                    library='MaterialCommunityIcons'
                    name='check'
                    size={20}
                    color={palette.primary}
                  />
                )}
              </Pressable>
              {index < items.length - 1 && (
                <FancySeparator style={{ marginTop: 8, marginBottom: 8 }} />
              )}
            </View>
          );
        })}
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
  },
  itemText: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    minWidth: 0,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'flex-end',
    flexShrink: 1,
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
    maxWidth: '100%',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  frequenciaText: {
    marginTop: 1,
  },
});
