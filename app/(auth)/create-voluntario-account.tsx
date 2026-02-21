import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import ControlledPasswordInput from '../../components/forms/ControlledPasswordInput';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import FancyVerticalSpacer from '../../components/FancyVerticalSpacer';
import { useVoluntariosCrud } from '../../hooks/useVoluntariosCrud';
import { createAccountSchema } from '../../domain/schemas/voluntarioSchema';
import {
  EXTRA_LARGE_SIZE_FONT,
  LARGE_SIZE_FONT,
  MEDIUM_SIZE_FONT,
  SMALL_SIZE_FONT,
} from '../../constants/font';
import { ScrollView } from 'react-native-gesture-handler';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';

export default function CreateVoluntarioAccountPage() {
  const { height: windowHeight } = useWindowDimensions();
  const { status: connectivityStatus } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';
  const isSmallDevice = windowHeight < 760;
  const baseRatio = isSmallDevice ? 0.62 : 0.68;
  const minFloor = isSmallDevice ? 480 : 560;
  const minCeil = isSmallDevice ? 640 : 760;
  const formCardMinHeight = Math.max(
    minFloor,
    Math.min(minCeil, Math.round(windowHeight * baseRatio)),
  );
  const [fieldsViewportHeight, setFieldsViewportHeight] = useState(0);
  const [fieldsContentHeight, setFieldsContentHeight] = useState(0);
  const shouldEnableFieldsScroll = fieldsContentHeight > fieldsViewportHeight + 1;

  const { add, isLoadingMutation } = useVoluntariosCrud({
    autoFetch: false,
    initialParams: null,
  });

  const createForm = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '', codigoIgreja: '' },
  });

  const handleSubmit = createForm.handleSubmit(async (data) => {
    try {
      const payload: any = {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      };

      // Adicionar código da igreja se fornecido
      if (data.codigoIgreja?.trim()) {
        payload.codigoIgreja = data.codigoIgreja.trim();
      }

      try {
        const result = await add(payload);

        // Backend pode retornar informações sobre o join da igreja na resposta
        // Se houver erro, mostrar mas não bloquear o fluxo
        const anyResult = result as any;
        if (anyResult?.igrejaJoinError) {
          Toast.show({
            type: 'error',
            text1: 'Conta criada',
            text2: anyResult.igrejaJoinError,
            visibilityTime: 5000,
          });
        } else if (data.codigoIgreja?.trim()) {
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

      router.replace('/(auth)/login');
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <AuthScreen
      showBackButton
      centerWithinBackButtonArea
      disableScroll
      scrollContainerStyle={styles.scrollContainer}
      headerContainerStyle={styles.titleContainer}
      paddingTopOnKeyboard={60}
      alignTopOnKeyboard
      fieldsContainerStyle={({ keyboardVisible }) => {
        if (keyboardVisible) return undefined;
        return { minHeight: formCardMinHeight };
      }}
      compactTitleOnKeyboard='Criação de Conta'
      header={({ keyboardVisible }) => (
        <View style={{ justifyContent: 'center', gap: 2 }}>
          <FancyText
            size={!keyboardVisible ? 'extraLarge' : 'large'}
            type='bold'
            color='white'
            style={{
              lineHeight: !keyboardVisible ? EXTRA_LARGE_SIZE_FONT * 1.2 : LARGE_SIZE_FONT * 1.2,
            }}
          >
            Criação de Conta
          </FancyText>
          <FancyText
            size={!keyboardVisible ? 'medium' : 'small'}
            type='medium'
            color='white'
            style={{
              lineHeight: !keyboardVisible ? MEDIUM_SIZE_FONT * 1.3 : SMALL_SIZE_FONT * 1.3,
            }}
          >
            Crie uma conta e aproveite todas as funcionalidades
          </FancyText>
        </View>
      )}
    >
      {() => (
        <View style={{ gap: 10, flex: 1 }}>
          <View
            style={{ flex: 1, minHeight: 0 }}
            onLayout={(event) => setFieldsViewportHeight(event.nativeEvent.layout.height)}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={shouldEnableFieldsScroll}
              bounces={shouldEnableFieldsScroll}
              onContentSizeChange={(_, height) => setFieldsContentHeight(height)}
            >
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
              <ControlledTextInput
                label='Código da igreja (opcional)'
                name='codigoIgreja'
                control={createForm.control}
                inputProps={{
                  autoCapitalize: 'none',
                  placeholder: 'Digite o código se tiver',
                }}
              />
            </ScrollView>
          </View>
          <FancyVerticalSpacer height={1} />
          <FancyButton
            label={isLoadingMutation ? 'Confirmando...' : 'Confirmar'}
            onPress={handleSubmit}
            disabled={isLoadingMutation || isServerUnavailable}
            icon={{ library: 'Feather', name: 'check', size: 16 }}
          />
        </View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    borderColor: 'magenta',
    justifyContent: 'center',
    // borderWidth: 1,
  },
});
