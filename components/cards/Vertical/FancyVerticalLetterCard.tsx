import { StyleSheet, View } from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import { ThemePalette } from '../../../constants/colors';
import FancyText from '../../FancyText';
import { EXTRA_LARGE_SIZE_FONT } from '../../../constants/font';
import { CustomIconProps } from '../../FancyIcons';
import { TopLeftMenuButton, TopRightMenuButton } from './FancyVerticalImageCard';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export type FancyVerticalLetterCardProps = {
  char?: string;
  topRightIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
  topLeftIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle' | 'containerStyle' | 'additionalElement'>;

export default function FancyVerticalLetterCard({ ...props }: FancyVerticalLetterCardProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const initialLetter = props.char || props.title?.[0] || '?';

  return (
    <FancyVerticalCard
      topElement={<LetterComponent letter={initialLetter} styles={styles} palette={palette} />}
      topRightElement={
        props.topRightIcon && (
          <TopRightMenuButton
            customIcon={props.topRightIcon?.customIcon}
            onPress={props.topRightIcon?.onPress}
          />
        )
      }
      topLeftElement={
        props.topLeftIcon && (
          <TopLeftMenuButton
            customIcon={props.topLeftIcon?.customIcon}
            onPress={props.topLeftIcon?.onPress}
          />
        )
      }
      {...props}
    />
  );
}

export function LetterComponent({
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
      <FancyText type='bold' size={'small'} style={[styles.letter, { color: palette.fonts.light }]}>
        {letter}
      </FancyText>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    letterContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 100,
      aspectRatio: 1,
      width: '100%',
      backgroundColor: palette.primary,
    },
    letter: {
      fontSize: EXTRA_LARGE_SIZE_FONT + 10,
      lineHeight: EXTRA_LARGE_SIZE_FONT + 15,
    },
  });
}
