import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import DefaultIcons from '../../../../FancyIcons';
import FancyText from '../../../../FancyText';
import { TimeUtils } from '../../../../../utils/timer_util';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { ThemePalette } from '../../../../../constants/colors';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../../utils/color_utils';

type ResumoMetricRowProps = {
  label: string;
  value: string | number;
  withDivider?: boolean;
  icon: {
    library: any;
    name: string;
    size?: number;
    color?: string;
  };
  iconBackgroundColor?: string;
};

function ResumoMetricRow({
  label,
  value,
  withDivider = false,
  icon,
  iconBackgroundColor,
}: ResumoMetricRowProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.metricRow, withDivider && styles.metricRowDivider]}>
      <View style={styles.metricLeft}>
        <View
          style={[
            styles.metricIconBadge,
            { backgroundColor: iconBackgroundColor || ColorUtils.withAlpha(palette.primary, 0.15) },
          ]}
        >
          <DefaultIcons.Custom
            library={icon.library}
            name={icon.name}
            size={icon.size || 12}
            color={icon.color || palette.primary}
          />
        </View>
        <FancyText size='small' type='medium' color={palette.fonts.inactive} numberOfLines={1}>
          {label}
        </FancyText>
      </View>

      <FancyText
        size='largeMedium'
        type='bold'
        color={palette.fonts.dark}
        style={styles.metricValue}
      >
        {value}
      </FancyText>
    </View>
  );
}

export default function AssistenteResultadoStep() {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { resultado, tempoGeracaoEscala } = useAssistenteEscala();

  const quantEventos = useMemo(() => {
    const set = new Set<string>();

    for (const item of resultado.itens) {
      const key = `${item.evento.id}-${new Date(item.dataOcorrencia).toISOString()}`;
      set.add(key);
    }

    return set.size;
  }, [resultado.itens]);

  const quantParticipantes = useMemo(() => {
    const set = new Set<string>();

    for (const item of resultado.itens) {
      if (!item.voluntario?.id) continue;
      set.add(item.voluntario.id);
    }

    return set.size;
  }, [resultado.itens]);

  const periodoInicio = useMemo(
    () => format(DateUtilsApi.dateOnlyFromApi(resultado.dataInicio), 'dd/MM/yyyy'),
    [resultado.dataInicio],
  );

  const periodoFim = useMemo(
    () => format(DateUtilsApi.dateOnlyFromApi(resultado.dataTermino), 'dd/MM/yyyy'),
    [resultado.dataTermino],
  );

  const periodoResumo = useMemo(
    () =>
      `${format(DateUtilsApi.dateOnlyFromApi(resultado.dataInicio), 'dd MMM', { locale: ptBR })} - ${format(
        DateUtilsApi.dateOnlyFromApi(resultado.dataTermino),
        'dd MMM',
        { locale: ptBR },
      )}`,
    [resultado.dataInicio, resultado.dataTermino],
  );

  const periodoDias = useMemo(() => {
    const inicio = DateUtilsApi.dateOnlyFromApi(resultado.dataInicio).getTime();
    const fim = DateUtilsApi.dateOnlyFromApi(resultado.dataTermino).getTime();
    return Math.max(1, Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)) + 1);
  }, [resultado.dataInicio, resultado.dataTermino]);

  const tempoTotal = useMemo(
    () => TimeUtils.formatMillis(tempoGeracaoEscala ?? 0),
    [tempoGeracaoEscala],
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.successHeader}>
          <DefaultIcons.Custom
            library='FontAwesome6'
            name='circle-check'
            size={44}
            color={palette.confirm}
          />
          <View style={styles.successTextWrap}>
            <FancyText size='large' type='bold' color={palette.fonts.dark}>
              Sua escala está pronta
            </FancyText>
            <FancyText size='small' type='medium' color={palette.fonts.inactive}>
              Confira o resumo final da geração automática.
            </FancyText>
          </View>
        </View>

        <View style={styles.summaryPanel}>
          <View style={styles.summaryHeader}>
            <View style={[styles.summaryHeaderBadge, { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.15) }]}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='view-dashboard-outline'
                size={13}
                color={palette.primary}
              />
            </View>
            <View style={styles.summaryHeaderTextWrap}>
              <FancyText size='small' type='bold' color={palette.fonts.dark}>
                Resumo final da escala
              </FancyText>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                Visão geral da geração automática
              </FancyText>
            </View>
          </View>

          <View style={styles.periodHero}>
            <FancyText size='small' type='medium' color={palette.fonts.inactive}>
              Período da escala
            </FancyText>

            <FancyText
              size='large'
              type='bold'
              color={palette.fonts.dark}
              style={styles.periodPrimaryValue}
            >
              {periodoResumo}
            </FancyText>
            <FancyText
              size='small'
              type='medium'
              color={palette.fonts.inactive}
              style={styles.periodMetaLine}
            >
              {periodoInicio} a {periodoFim}
            </FancyText>
            <FancyText
              size='extraSmall'
              type='semiBold'
              color={palette.primary}
              style={styles.periodCoverage}
            >
              {periodoDias} dias de cobertura
            </FancyText>
          </View>

          <View style={styles.kpiList}>
            <ResumoMetricRow
              label='Eventos'
              value={quantEventos}
              withDivider
              icon={{ library: 'MaterialCommunityIcons', name: 'calendar-month', size: 12 }}
              iconBackgroundColor={ColorUtils.withAlpha(palette.primary, 0.15)}
            />
            <ResumoMetricRow
              label='Voluntários'
              value={quantParticipantes}
              withDivider
              icon={{ library: 'MaterialCommunityIcons', name: 'account-group', size: 12 }}
              iconBackgroundColor={ColorUtils.withAlpha(palette.secondary, 0.15)}
            />
            <ResumoMetricRow
              label='Tempo de geração'
              value={tempoTotal}
              icon={{ library: 'MaterialCommunityIcons', name: 'timer-outline', size: 12 }}
              iconBackgroundColor={ColorUtils.withAlpha(palette.confirm, 0.15)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 10,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: 620,
      alignSelf: 'center',
      paddingHorizontal: 14,
      gap: 34,
    },
    successHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
    },
    successTextWrap: {
      alignItems: 'center',
      gap: 3,
    },
    summaryPanel: {
      width: '100%',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor2,
      paddingVertical: 14,
      paddingHorizontal: 12,
      ...palette.shadows[100],
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },
    summaryHeaderBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.28),
    },
    summaryHeaderTextWrap: {
      gap: 2,
    },
    periodHero: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 0,
      backgroundColor: palette.backgroundColor3,
      paddingVertical: 8,
      paddingHorizontal: 12,
      gap: 2,
    },
    periodHeroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    heroIconBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.28),
    },
    periodPrimaryValue: {
      marginTop: 2,
    },
    periodMetaLine: {
      lineHeight: 17,
    },
    periodCoverage: {
      marginTop: 1,
    },
    kpiList: {
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 0,
      backgroundColor: palette.backgroundColor3,
      overflow: 'hidden',
    },
    metricRow: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    metricRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.borderCard,
    },
    metricLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },
    metricIconBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.border, 0.24),
    },
    metricValue: {
      textAlign: 'right',
    },
  });
}
