import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import FancyPageView from '../../components/containers/FancyPageView';
import FancyText from '../../components/FancyText';
import FancyButton from '../../components/buttons/FancyButton';
import DefaultIcons, { CustomIconProps } from '../../components/FancyIcons';
import { ResponseNotificacaoDto } from '../../domain/dtos/Notificacao/notificacao.response';
import { NotificacaoTipoEnum } from '../../domain/enums/Notificacao/tipo-notificacao.enum';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { resolveEventoEnsaioInfo } from '../../utils/evento-ensaio';
import { resolveNotificationTarget } from '../../services/notification-routing';
import {
  DEFAULT_NOTIFICATION_THEME,
  getNotificationToneColor,
  NOTIFICACAO_THEMES,
  timeAgoLong,
} from '../../components/pages/notifications/NotificacaoCard';
import { formatAppDateTime, formatClockTime } from '../../utils/date_utils';

function parseNotification(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;

  try {
    return JSON.parse(value) as ResponseNotificacaoDto;
  } catch {
    return null;
  }
}

function normalizeTime(value?: string | null) {
  return formatClockTime(value, true) ?? null;
}

function getPayload(notification: ResponseNotificacaoDto) {
  return notification.data && typeof notification.data === 'object' ? notification.data : {};
}

const TIPOS_COM_ESCALA_COMPLETA = new Set<NotificacaoTipoEnum>([
  NotificacaoTipoEnum.EscalaLembrete,
  NotificacaoTipoEnum.EscalaPublicada,
  NotificacaoTipoEnum.EscalaAtualizada,
  NotificacaoTipoEnum.EscalaAlterada,
  NotificacaoTipoEnum.EscalaCancelada,
  NotificacaoTipoEnum.EscalaConfirmacaoSolicitada,
  NotificacaoTipoEnum.EscalaConfirmacaoPendente,
  NotificacaoTipoEnum.IndisponibilidadeConflito,
]);

const TIPOS_PRESENCA_LIDER = new Set<NotificacaoTipoEnum>([
  NotificacaoTipoEnum.EscalaVoluntarioConfirmou,
  NotificacaoTipoEnum.EscalaVoluntarioRecusou,
]);

function getDetailRows(notification: ResponseNotificacaoDto) {
  const tipo = notification.tipo;
  const payload = getPayload(notification);
  const rows: Array<{ label: string; value: string; icon: CustomIconProps['name'] }> = [];

  const semRows =
    !tipo ||
    tipo === NotificacaoTipoEnum.MinisterioNovoIntegrante ||
    tipo === NotificacaoTipoEnum.ComunicadoLider ||
    tipo === NotificacaoTipoEnum.IgrejaConviteAceito ||
    tipo === NotificacaoTipoEnum.IgrejaVinculoSolicitado ||
    tipo === NotificacaoTipoEnum.IgrejaVinculoAprovado ||
    tipo === NotificacaoTipoEnum.IgrejaVinculoNegado ||
    tipo === NotificacaoTipoEnum.IgrejaNovoVoluntario ||
    tipo === NotificacaoTipoEnum.IgrejaConviteExpirado ||
    tipo === NotificacaoTipoEnum.SistemaAlertaAdmin ||
    tipo === NotificacaoTipoEnum.TesteLocal ||
    tipo === NotificacaoTipoEnum.Generic;

  if (semRows) return rows;

  const mostrarEvento = true;
  const mostrarFuncao = TIPOS_COM_ESCALA_COMPLETA.has(tipo) || TIPOS_PRESENCA_LIDER.has(tipo);
  const mostrarData = true;
  const mostrarEnsaio = TIPOS_COM_ESCALA_COMPLETA.has(tipo);

  if (mostrarEvento && typeof payload.eventoNome === 'string' && payload.eventoNome.trim()) {
    rows.push({ label: 'Evento', value: payload.eventoNome.trim(), icon: 'calendar-outline' });
  }
  if (mostrarFuncao && typeof payload.funcaoNome === 'string' && payload.funcaoNome.trim()) {
    rows.push({ label: 'Função', value: payload.funcaoNome.trim(), icon: 'account-star-outline' });
  }

  if (mostrarData) {
    const eventDateTimeSource =
      typeof payload.dataEvento === 'string' && payload.dataEvento.trim()
        ? payload.dataEvento
        : typeof payload.dataOcorrencia === 'string' && payload.dataOcorrencia.trim()
          ? payload.dataOcorrencia
          : null;
    const eventDateTimeLabel = eventDateTimeSource
      ? formatAppDateTime(eventDateTimeSource, "dd/MM 'às' HH'h'mm")
      : null;
    if (eventDateTimeLabel) {
      rows.push({ label: 'Data', value: eventDateTimeLabel, icon: 'clock-outline' });
    }
  }

  if (mostrarEnsaio) {
    const ensaio = resolveEventoEnsaioInfo({
      horarioEnsaio: typeof payload.horarioEnsaio === 'string' ? payload.horarioEnsaio : null,
      horarioEnsaioPadrao:
        typeof payload.horarioEnsaioPadrao === 'string'
          ? payload.horarioEnsaioPadrao
          : typeof payload.evento?.horarioEnsaioPadrao === 'string'
            ? payload.evento.horarioEnsaioPadrao
            : null,
      isLouvor: true,
      fallbackLabel: 'Horário de ensaio não definido',
    });
    if (ensaio.horario) {
      rows.push({
        label: 'Ensaio',
        value: `Ensaio às ${normalizeTime(ensaio.horario)}`,
        icon: 'music-note-outline',
      });
    }
  }

  return rows;
}

function getShortcut(notification: ResponseNotificacaoDto) {
  const target = resolveNotificationTarget(notification);
  const tipo = notification.tipo;

  if (target && target.pathname !== '/notifications') {
    if (String(target.pathname).includes('/pessoal/escalas'))
      return { label: 'Ver escala', target };
    if (String(target.pathname).includes('/ministerios'))
      return { label: 'Abrir ministérios', target };
    if (String(target.pathname).includes('/admin/solicitacoes'))
      return { label: 'Abrir solicitações', target };
    if (String(target.pathname).includes('/admin/voluntarios'))
      return { label: 'Abrir voluntários', target };
    if (String(target.pathname).includes('/join-church/requests'))
      return { label: 'Abrir minhas solicitações', target };
    return { label: 'Abrir tela relacionada', target };
  }

  if (tipo === NotificacaoTipoEnum.SistemaAlertaAdmin) {
    return { label: 'Abrir configurações', target: { pathname: '/(app)/(drawer)/configuracoes' } };
  }

  return { label: 'Ir para início', target: { pathname: '/(app)/(drawer)/inicio' } };
}

export default function NotificationDetailPage() {
  const params = useLocalSearchParams<{ notification?: string }>();
  const palette = usePallete();
  const notification = parseNotification(params.notification);

  if (!notification) {
    return (
      <FancyPageView style={styles.container}>
        <View style={styles.emptyState}>
          <FancyText type='bold' size='small' style={{ color: palette.fonts.dark }}>
            Notificação indisponível
          </FancyText>
          <FancyText
            size='extraSmall'
            type='medium'
            style={{ color: palette.fonts.inactive, textAlign: 'center' }}
          >
            Não foi possível carregar os detalhes desta notificação.
          </FancyText>
        </View>
      </FancyPageView>
    );
  }

  const theme = notification.tipo
    ? (NOTIFICACAO_THEMES[notification.tipo] ?? DEFAULT_NOTIFICATION_THEME)
    : DEFAULT_NOTIFICATION_THEME;
  const accentColor = getNotificationToneColor(theme.tone);
  const rows = getDetailRows(notification);
  const shortcut = getShortcut(notification);
  const createdAt = notification.criadaEm || notification.createdAt;
  const createdDate = createdAt ? new Date(createdAt) : null;
  const timeLabel = createdDate ? timeAgoLong(createdDate) : null;

  const handleOpenContext = () => {
    const { target } = shortcut;
    if (target.params && Object.keys(target.params).length > 0) {
      router.replace({ pathname: target.pathname as any, params: target.params as any });
    } else {
      router.replace(target.pathname as any);
    }
  };

  return (
    <FancyPageView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.headerBlock,
            {
              backgroundColor: palette.backgroundColor2,
              borderColor: ColorUtils.withAlpha(accentColor, 0.1),
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: ColorUtils.withAlpha(accentColor, 0.14) },
            ]}
          >
            <DefaultIcons.Custom {...theme.icon} color={accentColor} size={20} />
          </View>
          <View style={styles.headerText}>
            <FancyText type='bold' size='medium' style={{ color: accentColor }}>
              {theme.label}
            </FancyText>
            <FancyText
              type='medium'
              size='extraSmall'
              style={[
                styles.inlineMessage,
                { color: ColorUtils.withAlpha(palette.fonts.dark, 0.72) },
              ]}
            >
              {notification.mensagem?.trim() ||
                notification.titulo?.trim() ||
                'Toque no atalho abaixo para abrir a tela relacionada.'}
            </FancyText>
            {timeLabel ? (
              <FancyText type='medium' size='extraSmall' style={{ color: palette.fonts.inactive }}>
                {timeLabel}
              </FancyText>
            ) : null}
          </View>
        </View>

        {rows.length > 0 ? (
          <View style={styles.section}>
            <FancyText type='bold' size='small' style={{ color: palette.fonts.dark }}>
              Resumo
            </FancyText>
            <View
              style={[
                styles.summaryBlock,
                { backgroundColor: ColorUtils.withAlpha(accentColor, 0.035) },
              ]}
            >
              {rows.map((row, index) => (
                <View
                  key={row.label}
                  style={[
                    styles.row,
                    index < rows.length - 1 && {
                      borderBottomColor: ColorUtils.withAlpha(palette.border, 0.55),
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.rowIcon,
                      { backgroundColor: ColorUtils.withAlpha(accentColor, 0.1) },
                    ]}
                  >
                    <DefaultIcons.Custom
                      library='MaterialCommunityIcons'
                      name={row.icon}
                      size={15}
                      color={accentColor}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <FancyText
                      type='medium'
                      size='extraSmall'
                      style={{ color: palette.fonts.inactive }}
                    >
                      {row.label}
                    </FancyText>
                    <FancyText
                      type='semiBold'
                      size='extraSmall'
                      style={{ color: palette.fonts.dark }}
                    >
                      {row.value}
                    </FancyText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <FancyButton
          label={shortcut.label}
          type='contained'
          icon={{ library: 'MaterialCommunityIcons', name: 'open-in-new', size: 16 }}
          onPress={handleOpenContext}
          containerStyle={styles.shortcutButton}
        />
      </ScrollView>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  inlineMessage: {
    lineHeight: 16,
  },
  section: {
    gap: 6,
  },
  summaryBlock: {
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  row: {
    paddingHorizontal: 0,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  shortcutButton: {
    marginTop: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
});
