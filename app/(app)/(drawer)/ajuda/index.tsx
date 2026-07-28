import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../components/containers/FancyPageView';
import FancyText from '../../../../components/FancyText';
import FancyVerticalSpacer from '../../../../components/FancyVerticalSpacer';
import FancyListItemCard from '../../../../components/cards/FancyListItemCard';
import FancyBottomSheetSelect, {
  FancyBottomSheetSelectRef,
} from '../../../../components/fields/FancyBottomSheetSelect';
import { usePallete } from '../../../../hooks/usePallete';
import { ColorUtils } from '../../../../utils/color_utils';
import { useMinisteriosDrawer } from '../../../../hooks/useMinisteriosDrawer';
import { useJourney } from '../../../../contexts/JourneyContext';
import {
  getJourney,
  VOLUNTARIO_JOURNEY_ID,
  LIDER_JOURNEY_ID,
} from '../../../../components/tutorial/journeys';
import { VoluntarioHierarquiaEnum } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { TutorialTarget } from '../../../../components/tutorial/TutorialTarget';
import { TutorialOverlay } from '../../../../components/tutorial/TutorialOverlay';
import { useScreenTutorial } from '../../../../hooks/useScreenTutorial';
import {
  AJUDA_TOUR_ID,
  AJUDA_TOUR_STEPS,
  AJUDA_TOUR_TITLE,
} from '../../../../components/tutorial/tours/ajudaTour';

export default function AjudaIndexPage() {
  const palette = usePallete();
  const { igrejaAtiva, isAdmin } = useMinisteriosDrawer();
  const journey = useJourney();
  const ministerioPickerRef = useRef<FancyBottomSheetSelectRef>(null);

  const tour = useScreenTutorial(AJUDA_TOUR_ID, AJUDA_TOUR_TITLE, AJUDA_TOUR_STEPS);

  useEffect(() => {
    // Tutorial de primeiro uso desta tela — não faz parte de nenhuma jornada guiada,
    // então inicia sozinho na primeira visita (não depende de um passo de journey ativo).
    if (!tour.isActive && tour.showBanner) {
      tour.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.showBanner]);

  const liderMinisterios = useMemo(() => {
    const ministerios = igrejaAtiva?.ministerios ?? [];
    if (isAdmin) return ministerios;

    return ministerios.filter((ministerio) => {
      const hierarquia = ministerio.hierarquia?.toString();
      return hierarquia === VoluntarioHierarquiaEnum.Lider || hierarquia === '1';
    });
  }, [igrejaAtiva?.ministerios, isAdmin]);

  const handleStartVoluntarioJourney = () => {
    const journeyDef = getJourney(VOLUNTARIO_JOURNEY_ID);
    if (journeyDef) journey.startJourney(journeyDef);
  };

  const handleStartLiderJourneyForMinisterio = (ministerioId: string) => {
    const journeyDef = getJourney(LIDER_JOURNEY_ID);
    if (journeyDef) journey.startJourney(journeyDef, { ministerioId });
  };

  const handleStartLiderJourney = () => {
    if (liderMinisterios.length === 0) return;
    if (liderMinisterios.length === 1) {
      handleStartLiderJourneyForMinisterio(liderMinisterios[0].id);
      return;
    }
    ministerioPickerRef.current?.open();
  };

  return (
    <FancyPageView style={styles.container}>
      <FancyText size='small' type='medium' color={palette.fonts.inactive}>
        Escolha uma jornada guiada para aprender, passo a passo, as tarefas mais importantes do app.
      </FancyText>

      <FancyVerticalSpacer height={4} />

      <TutorialTarget
        id='ajuda-jornadas-lista'
        registerTarget={tour.registerTarget}
        unregisterTarget={tour.unregisterTarget}
        style={styles.list}
      >
        <FancyListItemCard
          onPress={handleStartVoluntarioJourney}
          title='Primeiros passos como voluntário'
          subtitle='Indisponibilidades e suas escalas pessoais'
          leading={{
            type: 'icon',
            icon: { library: 'MaterialCommunityIcons', name: 'account-check-outline', size: 20 },
            color: palette.primary,
            backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
          }}
          trailing={{ type: 'chevron', onPress: handleStartVoluntarioJourney }}
        />

        {liderMinisterios.length > 0 && (
          <FancyListItemCard
            onPress={handleStartLiderJourney}
            title='Monte sua equipe e crie uma escala'
            subtitle='Integrantes, funções, templates e o assistente de escalas'
            leading={{
              type: 'icon',
              icon: { library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 20 },
              color: palette.secondary,
              backgroundColor: ColorUtils.withAlpha(palette.secondary, 0.12),
            }}
            trailing={{ type: 'chevron', onPress: handleStartLiderJourney }}
          />
        )}
      </TutorialTarget>

      <FancyBottomSheetSelect
        ref={ministerioPickerRef}
        containerStyle={styles.hiddenPickerTrigger}
        title='Escolha o ministério'
        placeholder='Escolha o ministério'
        listItems={liderMinisterios.map((ministerio) => ({
          title: ministerio.nome ?? 'Ministério',
          value: ministerio.id,
        }))}
        onChange={handleStartLiderJourneyForMinisterio}
      />

      <TutorialOverlay tour={tour} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, paddingHorizontal: 15, paddingTop: 5 },
  list: { gap: 10 },
  // O picker abre exclusivamente via ref (ministerioPickerRef.current?.open()), disparado
  // pelo toque no FancyListItemCard — o campo/trigger visível do componente não se aplica
  // a esse fluxo de seleção sob demanda, então ele fica com altura zero e invisível.
  hiddenPickerTrigger: { height: 0, opacity: 0, overflow: 'hidden' },
});
