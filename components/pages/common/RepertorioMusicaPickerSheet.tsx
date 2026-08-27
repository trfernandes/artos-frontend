import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancySearchBar from '../../FancySearchBar';
import FancyText from '../../FancyText';
import FancySeparator from '../../FancySeparator';
import DefaultIcons from '../../FancyIcons';
import MusicListenButton from '../../song/MusicListenButton';
import { usePallete } from '../../../hooks/usePallete';
import { ColorUtils } from '../../../utils/color_utils';
import { ResponseRepertorioMusicaDto } from '../../../domain/dtos/Repertorio/repertorio-musica.response';
import { ResponseRepertorioEtiquetaDto } from '../../../domain/dtos/Repertorio/repertorio-etiqueta.response';

type Props = {
  visible: boolean;
  onClose: () => void;
  repertorio: ResponseRepertorioMusicaDto[];
  etiquetas: ResponseRepertorioEtiquetaDto[];
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
  etiquetas,
  value,
  onSelect,
  statsPorMusicaId,
  hasStats,
}: Props) {
  const palette = usePallete();
  const [etiquetaIdsFiltro, setEtiquetaIdsFiltro] = useState<string[]>([]);
  const [busca, setBusca] = useState('');

  const etiquetasAtivas = useMemo(
    () => etiquetas.filter((etiqueta) => etiqueta.ativo !== false),
    [etiquetas],
  );

  const etiquetasSelecionadas = useMemo(
    () => etiquetasAtivas.filter((etiqueta) => etiquetaIdsFiltro.includes(etiqueta.id)),
    [etiquetasAtivas, etiquetaIdsFiltro],
  );

  const etiquetasNaoSelecionadas = useMemo(
    () => etiquetasAtivas.filter((etiqueta) => !etiquetaIdsFiltro.includes(etiqueta.id)),
    [etiquetasAtivas, etiquetaIdsFiltro],
  );

  const contagemPorEtiquetaId = useMemo(() => {
    const map = new Map<string, number>();
    for (const musica of repertorio) {
      for (const etiqueta of musica.etiquetas ?? []) {
        map.set(etiqueta.id, (map.get(etiqueta.id) ?? 0) + 1);
      }
    }
    return map;
  }, [repertorio]);

  const toggleEtiquetaFiltro = (id: string) => {
    setEtiquetaIdsFiltro((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  const repertorioFiltrado = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();

    return repertorio.filter((musica) => {
      const bateEtiqueta =
        etiquetaIdsFiltro.length === 0 ||
        musica.etiquetas?.some((etiqueta) => etiquetaIdsFiltro.includes(etiqueta.id));

      const bateBusca =
        !buscaNormalizada ||
        musica.nome.toLowerCase().includes(buscaNormalizada) ||
        (musica.interprete ?? '').toLowerCase().includes(buscaNormalizada);

      return bateEtiqueta && bateBusca;
    });
  }, [repertorio, etiquetaIdsFiltro, busca]);

  const items = useMemo(
    () =>
      repertorioFiltrado.map((musica) => {
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
    [repertorioFiltrado, statsPorMusicaId, hasStats],
  );

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Selecionar música do repertório'
    >
      <FancySearchBar
        value={busca}
        onSearch={setBusca}
        placeholder='Buscar por nome ou intérprete...'
        containerStyle={styles.searchBar}
      />
      {etiquetasAtivas.length > 0 ? (
        <View style={styles.filtroRow}>
          {etiquetasSelecionadas.map((etiqueta) => (
            <EtiquetaFiltroChip
              key={etiqueta.id}
              etiqueta={etiqueta}
              selected
              total={contagemPorEtiquetaId.get(etiqueta.id) ?? 0}
              onPress={() => toggleEtiquetaFiltro(etiqueta.id)}
            />
          ))}

          {etiquetasSelecionadas.length > 0 && etiquetasNaoSelecionadas.length > 0 && (
            <View style={[styles.filtroDivider, { backgroundColor: palette.icons.inactive }]} />
          )}

          {etiquetasNaoSelecionadas.map((etiqueta) => (
            <EtiquetaFiltroChip
              key={etiqueta.id}
              etiqueta={etiqueta}
              selected={false}
              total={contagemPorEtiquetaId.get(etiqueta.id) ?? 0}
              onPress={() => toggleEtiquetaFiltro(etiqueta.id)}
            />
          ))}
        </View>
      ) : null}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <FancyText color={palette.fonts.inactive}>Nenhuma música encontrada</FancyText>
        </View>
      ) : (
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

                    <FancyText
                      type='mediumItalic'
                      size='extraSmall'
                      color={palette.fonts.inactive}
                      numberOfLines={1}
                    >
                      {musica.interprete || 'Sem intérprete'}
                    </FancyText>

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

                    <View style={styles.listenRow}>
                      <MusicListenButton url={musica.versaoUrl} showLabel />
                    </View>
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
      )}
    </FancyBottomSheetModal>
  );
}

function EtiquetaFiltroChip({
  etiqueta,
  selected,
  total,
  onPress,
}: {
  etiqueta: ResponseRepertorioEtiquetaDto;
  selected: boolean;
  total: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filtroChip,
        {
          backgroundColor: ColorUtils.withAlpha(etiqueta.cor, selected ? 0.18 : 0.1),
          borderColor: ColorUtils.withAlpha(etiqueta.cor, selected ? 0.5 : 0.22),
        },
      ]}
    >
      {selected ? (
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='check'
          size={12}
          color={etiqueta.cor}
        />
      ) : null}
      <FancyText type='bold' size={12} color={etiqueta.cor} numberOfLines={1}>
        {etiqueta.nome} ({total})
      </FancyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  filtroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  filtroDivider: {
    width: 1.5,
    height: 14,
    borderRadius: 1,
    alignSelf: 'center',
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
  },
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
  listenRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
});
