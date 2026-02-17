import { StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { ThemePalette } from '../../constants/colors';
import { FancyStepsConfig } from '../../components/steps/FancyStepsConfig';
import CreateIgrejaAccountTabDados, { CodigoCheckProvider, useCodigoCheck } from '../../components/pages/login/createAccount/create-igreja-account-tab-dados';
import CreateIgrejaAccountTabResponsavel from '../../components/pages/login/createAccount/create-igreja-account-tab-responsavel';
import CreateIgrejaAccountTabPlano from '../../components/pages/login/createAccount/create-igreja-account-tab-plano';
import CreateIgrejaAccountTabPronto from '../../components/pages/login/createAccount/create-igreja-account-tab-pronto';
import { FormProvider } from 'react-hook-form';
import { LoginCreateIgrejaStepFields } from '../../domain/schemas/loginCreateIgrejaSchema';
import FancyText from '../../components/FancyText';
import { EXTRA_LARGE_SIZE_FONT, LARGE_SIZE_FONT } from '../../constants/font';
import { router } from 'expo-router';
import { useIgrejaCrud } from '../../hooks/useIgrejaCrud';
import FancySteps from '../../components/steps/FancySteps';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

function CreateIgrejaAccountPageContent() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const [stepIndex, setStepIndex] = useState(0);
  const [showSlowText, setShowSlowText] = useState(false);
  const slowTimer = useRef<NodeJS.Timeout | null>(null);

  const { status: connectivityStatus } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';
  const { isCheckingCode } = useCodigoCheck();

  const { form, handleCriarIgrejaPublico, isSubmitting } = useIgrejaCrud({
    defaultValues: {
      nome: '',
      cidade: '',
      uf: '',
      codigo: '',
      responsavelNome: '',
      responsavelEmail: '',
      responsavelWhatsapp: '',
      responsavelSenha: '',
      responsavelConfirmarSenha: '',
    },
    onSuccess: () => {
      router.replace('/(auth)/igreja-cadastro-aguardando-email');
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = LoginCreateIgrejaStepFields[stepIndex as keyof typeof LoginCreateIgrejaStepFields];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && stepIndex < 3) {
      setStepIndex(stepIndex + 1);
    }
  };

  // Guard-clause para impedir multi-clique
  const handleConfirmar = () => {
    if (isSubmitting) return;
    handleCriarIgrejaPublico();
  };

  useEffect(() => {
    if (isSubmitting) {
      slowTimer.current = setTimeout(() => setShowSlowText(true), 800);
    } else {
      setShowSlowText(false);
      if (slowTimer.current) {
        clearTimeout(slowTimer.current);
        slowTimer.current = null;
      }
    }
    return () => {
      if (slowTimer.current) {
        clearTimeout(slowTimer.current);
        slowTimer.current = null;
      }
    };
  }, [isSubmitting]);

  const stepsConfig: FancyStepsConfig = {
    steps: [
      {
        title: 'Igreja',
        content: <CreateIgrejaAccountTabDados />,
        actions: [
          {
            label: 'Próximo',
            onPress: () => handleNext(),
            iconPosition: 'right',
            icon: { library: 'Feather', name: 'arrow-right', size: 16 },
            enabled: !isCheckingCode,
          },
        ],
      },
      {
        title: 'Responsável',
        content: <CreateIgrejaAccountTabResponsavel />,
        actions: [
          {
            label: 'Voltar',
            onPress: 'previous',
            iconPosition: 'left',
            icon: { library: 'Feather', name: 'arrow-left', size: 16 },
          },
          {
            label: 'Próximo',
            onPress: () => handleNext(),
            iconPosition: 'right',
            icon: { library: 'Feather', name: 'arrow-right', size: 16 },
          },
        ],
      },
      {
        title: 'Plano',
        content: <CreateIgrejaAccountTabPlano />,
        actions: [
          {
            label: 'Voltar',
            onPress: 'previous',
            iconPosition: 'left',
            icon: { library: 'Feather', name: 'arrow-left', size: 16 },
          },
          {
            label: 'Próximo',
            onPress: 'next',
            iconPosition: 'right',
            icon: { library: 'Feather', name: 'arrow-right', size: 16 },
          },
        ],
      },
      {
        title: 'Revisão',
        content: <CreateIgrejaAccountTabPronto />,
        actions: [
          {
            label: 'Voltar',
            onPress: 'previous',
            iconPosition: 'left',
            icon: { library: 'Feather', name: 'arrow-left', size: 16 },
          },
          {
            label: 'Confirmar',
            onPress: () => {
              if (isSubmitting || isServerUnavailable) return;
              handleCriarIgrejaPublico();
            },
            icon: { library: 'Feather', name: 'check', size: 16 },
            color: Pallete.confirm,
            isLoading: isSubmitting,
            loadingText: 'Enviando...',
            spinnerSize: 'small',
            disableOnLoading: true,
            enabled: !isSubmitting && !isServerUnavailable,
            loadingColor: 'white',
          },
        ],
      },
    ],
  };

  return (
    <AuthScreen
      showBackButton
      disableScroll
      scrollContainerStyle={styles.scrollContainer}
      headerContainerStyle={styles.titleContainer}
      headerWidth={{ default: '85%', keyboard: '110%' }}
      contentWidth={{ default: '85%', keyboard: '110%' }}
      fieldsContainerStyle={({ keyboardVisible }) => {
        if (keyboardVisible) {
          return { height: '80%' };
        } else {
          return { height: '60%' };
        }
      }}
      paddingTopOnKeyboard={60}
      alignTopOnKeyboard
      keyboardBottomSpacing={20}
      header={({ keyboardVisible }) => (
        <View style={{ gap: 5 }}>
          <FancyText
            size={!keyboardVisible ? 'extraLarge' : 'large'}
            type='bold'
            color='white'
            style={{
              lineHeight: !keyboardVisible ? EXTRA_LARGE_SIZE_FONT * 1.2 : LARGE_SIZE_FONT * 1.2,
            }}
          >
            Criar sua igreja
          </FancyText>
          <FancyText size={!keyboardVisible ? 'medium' : 'small'} type='medium' color='white'>
            Cadastre sua igreja e comece a organizar seus ministérios e voluntários
          </FancyText>
        </View>
      )}
    >
      {({ keyboardVisible }) => (
        <View style={{ gap: 10, flexGrow: 1, flexShrink: 1 }}>
          <FormProvider {...form}>
            <FancySteps size='small' config={stepsConfig} index={stepIndex} setIndex={setStepIndex} />
          </FormProvider>
          {/* Bloqueio de tela durante envio, sem overlay visual */}
          {isSubmitting && (
            <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 99 }} pointerEvents="auto" />
          )}
          {/* Texto de aviso se demorar */}
          {showSlowText && (
            <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={{ textAlign: 'center', marginTop: 8 }}>
              Isso pode levar alguns segundos...
            </FancyText>
          )}
        </View>
      )}
    </AuthScreen>
  );
}

export default function CreateIgrejaAccountPage() {
  return (
    <CodigoCheckProvider>
      <CreateIgrejaAccountPageContent />
    </CodigoCheckProvider>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 40,
      justifyContent: 'center',
    },
    titleContainer: {
      borderColor: 'magenta',
      justifyContent: 'center',
      // borderWidth: 1,
    },
    fieldsContainer: {
      borderRadius: 15,
      borderColor: 'firebrick',
      gap: 10,
      backgroundColor: Pallete.backgroundColor,
      ...Pallete.shadows[200],
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.18)',
      zIndex: 99,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
