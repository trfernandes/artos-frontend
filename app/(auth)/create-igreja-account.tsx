import {
  StyleSheet,
  View,
  Platform,
  StatusBar as RNStatusBar,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoginBase from '../../components/pages/login/LoginBase';
import { FancyStepsConfig } from '../../components/steps/FancyStepsConfig';
import CreateIgrejaAccountTabDados, {
  CodigoCheckProvider,
  useCodigoCheck,
} from '../../components/pages/login/createAccount/create-igreja-account-tab-dados';
import CreateIgrejaAccountTabResponsavel from '../../components/pages/login/createAccount/create-igreja-account-tab-responsavel';
import CreateIgrejaAccountTabPlano from '../../components/pages/login/createAccount/create-igreja-account-tab-plano';
import CreateIgrejaAccountTabPronto from '../../components/pages/login/createAccount/create-igreja-account-tab-pronto';
import { FormProvider } from 'react-hook-form';
import { LoginCreateIgrejaStepFields } from '../../domain/schemas/loginCreateIgrejaSchema';
import FancyText from '../../components/FancyText';
import { EXTRA_LARGE_SIZE_FONT } from '../../constants/font';
import { router } from 'expo-router';
import { useIgrejaCrud } from '../../hooks/useIgrejaCrud';
import FancySteps from '../../components/steps/FancySteps';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { usePallete } from '../../hooks/usePallete';
import FancyButton from '../../components/buttons/FancyButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardMetrics } from '../../hooks/useKeyboardMetrics';

const HORIZONTAL_PADDING = 30;
const BACK_BUTTON_SIZE = 35;

function CreateIgrejaAccountPageContent() {
  const Pallete = usePallete();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const safeTopInset = Math.max(insets.top, androidStatusBarHeight);
  const backButtonTop = safeTopInset + 10;
  const contentTopPadding = backButtonTop + BACK_BUTTON_SIZE + 16;

  const [stepIndex, setStepIndex] = useState(0);
  const { visible: keyboardVisible, height: keyboardHeight } = useKeyboardMetrics();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [baselineViewportHeight, setBaselineViewportHeight] = useState(0);
  const [baselineWindowHeight, setBaselineWindowHeight] = useState(windowHeight);
  const [showSlowText, setShowSlowText] = useState(false);
  const slowTimer = useRef<NodeJS.Timeout | null>(null);
  // Altura medida de cada step (atualizada via onLayout do conteúdo)
  const [measuredStepHeights, setMeasuredStepHeights] = useState<Record<number, number>>({});
  const CARD_PADDING = 44; // padding: 22 × 2
  const STEPS_CHROME = 80; // header dos steps + navegação + gaps ≈ 80px
  const measuredHeight = measuredStepHeights[stepIndex];
  const formCardMinHeight = measuredHeight ? measuredHeight + CARD_PADDING + STEPS_CHROME : 300;
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
  const availableCardHeight =
    effectiveViewportHeight - contentTopPadding - overlayKeyboardInset - 8;
  const expandedCardHeight = Math.max(0, availableCardHeight);

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
    const fieldsToValidate =
      LoginCreateIgrejaStepFields[stepIndex as keyof typeof LoginCreateIgrejaStepFields];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && stepIndex < 3) {
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

  const measureStep = (index: number) => (height: number) => {
    setMeasuredStepHeights((prev) => {
      if (prev[index] === height) return prev;
      return { ...prev, [index]: height };
    });
  };

  const stepsConfig: FancyStepsConfig = {
    steps: [
      {
        title: 'Igreja',
        content: (
          <View onLayout={(e) => measureStep(0)(e.nativeEvent.layout.height)}>
            <CreateIgrejaAccountTabDados />
          </View>
        ),
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
        content: (
          <View onLayout={(e) => measureStep(1)(e.nativeEvent.layout.height)}>
            <CreateIgrejaAccountTabResponsavel />
          </View>
        ),
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
        content: (
          <View onLayout={(e) => measureStep(2)(e.nativeEvent.layout.height)}>
            <CreateIgrejaAccountTabPlano />
          </View>
        ),
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
        content: (
          <View onLayout={(e) => measureStep(3)(e.nativeEvent.layout.height)}>
            <CreateIgrejaAccountTabPronto />
          </View>
        ),
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

  const renderCard = (expandToFill: boolean) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Pallete.backgroundColor,
          ...Pallete.shadows[200],
          ...(expandToFill
            ? {
                minHeight: 0,
                height: expandedCardHeight,
                marginBottom: 8,
              }
            : { minHeight: formCardMinHeight }),
        },
      ]}
    >
      <FormProvider {...form}>
        <FancySteps
          size='small'
          overflowBehavior='fitThenScroll'
          containerStyle={
            expandToFill
              ? { flex: 1, minHeight: 0 }
              : { minHeight: formCardMinHeight - CARD_PADDING }
          }
          config={stepsConfig}
          index={stepIndex}
          setIndex={setStepIndex}
        />
      </FormProvider>
      {isSubmitting && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 99 }} pointerEvents='auto' />
      )}
      {showSlowText && (
        <FancyText
          size='extraSmall'
          color={Pallete.fonts.inactive}
          style={{ textAlign: 'center', marginTop: 8 }}
        >
          Isso pode levar alguns segundos...
        </FancyText>
      )}
    </View>
  );

  return (
    <LoginBase>
      {/* Botão voltar + título compacto — absoluto, acima de tudo */}
      <View style={[styles.backButtonContainer, { top: backButtonTop, left: HORIZONTAL_PADDING }]}>
        <FancyButton
          icon={{ library: 'Entypo', name: 'chevron-left', color: Pallete.icons.dark }}
          size={25}
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
          <FancyText type='bold' size='large' color='white' numberOfLines={1}>
            Criar sua igreja
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
        scrollEnabled
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='none'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: keyboardVisible ? contentTopPadding : 0,
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
              style={{ lineHeight: EXTRA_LARGE_SIZE_FONT * 1.2 }}
            >
              Criar sua igreja
            </FancyText>
            <FancyText size='medium' type='medium' color='white'>
              Cadastre sua igreja e comece a organizar seus ministérios e voluntários
            </FancyText>
          </View>
        )}
        {renderCard(keyboardVisible)}
      </KeyboardAwareScrollView>
    </LoginBase>
  );
}

export default function CreateIgrejaAccountPage() {
  return (
    <CodigoCheckProvider>
      <CreateIgrejaAccountPageContent />
    </CodigoCheckProvider>
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
    gap: 5,
  },
  card: {
    borderRadius: 15,
    padding: 22,
    gap: 10,
    overflow: 'hidden',
  },
});
