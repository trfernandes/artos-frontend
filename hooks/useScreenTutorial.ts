import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTutorialCatalog } from '../contexts/TutorialCatalogContext';
import type { TourStep } from '../components/tutorial/types';

export type TutorialTargetRect = { x: number; y: number; width: number; height: number };

export function useScreenTutorial(tourId: string, title: string, steps: TourStep[]) {
  const { registerTour, isSeen, markSeen, markSkipped, loading } = useTutorialCatalog();
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const targetsRef = useRef<Record<string, React.RefObject<View | null>>>({});

  useEffect(() => {
    registerTour({ id: tourId, title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, title]);

  const registerTarget = (id: string, ref: React.RefObject<View | null>) => {
    targetsRef.current[id] = ref;
  };

  const unregisterTarget = (id: string) => {
    delete targetsRef.current[id];
  };

  const getTargetRect = (id: string): Promise<TutorialTargetRect | null> => {
    const ref = targetsRef.current[id];
    if (!ref?.current) return Promise.resolve(null);
    return new Promise((resolve) => {
      ref.current!.measureInWindow((x, y, width, height) => {
        resolve({ x, y, width, height });
      });
    });
  };

  const start = () => {
    setStepIndex(0);
    setIsActive(true);
  };

  const finish = () => {
    setIsActive(false);
    markSeen(tourId);
  };

  const skip = () => {
    setIsActive(false);
    markSkipped(tourId);
  };

  const next = () => {
    if (stepIndex + 1 >= steps.length) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const back = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const showBanner = !loading && !isSeen(tourId) && !isActive;

  return {
    steps,
    currentStep: steps[stepIndex] ?? null,
    stepIndex,
    totalSteps: steps.length,
    isActive,
    showBanner,
    start,
    next,
    back,
    skip,
    registerTarget,
    unregisterTarget,
    getTargetRect,
  };
}

export type UseScreenTutorialReturn = ReturnType<typeof useScreenTutorial>;
