import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useState } from 'react';
import FancyStepsCircle from './FancyStepsCircle';
import { ThemePalette } from '../../constants/colors';
import FancyStepsText from './FancyStepsText';
import { FancyStepsConfig } from './FancyStepsConfig';
import { FancyStepsSize } from './FancySteps';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type LabelSize = {
  width: number;
  height: number;
};

export type FancyStepsHeaderProps = {
  index: number;
  config: FancyStepsConfig;
  containerStyle?: StyleProp<ViewStyle>;
  /** Tamanho dos steps: 'normal' (35px) ou 'small' (25px). Padrão: 'normal' */
  size?: FancyStepsSize;
};

const CIRCLE_SIZES: Record<FancyStepsSize, number> = {
  normal: 35,
  small: 25,
};

export default function FancyStepsHeader({ config, containerStyle, size = 'normal', ...props }: FancyStepsHeaderProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const stepsLength = config.steps?.length ?? 0;
  const circleWidth = CIRCLE_SIZES[size];
  const [stepsWidth, setStepsWidth] = useState(0);
  const [labelSizes, setLabelSizes] = useState<LabelSize[]>([]);

  const handleLabelLayout = (index: number, event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLabelSizes((prev) => {
      const current = prev[index];
      if (current && current.width === width && current.height === height) {
        return prev;
      }

      const next = [...prev];
      next[index] = { width, height };
      return next;
    });
  };

  const labelMaxWidth = stepsWidth > 0 && stepsLength > 0 ? stepsWidth / stepsLength : undefined;
  const firstLabelWidth = stepsLength ? labelSizes[0]?.width ?? labelMaxWidth ?? circleWidth : circleWidth;
  const lastLabelWidth = stepsLength ? labelSizes[stepsLength - 1]?.width ?? labelMaxWidth ?? circleWidth : circleWidth;

  let firstCenter = circleWidth / 2;
  let lastCenter = stepsWidth - circleWidth / 2;

  if (stepsWidth > 0 && stepsLength > 0) {
    if (stepsLength === 1) {
      firstCenter = stepsWidth / 2;
      lastCenter = stepsWidth / 2;
    } else {
      firstCenter = Math.max(circleWidth / 2, firstLabelWidth / 2);
      lastCenter = Math.min(stepsWidth - circleWidth / 2, stepsWidth - lastLabelWidth / 2);

      if (lastCenter < firstCenter) {
        firstCenter = circleWidth / 2;
        lastCenter = stepsWidth - circleWidth / 2;
      }
    }
  }

  const spacing = stepsLength > 1 ? (lastCenter - firstCenter) / (stepsLength - 1) : 0;
  const getCenterX = (index: number) => {
    if (stepsWidth <= 0 || stepsLength === 0) {
      return 0;
    }

    return stepsLength === 1 ? stepsWidth / 2 : firstCenter + spacing * index;
  };

  const lineWidth = stepsLength > 1 ? Math.max(0, lastCenter - firstCenter) : 0;
  const segmentWidth = stepsLength > 1 ? lineWidth / (stepsLength - 1) : 0;
  const isLastStep = props.index >= stepsLength - 1;
  const activeLineLeft = firstCenter + segmentWidth * props.index;
  const activeLineWidth = isLastStep ? 0 : segmentWidth;
  const labelsHeight = labelSizes.reduce((max, size) => Math.max(max, size.height), 0);

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={styles.containerSteps}
        onLayout={(event) => {
          const layoutWidth = event.nativeEvent.layout.width;
          if (layoutWidth !== stepsWidth) {
            setStepsWidth(layoutWidth);
          }
        }}
      >
        <View style={[styles.containerCircles, { height: circleWidth }]}>
          {stepsLength > 1 && (
            <>
              <View style={[styles.lineBase, { left: firstCenter, width: lineWidth, top: circleWidth / 2 }]} />
              {!isLastStep && (
                <View style={[styles.lineActive, { left: activeLineLeft, width: activeLineWidth, top: circleWidth / 2 }]} />
              )}
            </>
          )}
          {config.steps?.map((_, index) => {
            const centerX = getCenterX(index);
            return (
              <FancyStepsCircle
                key={index}
                stepNumber={(index + 1).toString()}
                circleWidth={circleWidth}
                color={index === props.index ? palette.primary : palette.disabled2}
                containerStyle={{ position: 'absolute', left: centerX - circleWidth / 2, top: 0 }}
              />
            );
          })}
        </View>
      </View>
      <View style={[styles.containerTexts, labelsHeight ? { height: labelsHeight } : { minHeight: 24 }]}>
        {config.steps?.map((item, index) => {
          const centerX = getCenterX(index);
          const labelWidth = labelSizes[index]?.width ?? labelMaxWidth ?? 0;
          let left = centerX - labelWidth / 2;

          if (stepsWidth > 0 && labelWidth > 0) {
            left = Math.max(0, Math.min(left, stepsWidth - labelWidth));
          }

          return (
            <FancyStepsText
              key={index}
              text={item.title}
              textColor={index === props.index ? palette.primary : palette.fonts.inactive}
              maxWidth={labelMaxWidth}
              containerStyle={{ position: 'absolute', left }}
              onLayout={(event) => handleLabelLayout(index, event)}
            />
          );
        })}
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: { width: '100%', gap: 5, borderWidth: 0, borderColor: 'red' },
    containerSteps: { width: '100%', borderWidth: 0 },
    containerCircles: { position: 'relative', width: '100%' },
    containerTexts: { position: 'relative', width: '100%' },
    lineBase: {
      position: 'absolute',
      height: 0,
      borderTopWidth: 3,
      borderTopColor: palette.disabled2,
    },
    lineActive: {
      position: 'absolute',
      height: 0,
      borderTopWidth: 3,
      borderTopColor: palette.primary,
    },
  });
}
