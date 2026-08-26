import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyColorPicker from '../../../../FancyColorPicker';
import { useRepertorioEtiquetas } from '../../../../../hooks/useRepertorio';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import FancyErrorBanner from '../../../../forms/FancyErrorBanner';
import Toast from 'react-native-toast-message';
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
  const {
    data: etiquetas = [],
    criarEtiqueta,
    atualizarEtiqueta,
    isMutatingEtiqueta,
  } = useRepertorioEtiquetas(ministerioId);
  const isEditing = Boolean(etiqueta);

  const coresDisponiveis = useMemo(() => {
    const usadasPorOutras = new Set(
      etiquetas.filter((item) => item.id !== etiqueta?.id).map((item) => item.cor),
    );
    const livres = CORES_PADRAO.filter((c) => !usadasPorOutras.has(c));
    if (etiqueta && !livres.includes(etiqueta.cor)) return [etiqueta.cor, ...livres];
    return livres.length > 0 ? livres : CORES_PADRAO;
  }, [etiquetas, etiqueta]);

  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES_PADRAO[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setNome(etiqueta?.nome ?? '');
    setCor(etiqueta?.cor ?? coresDisponiveis[0] ?? CORES_PADRAO[0]);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, etiqueta]);

  const canSubmit = nome.trim().length > 0;

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    setError(null);
    try {
      if (isEditing && etiqueta) {
        await atualizarEtiqueta({ id: etiqueta.id, dto: { nome: nome.trim(), cor } });
        Toast.show({ type: 'success', text1: 'Etiqueta atualizada com sucesso!' });
      } else {
        await criarEtiqueta({ nome: nome.trim(), cor });
        Toast.show({ type: 'success', text1: 'Etiqueta adicionada com sucesso!' });
      }
      onClose();
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          isEditing
            ? 'Não foi possível atualizar a etiqueta.'
            : 'Não foi possível salvar a etiqueta.',
        ),
      );
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Editando etiqueta' : 'Nova etiqueta'}
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
          colors={coresDisponiveis}
          circleSize={26}
          onSelectColor={setCor}
          disabled={isMutatingEtiqueta}
        />
        {error && <FancyErrorBanner message={error} />}
        <FancyButton
          type='contained'
          label={isEditing ? 'Salvar' : 'Adicionar'}
          icon={{
            library: 'MaterialCommunityIcons',
            name: isEditing ? 'content-save-outline' : 'plus',
            size: isEditing ? 24 : 27,
          }}
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
