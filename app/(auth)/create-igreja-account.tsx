import { StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResizeMode } from 'react-native-keyboard-controller';
import FancyButton from '../../components/buttons/FancyButton';
import { ColorUtils } from '../../utils/color_utils';
import { FancyStepsConfig } from '../../components/steps/FancyStepsConfig';
import CreateIgrejaAccountTabDados, {
  CodigoCheckProvider,
  useCodigoCheck,
} from '../../components/pages/login/createAccount/create-igreja-account-tab-dados';
import CreateIgrejaAccountTabResponsavel from '../../components/pages/login/createAccount/create-igreja-account-tab-responsavel';
import CreateIgrejaAccountTabPronto from '../../components/pages/login/createAccount/create-igreja-account-tab-pronto';
import { FormProvider } from 'react-hook-form';
import { LoginCreateIgrejaStepFields } from '../../domain/schemas/loginCreateIgrejaSchema';
import FancyText from '../../components/FancyText';
import { router } from 'expo-router';
import { useIgrejaCrud } from '../../hooks/useIgrejaCrud';
import FancySteps from '../../components/steps/FancySteps';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { usePallete } from '../../hooks/usePallete';

function CreateIgrejaAccountPageContent() {
  // Android: faz a janela redimensionar quando o teclado abre (adjustResize).
  useResizeMode();

  const Pallete = usePallete();
  const insets = useSafeAreaInsets();

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
      // Trial-first: a etapa de escolha de plano foi removida do signup. Toda igreja
      // começa no trial semeado com o plano mais alto (crescimento), liberando todos os
      // limites durante a avaliação; a conversão para um plano pago acontece depois em
      // Configurações (checkout Asaas).
      plano: 'crescimento',
      ciclo: 'MONTHLY',
      modoCadastroPlano: 'avaliacao',
    },
    onSuccess: () => {
      router.replace('/(auth)/igreja-cadastro-aguardando-email');
    },
  });

  const handleNext = async () => {
    const fieldsToValidate =
      LoginCreateIgrejaStepFields[stepIndex as keyof typeof LoginCreateIgrejaStepFields];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && stepIndex < 2) {
      setStepIndex(stepIndex + 1);
    }
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
        title: 'Contato',
        content: <CreateIgrejaAccountTabResponsavel />,
        actions: [
          {
            label: 'Voltar',
            onPress: 'previous',
            type: 'outlined',
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
        title: 'Revisão',
        content: <CreateIgrejaAccountTabPronto />,
        actions: [
          {
            label: 'Voltar',
            onPress: 'previous',
            type: 'outlined',
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
              borderRadius: 22,
              width: 44,
              height: 44,
            }}
          />
        </View>

        {/*
          O recorte começa ABAIXO da faixa do botão Voltar (top insets.top+8, altura 40).
          Como o conteúdo das etapas rola (KAS interno do FancySteps), o overflow:'hidden'
          garante que ele "entre" nessa borda — nunca renderiza atrás do botão Voltar nem
          da status bar.
        */}
        <View style={[styles.scrollClip, { paddingTop: insets.top + 52 }]}>
          <View style={[styles.contentInner, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.headerGroup}>
              <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
                Cadastrar minha igreja
              </FancyText>
              <FancyText size='small' color={Pallete.fonts.inactive}>
                Organize seus ministérios e voluntários.
              </FancyText>
            </View>

            <FormProvider {...form}>
              <FancySteps
                size='small'
                overflowBehavior='fitThenScroll'
                hugContent
                config={stepsConfig}
                index={stepIndex}
                setIndex={setStepIndex}
                containerStyle={styles.steps}
                headerProps={{
                  activeColor: Pallete.fonts.dark,
                  inactiveColor: Pallete.fonts.inactive,
                  activeCircleColor: Pallete.primary,
                  inactiveCircleColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.12),
                  lineColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.18),
                }}
              />
            </FormProvider>

            {showSlowText && (
              <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={styles.slowText}>
                Isso pode levar alguns segundos...
              </FancyText>
            )}
          </View>
        </View>
      </SafeAreaView>
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
  backButtonRow: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  scrollClip: {
    flex: 1,
    overflow: 'hidden',
  },
  contentInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  headerGroup: {
    gap: 2,
  },
  steps: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  slowText: {
    textAlign: 'center',
  },
});

export default function CreateIgrejaAccountPage() {
  return (
    <CodigoCheckProvider>
      <CreateIgrejaAccountPageContent />
    </CodigoCheckProvider>
  );
}
