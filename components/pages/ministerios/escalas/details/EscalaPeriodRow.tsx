import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import DefaultIcons from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import { formatPeriod } from './escalaHeader.utils';

type EscalaPeriodRowProps = {
  periodStart: Date;
  periodEnd: Date;
  trailingText?: string;
};

export default function EscalaPeriodRow({
  periodStart,
  periodEnd,
  trailingText,
}: EscalaPeriodRowProps) {
  const Pallete = usePallete();
  return (
    <View style={styles.container}>
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='calendar-range'
        size={14}
        color={Pallete.primary}
      />

      <FancyText type='medium' size='extraSmall' color={Pallete.fonts.inactive}>
        Período:
      </FancyText>

      <FancyText type='semiBold' size='small' color={Pallete.fonts.dark} numberOfLines={1}>
        {formatPeriod(periodStart, periodEnd)}
      </FancyText>

      {trailingText ? (
        <>
          <FancyText type='medium' size='extraSmall' color={Pallete.fonts.inactive}>
            •
          </FancyText>
          <FancyText
            type='medium'
            size='extraSmall'
            color={Pallete.fonts.inactive}
            numberOfLines={1}
            style={styles.trailingText}
          >
            {trailingText}
          </FancyText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
    paddingVertical: 2,
  },
  trailingText: {
    flexShrink: 1,
  },
});
