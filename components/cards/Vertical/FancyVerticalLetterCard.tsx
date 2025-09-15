import { StyleSheet, View } from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import { Pallete } from '../../../constants/colors';
import FancyText from '../../FancyText';
import { EXTRA_LARGE_SIZE_FONT } from '../../../constants/font';
import { CustomIconProps } from '../../FancyIcons';
import { TopLeftMenuButton, TopRightMenuButton } from './FancyVerticalImageCard';

export type FancyVerticalLetterCardProps = {
  char?: string;
  topRightIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
  topLeftIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle' | 'containerStyle' | 'additionalElement'>;

export default function FancyVerticalLetterCard({ ...props }: FancyVerticalLetterCardProps) {
  return (
    <FancyVerticalCard
      topElement={<LetterComponent letter={props.char || props.title[0]!} />}
      topRightElement={
        props.topRightIcon && (
          <TopRightMenuButton customIcon={props.topRightIcon?.customIcon} onPress={props.topRightIcon?.onPress} />
        )
      }
      topLeftElement={
        props.topLeftIcon && <TopLeftMenuButton customIcon={props.topLeftIcon?.customIcon} onPress={props.topLeftIcon?.onPress} />
      }
      {...props}
    />
  );
}

export function LetterComponent({ letter }: { letter: string }) {
  return (
    <View style={styles.letterContainer}>
      <FancyText type="bold" size={'small'} style={styles.letter}>
        {letter}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    aspectRatio: 1,
    width: '100%',
    backgroundColor: Pallete.primary,
  },
  letter: {
    color: Pallete.fonts.light,
    fontSize: EXTRA_LARGE_SIZE_FONT + 10,
    lineHeight: EXTRA_LARGE_SIZE_FONT + 15,
  },
});
