import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TutorialSpotlight } from './TutorialSpotlight';
import { TutorialTooltip } from './TutorialTooltip';
import type { TutorialTargetRect, UseScreenTutorialReturn } from '../../hooks/useScreenTutorial';

type TutorialOverlayProps = {
  tour: UseScreenTutorialReturn;
};

const MIN_TOOLTIP_HEIGHT = 180;
// Passos de wizard (FancySteps) desmontam o conteúdo do passo anterior e montam o novo
// de forma assíncrona — a tela ainda pode estar trocando de passo (setIndex) quando este
// efeito dispara. Reintentamos algumas vezes antes de desistir, o que não muda o
// comportamento de tours simples (a primeira medição já resolve nesses casos).
const MEASURE_RETRY_ATTEMPTS = 8;
const MEASURE_RETRY_DELAY_MS = 60;

export function TutorialOverlay({ tour }: TutorialOverlayProps) {
  const { isActive, currentStep, stepIndex, totalSteps, next, back, skip, getTargetRect } = tour;
  const [rect, setRect] = useState<TutorialTargetRect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setTooltipHeight(null);
  }, [currentStep?.targetId]);

  useEffect(() => {
    if (!isActive || !currentStep) {
      setRect(null);
      return;
    }
    let cancelled = false;

    const measureWithRetry = async (attemptsLeft: number) => {
      const measured = await getTargetRect(currentStep.targetId);
      if (cancelled) return;
      if (measured) {
        setRect(measured);
        return;
      }
      if (attemptsLeft <= 0) {
        setRect(null);
        return;
      }
      setTimeout(() => {
        if (!cancelled) measureWithRetry(attemptsLeft - 1);
      }, MEASURE_RETRY_DELAY_MS);
    };

    measureWithRetry(MEASURE_RETRY_ATTEMPTS);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep?.targetId]);

  if (!isActive || !currentStep || !rect) return null;

  // measureInWindow reports coordinates relative to the app's content window
  // (below the status bar), but the overFullScreen Modal below renders in a
  // surface that spans the entire physical screen (including the status bar).
  // Shift by the status bar height only — the window/screen height gap also
  // includes the bottom nav/gesture bar, which isn't relevant to a top offset.
  const statusBarOffset = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const adjustedRect = { ...rect, y: rect.y + statusBarOffset };

  const screenHeight = Dimensions.get('screen').height;
  // Antes de medir a altura real do tooltip (primeiro frame), usamos o mínimo como
  // estimativa conservadora — subestimar aqui é seguro, pois só faz o tooltip nascer
  // um pouco mais perto do alvo até o onLayout corrigir a posição no frame seguinte.
  const effectiveTooltipHeight = tooltipHeight ?? MIN_TOOLTIP_HEIGHT;
  const fitsBelow =
    adjustedRect.y + adjustedRect.height + 16 + effectiveTooltipHeight <= screenHeight;
  // Quando não cabe abaixo, o tooltip sobe para ficar logo acima do alvo — mas nunca a
  // ponto de invadir a status bar, então o topo fica travado nesse limite mínimo.
  const tooltipPosition =
    currentStep.tooltipPosition === 'bottom'
      ? { bottom: insets.bottom + 16 }
      : fitsBelow
        ? { top: adjustedRect.y + adjustedRect.height + 16 }
        : { top: Math.max(statusBarOffset + 8, adjustedRect.y - 16 - effectiveTooltipHeight) };

  return (
    <Modal visible transparent animationType='fade' presentationStyle='overFullScreen'>
      <View style={StyleSheet.absoluteFill}>
        <TutorialSpotlight rect={adjustedRect} />
        <TutorialTooltip
          title={currentStep.title}
          description={currentStep.description}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onNext={next}
          onBack={back}
          onSkip={skip}
          style={{ ...tooltipPosition, left: 20, right: 20 }}
          onLayout={(event) => setTooltipHeight(event.nativeEvent.layout.height)}
        />
      </View>
    </Modal>
  );
}
