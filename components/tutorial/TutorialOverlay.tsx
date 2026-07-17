import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import { TutorialSpotlight } from './TutorialSpotlight';
import { TutorialTooltip } from './TutorialTooltip';
import type { TutorialTargetRect, UseScreenTutorialReturn } from '../../hooks/useScreenTutorial';

type TutorialOverlayProps = {
  tour: UseScreenTutorialReturn;
};

const MIN_TOOLTIP_HEIGHT = 180;

export function TutorialOverlay({ tour }: TutorialOverlayProps) {
  const { isActive, currentStep, stepIndex, totalSteps, next, back, skip, getTargetRect } = tour;
  const [rect, setRect] = useState<TutorialTargetRect | null>(null);

  useEffect(() => {
    if (!isActive || !currentStep) {
      setRect(null);
      return;
    }
    let cancelled = false;
    getTargetRect(currentStep.targetId).then((measured) => {
      if (!cancelled) setRect(measured);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep?.targetId]);

  if (!isActive || !currentStep || !rect) return null;

  const screenHeight = Dimensions.get('window').height;
  const fitsBelow = rect.y + rect.height + 16 + MIN_TOOLTIP_HEIGHT <= screenHeight;
  const tooltipPosition = fitsBelow
    ? { top: rect.y + rect.height + 16 }
    : { bottom: screenHeight - rect.y + 16 };

  return (
    <Modal visible transparent animationType="fade" presentationStyle="overFullScreen">
      <View style={StyleSheet.absoluteFill}>
        <TutorialSpotlight rect={rect} />
        <TutorialTooltip
          title={currentStep.title}
          description={currentStep.description}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onNext={next}
          onBack={back}
          onSkip={skip}
          style={{ ...tooltipPosition, left: 20, right: 20 }}
        />
      </View>
    </Modal>
  );
}
