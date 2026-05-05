import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { Conjunction, DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyText from '../../../../FancyText';
import FancySeparator from '../../../../FancySeparator';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import { addMonths, format, startOfToday, subMonths } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { EscalaItensRepository } from '../../../../../domain/services/EscalaItensRepository';
import { MinisterioVoluntariosRepository } from '../../../../../domain/services/MinisterioVoluntariosRepository';
import FancySection from '../../../../FancySection';
import { EscalaTemplateExperienciaLabel } from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { useAuth } from '../../../../../contexts/AuthContext';
import FancyAvatarImage from '../../../../images/FancyImage';
import { AppImages } from '../../../../../assets/app_images';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import FancyChips from '../../../../FancyChips';

function EmptyState({ text }: { text: string }) {
  return (
    <FancyText size='extraSmall' type='mediumItalic' style={{ opacity: 0.6 }}>
      {text}
    </FancyText>
  );
}

function LoadingInline() {
  const palette = usePallete();
  return <ActivityIndicator size='small' color={palette.primary} style={{ alignSelf: 'flex-start' }} />;
}

export default function VoluntarioDetailsModal({
  ministerioVoluntarioId,
  voluntarioId,
  onClose,
}: {
  ministerioVoluntarioId: string;
  voluntarioId: string;
  onClose?: () => void;
}) {
  const { igrejaAtiva } = useAuth();
  const igrejaId = igrejaAtiva?.id;
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  // Main query: lightweight — only profile + skills, no indisponibilidades JOIN
  const initialParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioVoluntarioId },
          },
        ],
        conjunction: Conjunction.AND,
      },
      relations: ['voluntario', 'funcoes', 'funcoes.funcao'],
    }),
    [ministerioVoluntarioId],
  );

  const { data: voluntarioData, isLoading: isLoadingVoluntario } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams,
  });

  const voluntario = voluntarioData?.[0];

  const habilidadesContent = useMemo(() => {
    const funcoes = voluntario?.funcoes ?? [];
    if (!funcoes.length) return <EmptyState text='Nenhuma habilidade cadastrada' />;
    return funcoes.map((item, idx) => (
      <FancyTextDisplay
        key={item.id ?? String(idx)}
        titleStyle={{ size: 'extraSmall' }}
        valueStyle={{ size: 'extraSmall' }}
        title={`${item.funcao?.nome ?? '?'} —`}
        value={EscalaTemplateExperienciaLabel[item.experiencia] ?? item.experiencia}
      />
    ));
  }, [voluntario]);

  // Lazy loads: all in one Promise.all after profile is shown
  const [ultimaEscala, setUltimaEscala] = useState<any | null>(null);
  const [proximasEscalas, setProximasEscalas] = useState<any[]>([]);
  const [itens6m, setItens6m] = useState<any[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<any[]>([]);
  const [isLoadingLazy, setIsLoadingLazy] = useState(true);

  useEffect(() => {
    setIsLoadingLazy(true);
    const hoje = startOfToday();
    const em2Meses = addMonths(new Date(), 2);

    Promise.all([
      // 1. Última escala
      EscalaItensRepository.search({
        igrejaId,
        where: {
          conditions: [
            {
              path: 'voluntario.id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: voluntarioId },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.LT,
              value: { type: ValueType.LITERAL, value: hoje.toISOString() },
            },
          ],
          conjunction: Conjunction.AND,
        },
        orderBy: [{ path: 'dataOcorrencia', direction: OrderDirection.DESC }],
        limit: 1,
        relations: ['escala', 'evento', 'voluntario', 'funcao'],
      } as any),

      // 2. Próximas escalas
      EscalaItensRepository.search({
        igrejaId,
        where: {
          conditions: [
            {
              path: 'voluntario.id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: voluntarioId },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.GTE,
              value: { type: ValueType.LITERAL, value: hoje.toISOString() },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.LTE,
              value: { type: ValueType.LITERAL, value: em2Meses.toISOString() },
            },
          ],
          conjunction: Conjunction.AND,
        },
        orderBy: [{ path: 'dataOcorrencia', direction: OrderDirection.ASC }],
        relations: ['escala', 'evento', 'voluntario', 'funcao'],
      } as any),

      // 3. Métricas 6m (3m derived in memory)
      EscalaItensRepository.search({
        igrejaId,
        where: {
          conditions: [
            {
              path: 'voluntario.id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: voluntarioId },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.GTE,
              value: { type: ValueType.LITERAL, value: subMonths(hoje, 6).toISOString() },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.LT,
              value: { type: ValueType.LITERAL, value: hoje.toISOString() },
            },
          ],
          conjunction: Conjunction.AND,
        },
        relations: [],
      } as any),

      // 4. Indisponibilidades (lazy, not blocking profile)
      MinisterioVoluntariosRepository.search({
        where: {
          conditions: [
            {
              path: 'id',
              operator: Operator.EQUALS,
              value: { type: ValueType.LITERAL, value: ministerioVoluntarioId },
            },
            {
              path: 'voluntario.indisponibilidades.data',
              operator: Operator.GTE,
              value: { type: ValueType.LITERAL, value: hoje.toISOString() },
            },
            {
              path: 'voluntario.indisponibilidades.data',
              operator: Operator.LTE,
              value: { type: ValueType.LITERAL, value: em2Meses.toISOString() },
            },
          ],
          conjunction: Conjunction.AND,
        },
        relations: ['voluntario', 'voluntario.indisponibilidades'],
      }),
    ])
      .then(([ultima, proximas, metricas6m, indispResult]) => {
        setUltimaEscala((ultima as any[])?.[0] ?? null);
        setProximasEscalas((proximas as any[]) ?? []);
        setItens6m((metricas6m as any[]) ?? []);
        const indispData = (indispResult as any[])?.[0]?.voluntario?.indisponibilidades ?? [];
        setIndisponibilidades(
          [...indispData].sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()),
        );
      })
      .catch(() => {
        // silent — sections will remain empty
      })
      .finally(() => setIsLoadingLazy(false));
  }, [voluntarioId, ministerioVoluntarioId, igrejaId]);

  // 3m derived in memory from 6m data
  const itens3m = useMemo(() => {
    const cutoff = subMonths(startOfToday(), 3);
    return itens6m.filter((i) => new Date(i.dataOcorrencia) >= cutoff);
  }, [itens6m]);

  const ultimaEscalaContent = useMemo(() => {
    if (isLoadingLazy) return <LoadingInline />;
    if (!ultimaEscala) return <EmptyState text='Nenhuma escala anterior encontrada' />;
    return (
      <>
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title='Evento:'
          value={ultimaEscala.evento?.nome ?? '-'}
        />
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title='Data/Hora:'
          value={format(new Date(ultimaEscala.dataOcorrencia), 'dd/MM/yyyy HH:mm')}
        />
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title='Função:'
          value={ultimaEscala.funcao?.nome ?? '-'}
        />
      </>
    );
  }, [isLoadingLazy, ultimaEscala]);

  const proximasEscalasContent = useMemo(() => {
    if (isLoadingLazy) return <LoadingInline />;
    if (!proximasEscalas.length) return <EmptyState text='Nenhuma escala nos próximos 2 meses' />;
    return proximasEscalas.map((proxima, idx) => (
      <FancyTextDisplay
        key={proxima.id ?? String(idx)}
        titleStyle={{ size: 'extraSmall' }}
        valueStyle={{ size: 'extraSmall' }}
        title={format(new Date(proxima.dataOcorrencia), 'dd/MM/yyyy HH:mm')}
        value={proxima.evento?.nome ?? '-'}
      />
    ));
  }, [isLoadingLazy, proximasEscalas]);

  const metricasContent = useMemo(() => {
    if (isLoadingLazy) return <LoadingInline />;
    const total6m = itens6m.length;
    const total3m = itens3m.length;
    const confirmados6m = itens6m.filter((i) => i.status === EscalaItemStatusEnum.Confirmado).length;
    const ausentes6m = itens6m.filter((i) => i.status === EscalaItemStatusEnum.Ausente).length;
    const taxaConfirmacao = total6m > 0 ? Math.round((confirmados6m / total6m) * 100) : null;
    const taxaAusencia = total6m > 0 ? Math.round((ausentes6m / total6m) * 100) : null;
    return (
      <>
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title='Escalações (3 meses):'
          value={String(total3m)}
        />
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title='Escalações (6 meses):'
          value={String(total6m)}
        />
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title='Taxa de confirmação:'
          value={taxaConfirmacao !== null ? `${taxaConfirmacao}%` : '-'}
        />
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title='Taxa de ausência:'
          value={taxaAusencia !== null ? `${taxaAusencia}%` : '-'}
        />
      </>
    );
  }, [isLoadingLazy, itens6m, itens3m]);

  const indisponibilidadesContent = useMemo(() => {
    if (isLoadingLazy) return <LoadingInline />;
    if (!indisponibilidades.length) return <EmptyState text='Nenhuma indisponibilidade futura' />;
    return indisponibilidades.map((item, idx) => (
      <FancyTextDisplay
        key={item.id ?? String(idx)}
        titleStyle={{ size: 'extraSmall' }}
        valueStyle={{ size: 'extraSmall' }}
        title={`${format(item.data, 'dd/MM/yyyy')} —`}
        value={item.motivo ?? '-'}
      />
    ));
  }, [isLoadingLazy, indisponibilidades]);

  return (
    <FancyBottomSheetModal visible onClose={onClose ?? (() => {})} title='Detalhes do Voluntário'>
      {isLoadingVoluntario || !voluntario ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={palette.primary} />
          <FancyText size='small' type='medium' color={palette.fonts.inactive}>
            Carregando...
          </FancyText>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Profile card */}
          <View style={[styles.profileCard, { backgroundColor: palette.backgroundColor2, borderColor: palette.borderCard }]}>
            <View style={[styles.profileAccentBar, { backgroundColor: palette.primary }]} />
            <View style={styles.profileInner}>
              <View style={[styles.avatarRing, { borderColor: palette.primary }]}>
                <FancyAvatarImage
                  source={
                    voluntario.voluntario?.fotoThumbUrl || voluntario.voluntario?.fotoUrl
                      ? { uri: voluntario.voluntario.fotoThumbUrl || voluntario.voluntario.fotoUrl }
                      : AppImages.emptyProfile
                  }
                  size={36}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.profileInfo}>
                <FancyText type='bold' size='medium' color={palette.fonts.dark} numberOfLines={1}>
                  {voluntario.voluntario?.nome ?? '-'}
                </FancyText>
                <FancyText type='medium' size='extraSmall' color={palette.fonts.inactive} numberOfLines={1}>
                  {voluntario.voluntario?.email ?? ''}
                </FancyText>
                {(voluntario.funcoes?.length ?? 0) > 0 && (
                  <View style={styles.funcoesPills}>
                    {voluntario.funcoes!.slice(0, 3).map((f, i) => (
                      <FancyChips key={f.id ?? i} label={f.funcao?.nome ?? '?'} size='small' />
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Última Escala */}
          <FancySection
            icon={{ library: 'MaterialCommunityIcons', name: 'calendar', size: 24, color: '#4A90E2' }}
            title='Última Escala'
          >
            <View style={styles.sectionBody}>{ultimaEscalaContent}</View>
          </FancySection>

          <FancySeparator />

          {/* Habilidades */}
          <FancySection
            icon={{ library: 'Entypo', name: 'modern-mic', size: 23, color: '#8E7AEF' }}
            title='Habilidades'
          >
            <View style={styles.sectionBody}>{habilidadesContent}</View>
          </FancySection>

          <FancySeparator />

          {/* Métricas */}
          <FancySection
            icon={{ library: 'MaterialCommunityIcons', name: 'chart-bar', size: 24, color: '#3B82F6' }}
            title='Métricas'
          >
            <View style={styles.sectionBody}>{metricasContent}</View>
          </FancySection>

          <FancySeparator />

          {/* Indisponibilidades */}
          <FancySection
            icon={{ library: 'MaterialCommunityIcons', name: 'cancel', size: 26, color: '#D36AC2' }}
            title='Indisponibilidades Futuras'
          >
            <View style={styles.sectionBody}>{indisponibilidadesContent}</View>
          </FancySection>

          <FancySeparator />

          {/* Próximas escalas */}
          <FancySection
            icon={{ library: 'MaterialCommunityIcons', name: 'calendar-arrow-right', size: 25, color: '#5AC8B0' }}
            title='Próximas Escalas'
          >
            <View style={styles.sectionBody}>{proximasEscalasContent}</View>
          </FancySection>
        </View>
      )}
    </FancyBottomSheetModal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    loadingContainer: {
      paddingVertical: 32,
      alignItems: 'center',
      gap: 12,
    },
    content: {
      gap: 16,
    },
    profileCard: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
    },
    profileAccentBar: {
      height: 4,
    },
    profileInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
    },
    avatarRing: {
      borderWidth: 2,
      borderRadius: 22,
      padding: 2,
    },
    avatar: {
      borderRadius: 18,
    },
    profileInfo: {
      flex: 1,
      gap: 2,
    },
    funcoesPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 3,
      marginTop: 1,
    },
    sectionBody: {
      gap: 4,
    },
  });
}
