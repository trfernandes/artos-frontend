import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyColorPicker from '../../../../FancyColorPicker';
import { useRepertorioEtiquetas } from '../../../../../hooks/useRepertorio';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import FancyErrorBanner from '../../../../forms/FancyErrorBanner';
import { CORES_PADRAO_ETIQUETA as CORES_PADRAO } from '../../../../../constants/repertorioEtiquetaCores';
import { ResponseRepertorioEtiquetaDto } from '../../../../../domain/dtos/Repertorio/repertorio-etiqueta.response';

type Props = {
  visible: boolean;
  onClose: () => void;
  ministerioId?: string;
  etiqueta?: ResponseRepertorioEtiquetaDto | null;
};

export default function RepertorioEtiquetaFormSheet({
  visible,
  onClose,
  ministerioId,
  etiqueta,
}: Props) {
  const { criarEtiqueta, atualizarEtiqueta, isMutatingEtiqueta } =
    useRepertorioEtiquetas(ministerioId);
  const isEditing = Boolean(etiqueta);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES_PADRAO[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setNome(etiqueta?.nome ?? '');
    setCor(etiqueta?.cor ?? CORES_PADRAO[0]);
    setError(null);
  }, [visible, etiqueta]);

  const canSubmit = nome.trim().length > 0;

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    setError(null);
    try {
      if (isEditing && etiqueta) {
        await atualizarEtiqueta({ id: etiqueta.id, dto: { nome: nome.trim(), cor } });
      } else {
        await criarEtiqueta({ nome: nome.trim(), cor });
      }
      onClose();
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          isEditing ? 'Não foi possível atualizar a etiqueta.' : 'Não foi possível salvar a etiqueta.',
        ),
      );
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? `Editando · ${etiqueta?.nome}` : 'Nova etiqueta'}
      closeDisabled={isMutatingEtiqueta}
    >
      <View style={styles.content}>
        <FancyTextInput
          label='Nome'
          value={nome}
          inputProps={{
            onChangeText: setNome,
            placeholder: 'Ex: Celebração',
            returnKeyType: 'done',
            onSubmitEditing: () => void handleSubmit(),
            editable: !isMutatingEtiqueta,
          }}
        />
        <FancyColorPicker
          value={cor}
          colors={CORES_PADRAO}
          circleSize={26}
          onSelectColor={setCor}
          disabled={isMutatingEtiqueta}
        />
        {error && <FancyErrorBanner message={error} />}
        <FancyButton
          type='contained'
          label={isEditing ? 'Salvar' : 'Adicionar'}
          isLoading={isMutatingEtiqueta}
          onPress={() => void handleSubmit()}
          disabled={!canSubmit}
          accessibilityLabel={isEditing ? 'Salvar etiqueta' : 'Adicionar etiqueta'}
        />
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
});
