import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import FancyButton from '../../../components/buttons/FancyButton';
import FancyText from '../../../components/FancyText';
import FancyVerticalSpacer from '../../../components/FancyVerticalSpacer';
import FancyImage from '../../../components/images/FancyImage';
import DefaultIcons from '../../../components/FancyIcons';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useAuth } from '../../../contexts/AuthContext';
import { IgrejaRepository } from '../../../domain/services/IgrejaRepository';
import { ResponseConvitePreviewDto } from '../../../domain/dtos/Igreja/response-convite-preview.dto';
import { ColorUtils } from '../../../utils/color_utils';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const PENDING_INVITE_KEY = 'pendingInvite';
const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken'; // legado

/**
 * Shell flat das telas de auth (mesmo padrão de login/forgot-password):
 * fundo sólido, botão voltar circular no canto, conteúdo centralizado
 * verticalmente com gutter de 24px. Sem card, sem gradiente.
 */
function InviteFlatLayout({
  children,
  onPressBack,
}: {
  children: React.ReactNode;
  onPressBack?: () => void;
}) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: Pallete.backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <View style={[styles.backButtonRow, { top: insets.top + 8 }]}>
          <FancyButton
            mode='icon'
            type='text'
            onPress={onPressBack || (() => router.back())}
            icon={{ library: 'Feather', name: 'arrow-left', size: 18 }}
            iconStyle={{ color: Pallete.icons.dark }}
            containerStyle={{
              backgroundColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.08),
              borderRadius: 22,
              width: 44,
              height: 44,
            }}
          />
        </View>

        <View style={[styles.content, { paddingTop: insets.top + 24 }]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

function getErrorMessage(error: AxiosError | any): string {
  const data = error?.response?.data;
  const status = error?.response?.status;
  const errorCode = data?.code || data?.error?.code || data?.errorCode;
  const message = data?.message || data?.error?.message;

  if (status === 404 || errorCode === 'CONVITE_NAO_ENCONTRADO') {
    return 'Convite não encontrado. Verifique o código e tente novamente.';
  }
  if (errorCode === 'CONVITE_EXPIRADO' || message?.includes('expirado')) {
    return 'Este convite já expirou. Solicite um novo convite.';
  }
  if (
    errorCode === 'CONVITE_REVOGADO' ||
    message?.includes('revogado') ||
    message?.includes('inativo')
  ) {
    return 'Este convite foi revogado e não pode mais ser utilizado.';
  }
  if (errorCode === 'CONVITE_LIMITE_ATINGIDO' || message?.includes('limite')) {
    return 'Este convite atingiu o limite de usos.';
  }
  if (errorCode === 'JA_MEMBRO') {
    return 'Você já é membro desta igreja.';
  }
  if (errorCode === 'SOLICITACAO_PENDENTE') {
    return 'Você já possui uma solicitação pendente para esta igreja.';
  }
  if (message) {
    return message;
  }
  return 'Ocorreu um erro. Tente novamente.';
}

export default function InviteTokenPage() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const { token: urlToken } = useLocalSearchParams<{ token: string }>();
  const { user, refreshMe } = useAuth();

  const [loadingPreview, setLoadingPreview] = useState(true);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [preview, setPreview] = useState<ResponseConvitePreviewDto | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleInvite = async () => {
      if (!urlToken) {
        setError('Token de convite inválido');
        setLoadingPreview(false);
        return;
      }

      try {
        // Sempre carrega a preview — endpoint público, funciona sem JWT
        const previewData = await IgrejaRepository.getConvitePreview(urlToken);
        setPreview(previewData);

        // Se não logado: salva contexto rico no AsyncStorage e FICA na tela (estado N1)
        if (!user) {
          await AsyncStorage.setItem(
            PENDING_INVITE_KEY,
            JSON.stringify({
              token: urlToken,
              igreja: {
                nome: previewData.igreja.nome,
                logoUrl: previewData.igreja.logoUrl ?? null,
              },
            }),
          );
          // Remove chave legada se existir
          await AsyncStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
        } else {
          // Logado: chegamos aqui porque o convite pendente foi honrado
          // (via login.tsx ou useProtectedRoute). Limpa o token agora — este
          // é o único ponto que deleta, evitando corrida entre os redirects.
          await AsyncStorage.multiRemove([PENDING_INVITE_KEY, PENDING_INVITE_TOKEN_KEY]);
          router.replace('/(app)');
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
      } finally {
        setLoadingPreview(false);
      }
    };

    handleInvite();
  }, [urlToken, user]);

  const handleAccept = async () => {
    if (!urlToken || loadingAccept) return;

    setLoadingAccept(true);
    try {
      const result = await IgrejaRepository.aceitarConvite(urlToken);

      if (result.result === 'MEMBER_CREATED') {
        Toast.show({
          type: 'success',
          text1: 'Bem-vindo!',
          text2: 'Você agora faz parte da igreja.',
        });
        await refreshMe();
        router.replace('/(app)');
      } else if (result.result === 'REQUEST_CREATED') {
        Toast.show({
          type: 'info',
          text1: 'Solicitação enviada',
          text2: 'Aguarde a aprovação da liderança.',
        });
        router.replace('/(app)/join-church/requests');
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro ao aceitar convite', text2: getErrorMessage(err) });
    } finally {
      setLoadingAccept(false);
    }
  };

  const handleCancelarSolicitacao = async () => {
    if (!preview?.solicitacaoId || loadingCancel) return;

    setLoadingCancel(true);
    try {
      await IgrejaRepository.cancelarMinhaSolicitacao(preview.solicitacaoId);
      Toast.show({ type: 'success', text1: 'Solicitação cancelada.' });
      router.replace('/(app)');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao cancelar solicitação',
        text2: getErrorMessage(err),
      });
    } finally {
      setLoadingCancel(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(user ? '/(app)' : '/(auth)/login');
    }
  };

  const handleLoginPress = () => {
    // replace em vez de push: remove a tela de convite da pilha de navegação.
    // Depois do login, usePostLoginRedirect detecta o pendingInvite e
    // navega de volta para cá automaticamente.
    router.replace('/(auth)/login');
  };

  const handleCreateAccountPress = () => {
    router.push('/(auth)/create-voluntario-account');
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loadingPreview) {
    return (
      <InviteFlatLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={Pallete.primary} />
          <FancyText style={styles.loadingText}>Carregando convite...</FancyText>
        </View>
      </InviteFlatLayout>
    );
  }

  // ── Erro (expirado, revogado, inválido) ──────────────────────────────────────
  if (error || !preview) {
    return (
      <InviteFlatLayout onPressBack={handleBack}>
        <View style={styles.errorIconContainer}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name='error-outline'
            size={48}
            color={Pallete.error}
          />
        </View>
        <FancyText type='bold' size='large' style={styles.centeredText}>
          Convite indisponível
        </FancyText>
        <FancyText style={[styles.centeredText, styles.errorText]}>
          {error || 'Convite não encontrado'}
        </FancyText>
        <FancyButton label='Voltar' onPress={handleBack} />
      </InviteFlatLayout>
    );
  }

  // ── L3: Já é membro ──────────────────────────────────────────────────────────
  if (preview.jaMembro) {
    return (
      <InviteFlatLayout>
        <View style={styles.churchHeader}>
          {preview.igreja.logoUrl ? (
            <FancyImage source={{ uri: preview.igreja.logoUrl }} size={72} style={styles.logoImage} />
          ) : (
            <View style={[styles.logoContainer, { width: 72, height: 72, borderRadius: 36 }]}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='church'
                size={36}
                color={Pallete.primary}
              />
            </View>
          )}
          <FancyVerticalSpacer height={8} />
          <FancyText type='semiBold' size='large' style={[styles.centeredText, styles.churchNameText]}>
            {preview.igreja.nome}
          </FancyText>
          <FancyVerticalSpacer height={14} />
          <View style={styles.jaMembroBadge}>
            <FancyText type='semiBold' size='small' style={styles.jaMembroBadgeText}>
              ✓ Você já é membro
            </FancyText>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <FancyButton label='Voltar' onPress={() => router.replace('/(app)')} />
        </View>
      </InviteFlatLayout>
    );
  }

  // ── L4: Solicitação pendente ──────────────────────────────────────────────────
  if (preview.solicitacaoPendente) {
    return (
      <InviteFlatLayout>
        <View style={styles.churchHeader}>
          {preview.igreja.logoUrl ? (
            <FancyImage source={{ uri: preview.igreja.logoUrl }} size={72} style={styles.logoImage} />
          ) : (
            <View style={[styles.logoContainer, { width: 72, height: 72, borderRadius: 36 }]}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='church'
                size={36}
                color={Pallete.primary}
              />
            </View>
          )}
          <FancyVerticalSpacer height={8} />
          <FancyText type='semiBold' size='large' style={[styles.centeredText, styles.churchNameText]}>
            {preview.igreja.nome}
          </FancyText>
          <FancyVerticalSpacer height={6} />
          <View style={styles.aguardandoBadge}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='access-time'
              size={14}
              color={Pallete.warning}
            />
            <FancyText type='semiBold' size='medium' style={styles.aguardandoBadgeText}>
              Aguardando aprovação
            </FancyText>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <FancyButton label='Ir para o app' onPress={() => router.replace('/(app)')} />
          {preview.solicitacaoId && (
            <FancyButton
              label={loadingCancel ? 'Cancelando...' : 'Cancelar solicitação'}
              type='outlined'
              onPress={handleCancelarSolicitacao}
              disabled={loadingCancel}
            />
          )}
        </View>
      </InviteFlatLayout>
    );
  }

  const expiresText = preview.expiresAt
    ? formatInTimeZone(new Date(preview.expiresAt), 'America/Sao_Paulo', "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    : null;

  // ── N1: Não logado + convite válido ──────────────────────────────────────────
  if (!user) {
    return (
      <InviteFlatLayout>
        <View style={styles.churchHeader}>
          {preview.igreja.logoUrl ? (
            <FancyImage source={{ uri: preview.igreja.logoUrl }} size={80} style={styles.logoImage} />
          ) : (
            <View style={styles.logoContainer}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='church'
                size={40}
                color={Pallete.primary}
              />
            </View>
          )}
          <FancyVerticalSpacer height={8} />
          <FancyText type='semiBold' size='large' style={[styles.centeredText, styles.churchNameText]}>
            {preview.igreja.nome}
          </FancyText>
          <FancyVerticalSpacer height={4} />
          <FancyText type='bold' size='extraLarge' style={styles.centeredText}>
            Você foi convidado!
          </FancyText>
        </View>

        <View style={styles.detailGroup}>
          {expiresText && (
            <View style={styles.detailRow}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='access-time'
                size={16}
                color={Pallete.icons.inactive}
              />
              <FancyText size='medium' style={styles.detailText}>
                Válido até: {expiresText}
              </FancyText>
            </View>
          )}
          {preview.autoApprove ? (
            <View style={styles.detailRow}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='check-circle'
                size={18}
                color={Pallete.confirm}
              />
              <FancyText type='semiBold' size='medium' style={[styles.detailText, { color: Pallete.confirm }]}>
                Aprovação automática
              </FancyText>
            </View>
          ) : (
            <View style={styles.detailRow}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='schedule'
                size={18}
                color={Pallete.warning}
              />
              <FancyText type='semiBold' size='medium' style={[styles.detailText, { color: Pallete.warning }]}>
                Requer aprovação da liderança
              </FancyText>
            </View>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <FancyButton label='Já tenho conta' onPress={handleLoginPress} />
          <FancyButton label='Criar conta' type='outlined' onPress={handleCreateAccountPress} />
        </View>
      </InviteFlatLayout>
    );
  }

  // ── L1/L2: Logado + convite válido ──────────────────────────────────────────
  return (
    <InviteFlatLayout onPressBack={handleBack}>
      {/* Cabeçalho com logo e nome da igreja (sempre juntos) */}
      <View style={styles.churchHeader}>
        {preview.igreja.logoUrl ? (
          <FancyImage source={{ uri: preview.igreja.logoUrl }} size={80} style={styles.logoImage} />
        ) : (
          <View style={styles.logoContainer}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='church'
              size={40}
              color={Pallete.primary}
            />
          </View>
        )}
        <FancyVerticalSpacer height={8} />
        <FancyText type='semiBold' size='large' style={[styles.centeredText, styles.churchNameText]}>
          {preview.igreja.nome}
        </FancyText>
        <FancyVerticalSpacer height={4} />
        <FancyText type='bold' size='extraLarge' style={styles.centeredText}>
          Você foi convidado!
        </FancyText>
      </View>

      {/* Detalhes do convite */}
      <View style={styles.detailGroup}>
        {expiresText && (
          <View style={styles.detailRow}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='access-time'
              size={16}
              color={Pallete.icons.inactive}
            />
            <FancyText size='medium' style={styles.detailText}>
              Válido até: {expiresText}
            </FancyText>
          </View>
        )}
        {preview.autoApprove ? (
          <View style={styles.detailRow}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='check-circle'
              size={18}
              color={Pallete.confirm}
            />
            <FancyText type='semiBold' size='medium' style={[styles.detailText, { color: Pallete.confirm }]}>
              Aprovação automática
            </FancyText>
          </View>
        ) : (
          <View style={styles.detailRow}>
            <DefaultIcons.Custom
              library='MaterialIcons'
              name='schedule'
              size={18}
              color={Pallete.warning}
            />
            <FancyText type='semiBold' size='medium' style={[styles.detailText, { color: Pallete.warning }]}>
              Requer aprovação da liderança
            </FancyText>
          </View>
        )}
      </View>

      <View style={styles.buttonGroup}>
        <FancyButton
          label={
            loadingAccept
              ? 'Aceitando...'
              : preview.autoApprove
                ? 'Aceitar convite'
                : 'Solicitar entrada'
          }
          onPress={handleAccept}
          disabled={loadingAccept}
        />
        <FancyButton label='Cancelar' type='outlined' onPress={handleBack} disabled={loadingAccept} />
      </View>
    </InviteFlatLayout>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    safe: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 14,
    },
    backButtonRow: {
      position: 'absolute',
      left: 24,
      zIndex: 10,
    },
    loadingContainer: {
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      color: palette.fonts.inactive,
    },
    errorIconContainer: {
      alignItems: 'center',
    },
    churchHeader: {
      alignItems: 'center',
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
    },
    logoImage: {
      borderRadius: 40,
    },
    centeredText: {
      textAlign: 'center',
    },
    churchNameText: {
      color: palette.fonts.dark,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'center',
    },
    detailGroup: {
      alignSelf: 'center',
      gap: 6,
    },
    buttonGroup: {
      gap: 10,
    },
    detailText: {
      color: palette.fonts.inactive,
    },
    errorText: {
      color: palette.error,
    },
    jaMembroBadge: {
      backgroundColor: ColorUtils.withAlpha(palette.confirm, 0.12),
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'center',
    },
    jaMembroBadgeText: {
      color: palette.confirm,
    },
    aguardandoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: ColorUtils.withAlpha(palette.warning, 0.12),
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'center',
    },
    aguardandoBadgeText: {
      color: palette.warning,
    },
  });
}
