import { StyleSheet, View } from 'react-native';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import { ResponseIgrejaAssinaturaDto } from '../../domain/dtos/Igreja/response-igreja-assinatura.dto';
import { usePallete } from '../../hooks/usePallete';

type BillingStatusPanelProps = {
  assinatura: ResponseIgrejaAssinaturaDto;
  compact?: boolean;
  onPrimaryPress?: () => void;
  primaryLabel?: string;
};

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
  switch (assinatura.status) {
    case 'trial':
      return {
        title: 'Teste grátis ativo',
        body: `${assinatura.daysRemainingInTrial} dia(s) restantes no período de teste.`,
      };
    case 'active':
      return {
        title: 'Plano ativo',
        body: 'A assinatura da igreja está regularizada.',
      };
    case 'overdue':
      return {
        title: 'Pagamento pendente',
        body: assinatura.inGracePeriod
          ? 'A igreja segue em período de tolerância enquanto o pagamento é regularizado.'
          : 'A assinatura está em atraso e pode limitar ações administrativas.',
      };
    case 'cancelled':
      return {
        title: 'Assinatura cancelada',
        body: 'O acesso permanece até o fim do período já pago.',
      };
    case 'expired':
      return {
        title: 'Teste expirado',
        body: 'Os recursos premium entraram em modo de leitura.',
      };
    default:
      return {
        title: 'Plano gratuito',
        body: 'A igreja está usando o limite básico de voluntários.',
      };
  }
}

export default function BillingStatusPanel({
  assinatura,
  compact = false,
  onPrimaryPress,
  primaryLabel = 'Abrir assinatura',
}: BillingStatusPanelProps) {
  const palette = usePallete();
  const statusCopy = resolveStatusCopy(assinatura);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.backgroundColor4,
          borderColor: palette.borderCard,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <FancyText type='semiBold' size={compact ? 'small' : 'medium'}>
            {statusCopy.title}
          </FancyText>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            {statusCopy.body}
          </FancyText>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor:
                assinatura.status === 'active' || assinatura.status === 'trial'
                  ? `${palette.confirm}22`
                  : `${palette.primary}18`,
            },
          ]}
        >
          <FancyText
            size='extraSmall'
            type='semiBold'
            color={
              assinatura.status === 'active' || assinatura.status === 'trial'
                ? palette.confirm
                : palette.primary
            }
          >
            {assinatura.status.toUpperCase()}
          </FancyText>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Plano
          </FancyText>
          <FancyText type='bold' size='small'>
            {assinatura.plan === 'annual' ? 'Anual' : assinatura.plan === 'pro' ? 'Pro' : 'Gratuito'}
          </FancyText>
        </View>

        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Ciclo
          </FancyText>
          <FancyText type='bold' size='small'>
            {assinatura.cycle === 'YEARLY' ? 'Anual' : 'Mensal'}
          </FancyText>
        </View>

        {!compact ? (
          <View style={styles.metric}>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Valor
            </FancyText>
            <FancyText type='bold' size='small'>
              {formatCurrency(Number(assinatura.amount ?? 0))}
            </FancyText>
          </View>
        ) : null}
      </View>

      <View style={styles.timeline}>
        {assinatura.status === 'trial' ? (
          <View style={styles.metric}>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Trial termina em
            </FancyText>
            <FancyText type='semiBold' size='small'>
              {formatDate(assinatura.trialEndsAt)}
            </FancyText>
          </View>
        ) : null}

        {assinatura.currentPeriodEnd ? (
          <View style={styles.metric}>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Próxima renovação
            </FancyText>
            <FancyText type='semiBold' size='small'>
              {formatDate(assinatura.currentPeriodEnd)}
            </FancyText>
          </View>
        ) : null}
      </View>

      {assinatura.checkoutUrl ? (
        <View
          style={[
            styles.warningBox,
            { backgroundColor: `${palette.primary}10`, borderColor: `${palette.primary}22` },
          ]}
        >
          <FancyText size='extraSmall' type='semiBold'>
            Pagamento pendente
          </FancyText>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            O checkout continua disponível para você retomar quando quiser.
          </FancyText>
        </View>
      ) : null}

      {onPrimaryPress ? (
        <View style={styles.footer}>
          <FancyButton
            label={primaryLabel}
            onPress={onPrimaryPress}
            type={compact ? 'outlined' : 'contained'}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeline: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metric: {
    flex: 1,
    gap: 4,
    minWidth: 100,
  },
  warningBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  footer: {
    paddingTop: 2,
  },
});
