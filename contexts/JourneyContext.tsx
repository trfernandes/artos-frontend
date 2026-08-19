import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { getJourney } from '../components/tutorial/journeys';
import type { Journey, JourneyStep } from '../components/tutorial/journeys/types';

const STORAGE_KEY = 'artos_journey_state';

type PersistedJourneyState = {
  journeyId: string;
  stepIndex: number;
  params?: Record<string, string>;
};

function interpolateRoute(route: string, params?: Record<string, string>): string {
  if (!params) return route;
  return route.replace(/\{(\w+)\}/g, (match, key) => params[key] ?? match);
}

interface JourneyContextData {
  activeJourney: Journey | null;
  stepIndex: number;
  currentStep: JourneyStep | null;
  /** Jornada interrompida (fechou o app / trocou de tela no meio) encontrada ao abrir o app. */
  pendingResume: Journey | null;
  startJourney: (journey: Journey, params?: Record<string, string>) => void;
  /** Chamado pela tela quando o tour local do passo atual termina — avança pra próxima tela ou encerra. */
  advance: () => void;
  exitJourney: () => void;
  resumeJourney: () => void;
  dismissResume: () => void;
}

const JourneyContext = createContext<JourneyContextData>({} as JourneyContextData);

async function getPersisted(): Promise<PersistedJourneyState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function savePersisted(state: PersistedJourneyState | null): Promise<void> {
  try {
    if (state) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora falha de persistência — pior caso, a jornada não retoma sozinha
  }
}

type JourneyProviderProps = { children: React.ReactNode };

export function JourneyProvider({ children }: JourneyProviderProps) {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [journeyParams, setJourneyParams] = useState<Record<string, string> | undefined>();
  const [pendingResume, setPendingResume] = useState<Journey | null>(null);
  const [pendingResumeStepIndex, setPendingResumeStepIndex] = useState(0);
  const [pendingResumeParams, setPendingResumeParams] = useState<
    Record<string, string> | undefined
  >();

  useEffect(() => {
    getPersisted().then((persisted) => {
      if (!persisted) return;
      const journey = getJourney(persisted.journeyId);
      if (!journey || persisted.stepIndex >= journey.steps.length) {
        savePersisted(null);
        return;
      }
      setPendingResume(journey);
      setPendingResumeStepIndex(persisted.stepIndex);
      setPendingResumeParams(persisted.params);
    });
  }, []);

  const goToStep = (journey: Journey, index: number, params?: Record<string, string>) => {
    setActiveJourney(journey);
    setStepIndex(index);
    setJourneyParams(params);
    savePersisted({ journeyId: journey.id, stepIndex: index, params });
    const step = journey.steps[index];
    if (step) router.push(interpolateRoute(step.route, params) as never);
  };

  const startJourney = (journey: Journey, params?: Record<string, string>) =>
    goToStep(journey, 0, params);

  const advance = () => {
    if (!activeJourney) return;
    const nextIndex = stepIndex + 1;
    if (nextIndex >= activeJourney.steps.length) {
      setActiveJourney(null);
      setStepIndex(0);
      setJourneyParams(undefined);
      savePersisted(null);
      return;
    }
    goToStep(activeJourney, nextIndex, journeyParams);
  };

  const exitJourney = () => {
    setActiveJourney(null);
    setStepIndex(0);
    setJourneyParams(undefined);
    savePersisted(null);
  };

  const resumeJourney = () => {
    if (!pendingResume) return;
    const journey = pendingResume;
    const index = pendingResumeStepIndex;
    const params = pendingResumeParams;
    setPendingResume(null);
    goToStep(journey, index, params);
  };

  const dismissResume = () => {
    setPendingResume(null);
    savePersisted(null);
  };

  const value = useMemo(
    () => ({
      activeJourney,
      stepIndex,
      currentStep: activeJourney?.steps[stepIndex] ?? null,
      pendingResume,
      startJourney,
      advance,
      exitJourney,
      resumeJourney,
      dismissResume,
    }),
    [activeJourney, stepIndex, pendingResume, pendingResumeStepIndex],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export const useJourney = () => useContext(JourneyContext);
