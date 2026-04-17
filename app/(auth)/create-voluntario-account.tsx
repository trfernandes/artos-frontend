import { StyleSheet, View, useWindowDimensions, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import LoginBase from '../../components/pages/login/LoginBase';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import ControlledPasswordInput from '../../components/forms/ControlledPasswordInput';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import { useVoluntariosCrud } from '../../hooks/useVoluntariosCrud';
import { createAccountSchema } from '../../domain/schemas/voluntarioSchema';
import {
  EXTRA_LARGE_SIZE_FONT,
  MEDIUM_SIZE_FONT,
  SMALL_SIZE_FONT,
} from '../../constants/font';
import { ScrollView } from 'react-native-gesture-handler';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePallete } from '../../hooks/usePallete';
import { useKeyboardMetrics } from '../../hooks/useKeyboardMetrics';
import { ColorUtils } from '../../utils/color_utils';
import {
  AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
  AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
} from '../../constants/authTypography';

const HORIZONTAL_PADDING = 30;
const BACK_BUTTON_SIZE = 35;

export default function CreateVoluntarioAccountPage() {
  const Pallete = usePallete();
  const { height: windowHeight } = useWindowDimensions();
  const { status: connectivityStatus } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';
  const insets = useSafeAreaInsets();
  const { visible: keyboardVisible, height: keyboardHeight } = useKeyboardMetrics();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [baselineViewportHeight, setBaselineViewportHeight] = useState(0);
  const [baselineWindowHeight, setBaselineWindowHeight] = useState(windowHeight);

  const androidStatusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const safeTopInset = Math.max(insets.top, androidStatusBarHeight);
  const backButtonTop = safeTopInset + 10;
  const contentTopPadding = backButtonTop + BACK_BUTTON_SIZE + 16;

  const [fieldsViewportHeight, setFieldsViewportHeight] = useState(0);
  const [fieldsContentHeight, setFieldsContentHeight] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const shouldEnableFieldsScroll = fieldsContentHeight > fieldsViewportHeight + 1;

  useEffect(() => {
    if (!keyboardVisible) {
      setBaselineWindowHeight(windowHeight);
    }
  }, [keyboardVisible, windowHeight]);

  useEffect(() => {
    if (!keyboardVisible && viewportHeight > 0) {
      setBaselineViewportHeight(viewportHeight);
    }
  }, [keyboardVisible, viewportHeight]);

  const effectiveViewportHeight = viewportHeight || windowHeight;
  const windowResizeDelta = Math.max(0, baselineWindowHeight - windowHeight);
  const viewportResizeDelta = Math.max(0, baselineViewportHeight - effectiveViewportHeight);
  const resizeDelta = Math.max(windowResizeDelta, viewportResizeDelta);
  const overlayKeyboardInset = keyboardVisible ? Math.max(0, keyboardHeight - resizeDelta) : 0;
  const availableCardHeight = effectiveViewportHeight - contentTopPadding - overlayKeyboardInset - 8;
  const expandedCardHeight = Math.max(0, availableCardHeight);

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

      payload.codigoIgreja = data.codigoIgreja.trim();

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
    <LoginBase>
      <View
        style={[
          styles.backButtonContainer,
          { top: backButtonTop, left: HORIZONTAL_PADDING, right: HORIZONTAL_PADDING },
        ]}
      >
        <FancyButton
          icon={{ library: 'Entypo', name: 'chevron-left', color: Pallete.icons.dark }}
          size={30}
          onPress={() => router.back()}
          containerStyle={{
            backgroundColor: Pallete.backgroundColor3,
            width: BACK_BUTTON_SIZE,
            height: BACK_BUTTON_SIZE,
            borderRadius: BACK_BUTTON_SIZE / 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
        {keyboardVisible && (
          <FancyText
            type='bold'
            size='medium'
            color='white'
            numberOfLines={1}
            style={styles.compactHeaderTitle}
          >
            Criação de Conta
          </FancyText>
        )}
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        enableOnAndroid
        enableAutomaticScroll={false}
        extraScrollHeight={0}
        extraHeight={0}
        scrollEnabled={!keyboardVisible}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='none'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: contentTopPadding,
            paddingBottom: keyboardVisible ? 0 : 16,
            justifyContent: keyboardVisible ? 'flex-start' : 'center',
          },
        ]}
      >
        {!keyboardVisible && (
          <View style={styles.titleBlock}>
            <FancyText
              size='extraLarge'
              type='bold'
              color='white'
              style={{ lineHeight: EXTRA_LARGE_SIZE_FONT * AUTH_TITLE_LINE_HEIGHT_MULTIPLIER }}
            >
              Entrar como voluntário
            </FancyText>
            <FancyText
              size='medium'
              type='medium'
              color='white'
              style={{
                lineHeight:
                  (keyboardVisible ? SMALL_SIZE_FONT : MEDIUM_SIZE_FONT) *
                  AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
              }}
            >
              Use o código da sua igreja para criar a conta já no contexto certo.
            </FancyText>
          </View>
        )}

        <View
          style={[
            styles.card,
            {
              backgroundColor: Pallete.backgroundColor,
              ...Pallete.shadows[200],
              ...(keyboardVisible
                ? { height: expandedCardHeight, minHeight: 220, marginBottom: 8 }
                : null),
            },
          ]}
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
              <View
                style={[styles.fieldsArea, keyboardVisible ? styles.fieldsAreaKeyboard : undefined]}
                onLayout={(event) => setFieldsViewportHeight(event.nativeEvent.layout.height)}
              >
                <ScrollView
                  style={keyboardVisible ? { flex: 1 } : undefined}
                  contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={keyboardVisible ? shouldEnableFieldsScroll : false}
                  bounces={keyboardVisible && shouldEnableFieldsScroll}
                  onContentSizeChange={(_, height) => setFieldsContentHeight(height)}
                >
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
                </ScrollView>
              </View>

              <View style={styles.actionsFooter}>
                <FancyButton
                  label={isLoadingMutation ? 'Confirmando...' : 'Criar conta'}
                  onPress={handleSubmit}
                  disabled={isLoadingMutation || isServerUnavailable}
                  icon={{ library: 'Feather', name: 'check', size: 16 }}
                />
                <FancyButton
                  type='text'
                  label='Ainda não tenho o código'
                  onPress={() => setMostrarFormulario(false)}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAwareScrollView>
    </LoginBase>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    position: 'absolute',
    zIndex: 1000,
    elevation: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 16,
  },
  titleBlock: {
    gap: 2,
  },
  card: {
    borderRadius: 15,
    padding: 25,
    gap: 10,
    overflow: 'hidden',
  },
  fieldsArea: {
    minHeight: 0,
  },
  fieldsAreaKeyboard: {
    flex: 1,
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
  compactHeaderTitle: {
    flexShrink: 1,
    maxWidth: '82%',
  },
  secondaryActionButton: {
    minHeight: 30,
    marginTop: -2,
  },
});
