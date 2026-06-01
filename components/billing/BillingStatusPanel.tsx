import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FancyButton from '../buttons/FancyButton';
import { CustomIconProps } from '../FancyIcons';
import FancyText from '../FancyText';
import { ResponseIgrejaAssinaturaDto } from '../../domain/dtos/Igreja/response-igreja-assinatura.dto';
import { usePallete } from '../../hooks/usePallete';
import { resolveBillingPlanName } from '../../domain/utils/billing-plan-catalog';
import {
  resolveBillingNoticeContent,
  resolveBillingPrimaryActionLabel,
} from '../../domain/utils/billing-notice';

type BillingStatusPanelProps = {
  assinatura: ResponseIgrejaAssinaturaDto;
  compact?: boolean;
  onPrimaryPress?: () => void;
  primaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryLabel?: string;
  isSecondaryLoading?: boolean;
};

const CAPACITY_OVERFLOW = '#CC3F4F';

function withAlpha(color: string, alphaHex: string) {
  if (!color.startsWith('#') || color.length !== 7) return color;
  return `${color}${alphaHex}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}

function resolveStatusCopy(assinatura: ResponseIgrejaAssinaturaDto) {
  if (assinatura.status === 'trial' || assinatura.status === 'expired') {
    const notice = resolveBillingNoticeContent(assinatura);
    return {
      eyebrow: notice.eyebrow,
      title: assinatura.status === 'trial' ? 'Período avaliativo ativo' : notice.title,
      body: notice.body,
    };
  }

  switch (assinatura.status) {
    case 'active':
      return {
        eyebrow: 'Assinatura',
        title: 'Assinatura em dia',
        body: 'O plano está ativo e a igreja segue operando sem bloqueios administrativos.',
      };
    case 'overdue':
      return {
        eyebrow: 'Assinatura',
        title: 'Pagamento pendente',
        body: assinatura.inGracePeriod
          ? 'A igreja segue em período de tolerância enquanto o pagamento é regularizado.'
          : 'Existe uma pendência de pagamento que pode limitar recursos administrativos.',
      };
    case 'cancelled':
      return {
        eyebrow: 'Assinatura',
        title: 'Acesso mantido até o fim do ciclo',
        body: 'A igreja segue com acesso até o fim do período pago e pode ser reativada quando você quiser.',
      };
    default:
      return {
        eyebrow: 'Assinatura',
        title: 'Faixa gratuita',
        body: 'A igreja está operando no limite básico disponível para contas gratuitas.',
      };
  }
}

function resolveCycleLabel(cycle?: string | null) {
  return cycle === 'YEARLY' ? 'Anual' : 'Mensal';
}

function resolvePeriodMetricLabel(status: ResponseIgrejaAssinaturaDto['status']) {
  if (status === 'cancelled') {
    return 'Válido até';
  }

  return 'Próxima renovação';
}

function resolveStatusAccent(
  status: ResponseIgrejaAssinaturaDto['status'],
  palette: ReturnType<typeof usePallete>,
) {
  switch (status) {
    case 'active':
    case 'trial':
      return {
        color: palette.confirm,
        soft: withAlpha(palette.confirm, '10'),
        border: withAlpha(palette.confirm, '24'),
        glow: withAlpha(palette.primary, '18'),
      };
    case 'overdue':
      return {
        color: palette.warning,
        soft: withAlpha(palette.warning, '10'),
        border: withAlpha(palette.warning, '24'),
        glow: withAlpha(palette.warning, '12'),
      };
    case 'cancelled':
    case 'expired':
      return {
        color: palette.error,
        soft: withAlpha(palette.error, '10'),
        border: withAlpha(palette.error, '24'),
        glow: withAlpha(palette.primary, '10'),
      };
    default:
      return {
        color: palette.primary,
        soft: withAlpha(palette.primary, '10'),
        border: withAlpha(palette.primary, '24'),
        glow: withAlpha(palette.primary, '14'),
      };
  }
}

function resolveStatusPillLabel(status: ResponseIgrejaAssinaturaDto['status']) {
  switch (status) {
    case 'trial':
      return 'Teste';
    case 'active':
      return 'Ativa';
    case 'overdue':
      return 'Pendente';
    case 'cancelled':
      return 'Cancelada';
    case 'expired':
      return 'Expirada';
    default:
      return 'Gratuita';
  }
}

function resolvePrimaryActionIcon(
  assinatura: ResponseIgrejaAssinaturaDto,
  primaryLabel: string,
  compact: boolean,
  palette: ReturnType<typeof usePallete>,
): CustomIconProps {
  const iconColor =
    compact || assinatura.status === 'cancelled' ? palette.primary : palette.fonts.light;

  if (primaryLabel === 'Reativar assinatura') {
    return {
      library: 'MaterialCommunityIcons',
      name: 'refresh',
      size: 16,
      color: iconColor,
    };
  }

  if (primaryLabel === 'Retomar pagamento') {
    return {
      library: 'MaterialCommunityIcons',
      name: 'credit-card-outline',
      size: 16,
      color: iconColor,
    };
  }

  if (
    primaryLabel === 'Assinar agora' ||
    primaryLabel === 'Escolher plano' ||
    primaryLabel === 'Atualizar plano'
  ) {
    return {
      library: 'MaterialCommunityIcons',
      name: 'credit-card-fast-outline',
      size: 16,
      color: iconColor,
    };
  }

  return {
    library: 'MaterialCommunityIcons',
    name: 'view-grid-outline',
    size: 16,
    color: iconColor,
  };
}

function getUsageTone(current: number, max: number, palette: ReturnType<typeof usePallete>) {
  const safeMax = Math.max(max, 1);
  const ratio = Math.min(current / safeMax, 1);

  if (current > max) {
    return {
      ratio: 1,
      valueColor: CAPACITY_OVERFLOW,
      limitColor: CAPACITY_OVERFLOW,
      helperLabel: `Excedido em ${current - max}`,
      helperColor: CAPACITY_OVERFLOW,
      helperBackground: 'transparent',
      helperBorder: 'transparent',
      track: withAlpha(CAPACITY_OVERFLOW, '10'),
      fill: withAlpha(CAPACITY_OVERFLOW, 'CC'),
    };
  }

  if (current === max) {
    return {
      ratio,
      valueColor: palette.warning,
      limitColor: palette.warning,
      helperLabel: 'No limite do plano',
      helperColor: palette.warning,
      helperBackground: withAlpha(palette.warning, '12'),
      helperBorder: withAlpha(palette.warning, '24'),
      track: withAlpha(palette.warning, '12'),
      fill: withAlpha(palette.warning, 'CC'),
    };
  }

  return {
    ratio,
    valueColor: palette.fonts.dark,
    limitColor: palette.fonts.inactive,
    helperLabel: null,
    helperColor: palette.primary,
    helperBackground: 'transparent',
    helperBorder: 'transparent',
    track: withAlpha(palette.primary, '10'),
    fill: withAlpha(palette.primary, 'C8'),
  };
}

export default function BillingStatusPanel({
  assinatura,
  compact = false,
  onPrimaryPress,
  primaryLabel = 'Ver planos',
  onSecondaryPress,
  secondaryLabel = 'Cancelar assinatura',
  isSecondaryLoading = false,
}: BillingStatusPanelProps) {
  const palette = usePallete();
  const statusCopy = resolveStatusCopy(assinatura);
  const statusAccent = resolveStatusAccent(assinatura.status, palette);
  const labelColor = withAlpha(palette.fonts.dark, '7E');
  const volunteersTone = getUsageTone(
    assinatura.currentVolunteers,
    assinatura.maxVolunteers,
    palette,
  );
  const ministriesTone = getUsageTone(
    assinatura.currentMinistries,
    assinatura.maxMinistries,
    palette,
  );
  const hasExceededCapacity =
    assinatura.currentVolunteers > assinatura.maxVolunteers ||
    assinatura.currentMinistries > assinatura.maxMinistries;
  const hasPendingCheckout = Boolean(assinatura.checkoutUrl) && assinatura.status !== 'cancelled';
  const resolvedPrimaryLabel = primaryLabel || resolveBillingPrimaryActionLabel(assinatura);
  const showCapacityUpgradeAction =
    hasExceededCapacity && resolvedPrimaryLabel === 'Atualizar plano' && Boolean(onPrimaryPress);
  const primaryActionIcon = resolvePrimaryActionIcon(
    assinatura,
    resolvedPrimaryLabel,
    compact,
    palette,
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[palette.backgroundColor2, palette.backgroundColor2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.hero,
          {
            borderColor: palette.borderCard,
          },
        ]}
      >
        <View
          pointerEvents='none'
          style={[styles.heroGlow, { backgroundColor: statusAccent.glow }]}
        />
        <View
          pointerEvents='none'
          style={[styles.heroGlowSecondary, { backgroundColor: withAlpha(palette.primary, '0D') }]}
        />

        <View style={styles.heroHeader}>
          <View style={styles.heroMain}>
            <FancyText size='extraSmall' type='semiBold' color={labelColor} style={styles.eyebrow}>
              {statusCopy.eyebrow}
            </FancyText>
            <FancyText type='bold' size={compact ? 'medium' : 'largeMedium'}>
              {statusCopy.title}
            </FancyText>
            <FancyText
              size='small'
              type='medium'
              color={withAlpha(palette.fonts.dark, 'B2')}
              style={styles.heroBody}
            >
              {statusCopy.body}
            </FancyText>
          </View>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: statusAccent.soft,
                borderColor: statusAccent.border,
              },
            ]}
          >
            <FancyText size='extraSmall' type='bold' color={statusAccent.color}>
              {resolveStatusPillLabel(assinatura.status)}
            </FancyText>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.metricsGrid}>
        <MetricCard
          label='Plano atual'
          value={resolveBillingPlanName(assinatura.plan)}
          labelColor={labelColor}
          palette={palette}
        />
        <MetricCard
          label='Cobrança'
          value={resolveCycleLabel(assinatura.cycle)}
          labelColor={labelColor}
          palette={palette}
        />
        {!compact ? (
          <MetricCard
            label='Valor atual'
            value={formatCurrency(Number(assinatura.amount ?? 0))}
            labelColor={labelColor}
            palette={palette}
          />
        ) : null}
        {assinatura.currentPeriodEnd ? (
          <MetricCard
            label={resolvePeriodMetricLabel(assinatura.status)}
            value={formatDate(assinatura.currentPeriodEnd)}
            labelColor={labelColor}
            palette={palette}
          />
        ) : null}
        {assinatura.status === 'trial' ? (
          <MetricCard
            label='Teste até'
            value={formatDate(assinatura.trialEndsAt)}
            labelColor={labelColor}
            palette={palette}
          />
        ) : null}
      </View>

      <LinearGradient
        colors={[palette.backgroundColor2, palette.backgroundColor2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.capacityCard,
          {
            borderColor: palette.borderCard,
          },
        ]}
      >
        <View style={styles.capacityHeader}>
          <FancyText
            size='extraSmall'
            type='semiBold'
            color={labelColor}
            style={styles.capacityEyebrow}
          >
            Capacidade do plano
          </FancyText>
        </View>

        <UsageRow
          label='Voluntários'
          current={assinatura.currentVolunteers}
          max={assinatura.maxVolunteers}
          tone={volunteersTone}
          palette={palette}
        />
        <UsageRow
          label='Ministérios'
          current={assinatura.currentMinistries}
          max={assinatura.maxMinistries}
          tone={ministriesTone}
          palette={palette}
        />
      </LinearGradient>

      {hasPendingCheckout ? (
        <View
          style={[
            styles.warningBox,
            {
              backgroundColor: withAlpha(palette.primary, '0E'),
              borderColor: withAlpha(palette.primary, '22'),
            },
          ]}
        >
          <FancyText size='small' type='bold'>
            Pagamento pendente
          </FancyText>
          <FancyText size='small' type='medium' color={withAlpha(palette.fonts.dark, 'B0')}>
            O checkout continua disponível para você retomar quando quiser.
          </FancyText>
        </View>
      ) : null}

      {onPrimaryPress ? (
        <View style={styles.footer}>
          <FancyButton
            label={resolvedPrimaryLabel}
            onPress={onPrimaryPress}
            type={compact ? 'outlined' : 'contained'}
            icon={primaryActionIcon}
          />
          {onSecondaryPress ? (
            <FancyButton
              label={secondaryLabel}
              onPress={onSecondaryPress}
              type='text'
              icon={{
                library: 'MaterialCommunityIcons',
                name: 'close-circle-outline',
                size: 16,
                color: palette.error,
              }}
              isLoading={isSecondaryLoading}
              containerStyle={styles.secondaryAction}
              labelStyle={{ color: palette.error }}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  labelColor: string;
  palette: ReturnType<typeof usePallete>;
};

function MetricCard({ label, value, labelColor, palette }: MetricCardProps) {
  return (
    <LinearGradient
      colors={[palette.backgroundColor2, palette.backgroundColor2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.metricCard,
        {
          borderColor: palette.borderCard,
        },
      ]}
    >
      <View style={[styles.metricAccent, { backgroundColor: withAlpha(palette.primary, '20') }]} />
      <FancyText size='extraSmall' type='semiBold' color={labelColor} style={styles.metricLabel}>
        {label}
      </FancyText>
      <FancyText type='bold' size='medium' color={palette.fonts.dark}>
        {value}
      </FancyText>
    </LinearGradient>
  );
}

type UsageRowProps = {
  label: string;
  current: number;
  max: number;
  tone: ReturnType<typeof getUsageTone>;
  palette: ReturnType<typeof usePallete>;
};

function UsageRow({ label, current, max, tone, palette }: UsageRowProps) {
  return (
    <View
      style={[
        styles.usageCard,
        {
          backgroundColor: withAlpha(tone.helperLabel ? tone.helperColor : palette.primary, '08'),
          borderColor: withAlpha(tone.helperLabel ? tone.helperColor : palette.primary, '16'),
        },
      ]}
    >
      <View style={styles.usageRowTop}>
        <FancyText size='small' type='semiBold' color={palette.fonts.dark}>
          {label}
        </FancyText>
        <FancyText type='bold' size='medium' color={tone.valueColor}>
          {current}
          <FancyText type='semiBold' size='small' color={tone.limitColor}>
            {' '}
            / {max}
          </FancyText>
        </FancyText>
      </View>

      <View style={[styles.usageTrack, { backgroundColor: tone.track }]}>
        <View
          style={[
            styles.usageFill,
            {
              backgroundColor: tone.fill,
              width: `${Math.max(tone.ratio * 100, 8)}%`,
            },
          ]}
        />
      </View>

      {tone.helperLabel ? (
        <View style={styles.helperRow}>
          <View
            style={[
              styles.helperDot,
              {
                backgroundColor: tone.helperColor,
              },
            ]}
          />
          <FancyText size='extraSmall' type='semiBold' color={tone.helperColor}>
            {tone.helperLabel}
          </FancyText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  heroMain: {
    flex: 1,
    gap: 10,
  },
  eyebrow: {
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  heroBody: {
    width: '100%',
    maxWidth: 360,
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 999,
    top: -92,
    right: -58,
  },
  heroGlowSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    bottom: -96,
    left: -52,
  },
  statusPill: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 130,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
    overflow: 'hidden',
  },
  metricAccent: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 6,
    borderRadius: 999,
  },
  metricLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  capacityCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
  },
  capacityAlertBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacityAlertStack: {
    gap: 2,
  },
  capacityAlertDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  capacityActionButton: {
    alignSelf: 'flex-start',
    minHeight: 28,
    paddingHorizontal: 0,
  },
  capacityEyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  usageCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  usageRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  usageTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: 999,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helperDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    gap: 6,
  },
  footer: {
    paddingTop: 2,
    gap: 6,
  },
  secondaryAction: {
    alignSelf: 'center',
    minHeight: 32,
  },
});
