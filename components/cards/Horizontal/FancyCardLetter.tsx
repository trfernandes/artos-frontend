import { StyleSheet, View } from 'react-native';
import FancyBaseCard from './FancyBaseCard';
import { FancyActionButtons } from './FancyCardActionButtons';
import { isValidElement } from 'react';
import { ThemePalette } from '../../../constants/colors';
import FancyText from '../../FancyText';
import { FancyCardImageBaseProps } from './FancyCard';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export type FancyCardLetterProps = {
  letter?: string;
} & Pick<
  FancyCardImageBaseProps,
  | 'actionButtons'
  | 'title'
  | 'subtitle'
  | 'additionalData1'
  | 'additionalData2'
  | 'content'
  | 'containerStyle'
  | 'contentContainerStyle'
  | 'titleProps'
  | 'subtitleProps'
  | 'isCollapsable'
  | 'centerContainerStyle'
  | 'backgroundColor'
  | 'onPress'
  | 'onLongPress'
  | 'delayLongPress'
  | 'accessibilityRole'
  | 'accessibilityLabel'
>;

export default function FancyCardLetter({ letter = 'A', ...props }: FancyCardLetterProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <FancyBaseCard
      {...props}
      leftItem={<CardLetter letter={letter} styles={styles} palette={palette} />}
      rightItem={
        isValidElement(props.actionButtons) ? (
          props.actionButtons
        ) : (
          <FancyActionButtons actions={props.actionButtons} />
        )
      }
    />
  );
}

function CardLetter({
  letter,
  styles,
  palette,
}: {
  letter: string;
  styles: ReturnType<typeof createStyles>;
  palette: ThemePalette;
}) {
  return (
    <View style={styles.letterContainer}>
      <FancyText type='bold' size={'large'} style={[styles.letter, { color: palette.fonts.light }]}>
        {letter}
      </FancyText>
    </View>
  );
}

const HEIGHT = 40;

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    letterContainer: {
      backgroundColor: palette.primary,
      borderRadius: 100,
      marginRight: 5,
      width: HEIGHT,
      height: HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    letter: { lineHeight: 20, borderWidth: 0 },
  });
}
