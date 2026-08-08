import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import { useState, useMemo } from 'react';
import { MinisterioAddFormData } from './MinisterioAddForm';
import { ResponseMinisterioVoluntarioDto } from '../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import FancyList from '../../../list/FancyList';
import { FancyCardImageBaseProps, FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyChips from '../../../FancyChips';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import { DateUtilsApi } from '../../../../utils/date_utils';
import { differenceInDays, differenceInMonths, differenceInYears, format } from 'date-fns';
import { VoluntarioHierarquiaEnumLabel } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  getMinisterioStatusColorMap,
  MinisterioVoluntarioStatusEnum,
  MinisterioVoluntarioStatusEnumLabel,
} from '../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../../../FancyIcons';
import { ColorUtils } from '../../../../utils/color_utils';
import {
  MinisterioTipoEnum,
  MinisterioTipoLabel,
} from '../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import FancySegmentedControl from '../../../fields/FancySegmentedControl';

type MinisterioStatusFilter = 'all' | MinisterioVoluntarioStatusEnum;

type MinisterioJourneySummary = {
  total: number;
  active: number;
  inactive: number;
  longestDuration: string;
  longestMinisterio: string;
};

const DASH = '—';

function parseDataInicio(value?: string) {
  if (!value) return null;

  try {
    return DateUtilsApi.dateOnlyFromApi(value);
  } catch {
    return null;
  }
}

function formatDataInicio(value?: string) {
  const date = parseDataInicio(value);
  return date ? format(date, 'dd/MM/yyyy') : DASH;
}

function getServiceDays(value?: string) {
  const date = parseDataInicio(value);
  if (!date) return 0;

  return Math.max(0, differenceInDays(new Date(), date));
}

function formatServiceDuration(value?: string) {
  const date = parseDataInicio(value);
  if (!date) return DASH;

  const now = new Date();
  const days = Math.max(0, differenceInDays(now, date));

  if (days === 0) return 'Hoje';
  if (days < 30) return `${days}d`;

  const months = Math.max(0, differenceInMonths(now, date));
  if (months < 12) return `${months}m`;

  const years = Math.max(0, differenceInYears(now, date));
  const remainingMonths = months - years * 12;

  return remainingMonths > 0 ? `${years}a ${remainingMonths}m` : `${years}a`;
}

function getMinisterioTipoLabel(item: ResponseMinisterioVoluntarioDto) {
  const tipo = item.ministerio?.tipo as MinisterioTipoEnum | undefined;
  return tipo ? MinisterioTipoLabel[tipo] : undefined;
}

function getMinisterioSummary(
  ministerios: ResponseMinisterioVoluntarioDto[],
): MinisterioJourneySummary {
  const active = ministerios.filter(
    (item) => item.status === MinisterioVoluntarioStatusEnum.Ativo,
  ).length;
  const inactive = ministerios.filter(
    (item) => item.status === MinisterioVoluntarioStatusEnum.Inativo,
  ).length;
  const longest = [...ministerios].sort(
    (a, b) => getServiceDays(b.dataInicio) - getServiceDays(a.dataInicio),
  )[0];

  return {
    total: ministerios.length,
    active,
    inactive,
    longestDuration: longest ? formatServiceDuration(longest.dataInicio) : DASH,
    longestMinisterio: longest?.ministerio?.nome || 'Sem histórico',
  };
}

function MinisterioSummaryStat({
  icon,
  label,
  value,
  caption,
}: {
  icon: CustomIconProps;
  label: string;
  value: string;
  caption: string;
}) {
  const styles = useThemedStyles(createViewCardStyles);

  return (
    <View style={styles.summaryStat}>
      <View style={styles.summaryStatHeader}>
        <DefaultIcons.Custom {...icon} size={13} color='rgba(255,255,255,0.82)' />
        <FancyText size='extraSmall' color='rgba(255,255,255,0.78)' numberOfLines={1}>
          {label}
        </FancyText>
      </View>
      <FancyText
        type='bold'
        size='large'
        color='#FFFFFF'
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
      >
        {value}
      </FancyText>
      <FancyText
        size='extraSmall'
        color='rgba(255,255,255,0.7)'
        numberOfLines={1}
        style={styles.summaryStatCaption}
      >
        {caption}
      </FancyText>
    </View>
  );
}

function MinisterioJourneyCard({ summary }: { summary: MinisterioJourneySummary }) {
  const palette = usePallete();
  const styles = useThemedStyles(createViewCardStyles);

  return (
    <LinearGradient colors={palette.gradients.dashboard} style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryTitleBlock}>
          <FancyText type='bold' size='medium' color='#FFFFFF' numberOfLines={1}>
            Jornada ministerial
          </FancyText>
          <FancyText size='extraSmall' color='rgba(255,255,255,0.78)' numberOfLines={1}>
            Seus vínculos e status nos ministérios
          </FancyText>
        </View>
      </View>

      <View style={styles.summaryStatsRow}>
        <MinisterioSummaryStat
          icon={{ library: 'MaterialCommunityIcons', name: 'check-decagram-outline' }}
          label='Ativos'
          value={String(summary.active)}
          caption='servindo'
        />
        <MinisterioSummaryStat
          icon={{ library: 'MaterialCommunityIcons', name: 'archive-clock-outline' }}
          label='Inativos'
          value={String(summary.inactive)}
          caption='histórico'
        />
        <MinisterioSummaryStat
          icon={{ library: 'MaterialCommunityIcons', name: 'timer-sand' }}
          label='Maior tempo'
          value={summary.longestDuration}
          caption={summary.longestMinisterio}
        />
      </View>
    </LinearGradient>
  );
}

function MinisterioFilterChips({
  selected,
  summary,
  onChange,
}: {
  selected: MinisterioStatusFilter;
  summary: MinisterioJourneySummary;
  onChange: (filter: MinisterioStatusFilter) => void;
}) {
  const styles = useThemedStyles(createViewCardStyles);

  return (
    <FancySegmentedControl
      size='sm'
      value={selected}
      onChange={onChange}
      containerStyle={styles.filterControl}
      options={[
        { label: `Todos ${summary.total}`, value: 'all' },
        { label: `Ativos ${summary.active}`, value: MinisterioVoluntarioStatusEnum.Ativo },
        { label: `Inativos ${summary.inactive}`, value: MinisterioVoluntarioStatusEnum.Inativo },
      ]}
    />
  );
}

function MinisterioInfoPill({
  icon,
  label,
  value,
}: {
  icon: CustomIconProps;
  label: string;
  value: string;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createViewCardStyles);

  return (
    <View style={styles.infoPill}>
      <DefaultIcons.Custom {...icon} size={14} color={palette.primary} />
      <View style={styles.infoPillText}>
        <FancyText size='extraSmall' color={palette.fonts.inactive} numberOfLines={1}>
          {label}
        </FancyText>
        <FancyText
          type='bold'
          size='extraSmall'
          color={palette.fonts.dark}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
        >
          {value}
        </FancyText>
      </View>
    </View>
  );
}

function MinisterioViewCard({ item }: { item: ResponseMinisterioVoluntarioDto }) {
  const palette = usePallete();
  const styles = useThemedStyles(createViewCardStyles);
  const statusColorMap = useMemo(() => getMinisterioStatusColorMap(palette), [palette]);

  const status = item.status as MinisterioVoluntarioStatusEnum;
  const statusColor = statusColorMap[status] ?? palette.primary;
  const statusLabel = MinisterioVoluntarioStatusEnumLabel[status] ?? '';
  const logoUrl = item.ministerio?.logoThumbUrl || item.ministerio?.logoUrl;
  const initial = item.ministerio?.nome?.charAt(0)?.toUpperCase() || '?';
  const dataInicio = formatDataInicio(item.dataInicio);
  const tempo = formatServiceDuration(item.dataInicio);
  const funcao = VoluntarioHierarquiaEnumLabel[item.hierarquia] ?? DASH;
  const tipo = getMinisterioTipoLabel(item);
  const subtitle = [funcao, tipo].filter(Boolean).join(' · ');
  const descricao = item.ministerio?.descricao?.trim();
  const funcoesCount = item.funcoes?.length ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.leftSection}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <View
              style={[
                styles.logo,
                styles.logoFallback,
                { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12) },
              ]}
            >
              <FancyText type='bold' size='medium' color={palette.primary}>
                {initial}
              </FancyText>
            </View>
          )}
        </View>

        <View style={styles.titleSection}>
          <FancyText
            type='bold'
            size='medium'
            color={palette.fonts.dark}
            numberOfLines={1}
            style={styles.titleText}
          >
            {item.ministerio?.nome || 'Ministério'}
          </FancyText>
          <FancyText
            size='extraSmall'
            color={palette.fonts.inactive}
            numberOfLines={1}
            style={styles.metaText}
          >
            {subtitle || 'Vínculo ministerial'}
          </FancyText>
        </View>

        <FancyChips label={statusLabel} color={statusColor} size='small' />
      </View>

      <View style={styles.infoRow}>
        <MinisterioInfoPill
          icon={{ library: 'MaterialCommunityIcons', name: 'timer-outline' }}
          label='Tempo'
          value={tempo}
        />
        <MinisterioInfoPill
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-start' }}
          label='Desde'
          value={dataInicio}
        />
      </View>

      {(descricao || item.isDelegado || funcoesCount > 0) && (
        <View style={styles.cardFooter}>
          {descricao ? (
            <FancyText
              size='extraSmall'
              color={palette.fonts.inactive}
              numberOfLines={1}
              style={styles.descriptionText}
            >
              {descricao}
            </FancyText>
          ) : (
            <View style={styles.descriptionText} />
          )}

          <View style={styles.footerBadges}>
            {funcoesCount > 0 && (
              <FancyChips
                label={`${funcoesCount} função${funcoesCount === 1 ? '' : 'ões'}`}
                color={palette.primary}
                size='small'
                outlined
                style={styles.footerChip}
              />
            )}
            {item.isDelegado && (
              <FancyChips
                label='Delegado'
                color={palette.terciary}
                size='small'
                outlined
                style={styles.footerChip}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function ViewListHeader({
  summary,
  selectedFilter,
  onFilterChange,
}: {
  summary: MinisterioJourneySummary;
  selectedFilter: MinisterioStatusFilter;
  onFilterChange: (filter: MinisterioStatusFilter) => void;
}) {
  const styles = useThemedStyles(createViewCardStyles);

  return (
    <View style={styles.viewHeader}>
      <MinisterioJourneyCard summary={summary} />
      <MinisterioFilterChips
        selected={selectedFilter}
        summary={summary}
        onChange={onFilterChange}
      />
    </View>
  );
}

function getEmptyLabel(filter: MinisterioStatusFilter) {
  if (filter === MinisterioVoluntarioStatusEnum.Ativo) return 'Nenhum ministério ativo';
  if (filter === MinisterioVoluntarioStatusEnum.Inativo) return 'Nenhum ministério inativo';
  return 'Nenhum ministério vinculado';
}

function createViewCardStyles(palette: ThemePalette) {
  return StyleSheet.create({
    viewHeader: {
      gap: 10,
    },
    summaryCard: {
      borderRadius: 8,
      padding: 12,
      gap: 12,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    summaryTitleBlock: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    summaryStatsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.14)',
    },
    summaryStat: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      gap: 4,
    },
    summaryStatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      minWidth: 0,
    },
    summaryStatCaption: {
      textAlign: 'center',
      alignSelf: 'stretch',
    },
    filterControl: {
      width: '100%',
    },
    card: {
      backgroundColor: palette.backgroundColor4,
      borderRadius: 8,
      padding: 11,
      gap: 10,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.14),
      ...palette.shadows[100],
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: 0,
    },
    leftSection: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    logoFallback: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.16),
    },
    titleSection: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    titleText: {
      flexShrink: 1,
    },
    metaText: {
      flexShrink: 1,
    },
    infoRow: {
      flexDirection: 'row',
      gap: 8,
    },
    infoPill: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderRadius: 8,
      backgroundColor: palette.backgroundColor,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.1),
      paddingVertical: 8,
      paddingHorizontal: 9,
    },
    infoPillText: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },
    descriptionText: {
      flex: 1,
      minWidth: 0,
    },
    footerBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      flexShrink: 0,
    },
    footerChip: {
      paddingVertical: 2,
      paddingHorizontal: 7,
    },
  });
}

export default function VoluntarioMinisterioTab({
  mode = 'edit',
  ...props
}: {
  ministerios: ResponseMinisterioVoluntarioDto[] | null | undefined;
  onEnable?: (ministerioVoluntario: ResponseMinisterioVoluntarioDto) => void;
  onDisabled?: (ministerioVoluntario: ResponseMinisterioVoluntarioDto) => void;
  onAdd?: (data: MinisterioAddFormData) => void;
  onUpdate?: (data: MinisterioAddFormData) => void;
  mode?: 'view' | 'edit';
}) {
  const [statusFilter, setStatusFilter] = useState<MinisterioStatusFilter>('all');
  const ministerios = props.ministerios ?? [];
  const summary = useMemo(() => getMinisterioSummary(ministerios), [ministerios]);
  const filteredMinisterios = useMemo(() => {
    if (statusFilter === 'all') return ministerios;

    return ministerios.filter((item) => item.status === statusFilter);
  }, [ministerios, statusFilter]);

  const [addMinisterioFormProps, setAddMinisterioFormProps] = useState<{
    visible: boolean;
    mode?: 'add' | 'edit';
    data?: MinisterioAddFormData;
  }>({
    visible: false,
  });

  if (!props.ministerios) return null;

  if (mode === 'view') {
    return (
      <View style={styles.viewContainer}>
        {ministerios.length > 0 && (
          <ViewListHeader
            summary={summary}
            selectedFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
        )}
        <FancyList
          containerStyle={styles.viewList}
          data={filteredMinisterios}
          extraData={statusFilter}
          keyExtractor={(item) => item.id}
          listEmptyProps={{
            label: getEmptyLabel(statusFilter),
            icon: { library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 68 },
          }}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
          renderItem={({ item }) => <MinisterioViewCard item={item} />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {props.ministerios ? (
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <FancyList
            data={props.ministerios}
            listEmptyProps={{
              label: 'Nenhum ministério vinculado',
              icon: { library: 'MaterialCommunityIcons', name: 'home-group-outline', size: 68 },
            }}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item, index }) => {
              const ministerioNome = item.ministerio?.nome?.trim() || 'Ministério';
              const cardProps: FancyCardImageBaseProps = {
                title: ministerioNome,
                subtitle: (
                  <FancyTextDisplayCard
                    title='Data Inicio:'
                    value={format(DateUtilsApi.dateOnlyFromApi(item.dataInicio), 'dd/MM/yyyy')}
                  />
                ),
                additionalData1: (
                  <FancyTextDisplayCard
                    title='Função:'
                    value={VoluntarioHierarquiaEnumLabel[item.hierarquia]}
                  />
                ),
                additionalData2: (
                  <FancyChips
                    style={{ marginTop: 3 }}
                    label={
                      MinisterioVoluntarioStatusEnumLabel[
                        item.status as MinisterioVoluntarioStatusEnum
                      ] ?? ''
                    }
                  />
                ),
              };

              if (item.ministerio?.logoUrl || item.ministerio?.logoThumbUrl) {
                return (
                  <FancyCard.Image
                    key={index}
                    type='image'
                    props={{
                      ...cardProps,
                      source: { uri: item.ministerio?.logoThumbUrl || item.ministerio?.logoUrl },
                    }}
                  />
                );
              } else {
                return (
                  <FancyCard.Image
                    key={index}
                    type='letter'
                    props={{ ...cardProps, letter: ministerioNome.charAt(0).toUpperCase() || '?' }}
                  />
                );
              }
            }}
          />
        </View>
      ) : null}
      {/* {mode === 'edit' && <FancyFab right={0} bottom={0} onPress={() => setAddMinisterioFormProps({ visible: true, mode: 'add' })} />}
      {mode === 'edit' && addMinisterioFormProps?.visible && (
        <MinisterioAddForm
          mode={addMinisterioFormProps.mode || 'add'}
          defaultValues={addMinisterioFormProps.data}
          ministerios={props.ministerios}
          onButton1Press={() => setAddMinisterioFormProps({ visible: false })}
          onButton2Press={(data) => {
            setAddMinisterioFormProps({ visible: false });

            if (data?.mode === 'add') {
              props.onAdd?.(data);
            } else if (data?.mode === 'edit') {
              props.onUpdate?.(data);
            }
          }}
        />
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 55, overflow: 'hidden' },
  viewContainer: { flex: 1, paddingBottom: 12, overflow: 'hidden', gap: 10 },
  viewList: { flex: 1 },
});
