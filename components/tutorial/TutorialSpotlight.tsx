import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { usePallete } from '../../hooks/usePallete';
import type { TutorialTargetRect } from '../../hooks/useScreenTutorial';

type TutorialSpotlightProps = {
  rect: TutorialTargetRect;
  padding?: number;
  radius?: number;
};

export function TutorialSpotlight({ rect, padding = 6, radius = 14 }: TutorialSpotlightProps) {
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
      <Svg style={StyleSheet.absoluteFill} pointerEvents='none'>
        <Defs>
          <Mask id='spotlightMask'>
            <Rect x={0} y={0} width='100%' height='100%' fill='white' />
            <Rect
              x={spot.x}
              y={spot.y}
              width={spot.width}
              height={spot.height}
              rx={radius}
              ry={radius}
              fill='black'
            />
          </Mask>
        </Defs>
        <Rect
          x={0}
          y={0}
          width='100%'
          height='100%'
          fill={overlayColor}
          mask='url(#spotlightMask)'
        />
      </Svg>
    </View>
  );
}
