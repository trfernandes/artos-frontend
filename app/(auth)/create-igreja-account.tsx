import {
  StyleSheet,
  View,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
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
import { EXTRA_LARGE_SIZE_FONT, MEDIUM_SIZE_FONT } from '../../constants/font';
import { router } from 'expo-router';
import { useIgrejaCrud } from '../../hooks/useIgrejaCrud';
import FancySteps from '../../components/steps/FancySteps';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { usePallete } from '../../hooks/usePallete';
import FancyButton from '../../components/buttons/FancyButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardMetrics } from '../../hooks/useKeyboardMetrics';
import {
  AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
  AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
} from '../../constants/authTypography';

const HORIZONTAL_PADDING = 24;
const BACK_BUTTON_SIZE = 34;

function gerarMockCadastroData() {
  const nomesIgreja = ['Diakonia', 'Nova Vida', 'Fonte de Esperança', 'Casa de Oração', 'Vida Plena'];
  const cidades = [
    { cidade: 'Caxias do Sul', uf: 'RS' },
    { cidade: 'Porto Alegre', uf: 'RS' },
    { cidade: 'Curitiba', uf: 'PR' },
    { cidade: 'Campinas', uf: 'SP' },
    { cidade: 'Florianópolis', uf: 'SC' },
  ];
  const responsaveis = ['Thiago', 'Mariana', 'Renato', 'Camila', 'Lucas'];
  const sobrenomes = ['Silva', 'Barbosa', 'Ferreira', 'Almeida', 'Souza'];
  const planos: Array<'starter' | 'essencial' | 'crescimento'> = ['starter', 'essencial', 'crescimento'];
  const ciclos: Array<'MONTHLY' | 'YEARLY'> = ['MONTHLY', 'YEARLY'];

  const igrejaBase = nomesIgreja[Math.floor(Math.random() * nomesIgreja.length)];
  const local = cidades[Math.floor(Math.random() * cidades.length)];
  const primeiroNome = responsaveis[Math.floor(Math.random() * responsaveis.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  const sufixo = Math.floor(1000 + Math.random() * 9000);
  const igrejaNome = `${igrejaBase} ${sufixo}`;
  const codigo = `${igrejaBase.toLowerCase().replace(/\s+/g, '-')}-${sufixo}`;
  const email = `${primeiroNome.toLowerCase()}.${sobrenome.toLowerCase()}.${sufixo}@teste.diakonia.app`;
  const ddd = ['11', '21', '31', '41', '51'][Math.floor(Math.random() * 5)];
  const numero = Math.floor(100000000 + Math.random() * 899999999).toString();

  return {
    nome: igrejaNome,
    cidade: local.cidade,
    uf: local.uf,
    codigo,
    responsavelNome: `${primeiroNome} ${sobrenome}`,
    responsavelEmail: email,
    responsavelWhatsapp: `${ddd}9${numero}`,
      responsavelSenha: '123456',
      responsavelConfirmarSenha: '123456',
      plano: planos[Math.floor(Math.random() * planos.length)],
      ciclo: ciclos[Math.floor(Math.random() * ciclos.length)],
      modoCadastroPlano: 'avaliacao',
  } as const;
}

function CreateIgrejaAccountPageContent() {
  const Pallete = usePallete();
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const safeTopInset = Math.max(insets.top, androidStatusBarHeight);
  const backButtonTop = safeTopInset + 10;
  const contentTopPadding = backButtonTop + BACK_BUTTON_SIZE + 16;

  const [stepIndex, setStepIndex] = useState(0);
  const { visible: keyboardVisible } = useKeyboardMetrics();
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
      plano: 'starter',
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

  const renderCard = () => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Pallete.backgroundColor,
          ...Pallete.shadows[200],
          ...(keyboardVisible ? styles.cardKeyboard : null),
        },
      ]}
    >
      <FormProvider {...form}>
        {__DEV__ && stepIndex === 0 && (
          <View style={styles.devActions}>
            <FancyButton
              type='light'
              label='Preencher teste'
              icon={{ library: 'MaterialCommunityIcons', name: 'flask-outline', size: 14 }}
              onPress={() => {
                form.reset(gerarMockCadastroData());
                setStepIndex(0);
              }}
              labelProps={{ size: 'extraSmall' }}
              containerStyle={styles.devButton}
            />
          </View>
        )}
        <FancySteps
          size='small'
          overflowBehavior='fitThenScroll'
          containerStyle={styles.stepsContainer}
          contentContainerStyle={styles.stepsContentCentered}
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
    <LoginBase enableDismissKeyboard={false}>
      <View style={[styles.screen, { paddingTop: safeTopInset + 10 }]}>
        <View
          style={[
            styles.backButtonContainer,
            keyboardVisible ? styles.backButtonContainerKeyboard : styles.backButtonContainerStatic,
            keyboardVisible
              ? { top: backButtonTop, left: HORIZONTAL_PADDING }
              : { left: 0 },
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
            <FancyText type='bold' size='medium' color='white' numberOfLines={1}>
              Cadastrar minha igreja
            </FancyText>
          )}
        </View>

        <View
          style={[
            styles.titleBlock,
            keyboardVisible ? styles.titleBlockHidden : null,
          ]}
        >
          <FancyText
            size='large'
            type='bold'
            color='white'
            style={{
              lineHeight: EXTRA_LARGE_SIZE_FONT * AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
              maxWidth: '92%',
            }}
          >
            Cadastrar minha igreja
          </FancyText>
          <FancyText
            size='medium'
            type='medium'
            color='white'
            style={{ lineHeight: MEDIUM_SIZE_FONT * AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER }}
          >
            Cadastre sua igreja e comece a organizar seus ministérios e voluntários
          </FancyText>
        </View>

        <View
          style={[
            styles.cardArea,
            {
              paddingTop: keyboardVisible ? contentTopPadding - (safeTopInset + 10) : 0,
              paddingBottom: keyboardVisible ? 8 : 16,
            },
          ]}
        >
          {renderCard()}
        </View>
      </View>
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
  screen: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  backButtonContainer: {
    zIndex: 1000,
    elevation: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButtonContainerStatic: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  backButtonContainerKeyboard: {
    position: 'absolute',
  },
  titleBlock: {
    gap: 10,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titleBlockHidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    paddingTop: 0,
    paddingBottom: 0,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardArea: {
    flex: 1,
    minHeight: 0,
  },
  card: {
    borderRadius: 15,
    padding: 18,
    gap: 8,
    overflow: 'hidden',
    flexShrink: 1,
    flex: 1,
    minHeight: 0,
  },
  cardKeyboard: {
    flex: 1,
    minHeight: 0,
  },
  devActions: {
    alignItems: 'flex-end',
  },
  devButton: {
    minHeight: 30,
    paddingHorizontal: 10,
  },
  stepsContainer: {
    flex: 1,
    minHeight: 0,
  },
  stepsContentCentered: {
    justifyContent: 'center',
  },
});
