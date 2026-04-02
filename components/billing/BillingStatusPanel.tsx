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

function formatCurrency(cents?: number | null) {
  if (cents == null) return 'Sob consulta';
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function BillingStatusPanel({
  assinatura,
  compact = false,
  onPrimaryPress,
  primaryLabel = 'Ver assinatura',
}: BillingStatusPanelProps) {
  const palette = usePallete();
  const avisoPrincipal = assinatura.avisos?.[0];
  const planoAtual = assinatura.planoAtual;
  const usoAtual = assinatura.usoAtual;
  const checkoutPendente = assinatura.checkoutPendente;

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
            Status do plano
          </FancyText>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            {planoAtual
              ? `${planoAtual.nome} • ${assinatura.periodicidade.toLowerCase()}`
              : 'Plano em preparação'}
          </FancyText>
          {checkoutPendente ? (
            <FancyText size='extraSmall' color={palette.primary} type='semiBold'>
              Pagamento pendente para {checkoutPendente.plano.toLowerCase()}
            </FancyText>
          ) : null}
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor:
                assinatura.status === 'ATIVA' || assinatura.status === 'ISENTA'
                  ? `${palette.confirm}22`
                  : `${palette.primary}18`,
            },
          ]}
        >
          <FancyText
            size='extraSmall'
            type='semiBold'
            color={
              assinatura.status === 'ATIVA' || assinatura.status === 'ISENTA'
                ? palette.confirm
                : palette.primary
            }
          >
            {assinatura.status}
          </FancyText>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Voluntários
          </FancyText>
          <FancyText type='bold' size='small'>
            {usoAtual?.voluntariosAtivos ?? 0}
            {planoAtual?.limiteVoluntarios != null ? ` / ${planoAtual.limiteVoluntarios}` : ''}
          </FancyText>
        </View>
        <View style={styles.metric}>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            Ministérios
          </FancyText>
          <FancyText type='bold' size='small'>
            {usoAtual?.ministeriosAtivos ?? 0}
            {planoAtual?.limiteMinisterios != null ? ` / ${planoAtual.limiteMinisterios}` : ''}
          </FancyText>
        </View>
        {!compact && (
          <View style={styles.metric}>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Valor atual
            </FancyText>
            <FancyText type='bold' size='small'>
              {planoAtual
                ? formatCurrency(
                    assinatura.periodicidade === 'ANUAL'
                      ? planoAtual.precoAnualCentavos
                      : planoAtual.precoMensalCentavos,
                  )
                : 'Sob consulta'}
            </FancyText>
          </View>
        )}
      </View>

      {checkoutPendente ? (
        <View
          style={[
            styles.warningBox,
            { backgroundColor: `${palette.primary}10`, borderColor: `${palette.primary}22` },
          ]}
        >
          <FancyText size='extraSmall' type='semiBold'>
            Upgrade aguardando confirmação
          </FancyText>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            O plano atual continua valendo até o Mercado Pago confirmar o pagamento.
          </FancyText>
        </View>
      ) : avisoPrincipal ? (
        <View
          style={[
            styles.warningBox,
            { backgroundColor: `${palette.primary}10`, borderColor: `${palette.primary}22` },
          ]}
        >
          <FancyText size='extraSmall' type='semiBold'>
            {avisoPrincipal.titulo}
          </FancyText>
          <FancyText size='extraSmall' color={palette.fonts.inactive}>
            {avisoPrincipal.mensagem}
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
    gap: 3,
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
  metric: {
    flex: 1,
    gap: 4,
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
