import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyButton from '../../buttons/FancyButton';
import FancySearchSelect from '../../fields/FancySearchSelect';
import { DropDownItemProps } from '../../fields/FancyDropDownItem';
import { AppImages } from '../../../assets/app_images';
import { useMinisterioVoluntariosCrud } from '../../../hooks/useMinisterioVoluntariosCrud';
import { DynamicQuery, Operator, ValueType } from '../../../domain/utils/query_utils';
import { ResponseSubstituicaoPedidoDto } from '../../../domain/dtos/SubstituicaoPedido/substituicao-pedido.response';

type Props = {
  visible: boolean;
  onClose: () => void;
  pedido: ResponseSubstituicaoPedidoDto;
  onConfirm: (candidatoMinisterioVoluntarioId: string) => Promise<unknown>;
};

export default function IndicarVoluntarioModal({ visible, onClose, pedido, onConfirm }: Props) {
  const ministerioId = pedido.escalaItem?.voluntario?.ministerio?.id;
  const solicitanteMinisterioVoluntarioId = pedido.solicitanteId;

  const initialParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId ?? '' },
          },
          {
            path: 'id',
            operator: Operator.NOT_EQUALS,
            value: { type: ValueType.LITERAL, value: solicitanteMinisterioVoluntarioId },
          },
        ],
      },
      relations: ['voluntario'],
    }),
    [ministerioId, solicitanteMinisterioVoluntarioId],
  );

  const { data: voluntarios, isLoading } = useMinisterioVoluntariosCrud({
    initialParams,
    autoFetch: visible && !!ministerioId,
  });

  const items = useMemo<DropDownItemProps<string>[]>(
    () =>
      voluntarios
        .map(
          (mv) =>
            ({
              title: mv.voluntario?.nome ?? '—',
              left: {
                type: 'image',
                source:
                  mv.voluntario?.fotoThumbUrl || mv.voluntario?.fotoUrl
                    ? { uri: mv.voluntario.fotoThumbUrl || mv.voluntario.fotoUrl || '' }
                    : AppImages.emptyProfile,
              },
              value: mv.id,
            }) as DropDownItemProps<string>,
        )
        .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })),
    [voluntarios],
  );

  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selected);
      setSelected(undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Indicar voluntário'
      closeDisabled={isSubmitting}
      footer={
        <View style={styles.buttons}>
          <FancyButton
            label='Voltar'
            type='outlined'
            onPress={onClose}
            disabled={isSubmitting}
            containerStyle={styles.btnFlex}
          />
          <FancyButton
            label='Confirmar'
            type='contained'
            onPress={() => void handleConfirm()}
            disabled={isBusy || !selected}
            isLoading={isSubmitting}
            loadingText='Indicando...'
            containerStyle={styles.btnFlex}
          />
        </View>
      }
    >
      <FancySearchSelect
        listItems={items}
        value={selected}
        onChange={(v) => setSelected(Array.isArray(v) ? v[0] : v)}
        isLoading={isLoading}
        searchPlaceholder='Buscar voluntário...'
      />
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  buttons: { flexDirection: 'row', gap: 10 },
  btnFlex: { flex: 1 },
});
