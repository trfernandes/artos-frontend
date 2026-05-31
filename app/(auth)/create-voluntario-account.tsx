import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import FancyImage from '../../components/images/FancyImage';
import { KeyboardAwareScrollView, useResizeMode } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import ControlledPasswordInput from '../../components/forms/ControlledPasswordInput';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultIcons from '../../components/FancyIcons';
import { useVoluntariosCrud } from '../../hooks/useVoluntariosCrud';
import { createAccountSchema, createAccountViaConviteSchema } from '../../domain/schemas/voluntarioSchema';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

export default function CreateVoluntarioAccountPage() {
  // Android: faz a janela redimensionar quando o teclado abre (adjustResize).
  useResizeMode();

  const Pallete = usePallete();
  const insets = useSafeAreaInsets();
  const { status: connectivityStatus } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [temConvitePendente, setTemConvitePendente] = useState(false);
  const [conviteIgreja, setConviteIgreja] = useState<{ nome: string; logoUrl?: string | null } | null>(null);

  useEffect(() => {
    const checkPendingInvite = async () => {
      const raw = await AsyncStorage.getItem('pendingInvite');
      const legacyToken = await AsyncStorage.getItem('pendingInviteToken');
      if (raw) {
        try {
          const pending = JSON.parse(raw);
          setTemConvitePendente(true);
          setMostrarFormulario(true);
          if (pending.igreja) setConviteIgreja(pending.igreja);
        } catch {
          setTemConvitePendente(true);
          setMostrarFormulario(true);
        }
      } else if (legacyToken) {
        setTemConvitePendente(true);
        setMostrarFormulario(true);
      }
    };
    checkPendingInvite();
  }, []);

  const { add, isLoadingMutation } = useVoluntariosCrud({
    autoFetch: false,
    initialParams: null,
  });

  const createForm = useForm({
    resolver: zodResolver(temConvitePendente ? createAccountViaConviteSchema : createAccountSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '', codigoIgreja: '' },
  });

  const handleCancelarConvite = async () => {
    await AsyncStorage.multiRemove(['pendingInvite', 'pendingInviteToken']);
    setTemConvitePendente(false);
    setConviteIgreja(null);
    createForm.setValue('codigoIgreja', '');
  };

  const handleSubmit = createForm.handleSubmit(async (data) => {
    try {
      const payload: any = {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      };

      if (temConvitePendente) {
        try {
          const raw = await AsyncStorage.getItem('pendingInvite');
          const legacy = await AsyncStorage.getItem('pendingInviteToken');
          const inviteToken = raw ? (JSON.parse(raw)?.token ?? null) : legacy;
          payload.codigoIgreja = inviteToken ?? '';
        } catch {
          payload.codigoIgreja = '';
        }
      } else {
        payload.codigoIgreja = data.codigoIgreja?.trim() ?? '';
      }

      try {
        const result = await add(payload);
        const anyResult = result as any;

        if (anyResult?.igrejaJoinError) {
          Toast.show({
            type: 'error',
            text1: 'Conta criada',
            text2: anyResult.igrejaJoinError,
            visibilityTime: 5000,
          });
        } else if (data.codigoIgreja && data.codigoIgreja.trim()) {
          Toast.show({
            type: 'success',
            text1: 'Conta criada com sucesso!',
            text2: 'Faça login para acessar.',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Conta criada com sucesso!',
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
            onPress={() => router.back()}
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

            {!mostrarFormulario ? (
              <View style={styles.entryState}>
                <View style={[styles.infoBox, Pallete.shadows[200], { backgroundColor: Pallete.backgroundColor2, borderWidth: StyleSheet.hairlineWidth, borderColor: Pallete.borderCard }]}>
                  <FancyText type='semiBold' size='small' color={Pallete.fonts.dark}>
                    Você já tem o código ou convite da igreja?
                  </FancyText>
                  <FancyText
                    size='extraSmall'
                    type='medium'
                    color={Pallete.fonts.inactive}
                    style={styles.boxHint}
                  >
                    Se ainda não recebeu, peça ao responsável da igreja. Sem esse código, o cadastro não
                    consegue te vincular ao lugar certo.
                  </FancyText>
                </View>

                <FancyButton
                  label='Tenho o código'
                  onPress={() => setMostrarFormulario(true)}
                  icon={{ library: 'MaterialCommunityIcons', name: 'arrow-right', size: 16 }}
                  iconPosition='right'
                />
                <FancyButton
                  type='text'
                  label='Já tenho conta'
                  onPress={() => router.push('/(auth)/login')}
                  labelStyle={{ color: Pallete.fonts.link }}
                  containerStyle={styles.secondaryActionButton}
                />
              </View>
            ) : (
              <View style={styles.formState}>
                {temConvitePendente && (
                  <View style={[styles.conviteBox, Pallete.shadows[200], { backgroundColor: Pallete.backgroundColor2, borderWidth: StyleSheet.hairlineWidth, borderColor: Pallete.borderCard }]}>
                    <View style={styles.conviteBoxHeader}>
                      {conviteIgreja?.logoUrl ? (
                        <FancyImage
                          source={{ uri: conviteIgreja.logoUrl }}
                          size={40}
                          style={styles.conviteBoxLogo}
                        />
                      ) : (
                        <View style={[styles.conviteBoxLogoFallback, { backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.12) }]}>
                          <DefaultIcons.Custom library='MaterialIcons' name='church' size={20} color={Pallete.primary} />
                        </View>
                      )}
                      <View style={styles.conviteBoxTexts}>
                        <FancyText type='semiBold' size='small' color={Pallete.fonts.dark}>
                          {conviteIgreja?.nome ? `Convidado para ${conviteIgreja.nome}` : '🎉 Você foi convidado!'}
                        </FancyText>
                        <FancyText
                          size='extraSmall'
                          type='medium'
                          color={Pallete.fonts.inactive}
                          style={styles.boxHint}
                        >
                          Crie sua conta para aceitar o convite.
                        </FancyText>
                      </View>
                      <FancyButton
                        type='text'
                        onPress={handleCancelarConvite}
                        icon={{ library: 'Ionicons', name: 'close', size: 18 }}
                        containerStyle={styles.cancelConviteButton}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.fieldsArea}>
                  {!temConvitePendente && (
                    <ControlledTextInput
                      label='Código da igreja'
                      name='codigoIgreja'
                      control={createForm.control}
                      labelProps={{ style: { color: Pallete.fonts.dark } }}
                      inputProps={{
                        autoCapitalize: 'none',
                        placeholder: 'Digite o código recebido',
                        placeholderTextColor: Pallete.fonts.inactive2,
                      }}
                    />
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
                  <ControlledPasswordInput
                    label='Senha'
                    name='senha'
                    control={createForm.control}
                    labelProps={{ style: { color: Pallete.fonts.dark } }}
                    inputProps={{ secureTextEntry: true }}
                  />
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
                  {!temConvitePendente && (
                    <FancyButton
                      type='text'
                      label='Ainda não tenho o código'
                      onPress={() => setMostrarFormulario(false)}
                      labelStyle={{ color: Pallete.fonts.link }}
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>

      {isLoadingMutation && (
        <View style={[styles.loadingOverlay, { backgroundColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.45) }]}>
          <View style={[styles.loadingBox, { backgroundColor: Pallete.backgroundColor }]}>
            <ActivityIndicator size='large' color={Pallete.primary} />
            <FancyText size='small' type='medium'>
              Criando conta...
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
  actionsFooter: {
    paddingTop: 12,
    gap: 8,
  },
  entryState: {
    gap: 12,
  },
  infoBox: {
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  conviteBox: {
    borderRadius: 16,
    padding: 14,
  },
  cancelConviteButton: {
    minHeight: 44,
    minWidth: 44,
    alignSelf: 'center',
    marginRight: -13,
  },
  conviteBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conviteBoxLogo: {
    borderRadius: 20,
  },
  conviteBoxLogoFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conviteBoxTexts: {
    flex: 1,
    gap: 2,
  },
  secondaryActionButton: {
    minHeight: 30,
    marginTop: -2,
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
