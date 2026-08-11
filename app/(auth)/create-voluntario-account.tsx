import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import { KeyboardAwareScrollView, useResizeMode } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import ControlledPasswordInput from '../../components/forms/ControlledPasswordInput';
import FancyErrorText from '../../components/forms/FancyErrorText';
import PasswordStrengthMeter from '../../components/forms/PasswordStrengthMeter';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVoluntariosCrud } from '../../hooks/useVoluntariosCrud';
import {
  createAccountSchema,
  createAccountViaConviteSchema,
} from '../../domain/schemas/voluntarioSchema';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import ConviteIgrejaCard from '../../components/cards/ConviteIgrejaCard';
import { IgrejaRepository } from '../../domain/services/IgrejaRepository';
import { ResponseConvitePreviewDto } from '../../domain/dtos/Igreja/response-convite-preview.dto';
import { extractInviteToken } from '../../utils/inviteToken';
import DefaultIcons from '../../components/FancyIcons';

function getConviteErrorMessage(error: AxiosError | any): string {
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
  if (message) {
    return message;
  }
  return 'Não foi possível validar o código. Tente novamente.';
}

export default function CreateVoluntarioAccountPage() {
  // Android: faz a janela redimensionar quando o teclado abre (adjustResize).
  useResizeMode();

  const Pallete = usePallete();
  const insets = useSafeAreaInsets();
  const { status: connectivityStatus } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';

  const [temConvitePendente, setTemConvitePendente] = useState(false);
  const [conviteIgreja, setConviteIgreja] = useState<{
    nome: string;
    logoUrl?: string | null;
  } | null>(null);

  // Preview rico do convite (manual ou re-buscado no caminho link).
  const [convitePreview, setConvitePreview] = useState<ResponseConvitePreviewDto | null>(null);
  // Token de convite já validado (manual) ou recuperado do AsyncStorage (link).
  const [conviteToken, setConviteToken] = useState<string | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // "Convite ativo" = veio por link OU o usuário validou um código manualmente.
  const conviteAtivo = temConvitePendente || !!convitePreview;

  useEffect(() => {
    const checkPendingInvite = async () => {
      const raw = await AsyncStorage.getItem('pendingInvite');
      const legacyToken = await AsyncStorage.getItem('pendingInviteToken');

      let token: string | null = null;
      let igrejaFallback: { nome: string; logoUrl?: string | null } | null = null;

      if (raw) {
        try {
          const pending = JSON.parse(raw);
          token = pending?.token ?? null;
          if (pending.igreja) igrejaFallback = pending.igreja;
        } catch {
          // payload inválido — segue só com o legado abaixo
        }
      }
      if (!token && legacyToken) token = legacyToken;

      if (!token) return;

      setTemConvitePendente(true);
      setConviteToken(token);
      if (igrejaFallback) setConviteIgreja(igrejaFallback);

      // Re-busca o preview para popular o card rico (autoApprove/validade) e
      // revalidar o token. Em caso de falha, mantém o fallback nome/logo.
      try {
        const preview = await IgrejaRepository.getConvitePreview(token);
        setConvitePreview(preview);
      } catch {
        // mantém o card mínimo via conviteIgreja
      }
    };
    checkPendingInvite();
  }, []);

  const { add, isLoadingMutation } = useVoluntariosCrud({
    autoFetch: false,
    initialParams: null,
  });

  const createForm = useForm({
    resolver: zodResolver(conviteAtivo ? createAccountViaConviteSchema : createAccountSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '', codigoIgreja: '' },
  });

  const senhaValue = useWatch({ control: createForm.control, name: 'senha' });

  const handleCancelarConvite = async () => {
    await AsyncStorage.multiRemove(['pendingInvite', 'pendingInviteToken']);
    setTemConvitePendente(false);
    setConviteIgreja(null);
    setConvitePreview(null);
    setConviteToken(null);
    createForm.setValue('codigoIgreja', '');
  };

  // Valida o código digitado ANTES de criar a conta. Sucesso → mostra o card e
  // revela o formulário; erro → mensagem inline e bloqueia o avanço.
  const handleValidarCodigo = async () => {
    const raw = createForm.getValues('codigoIgreja') ?? '';
    const token = extractInviteToken(raw);
    if (!token) {
      setCodeError('Informe o código da igreja.');
      return;
    }

    setValidatingCode(true);
    setCodeError(null);
    try {
      const preview = await IgrejaRepository.getConvitePreview(token);
      setConvitePreview(preview);
      setConviteToken(token);
    } catch (error: AxiosError | any) {
      setCodeError(getConviteErrorMessage(error));
    } finally {
      setValidatingCode(false);
    }
  };

  // Valida ao sair do campo, mas só quando há algo digitado — evita acusar
  // "Informe o código" só por focar e sair vazio.
  const handleBlurCodigo = () => {
    const raw = createForm.getValues('codigoIgreja') ?? '';
    if (raw.trim()) handleValidarCodigo();
  };

  // Volta ao "gate" para o usuário digitar outro código.
  const handleTrocarCodigo = () => {
    setConvitePreview(null);
    setConviteToken(null);
    setCodeError(null);
    createForm.setValue('codigoIgreja', '');
  };

  const handleSubmit = createForm.handleSubmit(async (data) => {
    // Não cria conta sem um código validado — evita o caminho de igrejaJoinError.
    if (!conviteToken) {
      setCodeError('Valide o código da igreja antes de continuar.');
      return;
    }
    try {
      const payload: any = {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        // Token já validado (manual ou via link).
        codigoIgreja: conviteToken,
      };

      try {
        const result = await add(payload);
        const anyResult = result as any;

        if (anyResult?.igrejaJoinError) {
          // Corrida rara: token expirou/esgotou entre validar e submeter.
          // igrejaJoinError é um objeto { code, message } — renderizar só a string.
          Toast.show({
            type: 'error',
            text1: 'Conta criada',
            text2: anyResult.igrejaJoinError?.message ?? 'Não foi possível vincular ao convite.',
            visibilityTime: 5000,
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Conta criada com sucesso!',
            text2: 'Faça login para acessar.',
          });
        }
      } catch (error: AxiosError | any) {
        Toast.show({
          type: 'error',
          text1: 'Não foi possível criar a conta',
          text2:
            error?.response?.data?.message ||
            'Ocorreu um erro ao criar a conta. Tente novamente mais tarde.',
        });
        return;
      }

      if (temConvitePendente) {
        await AsyncStorage.multiRemove(['pendingInvite', 'pendingInviteToken']);
      }
      router.replace('/(auth)/login');
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <View style={[styles.root, { backgroundColor: Pallete.backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <View style={[styles.backButtonRow, { top: insets.top + 8 }]}>
          <FancyButton
            mode='icon'
            type='text'
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(auth)/login');
            }}
            icon={{ library: 'Feather', name: 'arrow-left', size: 18 }}
            iconStyle={{ color: Pallete.icons.dark }}
            containerStyle={{
              backgroundColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.08),
              borderRadius: 20,
              width: 40,
              height: 40,
            }}
          />
        </View>

        {/*
          O scroll começa ABAIXO da faixa do botão Voltar (top insets.top+8, altura 40).
          Como o ScrollView recorta o que sai dos seus limites, o conteúdo "entra" nessa
          borda ao rolar — nunca renderiza por trás do botão Voltar nem da status bar.
        */}
        <View style={[styles.scrollClip, { paddingTop: insets.top + 52 }]}>
          <KeyboardAwareScrollView
            style={styles.safe}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode='none'
            bottomOffset={20}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: 12,
                paddingBottom: insets.bottom + 24,
              },
            ]}
          >
            <View style={styles.centerGroup}>
              <View style={styles.headerGroup}>
                <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
                  Entrar como voluntário
                </FancyText>
                <FancyText size='small' color={Pallete.fonts.inactive} style={styles.subtitle}>
                  Use o código da sua igreja para criar a conta já no contexto certo.
                </FancyText>
              </View>

              <View style={styles.formState}>
                <View style={styles.fieldsArea}>
                  {conviteAtivo ? (
                    // Código validado → card no lugar do campo.
                    <ConviteIgrejaCard
                      igreja={
                        convitePreview?.igreja ?? {
                          nome: conviteIgreja?.nome ?? 'Igreja',
                          logoUrl: conviteIgreja?.logoUrl ?? null,
                        }
                      }
                      autoApprove={convitePreview?.autoApprove}
                      expiresAt={convitePreview?.expiresAt}
                      onRemove={temConvitePendente ? handleCancelarConvite : handleTrocarCodigo}
                    />
                  ) : (
                    // Card com campo do código + botão "Validar" ao lado.
                    <View
                      style={[
                        styles.codeCard,
                        Pallete.shadows[200],
                        {
                          backgroundColor: Pallete.backgroundColor,
                          borderWidth: 1.5,
                          borderColor: Pallete.primary,
                        },
                      ]}
                    >
                      <View style={styles.codeCardRow}>
                        <View
                          style={[
                            styles.codeCardIcon,
                            { backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.12) },
                          ]}
                        >
                          <DefaultIcons.Custom
                            library='MaterialIcons'
                            name='church'
                            size={24}
                            color={Pallete.primary}
                          />
                        </View>
                        <View style={styles.codeCardTexts}>
                          <FancyText type='semiBold' size='small' color={Pallete.fonts.dark}>
                            Código do convite
                          </FancyText>
                          <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                            Digite o código que você recebeu da sua igreja.
                          </FancyText>
                        </View>
                      </View>

                      <View>
                        <View style={styles.codeRow}>
                          <View style={styles.codeInput}>
                            <ControlledTextInput
                              name='codigoIgreja'
                              control={createForm.control}
                              showErrorMessage={false}
                              inputProps={{
                                autoCapitalize: 'none',
                                onChangeText: (text) => {
                                  if (!text.trim() && codeError) setCodeError(null);
                                },
                                onSubmitEditing: handleValidarCodigo,
                                onBlur: handleBlurCodigo,
                              }}
                            />
                          </View>
                          <FancyButton
                            mode='icon'
                            onPress={handleValidarCodigo}
                            disabled={validatingCode || isServerUnavailable}
                            icon={{ library: 'Feather', name: 'arrow-right', size: 18 }}
                            containerStyle={styles.codeButton}
                          />
                        </View>
                        {codeError && (
                          <View style={styles.codeError}>
                            <FancyErrorText message={codeError} />
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  <ControlledTextInput
                    label='Nome'
                    name='nome'
                    control={createForm.control}
                    labelProps={{ style: { color: Pallete.fonts.dark } }}
                  />
                  <ControlledTextInput
                    label='E-mail'
                    name='email'
                    control={createForm.control}
                    labelProps={{ style: { color: Pallete.fonts.dark } }}
                    inputProps={{ autoCapitalize: 'none' }}
                  />
                  <View style={styles.passwordField}>
                    <ControlledPasswordInput
                      label='Senha'
                      name='senha'
                      control={createForm.control}
                      labelProps={{ style: { color: Pallete.fonts.dark } }}
                      inputProps={{ secureTextEntry: true }}
                    />
                    <PasswordStrengthMeter password={senhaValue ?? ''} />
                  </View>
                  <ControlledPasswordInput
                    label='Confirmar a Senha'
                    name='confirmarSenha'
                    control={createForm.control}
                    labelProps={{ style: { color: Pallete.fonts.dark } }}
                    inputProps={{ secureTextEntry: true }}
                  />
                </View>

                <View style={styles.actionsFooter}>
                  <FancyButton
                    label={isLoadingMutation ? 'Confirmando...' : 'Criar conta'}
                    onPress={handleSubmit}
                    disabled={isLoadingMutation || isServerUnavailable}
                    icon={{ library: 'Feather', name: 'check', size: 16 }}
                  />
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>

      {(isLoadingMutation || validatingCode) && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.45) },
          ]}
        >
          <View style={[styles.loadingBox, { backgroundColor: Pallete.backgroundColor }]}>
            <ActivityIndicator size='large' color={Pallete.primary} />
            <FancyText size='small' type='medium'>
              {validatingCode ? 'Validando código...' : 'Criando conta...'}
            </FancyText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollClip: {
    flex: 1,
    overflow: 'hidden',
  },
  backButtonRow: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerGroup: {
    gap: 16,
  },
  headerGroup: {
    gap: 2,
  },
  subtitle: {
    opacity: 0.85,
  },
  formState: {
    gap: 16,
  },
  boxHint: {
    opacity: 0.85,
  },
  fieldsArea: {
    gap: 16,
  },
  codeCard: {
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  codeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCardTexts: {
    flex: 1,
    gap: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  codeButton: {
    width: 44,
    height: 43,
    borderRadius: 10,
  },
  codeInput: {
    flex: 1,
  },
  codeError: {
    marginTop: 5,
  },
  passwordField: {
    gap: 8,
  },
  actionsFooter: {
    paddingTop: 12,
    gap: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    minWidth: 140,
    gap: 12,
  },
});
