import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FancyText from '../../../../FancyText';
import DefaultIcons from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';

type Props = { count: number };

export default function PendenciasChip({ count }: Props) {
  const palette = usePallete();
  const router = useRouter();

  if (count === 0) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push('/(app)/(drawer)/pessoal/escalas/substituicoes')}
      style={[
        styles.container,
        {
          backgroundColor: ColorUtils.withAlpha(palette.warning, 0.1),
          borderColor: ColorUtils.withAlpha(palette.warning, 0.35),
        },
      ]}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: ColorUtils.withAlpha(palette.warning, 0.18) },
        ]}
      >
        <DefaultIcons.Custom
          library='MaterialIcons'
          name='swap-horiz'
          size={20}
          color={palette.warning}
        />
      </View>
      <View style={styles.textBlock}>
        <FancyText type='semiBold' size='small' color={palette.warning}>
          {count === 1 ? '1 solicitação para você' : `${count} solicitações para você`}
        </FancyText>
        <FancyText size='extraSmall' color={palette.warning} style={styles.subtitleText}>
          Toque para revisar
        </FancyText>
      </View>
      <View style={[styles.badge, { backgroundColor: palette.warning }]}>
        <FancyText size={11} type='bold' color='#FFFFFF'>
          {count > 9 ? '9+' : String(count)}
        </FancyText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 1,
  },
  subtitleText: {
    opacity: 0.8,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
