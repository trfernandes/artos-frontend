import { useFormContext } from 'react-hook-form';
import { EscalaTemplateVoluntarioFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import ControlledBottomSheetSelect from '../../../forms/ControlledBottomSheetSelect';
import { StyleSheet, View } from 'react-native';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { useMemo } from 'react';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';

interface TemplateFixoEquipeFormProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  voluntarioList?: DropDownItemProps<string>[];
  funcoesList?: DropDownItemProps<string>[];
}

export default function TemplateFixoEquipeForm({
  visible,
  onClose,
  onConfirm,
  voluntarioList,
  funcoesList,
}: TemplateFixoEquipeFormProps) {
  const { control } = useFormContext<EscalaTemplateVoluntarioFormData>();
  const sortedVoluntarioList = useMemo(
    () =>
      [...(voluntarioList ?? [])].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'pt-BR', {
          sensitivity: 'base',
        }),
      ),
    [voluntarioList],
  );
  const sortedFuncoesList = useMemo(
    () =>
      [...(funcoesList ?? [])].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'pt-BR', {
          sensitivity: 'base',
        }),
      ),
    [funcoesList],
  );

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Adicionar Voluntário'
      footer={
        <View style={styles.buttonsRow}>
          <FancyButton
            label='Cancelar'
            type='outlined'
            onPress={onClose}
            containerStyle={styles.button}
          />
          <FancyButton label='Confirmar' onPress={onConfirm} containerStyle={styles.button} />
        </View>
      }
    >
      <View style={{ gap: 15 }}>
        <ControlledBottomSheetSelect
          control={control}
          name='voluntarioId'
          label='Voluntário'
          listItems={sortedVoluntarioList}
        />
        <ControlledBottomSheetSelect
          control={control}
          name='funcaoId'
          label='Função'
          listItems={sortedFuncoesList}
        />
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 36,
  },
});
