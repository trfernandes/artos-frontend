import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { endOfDay, format, parseISO, startOfDay, startOfYear, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import z from 'zod';

import FancyScrollView from '../../../../FancyScrollView';
import FancyText from '../../../../FancyText';
import FancyChips from '../../../../FancyChips';
import FancyListEmpty from '../../../../list/FancyListEmpty';
import FancyListItemCard from '../../../../cards/FancyListItemCard';
import FancyToggle from '../../../../fields/FancyToggle';
import FancyButton from '../../../../buttons/FancyButton';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import ControlledDateInput from '../../../../forms/ControlledDateInput';
import DefaultIcons from '../../../../FancyIcons';
import DashboardCard from '../../../inicio/DashboardCard';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import { useMusicasTocadasRelatorio } from '../../../../../hooks/useMusicasTocadasRelatorio';
import { useRepertorioCategorias } from '../../../../../hooks/useRepertorio';
import { ResponseMusicaTocadaDto } from '../../../../../domain/dtos/Evento/musicas-tocadas-relatorio.dto';

const MAX_RANKING_ROWS = 12;

type PeriodoPreset = '30d' | '90d' | 'ano' | 'sempre' | 'custom';
type Ordenacao = 'mais' | 'menos';

type Props = {
  ministerioId: string;
  eventoId?: string;
  dataOcorrencia?: string;
};

const customPeriodoSchema = z
  .object({
    dataInicio: z
      .date()
      .nullable()
      .refine((d) => !!d, { message: 'Data inicial obrigatória' }),
    dataFim: z
      .date()
      .nullable()
      .refine((d) => !!d, { message: 'Data final obrigatória' }),
  })
  .refine((data) => !!data.dataInicio && !!data.dataFim && data.dataFim >= data.dataInicio, {
    path: ['dataFim'],
    message: 'Data final deve ser maior ou igual à inicial',
  });

function formatCount(value: number) {
  return value.toLocaleString('pt-BR');
}

export default function MusicasTocadasInsightsView({
  ministerioId,
  eventoId,
  dataOcorrencia,
}: Props) {
  const palette = usePallete();
  const [preset, setPreset] = useState<PeriodoPreset>('90d');
  const [customRange, setCustomRange] = useState<{ dataInicio: Date; dataFim: Date } | null>(null);
  const [customVisible, setCustomVisible] = useState(false);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('mais');
  const [showAll, setShowAll] = useState(false);
  const [selectedMusica, setSelectedMusica] = useState<ResponseMusicaTocadaDto | null>(null);

  const { data: categorias = [] } = useRepertorioCategorias(ministerioId);
  const categoriasAtivas = useMemo(
    () => categorias.filter((item) => item.ativo !== false),
    [categorias],
  );

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(customPeriodoSchema),
    defaultValues: { dataInicio: new Date() as Date | null, dataFim: new Date() as Date | null },
  });

  const periodo = useMemo(() => {
    const now = new Date();
    if (preset === '30d')
      return { dataInicio: startOfDay(subDays(now, 29)), dataFim: endOfDay(now) };
    if (preset === '90d')
      return { dataInicio: startOfDay(subDays(now, 89)), dataFim: endOfDay(now) };
    if (preset === 'ano') return { dataInicio: startOfYear(now), dataFim: endOfDay(now) };
    if (preset === 'sempre') return null;
    return customRange;
  }, [preset, customRange]);

  const relatorioQuery = useMusicasTocadasRelatorio({
    ministerioId,
    categoriaId: categoriaId ?? undefined,
    dataInicio: periodo?.dataInicio.toISOString(),
    dataFim: periodo?.dataFim.toISOString(),
    eventoId,
    dataOcorrencia,
  });

  const musicasOrdenadas = useMemo(() => {
    const musicas = relatorioQuery.data?.musicas ?? [];
    return [...musicas].sort((a, b) =>
      ordenacao === 'mais'
        ? b.totalExecucoes - a.totalExecucoes
        : a.totalExecucoes - b.totalExecucoes,
    );
  }, [relatorioQuery.data, ordenacao]);

  const rankingVisivel = showAll ? musicasOrdenadas : musicasOrdenadas.slice(0, MAX_RANKING_ROWS);

  const abrirPeriodoCustomizado = () => {
    reset({
      dataInicio: customRange?.dataInicio ?? new Date(),
      dataFim: customRange?.dataFim ?? new Date(),
    });
    setCustomVisible(true);
  };

  const confirmarPeriodoCustomizado = handleSubmit((values) => {
    setCustomRange({ dataInicio: values.dataInicio as Date, dataFim: values.dataFim as Date });
    setPreset('custom');
    setCustomVisible(false);
  });

  const navegarParaEvento = (eventoIdAlvo: string, dataOcorrenciaAlvo: string) => {
    setSelectedMusica(null);
    router.push({
      pathname: '/ministerios/agenda/details',
      params: { eventoId: eventoIdAlvo, dataOcorrencia: dataOcorrenciaAlvo, ministerioId },
    });
  };

  const kpis = relatorioQuery.data;
  const isLoading = relatorioQuery.isLoading;

  return (
    <>
      <FancyScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterRow}>
          <FancyChips
            label='Últimos 30 dias'
            size='medium'
            outlined={preset !== '30d'}
            onPress={() => setPreset('30d')}
          />
          <FancyChips
            label='Últimos 90 dias'
            size='medium'
            outlined={preset !== '90d'}
            onPress={() => setPreset('90d')}
          />
          <FancyChips
            label='Ano atual'
            size='medium'
            outlined={preset !== 'ano'}
            onPress={() => setPreset('ano')}
          />
          <FancyChips
            label='Desde sempre'
            size='medium'
            outlined={preset !== 'sempre'}
            onPress={() => setPreset('sempre')}
          />
          <FancyChips
            label={
              preset === 'custom' && customRange
                ? `${format(customRange.dataInicio, 'dd/MM/yy')} - ${format(customRange.dataFim, 'dd/MM/yy')}`
                : 'Customizado'
            }
            size='medium'
            outlined={preset !== 'custom'}
            onPress={abrirPeriodoCustomizado}
          />
        </View>

        {categoriasAtivas.length > 0 && (
          <View style={styles.filterRow}>
            <FancyChips
              label='Todas categorias'
              size='medium'
              outlined={!!categoriaId}
              onPress={() => setCategoriaId(null)}
            />
            {categoriasAtivas.map((item) => (
              <FancyChips
                key={item.id}
                label={item.nome}
                size='medium'
                outlined={categoriaId !== item.id}
                onPress={() => setCategoriaId(categoriaId === item.id ? null : item.id)}
              />
            ))}
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size='large' color={palette.primary} />
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiRow}>
                <View style={styles.kpiCard}>
                  <DashboardCard
                    title='Execuções'
                    value={formatCount(kpis?.totalExecucoes ?? 0)}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'music-note-outline',
                      size: 20,
                    }}
                    layout='horizontal'
                  />
                </View>
                <View style={styles.kpiCard}>
                  <DashboardCard
                    title='Músicas distintas'
                    value={formatCount(kpis?.totalMusicasDistintas ?? 0)}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'playlist-music-outline',
                      size: 20,
                    }}
                    layout='horizontal'
                  />
                </View>
              </View>
              <View style={styles.kpiRow}>
                <View style={styles.kpiCard}>
                  <DashboardCard
                    title='#1 do período'
                    value={kpis?.musicaTopNome || '—'}
                    icon={{ library: 'MaterialCommunityIcons', name: 'trophy-outline', size: 20 }}
                    layout='horizontal'
                    accentColor={palette.secondary}
                  />
                </View>
                <View style={styles.kpiCard}>
                  <DashboardCard
                    title='% nunca tocado'
                    value={`${kpis?.percentualNuncaTocado ?? 0}%`}
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'alert-circle-outline',
                      size: 20,
                    }}
                    layout='horizontal'
                    accentColor={palette.warning}
                  />
                </View>
              </View>
            </View>

            <View style={styles.rankingHeader}>
              <FancyText size='small' type='bold'>
                Ranking
              </FancyText>
              <FancyToggle<Ordenacao>
                value={ordenacao}
                onChange={setOrdenacao}
                option1={{ title: 'Mais tocadas', value: 'mais' }}
                option2={{ title: 'Menos tocadas', value: 'menos' }}
              />
            </View>

            {rankingVisivel.length === 0 ? (
              <FancyListEmpty
                label='Nenhuma música no período'
                helperText='Ajuste o período ou a categoria selecionada.'
                icon={{ library: 'MaterialCommunityIcons', name: 'music-off', size: 56 }}
              />
            ) : (
              <View style={styles.rankingList}>
                {rankingVisivel.map((musica) => (
                  <FancyListItemCard
                    key={musica.id}
                    onPress={() => setSelectedMusica(musica)}
                    leading={{
                      type: 'icon',
                      icon: {
                        library: 'MaterialCommunityIcons',
                        name: 'music-note-outline',
                        size: 20,
                      },
                      color: musica.totalExecucoes === 0 ? palette.fonts.inactive : palette.primary,
                      backgroundColor: ColorUtils.withAlpha(
                        musica.totalExecucoes === 0 ? palette.fonts.inactive : palette.primary,
                        0.12,
                      ),
                    }}
                    title={musica.nome}
                    subtitle={musica.interprete || musica.categoriaNome || 'Sem intérprete'}
                    meta={
                      <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                        {musica.totalExecucoes === 0
                          ? 'Nunca tocada'
                          : `${musica.totalExecucoes}x · última vez ${format(parseISO(musica.ultimaExecucaoEm!), 'dd/MM')}`}
                      </FancyText>
                    }
                    trailing={{ type: 'chevron', onPress: () => setSelectedMusica(musica) }}
                  />
                ))}
              </View>
            )}

            {musicasOrdenadas.length > MAX_RANKING_ROWS && (
              <FancyButton
                label={showAll ? 'Ver menos' : `Ver tudo (${musicasOrdenadas.length})`}
                type='text'
                onPress={() => setShowAll(!showAll)}
              />
            )}
          </>
        )}
      </FancyScrollView>

      <FancyBottomSheetModal
        visible={customVisible}
        onClose={() => setCustomVisible(false)}
        title='Período customizado'
        footer={<FancyButton label='Aplicar' onPress={() => void confirmarPeriodoCustomizado()} />}
      >
        <View style={styles.customPeriodoContent}>
          <ControlledDateInput control={control} name='dataInicio' label='Data início' />
          <ControlledDateInput control={control} name='dataFim' label='Data fim' />
        </View>
      </FancyBottomSheetModal>

      <FancyBottomSheetModal
        visible={!!selectedMusica}
        onClose={() => setSelectedMusica(null)}
        title={selectedMusica?.nome || ''}
      >
        <View style={styles.drillDownContent}>
          {selectedMusica?.interprete ? (
            <FancyText size='small' color={palette.fonts.inactive}>
              {selectedMusica.interprete}
            </FancyText>
          ) : null}
          {!selectedMusica || selectedMusica.execucoes.length === 0 ? (
            <FancyListEmpty
              label='Nunca tocada'
              helperText='Essa música ainda não apareceu em nenhum SetList no período selecionado.'
              icon={{ library: 'MaterialCommunityIcons', name: 'calendar-blank-outline', size: 48 }}
            />
          ) : (
            selectedMusica.execucoes.map((execucao, index) => (
              <Pressable
                key={`${execucao.eventoId}-${execucao.dataOcorrencia}-${index}`}
                onPress={() => navegarParaEvento(execucao.eventoId, execucao.dataOcorrencia)}
                style={({ pressed }) => [
                  styles.execucaoRow,
                  { borderColor: palette.borderCard },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='calendar-outline'
                  size={16}
                  color={palette.primary}
                />
                <FancyText size='small' type='medium' style={{ flex: 1 }}>
                  {format(parseISO(execucao.dataOcorrencia), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </FancyText>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='chevron-right'
                  size={18}
                  color={palette.icons.inactive}
                />
              </Pressable>
            ))
          )}
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: 14, paddingTop: 2, paddingBottom: 24 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  loadingWrap: { alignItems: 'center', paddingVertical: 32 },
  kpiGrid: { gap: 8 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiCard: { flex: 1 },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rankingList: { gap: 8 },
  customPeriodoContent: { gap: 16 },
  drillDownContent: { gap: 10, paddingBottom: 4 },
  execucaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
