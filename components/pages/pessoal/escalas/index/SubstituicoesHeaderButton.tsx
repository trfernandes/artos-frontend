import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import DefaultIcons from '../../../../FancyIcons';
import FancyText from '../../../../FancyText';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useEscalaSubstituicoesCrud } from '../../../../../hooks/useEscalaSubstituicoesCrud';
import { useMemo } from 'react';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { EscalaSubstituicaoStatusEnum } from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';
import { usePallete } from '../../../../../hooks/usePallete';

export default function SubstituicoesHeaderButton() {
  const router = useRouter();
  const palette = usePallete();
  const { user } = useAuth();

  const query: DynamicQuery = useMemo(
    () => ({
      where: {
        conditions: [
          {
            path: 'substituto.voluntario.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: user?.user?.id ?? '' },
          },
          {
            path: 'status',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: EscalaSubstituicaoStatusEnum.Pendente },
          },
        ],
      },
      relations: [],
    }),
    [user?.user?.id],
  );

  const { data } = useEscalaSubstituicoesCrud({ autoFetch: true, initialParams: query });
  const count = (data ?? []).length;

  return (
    <TouchableOpacity
      onPress={() => router.push('/(app)/(drawer)/pessoal/escalas/substituicoes')}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={styles.container}
    >
      <DefaultIcons.Custom
        library='MaterialIcons'
        name='swap-horiz'
        size={24}
        color={palette.icons.dark}
      />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: palette.warning }]}>
          <FancyText size={10} type='bold' color='#FFFFFF'>
            {count > 9 ? '9+' : String(count)}
          </FancyText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    position: 'relative',
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
