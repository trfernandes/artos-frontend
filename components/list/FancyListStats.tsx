import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ColorUtils } from '../../utils/color_utils';

export type FancyListStatItem = {
  label: string;
  value: number | string;
  color?: string;
};

type FancyListStatsProps = {
  items: FancyListStatItem[];
};

/**
 * Faixa de resumo (até 3 stat cards) exibida no topo das telas de listagem que têm status.
 * Reaproveita contagens já disponíveis em memória — não dispara fetch.
 */
export default function FancyListStats({ items }: FancyListStatsProps) {
  const { palette, isDark } = useAppTheme();
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;

  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <View
          key={`${item.label}-${index}`}
          style={[
            styles.stat,
            {
              backgroundColor: cardBg,
              borderColor: ColorUtils.withAlpha(palette.borderCard ?? palette.border, 0.45),
              ...palette.shadows[200],
            },
          ]}
        >
          <FancyText type='bold' size='large' color={item.color ?? palette.fonts.dark}>
            {item.value}
          </FancyText>
          <FancyText
            type='medium'
            size='extraSmall'
            color={palette.fonts.inactive}
            numberOfLines={1}
          >
            {item.label}
          </FancyText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 0.5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 3,
  },
});
