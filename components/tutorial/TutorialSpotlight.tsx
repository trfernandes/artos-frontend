import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePallete } from '../../hooks/usePallete';
import type { TutorialTargetRect } from '../../hooks/useScreenTutorial';

type TutorialSpotlightProps = {
  rect: TutorialTargetRect;
  padding?: number;
};

// Sem lib de SVG no projeto: o "recorte" é simulado com 4 retângulos opacos
// ao redor da área alvo, deixando o miolo transparente.
export function TutorialSpotlight({ rect, padding = 6 }: TutorialSpotlightProps) {
  const Pallete = usePallete();

  const spot = {
    x: Math.max(rect.x - padding, 0),
    y: Math.max(rect.y - padding, 0),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  const overlayColor = Pallete.overlays.strongBackdrop;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents='box-only'>
      <View
        style={[
          styles.mask,
          { backgroundColor: overlayColor, top: 0, left: 0, right: 0, height: spot.y },
        ]}
      />
      <View
        style={[
          styles.mask,
          {
            backgroundColor: overlayColor,
            top: spot.y + spot.height,
            left: 0,
            right: 0,
            bottom: 0,
          },
        ]}
      />
      <View
        style={[
          styles.mask,
          {
            backgroundColor: overlayColor,
            top: spot.y,
            height: spot.height,
            left: 0,
            width: spot.x,
          },
        ]}
      />
      <View
        style={[
          styles.mask,
          {
            backgroundColor: overlayColor,
            top: spot.y,
            height: spot.height,
            left: spot.x + spot.width,
            right: 0,
          },
        ]}
      />
      <View
        pointerEvents='none'
        style={[
          styles.spotlightBorder,
          {
            borderColor: Pallete.primary,
            top: spot.y,
            left: spot.x,
            width: spot.width,
            height: spot.height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mask: { position: 'absolute' },
  spotlightBorder: { position: 'absolute', borderWidth: 2, borderRadius: 12 },
});
