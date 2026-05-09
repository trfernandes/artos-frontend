import { StyleSheet, View } from 'react-native';
import FancyButton from '../../../../buttons/FancyButton';
import { usePallete } from '../../../../../hooks/usePallete';
import { EscalaSubstituicaoStatusEnum } from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';
import SubstituicaoCardBase from '../../../common/SubstituicaoCardBase';

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  onApprove?: () => void;
  onReject?: () => void;
};

export default function SubstituicaoRecebidaCard({ substituicao, onApprove, onReject }: Props) {
  const palette = usePallete();
  const isPendente = substituicao.status === EscalaSubstituicaoStatusEnum.Pendente;

  const footer =
    isPendente && onApprove && onReject ? (
      <View style={styles.actionRow}>
        <FancyButton
          label='Recusar'
          type='outlined'
          onPress={onReject}
          containerStyle={[styles.actionBtn, { borderColor: palette.error }]}
          labelProps={{ color: palette.error }}
        />
        <FancyButton
          label='Aprovar'
          type='contained'
          onPress={onApprove}
          containerStyle={[styles.actionBtn, { backgroundColor: palette.confirm }]}
        />
      </View>
    ) : null;

  return <SubstituicaoCardBase substituicao={substituicao} footer={footer} />;
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
  },
});
