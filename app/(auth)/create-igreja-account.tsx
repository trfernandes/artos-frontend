import { StyleSheet, View } from 'react-native';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { Pallete } from '../../constants/colors';
import FancySteps from '../../components/steps/FancySteps';
import { FancyStepsConfig } from '../../components/steps/FancyStepsConfig';
import { useState } from 'react';
import CreateIgrejaAccountTabDados from '../../components/pages/login/createAccount/create-igreja-account-tab-dados';
import CreateIgrejaAccountTabResponsavel from '../../components/pages/login/createAccount/create-igreja-account-tab-responsavel';
import CreateIgrejaAccountTabPlano from '../../components/pages/login/createAccount/create-igreja-account-tab-plano';
import CreateIgrejaAccountTabPronto from '../../components/pages/login/createAccount/create-igreja-account-tab-pronto';
import { FormProvider } from 'react-hook-form';
import { LoginCreateIgrejaStepFields } from '../../domain/schemas/loginCreateIgrejaSchema';
import FancyText from '../../components/FancyText';
import { EXTRA_LARGE_SIZE_FONT, LARGE_SIZE_FONT } from '../../constants/font';
import { router } from 'expo-router';
import { useIgrejaCrud } from '../../hooks/useIgrejaCrud';

export default function CreateIgrejaAccountPage() {
  const [stepIndex, setStepIndex] = useState(0);

  const { form, handleCriarIgrejaPublico, isSubmitting } = useIgrejaCrud({
    defaultValues: {
      nome: 'Igreja Teste',
      cidade: 'São Paulo',
      uf: 'SP',
      codigo: 'igreja-teste',
      responsavelNome: 'João da Silva',
      responsavelEmail: 'joao@teste.com',
      responsavelWhatsapp: '11999999999',
      responsavelSenha: '123456',
      responsavelConfirmarSenha: '123456',
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
            label: isSubmitting ? 'Enviando...' : 'Confirmar',
            onPress: handleCriarIgrejaPublico,
            icon: { library: 'Feather', name: 'check', size: 16 },
            color: Pallete.confirm,
            enabled: !isSubmitting,
          },
        ],
      },
    ],
  };

  return (
    <AuthScreen
      showBackButton
      disableScroll
      containerPosition={{ default: 'relative', keyboard: 'relative' }}
      scrollContainerStyle={styles.scrollContainer}
      centerContainerStyle={styles.centerContainer}
      headerWidth={{ default: '100%', keyboard: '100%' }}
      contentWidth={{ default: '100%', keyboard: '100%' }}
      fieldsContainerStyle={({ keyboardVisible }) => [
        styles.fieldsContainer,
        keyboardVisible ? styles.fieldsContainerKeyboard : null,
      ]}
      header={({ keyboardVisible }) => (
        <View style={{ gap: 5 }}>
          <FancyText
            size={!keyboardVisible ? 'extraLarge' : 'large'}
            type='bold'
            color='white'
            style={{
              lineHeight: !keyboardVisible
                ? EXTRA_LARGE_SIZE_FONT * 1.2
                : LARGE_SIZE_FONT * 1.2,
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
      <View style={{ flex: 1, width: '100%', justifyContent: 'center' }}>
        <FormProvider {...form}>
          <FancySteps
            size='small'
            config={stepsConfig}
            index={stepIndex}
            setIndex={setStepIndex}
          />
        </FormProvider>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 80,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    gap: 15,
  },
  fieldsContainer: {
    ...Pallete.shadows[200],
    borderRadius: 15,
    gap: 10,
    backgroundColor: Pallete.backgroundColor,
    alignItems: 'stretch',
    flex: 1,
  },
  fieldsContainerKeyboard: {
    flex: 1,
  },
  stepsHeader: {
    paddingHorizontal: 0,
  },
});
