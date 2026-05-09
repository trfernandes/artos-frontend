import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyButton from '../../../../buttons/FancyButton';
import { usePallete } from '../../../../../hooks/usePallete';
import { EscalaSubstituicaoStatusEnum } from '../../../../../domain/enums/Escala/escala-substituicao-status.enum';
import { ResponseEscalaSubstituicaoDto } from '../../../../../domain/dtos/Escala/escala-substituicao.response';
import SubstituicaoCardBase from '../../../common/SubstituicaoCardBase';
import CancelarSubstituicaoModal from './CancelarSubstituicaoModal';

type Props = {
  substituicao: ResponseEscalaSubstituicaoDto;
  onCancelar: (id: string, motivo?: string) => Promise<void>;
  isCanceling?: boolean;
};

export default function SubstituicaoMinisterioCard({
  substituicao,
  onCancelar,
  isCanceling,
}: Props) {
  const palette = usePallete();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const isCancelada = substituicao.status === EscalaSubstituicaoStatusEnum.Cancelada;

  const handleCancelar = async (motivo?: string) => {
    setCancelModalVisible(false);
    await onCancelar(substituicao.id, motivo);
  };

  const footer = !isCancelada ? (
    <View style={styles.footer}>
      <FancyButton
        label='Cancelar substituição'
        type='outlined'
        icon={{ library: 'MaterialIcons', name: 'cancel', color: palette.error, size: 16 }}
        onPress={() => setCancelModalVisible(true)}
        containerStyle={[styles.cancelBtn, { borderColor: palette.error }]}
        labelProps={{ color: palette.error }}
        disabled={isCanceling}
      />
    </View>
  ) : null;

  return (
    <>
      <SubstituicaoCardBase substituicao={substituicao} footer={footer} />
      <CancelarSubstituicaoModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleCancelar}
        isLoading={isCanceling}
      />
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 2,
  },
  cancelBtn: {
    width: '100%',
    minHeight: 44,
  },
});
