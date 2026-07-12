import { View, StyleSheet } from 'react-native';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import { ColorUtils } from '../../../../utils/color_utils';

type SummaryCardsProps = {
  pendentes: number;
  convitesAtivos: number;
  totalAceitos: number;
};

type SummaryCardItemProps = {
  icon: string;
  iconLib: 'MaterialCommunityIcons' | 'MaterialIcons';
  value: number;
  label: string;
  color: string;
};

function SummaryCardItem({ icon, iconLib, value, label, color }: SummaryCardItemProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.card, { backgroundColor: ColorUtils.withAlpha(color, 0.07) }]}>
      <View style={styles.topRow}>
        <View
          style={[styles.iconContainer, { backgroundColor: ColorUtils.withAlpha(color, 0.12) }]}
        >
          <DefaultIcons.Custom library={iconLib} name={icon as any} size={18} color={color} />
        </View>
        <FancyText type='bold' size='large' style={{ color }}>
          {value}
        </FancyText>
      </View>
      <FancyText
        size='extraSmall'
        type='bold'
        color={palette.fonts.inactive}
        numberOfLines={2}
        style={styles.label}
      >
        {label}
      </FancyText>
    </View>
  );
}

export default function SummaryCards({
  pendentes,
  convitesAtivos,
  totalAceitos,
}: SummaryCardsProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <SummaryCardItem
        icon='clock-outline'
        iconLib='MaterialCommunityIcons'
        value={pendentes}
        label='Pendentes'
        color={palette.warning}
      />
      <SummaryCardItem
        icon='email-outline'
        iconLib='MaterialCommunityIcons'
        value={convitesAtivos}
        label='Convites Ativos'
        color={palette.primary}
      />
      <SummaryCardItem
        icon='check-circle-outline'
        iconLib='MaterialCommunityIcons'
        value={totalAceitos}
        label='Aceitos'
        color={palette.confirm}
      />
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 0,
      marginBottom: 16,
    },
    card: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 6,
      borderRadius: 14,
      gap: 4,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      alignSelf: 'stretch',
      textAlign: 'center',
    },
  });
}
