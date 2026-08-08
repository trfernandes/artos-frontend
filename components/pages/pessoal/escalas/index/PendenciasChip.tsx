import { Pressable, View, StyleSheet } from 'react-native';
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
    <Pressable
      onPress={() => router.push('/(app)/(drawer)/pessoal/escalas/substituicoes')}
      style={[
        styles.container,
        {
          backgroundColor: ColorUtils.withAlpha(palette.secondary, 0.18),
          borderColor: ColorUtils.withAlpha(palette.secondary, 0.55),
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: ColorUtils.withAlpha(palette.secondary, 0.28) },
        ]}
      >
        <DefaultIcons.Custom
          library='MaterialIcons'
          name='swap-horiz'
          size={15}
          color={palette.secondary}
        />
      </View>
      <FancyText type='semiBold' size='small' color={palette.secondary} style={{ flex: 1 }}>
        {count === 1 ? 'Substituição pendente' : `${count} substituições pendentes`}
      </FancyText>
      <DefaultIcons.Custom
        library='MaterialIcons'
        name='chevron-right'
        size={18}
        color={palette.secondary}
        style={{ opacity: 0.65 }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
