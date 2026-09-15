import { Pressable, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import FancyText from '../../../../FancyText';
import DefaultIcons from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import { useAppTheme } from '../../../../../hooks/useAppTheme';
import { ColorUtils } from '../../../../../utils/color_utils';
import { useSubstituicaoPedidosCrud } from '../../../../../hooks/useSubstituicaoPedidosCrud';

export default function PendenciasChip() {
  const palette = usePallete();
  const { isDark } = useAppTheme();
  const router = useRouter();
  const { meusPedidos } = useSubstituicaoPedidosCrud();

  const pendentesCount = useMemo(
    () => meusPedidos.filter((p) => p.aguardandoAcaoDoUsuario).length,
    [meusPedidos],
  );

  if (pendentesCount === 0) return null;

  const cardBg = isDark ? palette.backgroundColor4 : ColorUtils.lightenColor(palette.warning, 0.94);

  return (
    <Pressable
      onPress={() => router.push('/(app)/(drawer)/pessoal/escalas/substituicoes')}
      style={[styles.card, { backgroundColor: cardBg }]}
    >
      <View style={[styles.icon, { backgroundColor: ColorUtils.withAlpha(palette.warning, 0.16) }]}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='swap-horizontal-circle-outline'
          size={19}
          color={palette.warning}
        />
      </View>
      <View style={styles.textWrap}>
        <FancyText size='small' type='bold' color={palette.fonts.dark}>
          {pendentesCount === 1
            ? '1 pedido esperando você'
            : `${pendentesCount} pedidos esperando você`}
        </FancyText>
        <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
          Toque pra ver suas substituições pendentes
        </FancyText>
      </View>
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='chevron-right'
        size={20}
        color={palette.icons.inactive}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 1,
  },
});
