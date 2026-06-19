import { StyleSheet, View } from 'react-native';
import FancyButton from '../buttons/FancyButton';
import FancyChips from '../FancyChips';
import { CustomIconProps } from '../FancyIcons';
import FancyText from '../FancyText';
import { ResponseIgrejaAssinaturaDto } from '../../domain/dtos/Igreja/response-igreja-assinatura.dto';
import { useAppTheme } from '../../hooks/useAppTheme';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { resolveBillingPlanName } from '../../domain/utils/billing-plan-catalog';
import {
  resolveBillingNoticeContent,
  resolveBillingPrimaryActionLabel,
  resolveBillingTrialPhase,
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

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function resolveStatusCopy(assinatura: ResponseIgrejaAssinaturaDto) {
  if (assinatura.status === 'trial' || assinatura.status === 'expired') {
    const notice = resolveBillingNoticeContent(assinatura);
    const trialPhase = resolveBillingTrialPhase(assinatura);
    return {
      eyebrow: notice.eyebrow,
      title:
        assinatura.status === 'trial' && trialPhase !== 'expired'
          ? 'Período avaliativo ativo'
          : notice.title,
    };
  }
  switch (assinatura.status) {
    case 'active':
      return { eyebrow: 'Assinatura', title: 'Assinatura em dia' };
    case 'overdue':
      return { eyebrow: 'Assinatura', title: 'Pagamento pendente' };
    case 'cancelled':
      return { eyebrow: 'Assinatura', title: 'Acesso mantido até o fim do ciclo' };
    default:
      return { eyebrow: 'Assinatura', title: 'Faixa gratuita' };
  }
}

function resolveCycleLabel(cycle?: string | null) {
  return cycle === 'YEARLY' ? 'Anual' : 'Mensal';
}

function resolvePeriodMetricLabel(status: ResponseIgrejaAssinaturaDto['status']) {
  return status === 'cancelled' ? 'Válido até' : 'Renova em';
}

function resolveStatusAccentColor(
  status: ResponseIgrejaAssinaturaDto['status'],
  palette: ReturnType<typeof usePallete>,
) {
  switch (status) {
    case 'active':
    case 'trial':
      return palette.confirm;
    case 'overdue':
      return palette.warning;
    case 'cancelled':
    case 'expired':
      return palette.error;
    default:
      return palette.primary;
  }
}

function resolveStatusPillLabel(status: ResponseIgrejaAssinaturaDto['status']) {
  switch (status) {
    case 'trial':    return 'Teste';
    case 'active':   return 'Ativa';
    case 'overdue':  return 'Pendente';
    case 'cancelled': return 'Cancelada';
    case 'expired':  return 'Expirada';
    default:         return 'Gratuita';
  }
}

function resolvePrimaryActionIcon(
  assinatura: ResponseIgrejaAssinaturaDto,
  primaryLabel: string,
  compact: boolean,
  palette: ReturnType<typeof usePallete>,
): CustomIconProps {
  const iconColor = compact ? palette.primary : palette.fonts.light;

  if (primaryLabel === 'Reativar assinatura')
    return { library: 'MaterialCommunityIcons', name: 'refresh', size: 16, color: iconColor };
  if (primaryLabel === 'Retomar pagamento')
    return { library: 'MaterialCommunityIcons', name: 'credit-card-outline', size: 16, color: iconColor };
  if (['Assinar agora', 'Escolher plano', 'Atualizar plano'].includes(primaryLabel))
    return { library: 'MaterialCommunityIcons', name: 'credit-card-fast-outline', size: 16, color: iconColor };

  return { library: 'MaterialCommunityIcons', name: 'view-grid-outline', size: 16, color: iconColor };
}

function getUsageTone(current: number, max: number, palette: ReturnType<typeof usePallete>) {
  const safeMax = Math.max(max, 1);
  const ratio = Math.min(current / safeMax, 1);

  if (current > max) {
    return {
      ratio: 1,
      valueColor: palette.error,
      limitColor: palette.error,
      helperLabel: `Excedido em ${current - max}`,
      helperColor: palette.error,
      track: ColorUtils.withAlpha(palette.error, 0.1),
      fill: ColorUtils.withAlpha(palette.error, 0.8),
    };
  }
  if (current === max) {
    return {
      ratio,
      valueColor: palette.warning,
      limitColor: palette.warning,
      helperLabel: 'No limite do plano',
      helperColor: palette.warning,
      track: ColorUtils.withAlpha(palette.warning, 0.12),
      fill: ColorUtils.withAlpha(palette.warning, 0.8),
    };
  }
  return {
    ratio,
    valueColor: palette.fonts.dark,
    limitColor: palette.fonts.inactive,
    helperLabel: null,
    helperColor: palette.primary,
    track: ColorUtils.withAlpha(palette.primary, 0.1),
    fill: ColorUtils.withAlpha(palette.primary, 0.8),
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
  const { palette, isDark } = useAppTheme();
  const statusCopy = resolveStatusCopy(assinatura);
  const statusColor = resolveStatusAccentColor(assinatura.status, palette);
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;

  const volunteersTone = getUsageTone(assinatura.currentVolunteers, assinatura.maxVolunteers, palette);
  const ministriesTone = getUsageTone(assinatura.currentMinistries, assinatura.maxMinistries, palette);
  const hasPendingCheckout = Boolean(assinatura.checkoutUrl) && assinatura.status !== 'cancelled';
  const resolvedPrimaryLabel = primaryLabel || resolveBillingPrimaryActionLabel(assinatura);
  const primaryActionIcon = resolvePrimaryActionIcon(assinatura, resolvedPrimaryLabel, compact, palette);

  const metaParts = [resolveBillingPlanName(assinatura.plan), resolveCycleLabel(assinatura.cycle)];
  if (!compact) metaParts.push(formatCurrency(Number(assinatura.amount ?? 0)));
  if (assinatura.status === 'trial' && resolveBillingTrialPhase(assinatura) !== 'expired') {
    metaParts.push(`Teste até ${formatDate(assinatura.trialEndsAt)}`);
  } else if (assinatura.currentPeriodEnd) {
    metaParts.push(`${resolvePeriodMetricLabel(assinatura.status)} ${formatDate(assinatura.currentPeriodEnd)}`);
  }
  const metaLine = metaParts.join('  ·  ');

  return (
    <View style={styles.container}>
      {/* Card unificado: header colorido + barras de capacidade */}
      <View
        style={[
          styles.unifiedCard,
          {
            backgroundColor: cardBg,
            borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45),
          },
          palette.shadows[200],
        ]}
      >
        <View
          style={[
            styles.cardHeader,
            {
              backgroundColor: ColorUtils.withAlpha(statusColor, 0.08),
              borderBottomColor: ColorUtils.withAlpha(statusColor, 0.18),
            },
          ]}
        >
          <View style={styles.headerRow}>
            <FancyText
              size='extraSmall'
              type='semiBold'
              color={ColorUtils.withAlpha(statusColor, 0.9)}
              style={[styles.eyebrow, { flex: 1 }]}
              numberOfLines={1}
            >
              {statusCopy.eyebrow}
            </FancyText>
            <FancyChips
              label={resolveStatusPillLabel(assinatura.status)}
              color={statusColor}
              backgroundColor={ColorUtils.withAlpha(statusColor, 0.14)}
              size='small'
              dot
            />
          </View>

          <FancyText type='bold' size={compact ? 'medium' : 'largeMedium'}>
            {statusCopy.title}
          </FancyText>

          <FancyText
            size='extraSmall'
            type='semiBold'
            color={ColorUtils.withAlpha(palette.fonts.dark, 0.55)}
            style={styles.metaLine}
          >
            {metaLine}
          </FancyText>
        </View>

        <View style={styles.cardBody}>
          <SimpleUsageBar
            label='Voluntários'
            current={assinatura.currentVolunteers}
            max={assinatura.maxVolunteers}
            tone={volunteersTone}
            palette={palette}
          />
          <SimpleUsageBar
            label='Ministérios'
            current={assinatura.currentMinistries}
            max={assinatura.maxMinistries}
            tone={ministriesTone}
            palette={palette}
          />
        </View>
      </View>

      {hasPendingCheckout ? (
        <View
          style={[
            styles.warningBox,
            {
              backgroundColor: ColorUtils.withAlpha(palette.primary, 0.06),
              borderColor: ColorUtils.withAlpha(palette.primary, 0.14),
            },
          ]}
        >
          <FancyText size='small' type='bold'>
            Pagamento pendente
          </FancyText>
          <FancyText size='small' type='medium' color={ColorUtils.withAlpha(palette.fonts.dark, 0.7)}>
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

type SimpleUsageBarProps = {
  label: string;
  current: number;
  max: number;
  tone: ReturnType<typeof getUsageTone>;
  palette: ReturnType<typeof usePallete>;
};

function SimpleUsageBar({ label, current, max, tone, palette }: SimpleUsageBarProps) {
  return (
    <View style={styles.usageBar}>
      <View style={styles.usageBarTop}>
        <FancyText size='small' type='semiBold' color={palette.fonts.dark} style={{ flex: 1 }}>
          {label}
        </FancyText>
        <View style={styles.usageValueRow}>
          <FancyText type='bold' size='medium' color={tone.valueColor}>
            {current}
          </FancyText>
          <FancyText type='semiBold' size='small' color={tone.limitColor}>
            {' / '}{max}
          </FancyText>
        </View>
      </View>

      <View style={[styles.barTrack, { backgroundColor: tone.track }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: tone.fill,
              width: `${Math.max(tone.ratio * 100, 8)}%`,
            },
          ]}
        />
      </View>

      {tone.helperLabel ? (
        <View style={styles.helperRow}>
          <View style={[styles.helperDot, { backgroundColor: tone.helperColor }]} />
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
  unifiedCard: {
    borderWidth: 0.5,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 0.5,
    gap: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  metaLine: {
    marginTop: 2,
  },
  cardBody: {
    padding: 14,
    gap: 12,
  },
  usageBar: {
    gap: 6,
  },
  usageBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  usageValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  barTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
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
