import { StyleSheet, View } from 'react-native';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import { ResponseIgrejaAssinaturaDto } from '../../domain/dtos/Igreja/response-igreja-assinatura.dto';
import { usePallete } from '../../hooks/usePallete';
import { resolveBillingPlanName } from '../../domain/utils/billing-plan-catalog';

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
        title: 'Período de teste ativo',
        body: `${assinatura.daysRemainingInTrial} dia(s) restantes para validar a rotina antes da cobrança começar.`,
      };
    case 'active':
      return {
        title: 'Assinatura em dia',
        body: 'O plano atual está ativo e a operação da igreja segue liberada.',
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
        body: 'A igreja segue com acesso até o fim do período já pago.',
      };
    case 'expired':
      return {
        title: 'Teste expirado',
        body: 'A igreja voltou para os limites gratuitos até reativar a assinatura.',
      };
    default:
      return {
        title: 'Faixa gratuita',
        body: 'A igreja está operando no limite básico de ministérios e voluntários.',
      };
  }
}

function resolveCycleLabel(cycle?: string | null) {
  return cycle === 'YEARLY' ? 'Anual' : 'Mensal';
}

function resolveStatusPillLabel(status: ResponseIgrejaAssinaturaDto['status']) {
  switch (status) {
    case 'trial':
      return 'TESTE';
    case 'active':
      return 'ATIVA';
    case 'overdue':
      return 'EM ATRASO';
    case 'cancelled':
      return 'CANCELADA';
    case 'expired':
      return 'EXPIRADA';
    default:
      return 'GRATUITA';
  }
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
            {resolveStatusPillLabel(assinatura.status)}
          </FancyText>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Plano atual
          </FancyText>
          <FancyText type='bold' size='small'>
            {resolveBillingPlanName(assinatura.plan)}
          </FancyText>
        </View>

        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Cobrança
          </FancyText>
          <FancyText type='bold' size='small'>
            {resolveCycleLabel(assinatura.cycle)}
          </FancyText>
        </View>

        {!compact ? (
          <View style={styles.metric}>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Valor atual
            </FancyText>
            <FancyText type='bold' size='small'>
              {formatCurrency(Number(assinatura.amount ?? 0))}
            </FancyText>
          </View>
        ) : null}
      </View>

      <View style={styles.usageBlock}>
        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Voluntários
          </FancyText>
          <FancyText type='semiBold' size='small'>
            {assinatura.currentVolunteers} / {assinatura.maxVolunteers}
          </FancyText>
        </View>

        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Ministérios
          </FancyText>
          <FancyText type='semiBold' size='small'>
            {assinatura.currentMinistries} / {assinatura.maxMinistries}
          </FancyText>
        </View>
      </View>

      <View style={styles.timeline}>
        {assinatura.status === 'trial' ? (
          <View style={styles.metric}>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Teste até
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
          {onSecondaryPress ? (
            <FancyButton
              label={secondaryLabel}
              onPress={onSecondaryPress}
              type='text'
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
    flexWrap: 'wrap',
  },
  usageBlock: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
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
    gap: 4,
  },
  secondaryAction: {
    alignSelf: 'center',
    minHeight: 32,
  },
});
