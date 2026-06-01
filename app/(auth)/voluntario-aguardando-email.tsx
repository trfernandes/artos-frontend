import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import FancyText from '../../components/FancyText';
import FancyButton from '../../components/buttons/FancyButton';
import DefaultIcons from '../../components/FancyIcons';
import { ThemePalette } from '../../constants/colors';
import { ColorUtils } from '../../utils/color_utils';
import { VoluntarioEmailRepository } from '../../domain/services/VoluntarioEmailRepository';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import {
  clearPendingLoginAttempt,
  getPendingLoginAttempt,
} from '../../core/auth/pendingLoginAttemptStore';

const POLLING_INTERVAL_MS = 15000;
const AUTO_CHECK_INTERVAL_SECONDS = Math.floor(POLLING_INTERVAL_MS / 1000);

export default function VoluntarioAguardandoEmailPage() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { signIn } = useAuth();

  const { status: connectivityStatus } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';
  const emailToUse = typeof emailParam === 'string' ? emailParam.trim() : '';

  const [isReenviando, setIsReenviando] = useState(false);
  const [isVerificando, setIsVerificando] = useState(false);
  const [autoCheckCountdown, setAutoCheckCountdown] = useState(AUTO_CHECK_INTERVAL_SECONDS);
  const isVerificandoRef = useRef(false);

  const hasPendingAttempt = Boolean(emailToUse && getPendingLoginAttempt(emailToUse));

  const verificarConfirmacao = useCallback(
    async (manual: boolean) => {
      if (isVerificandoRef.current || isServerUnavailable) return;

      const pendingAttempt = getPendingLoginAttempt(emailToUse);
      if (!pendingAttempt) {
        if (manual) {
          Toast.show({
            type: 'info',
            text1: 'Verificação indisponível',
            text2: 'Volte ao login e tente novamente para habilitar a verificação.',
          });
        }
        return;
      }

      isVerificandoRef.current = true;
      setIsVerificando(true);

      try {
        await signIn(pendingAttempt.email, pendingAttempt.senha);
        clearPendingLoginAttempt();
        router.replace('/');
        return;
      } catch (error: any) {
        const status = error?.response?.status;
        const backendMessage =
          `${error?.response?.data?.message || error?.response?.data?.error?.message || ''}`.toLowerCase();

        if (
          status === 401 &&
          (backendMessage.includes('não verificado') || backendMessage.includes('nao verificado'))
        ) {
          if (manual) {
            Toast.show({
              type: 'info',
              text1: 'Ainda pendente',
              text2: 'Seu e-mail ainda não foi confirmado.',
            });
          }
        } else {
          const isNetworkError =
            !error?.response ||
            error?.code === 'ECONNABORTED' ||
            `${error?.message || ''}`.toLowerCase().includes('timeout') ||
            `${error?.message || ''}`.toLowerCase().includes('network');

          if (status === 401) {
            clearPendingLoginAttempt();
          }

          if (manual) {
            Toast.show({
              type: 'error',
              text1: 'Não foi possível verificar',
              text2: isNetworkError
                ? 'Verifique sua conexão e tente novamente.'
                : 'Faça login novamente para continuar.',
            });
          }
        }
      } finally {
        setIsVerificando(false);
        isVerificandoRef.current = false;
      }
    },
    [emailToUse, isServerUnavailable, signIn],
  );

  useEffect(() => {
    if (!hasPendingAttempt || isServerUnavailable) return;

    setAutoCheckCountdown(AUTO_CHECK_INTERVAL_SECONDS);

    const intervalId = setInterval(() => {
      setAutoCheckCountdown((prev) => {
        if (prev <= 1) {
          void verificarConfirmacao(false);
          return AUTO_CHECK_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [hasPendingAttempt, isServerUnavailable, verificarConfirmacao]);

  const handleReenviar = async () => {
    if (isReenviando || isServerUnavailable) return;
    if (!emailToUse) return;

    setIsReenviando(true);
    try {
      await VoluntarioEmailRepository.reenviarConfirmacaoEmail(emailToUse);
      Toast.show({
        type: 'success',
        text1: 'E-mail reenviado!',
        text2: 'Verifique sua caixa de entrada.',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro ao reenviar',
        text2: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsReenviando(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: Pallete.backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <View style={[styles.backButtonRow, { top: insets.top + 8 }]}>
          <FancyButton
            mode='icon'
            type='text'
            onPress={() => router.replace('/(auth)/login')}
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

        <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
          <View style={styles.centerGroup}>
            <View style={styles.headerGroup}>
              <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
                Confirme seu e-mail
              </FancyText>
              <FancyText size='small' color={Pallete.fonts.inactive}>
                Enviamos um link de ativação para sua conta
              </FancyText>
            </View>

            {/* Ícone */}
            <View style={styles.iconContainer}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='email-outline'
                size={40}
                color={Pallete.primary}
              />
            </View>

            {/* Email */}
            {emailParam ? (
              <View style={styles.emailSection}>
                <FancyText
                  size='extraSmall'
                  color={Pallete.fonts.inactive}
                  style={{ textAlign: 'center' }}
                >
                  E-mail cadastrado
                </FancyText>
                <FancyText
                  size='medium'
                  type='semiBold'
                  style={{ textAlign: 'center' }}
                  numberOfLines={1}
                  ellipsizeMode='middle'
                >
                  {emailParam}
                </FancyText>
              </View>
            ) : null}

            {/* Status */}
            <View style={styles.statusSection}>
              <View style={styles.statusBadge}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='clock-outline'
                  size={16}
                  color={Pallete.warning}
                />
                <FancyText size='extraSmall' type='medium' color={Pallete.warning}>
                  Aguardando confirmação
                </FancyText>
              </View>
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
                  name='info'
                  size={14}
                  color={Pallete.fonts.inactive}
                />
                <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={{ flex: 1 }}>
                  Após confirmar, toque em Verificar agora ou aguarde a verificação automática
                </FancyText>
              </View>
            </View>

            {/* Botões */}
            <View style={styles.actionsContainer}>
              <FancyButton
                label={
                  isVerificando
                    ? 'Verificando...'
                    : hasPendingAttempt
                      ? `Verificar agora (${autoCheckCountdown}s)`
                      : 'Verificar agora'
                }
                type='contained'
                isLoading={isVerificando}
                loadingText='Verificando...'
                spinnerSize='small'
                icon={{ library: 'Feather', name: 'check-circle', size: 18 }}
                containerStyle={styles.primaryButton}
                disabled={isVerificando || isServerUnavailable || !hasPendingAttempt}
                onPress={() => {
                  setAutoCheckCountdown(AUTO_CHECK_INTERVAL_SECONDS);
                  void verificarConfirmacao(true);
                }}
              />

              <FancyButton
                label='Reenviar e-mail'
                type='outlined'
                isLoading={isReenviando}
                loadingText='Reenviando...'
                spinnerSize='small'
                icon={{ library: 'Feather', name: 'mail', size: 18, color: Pallete.primary }}
                containerStyle={styles.secondaryButton}
                disabled={isReenviando || isServerUnavailable || !emailParam}
                onPress={handleReenviar}
              />

              <FancyButton
                label='Voltar ao login'
                type='text'
                icon={{ library: 'Feather', name: 'arrow-left', size: 18, color: Pallete.primary }}
                containerStyle={styles.tertiaryButton}
                onPress={() => router.replace('/(auth)/login')}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    safe: {
      flex: 1,
    },
    backButtonRow: {
      position: 'absolute',
      left: 24,
      zIndex: 10,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    centerGroup: {
      gap: 14,
      alignItems: 'center',
    },
    headerGroup: {
      gap: 2,
      alignSelf: 'stretch',
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.08),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emailSection: {
      alignItems: 'center',
      gap: 4,
      width: '100%',
    },
    statusSection: {
      alignItems: 'center',
      gap: 6,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: ColorUtils.withAlpha(Pallete.warning, 0.094),
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tipsSection: {
      width: '100%',
      gap: 8,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    actionsContainer: {
      gap: 10,
      width: '100%',
    },
    primaryButton: {
      width: '100%',
    },
    secondaryButton: {
      width: '100%',
    },
    tertiaryButton: {
      width: '100%',
      borderWidth: 0,
    },
  });
}
