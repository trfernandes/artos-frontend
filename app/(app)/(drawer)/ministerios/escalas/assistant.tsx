import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancySteps from '../../../../../components/steps/FancySteps';
import { FancyStepsConfig } from '../../../../../components/steps/FancyStepsConfig';
import { useRef, useState } from 'react';
import { Pallete } from '../../../../../constants/colors';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EscalaSchema } from '../../../../../domain/schemas/escalaSchema';
import AssistenteParametrosStep from '../../../../../components/pages/ministerios/escalas/AssistenteParametrosStep';
import AssistenteEventosStep from '../../../../../components/pages/ministerios/escalas/AssistenteEventosStep';
import AssistenteParticipantesStep from '../../../../../components/pages/ministerios/escalas/AssistenteParticipantesStep';
import AssistenteRevisaoStep from '../../../../../components/pages/ministerios/escalas/AssistenteRevisaoStep';
import { useLocalSearchParams } from 'expo-router';

export default function MinisterioEscalasAssistenteIndex() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  const [stepsIndex, setStepsIndex] = useState(0);

  const form = useForm({
    resolver: zodResolver(EscalaSchema),
    defaultValues: { dataInicio: new Date(2025, 9, 1), dataTermino: new Date(2025, 9, 30) },
  });
  const isParamsChanged = useRef(true);

  form.register('dataInicio', { onChange: () => (isParamsChanged.current = true) });
  form.register('dataTermino', { onChange: () => (isParamsChanged.current = true) });

  const stepsConfig: FancyStepsConfig = {
    steps: [
      {
        title: 'Parâmetros',
        content: <AssistenteParametrosStep />,
        actions: [
          {
            label: 'Anterior',
            enabled: false,
          },
          {
            label: 'Próximo',
            onPress: () => {
              setStepsIndex(stepsIndex + 1);
            },
          },
        ],
      },
      {
        title: 'Eventos',
        content: <AssistenteEventosStep ministerioId={ministerioId} isShouldLoad={isParamsChanged} />,
        actions: [
          {
            label: 'Anterior',
          },
          {
            label: 'Próximo',
            onPress: () => setStepsIndex(stepsIndex + 1),
          },
        ],
      },
      {
        title: 'Participantes',
        content: <AssistenteParticipantesStep ministerioId={ministerioId} isShouldLoad={isParamsChanged} />,
        actions: [
          {
            label: 'Anterior',
          },
          {
            label: 'Próximo',
            onPress: () => setStepsIndex(stepsIndex + 1),
          },
        ],
      },
      {
        title: 'Revisão',
        content: <AssistenteRevisaoStep />,
        actions: [
          {
            label: 'Anterior',
          },
          {
            label: 'Finalizar',
            color: Pallete.secondary,
          },
        ],
      },
    ],
  };

  return (
    <FancyPageView style={styles.container}>
      <FormProvider {...form}>
        <FancySteps config={stepsConfig} index={stepsIndex} setIndex={setStepsIndex} />
      </FormProvider>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, paddingHorizontal: 5 },
});
