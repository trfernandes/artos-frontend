import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import FancyImage from '../../components/images/FancyImage';
import AuthLayout from '../../components/pages/login/AuthLayout';
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
  const Pallete = usePallete();
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
    <>
      <AuthLayout
        showBackButton
        title='Entrar como voluntário'
        subtitle='Use o código da sua igreja para criar a conta já no contexto certo.'
        footer={mostrarFormulario ? (
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
              />
            )}
          </View>
        ) : undefined}
      >
        {!mostrarFormulario ? (
          <View style={styles.entryState}>
            <View style={[styles.infoBox, { backgroundColor: Pallete.backgroundColor4 }]}>
              <FancyText type='semiBold' size='small'>
                Você já tem o código ou convite da igreja?
              </FancyText>
              <FancyText
                size='extraSmall'
                type='medium'
                style={{ color: ColorUtils.withAlpha(Pallete.fonts.dark, 0.78) }}
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
              containerStyle={styles.secondaryActionButton}
            />
          </View>
        ) : (
          <>
            {temConvitePendente && (
              <View style={[styles.conviteBox, { backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.07) }]}>
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
                    <FancyText type='semiBold' size='small'>
                      {conviteIgreja?.nome ? `Convidado para ${conviteIgreja.nome}` : '🎉 Você foi convidado!'}
                    </FancyText>
                    <FancyText
                      size='extraSmall'
                      type='medium'
                      style={{ color: ColorUtils.withAlpha(Pallete.fonts.dark, 0.78) }}
                    >
                      Crie sua conta para aceitar o convite.
                    </FancyText>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.fieldsArea}>
              {!temConvitePendente && (
                <ControlledTextInput
                  label='Código da igreja'
                  name='codigoIgreja'
                  control={createForm.control}
                  inputProps={{
                    autoCapitalize: 'none',
                    placeholder: 'Digite o código recebido',
                    placeholderTextColor: Pallete.fonts.inactive2,
                  }}
                />
              )}
              <ControlledTextInput label='Nome' name='nome' control={createForm.control} />
              <ControlledTextInput
                label='E-mail'
                name='email'
                control={createForm.control}
                inputProps={{ autoCapitalize: 'none' }}
              />
              <ControlledPasswordInput
                label='Senha'
                name='senha'
                control={createForm.control}
                inputProps={{ secureTextEntry: true }}
              />
              <ControlledPasswordInput
                label='Confirmar a Senha'
                name='confirmarSenha'
                control={createForm.control}
                inputProps={{ secureTextEntry: true }}
              />
            </View>

          </>
        )}
      </AuthLayout>

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
    </>
  );
}

const styles = StyleSheet.create({
  fieldsArea: {
    gap: 10,
  },
  actionsFooter: {
    paddingTop: 10,
    gap: 8,
  },
  entryState: {
    gap: 10,
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
