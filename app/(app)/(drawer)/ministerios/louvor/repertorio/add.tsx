import { FancyStepsConfig } from '../../../../../../components/steps/FancyStepsConfig';
import { useState } from 'react';
import FancySteps from '../../../../../../components/steps/FancySteps';
import DadosTab from '../../../../../../components/pages/ministerios/louvor/repertorio/DadosTab';
import LetraTab from '../../../../../../components/pages/ministerios/louvor/repertorio/LetraTab';
import CifraTab from '../../../../../../components/pages/ministerios/louvor/repertorio/CifraTab';
import { DefaultIconsNames } from '../../../../../../constants/icons';

const STEPS_CONFIG: FancyStepsConfig = {
  steps: [
    {
      title: 'Dados',
      content: <DadosTab />,
      actions: [
        {
          label: 'Anterior',
          icon: { ...DefaultIconsNames['arrow-left'], size: 18 },
          enabled: false,
        },
        {
          label: 'Próximo',
          onPress: 'next',
          iconPosition: 'right',
          icon: { ...DefaultIconsNames['arrow-right'], size: 18 },
        },
      ],
    },
    {
      title: 'Letra',
      content: <LetraTab />,
      actions: [
        {
          label: 'Anterior',
          enabled: true,
          icon: { ...DefaultIconsNames['arrow-left'], size: 18 },
          onPress: 'previous',
        },
        {
          label: 'Próximo',
          onPress: 'next',
          iconPosition: 'right',
          icon: { ...DefaultIconsNames['arrow-right'], size: 18 },
        },
      ],
    },
    {
      title: 'Cifra',
      content: <CifraTab />,
      actions: [
        {
          label: 'Anterior',
          icon: { ...DefaultIconsNames['arrow-left'], size: 18 },
          onPress: 'previous',
        },
        { label: 'Salvar', iconPosition: 'left', icon: { ...DefaultIconsNames.save, size: 16 } },
      ],
    },
  ],
};

export default function MinisterioLouvorRepertorioAddPage() {
  const [stepIndex, setStepIndex] = useState(0);
  return (
    <FancySteps
      containerStyle={{ paddingTop: 10 }}
      index={stepIndex}
      config={STEPS_CONFIG}
      setIndex={setStepIndex}
    />
  );
}
