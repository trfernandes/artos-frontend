import { StyleSheet, View } from 'react-native';
import FancyBaseCard from './FancyBaseCard';
import { FancyActionButtons } from './FancyCardActionButtons';
import { isValidElement } from 'react';
import { Pallete } from '../../../constants/colors';
import FancyText from '../../FancyText';
import { FancyCardImageBaseProps } from './FancyCard';

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
  | 'isCollapsable'
  | 'centerContainerStyle'
>;

export default function FancyCardLetter({ letter = 'A', ...props }: FancyCardLetterProps) {
  return (
    <FancyBaseCard
      {...props}
      leftItem={<CardLetter letter={letter} />}
      rightItem={isValidElement(props.actionButtons) ? props.actionButtons : <FancyActionButtons actions={props.actionButtons} />}
    />
  );
}

function CardLetter({ letter }: { letter: string }) {
  return (
    <View style={styles.letterContainer}>
      <FancyText type="bold" size={'large'} style={styles.letter}>
        {letter}
      </FancyText>
    </View>
  );
}

const HEIGHT = 40;

const styles = StyleSheet.create({
  letterContainer: {
    backgroundColor: Pallete.primary,
    borderRadius: 100,
    marginRight: 5,
    width: HEIGHT,
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: { color: 'white', lineHeight: 20, borderWidth: 0 },
});
