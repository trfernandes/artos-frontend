import { useEffect, useState, useRef, useCallback } from 'react';
import { useCooldown } from '../../hooks/useCooldown';
import { StyleSheet, View, Modal } from 'react-native';
import { router } from 'expo-router';
import AuthScreen from '../../components/pages/login/AuthScreen';
import FancyText from '../../components/FancyText';
import FancyButton from '../../components/buttons/FancyButton';
import DefaultIcons from '../../components/FancyIcons';
import FancyLoading from '../../components/FancyLoading';
import { ThemePalette } from '../../constants/colors';
import {
  EXTRA_LARGE_SIZE_FONT,
  LARGE_SIZE_FONT,
  MEDIUM_SIZE_FONT,
  SMALL_SIZE_FONT,
} from '../../constants/font';
import { useCadastroIgrejaEmail } from '../../hooks/useCadastroIgrejaEmail';
import { ColorUtils } from '../../utils/color_utils';
import FancyTextInput from '../../components/fields/FancyTextInput';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { ResponseLoginDto } from '../../domain/dtos/login/login.response';
import { useAuth } from '../../contexts/AuthContext';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import {
  AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
  AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
} from '../../constants/authTypography';

export default function IgrejaCadastroAguardandoEmailPage() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const isProcessingLoginRef = useRef(false);

  const { status: connectivityStatus } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';
  const { signInWithData } = useAuth();

  const realizarLoginAutomatico = useCallback(
    async (authData: any) => {
      // Evita execuções duplicadas usando ref que persiste entre renders
      if (isProcessingLoginRef.current) {
        return;
      }

      isProcessingLoginRef.current = true;

      try {
        // Verifica se o backend retornou dados de autenticação
        // igrejas pode ser um array vazio para contas recém-criadas
        if (authData?.access_token && authData?.user && authData?.igrejas !== undefined) {
          const loginData: ResponseLoginDto = {
            access_token: authData.access_token,
            user: authData.user,
            igrejas: authData.igrejas || [],
          };

          // Usa o método do AuthContext para fazer login com os dados
          await signInWithData(loginData);

          // Limpa dados do cadastro
          await limparDadosCadastro();

          // Redireciona para a tela inicial
          router.replace('/');
        } else {
          // Se não houver dados de auth, vai para login
          await limparDadosCadastro();
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.log('Erro ao realizar login automático:', error);
        await limparDadosCadastro();
        router.replace('/(auth)/login');
      }
    },
    [signInWithData],
  );

  const {
    dadosCadastro,
    loadingDados,
    status,
    verificarConfirmacao,
    reenviarEmail,
    alterarEmail,
    limparDadosCadastro,
    isReenviando,
    isAlterandoEmail,
    isVerificando,
  } = useCadastroIgrejaEmail({
    onConfirmado: realizarLoginAutomatico,
    enablePolling: true,
  });

  const handleVerificar = async () => {
    const authData = await verificarConfirmacao();
    if (authData) {
      await realizarLoginAutomatico(authData);
    }
  };

  // Cooldown local para UX
  const {
    seconds: cooldownRestante,
    start: startCooldown,
    isActive: cooldownAtivo,
  } = useCooldown(60);
  const [reenviadoMsg, setReenviadoMsg] = useState('');

  const handleReenviar = () => {
    if (isReenviando || cooldownAtivo) return;
    reenviarEmail();
    startCooldown();
  };

  // Feedback de sucesso após reenviar
  // Exibe mensagem quando loading termina e cooldown inicia
  useEffect(() => {
    if (!isReenviando && cooldownAtivo && !reenviadoMsg) {
      setReenviadoMsg('E-mail reenviado! Confira spam.');
      setTimeout(() => setReenviadoMsg(''), 5000);
    }
  }, [isReenviando, cooldownAtivo]);

  const handleAbrirModalAlterarEmail = () => {
    setNovoEmail(dadosCadastro?.responsavelEmail || '');
    setModalVisible(true);
  };

  const handleAlterarEmail = () => {
    if (!novoEmail.trim()) return;
    alterarEmail(novoEmail.trim(), {
      onSuccess: () => {
        setModalVisible(false);
      },
    });
  };

  const formatarTempoRelativo = (isoDate?: string) => {
    if (!isoDate) return null;
    const data = new Date(isoDate);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `há ${diffHoras}h`;
    return `há ${Math.floor(diffHoras / 24)} dias`;
  };

  const formatarExpiracao = (isoDate?: string) => {
    if (!isoDate) return null;
    const data = new Date(isoDate);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Se não há dados de cadastro, voltar para criar igreja (apenas após terminar o loading)
  useEffect(() => {
    if (!loadingDados && !dadosCadastro) {
      router.replace('/(auth)/create-igreja-account');
    }
  }, [dadosCadastro, loadingDados]);

  // Loading inicial - só mostra se estiver carregando os dados do storage
  if (loadingDados) {
    return (
      <AuthScreen header={() => null} scrollContainerStyle={styles.loadingContainer}>
        <FancyLoading />
      </AuthScreen>
    );
  }

  if (!dadosCadastro) {
    return null;
  }

  const isExpirado = status?.statusSolicitacao === 'EXPIRADO';

  return (
    <AuthScreen
      showBackButton
      centerWithinBackButtonArea
      onPressBack={() => router.replace('/(auth)/login')}
      containerPosition={{ default: 'relative', keyboard: 'relative' }}
      scrollContainerStyle={styles.scrollContainer}
      centerContainerStyle={styles.centerContainer}
      fieldsContainerStyle={styles.fieldsContainer}
      compactTitleOnKeyboard='Confirme seu e-mail'
      header={({ keyboardVisible }) => (
        <View style={{ gap: 5, alignItems: 'center' }}>
          <FancyText
            size={!keyboardVisible ? 'extraLarge' : 'large'}
            type='bold'
            color='white'
            style={{
              lineHeight:
                !keyboardVisible
                  ? EXTRA_LARGE_SIZE_FONT * AUTH_TITLE_LINE_HEIGHT_MULTIPLIER
                  : LARGE_SIZE_FONT * AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
              textAlign: 'center',
            }}
          >
            Confirme seu e-mail
          </FancyText>
          <FancyText
            size={!keyboardVisible ? 'medium' : 'small'}
            type='medium'
            color='white'
            style={{
              textAlign: 'center',
              lineHeight:
                !keyboardVisible
                  ? MEDIUM_SIZE_FONT * AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER
                  : SMALL_SIZE_FONT * AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
            }}
          >
            Enviamos um link de confirmação para ativar sua igreja
          </FancyText>
        </View>
      )}
    >
      <View style={styles.content}>
        {/* Card com informações */}
        <View style={styles.card}>
          {/* Ícone de email */}
          <View style={styles.iconContainer}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='email-outline'
              size={40}
              color={Pallete.primary}
            />
          </View>

          {/* Email */}
          <View style={styles.emailSection}>
            <FancyText
              size='extraSmall'
              color={Pallete.fonts.inactive}
              style={{ textAlign: 'center', alignSelf: 'center' }}
            >
              E-mail do responsável
            </FancyText>
            <FancyText
              size='medium'
              type='semiBold'
              style={{ textAlign: 'center', alignSelf: 'center', flexShrink: 0, maxWidth: '100%' }}
              numberOfLines={1}
              ellipsizeMode='middle'
            >
              {dadosCadastro.responsavelEmail}
            </FancyText>
          </View>

          {/* Status */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, isExpirado && styles.statusBadgeExpirado]}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name={isExpirado ? 'alert-circle' : 'clock-outline'}
                size={16}
                color={isExpirado ? Pallete.error : Pallete.warning}
              />
              <FancyText
                size='extraSmall'
                type='medium'
                color={isExpirado ? Pallete.error : Pallete.warning}
              >
                {isExpirado ? 'Link expirado' : 'Aguardando confirmação'}
              </FancyText>
            </View>

            {status?.emailEnviadoEm && (
              <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                Enviado {formatarTempoRelativo(status.emailEnviadoEm)}
              </FancyText>
            )}

            {status?.linkExpiraEm && !isExpirado && (
              <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                Expira em: {formatarExpiracao(status.linkExpiraEm)}
              </FancyText>
            )}
          </View>

          {/* Dicas */}
          <View style={styles.tipsSection}>
            <View style={styles.tipRow}>
              <DefaultIcons.Custom
                library='Feather'
                name='info'
                size={14}
                color={Pallete.fonts.inactive}
              />
              <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={{ flex: 1 }}>
                Verifique a caixa de spam/lixo eletrônico
              </FancyText>
            </View>
            <View style={styles.tipRow}>
              <DefaultIcons.Custom
                library='Feather'
                name='check-circle'
                size={14}
                color={Pallete.fonts.inactive}
              />
              <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={{ flex: 1 }}>
                Após confirmar, toque em "Já confirmei"
              </FancyText>
            </View>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.actionsContainer}>
          {/* Botão primário - Já confirmei */}
          <FancyButton
            label={isVerificando ? 'Verificando...' : 'Já confirmei'}
            type='contained'
            disabled={isVerificando || isServerUnavailable}
            icon={{ library: 'Feather', name: 'check', size: 18 }}
            containerStyle={styles.primaryButton}
            onPress={handleVerificar}
          />

          {/* Botão secundário - Reenviar */}
          <FancyButton
            label={cooldownAtivo ? `Reenviar em ${cooldownRestante}s` : 'Reenviar e-mail'}
            type='outlined'
            isLoading={isReenviando}
            loadingText='Reenviando...'
            spinnerSize='small'
            icon={{ library: 'Feather', name: 'mail', size: 18, color: Pallete.primary }}
            containerStyle={styles.secondaryButton}
            disabled={isReenviando || cooldownAtivo || isServerUnavailable}
            onPress={() => {
              if (isReenviando || cooldownAtivo || isServerUnavailable) return;
              handleReenviar();
            }}
          />
          {reenviadoMsg && (
            <FancyText
              size='extraSmall'
              color={Pallete.confirm}
              style={{ textAlign: 'center', marginTop: 4 }}
            >
              {reenviadoMsg}
            </FancyText>
          )}

          {/* Link - Alterar email */}
          <FancyButton
            label='Alterar e-mail'
            type='text'
            icon={{ library: 'Feather', name: 'edit-2', size: 16 }}
            disabled={isServerUnavailable}
            onPress={handleAbrirModalAlterarEmail}
          />
        </View>
      </View>

      {/* Modal para alterar email */}
      <Modal
        visible={modalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FancyText size='large' type='bold' style={styles.modalTitle}>
              Alterar e-mail
            </FancyText>

            <FancyText size='small' color={Pallete.fonts.inactive} style={styles.modalSubtitle}>
              Digite o novo e-mail para receber o link de confirmação
            </FancyText>

            <View style={styles.modalInputContainer}>
              <View style={styles.modalInputWrapper}>
                <FancyText size='small' color={Pallete.fonts.inactive} style={{ marginBottom: 4 }}>
                  Novo e-mail
                </FancyText>
                <FancyTextInput
                  value={novoEmail}
                  label={undefined}
                  placeholder='Novo e-mail'
                  inputProps={{
                    onChangeText: setNovoEmail,
                    keyboardType: 'email-address',
                    autoCapitalize: 'none',
                    autoCorrect: false,
                    style: styles.modalInput,
                  }}
                  containerStyle={{ width: '100%' }}
                  inputContainerStyle={{ width: '100%' }}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <FancyButton
                label='Cancelar'
                type='outlined'
                containerStyle={styles.modalButton}
                onPress={() => setModalVisible(false)}
              />
              <FancyButton
                label={isAlterandoEmail ? 'Salvando...' : 'Salvar e reenviar'}
                type='contained'
                disabled={isAlterandoEmail || !novoEmail.trim() || isServerUnavailable}
                containerStyle={styles.modalButton}
                onPress={handleAlterarEmail}
              />
            </View>
          </View>
        </View>
      </Modal>
      {/* {isReenviando && (
        <View style={styles.loadingOverlay} pointerEvents='auto'>
          <FancyLoading />
        </View>
      )} */}
    </AuthScreen>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.18)',
      zIndex: 99,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalInputWrapper: {
      width: '100%',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      flexGrow: 1,
      paddingVertical: 0,
      justifyContent: 'center',
    },
    centerContainer: {
      flex: 1,
      gap: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fieldsContainer: {
      ...Pallete.shadows[200],
      borderRadius: 15,
      gap: 10,
      backgroundColor: Pallete.backgroundColor,
      alignItems: 'stretch',
      padding: 20,
    },
    content: {
      gap: 20,
      width: '100%',
    },
    card: {
      backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.95),
      borderRadius: 12,
      padding: 20,
      gap: 16,
      alignItems: 'center',
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.9),
      justifyContent: 'center',
      alignItems: 'center',
    },
    emailSection: {
      alignItems: 'center',
      gap: 4,
    },
    statusSection: {
      alignItems: 'center',
      gap: 6,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: ColorUtils.lightenColor(Pallete.warning, 0.9),
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusBadgeExpirado: {
      backgroundColor: ColorUtils.lightenColor(Pallete.error, 0.9),
    },
    tipsSection: {
      width: '100%',
      gap: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: Pallete.borderCard,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionsContainer: {
      gap: 12,
    },
    primaryButton: {
      width: '100%',
    },
    secondaryButton: {
      width: '100%',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      gap: 16,
    },
    modalTitle: {
      textAlign: 'center',
    },
    modalSubtitle: {
      textAlign: 'center',
    },
    modalInputContainer: {
      width: '100%',
    },
    modalInput: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: Pallete.borderCard,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 8,
    },
    modalButton: {
      flex: 1,
    },
  });
}
