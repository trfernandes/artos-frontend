import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import { FancyStepsConfig } from '../../../../../components/steps/FancyStepsConfig';
import FancySteps from '../../../../../components/steps/FancySteps';
import { useState } from 'react';
import DefinicoesStep from '../../../../../components/pages/ministerios/escalas/add/DefinicoesStep';
import EventosStep from '../../../../../components/pages/ministerios/escalas/add/EventosStep';
import ParticipantesStep from '../../../../../components/pages/ministerios/escalas/add/ParticipantesStep';
import RevisaoStep from '../../../../../components/pages/ministerios/escalas/add/RevisaoStep';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Pallete } from '../../../../../constants/colors';

const STEPS_CONFIG: FancyStepsConfig = {
  steps: [
    {
      title: 'Definições',
      content: <DefinicoesStep />,
      actions: [
        { label: 'Anterior', enabled: false, icon: { ...DefaultIconsNames['arrow-left'], size: 18 } },
        {
          label: 'Próximo',
          iconPosition: 'right',
          onPress: 'next',
          icon: { ...DefaultIconsNames['arrow-right'], size: 18 },
        },
      ],
    },
    {
      title: 'Eventos',
      content: <EventosStep />,
      actions: [
        { label: 'Anterior', onPress: 'previous', icon: { ...DefaultIconsNames['arrow-left'], size: 18 } },
        {
          label: 'Próximo',
          onPress: 'next',
          icon: { ...DefaultIconsNames['arrow-right'], size: 18 },
          iconPosition: 'right',
        },
      ],
    },
    {
      title: 'Participantes',
      content: <ParticipantesStep />,
      actions: [
        { label: 'Anterior', onPress: 'previous', icon: { ...DefaultIconsNames['arrow-left'], size: 18 } },
        {
          label: 'Gerar',
          color: Pallete.terciary,
          icon: { library: 'MaterialCommunityIcons', name: 'table-arrow-right', size: 18, style: { marginTop: 2 } },
          onPress: 'next',
        },
      ],
    },
    {
      title: 'Revisão',
      content: <RevisaoStep />,
      actions: [
        { label: 'Anterior', onPress: 'previous', icon: { ...DefaultIconsNames['arrow-left'], size: 18 } },
        {
          label: 'Salvar',

          icon: { ...DefaultIconsNames.save, size: 18 },
          iconPosition: 'left',
        },
      ],
    },
  ],
};

export default function MinisterioEscalaAddPage() {
  const [stepsIndex, setStepsIndex] = useState(0);
  return (
    <FancyPageView style={styles.container}>
      <FancySteps index={stepsIndex} config={STEPS_CONFIG} setIndex={setStepsIndex} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 15 },
});
