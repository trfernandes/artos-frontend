import { useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { EscalaTemplateFuncaoFormData } from '../../../../domain/schemas/escalaTemplateSchema';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import ControlledBottomSheetSelect from '../../../forms/ControlledBottomSheetSelect';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import { useMemo } from 'react';
import { EnumUtils } from '../../../../utils/enum_utils';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import ControlledNumberInput from '../../../forms/ControlledNumberInput';

interface TemplateFuncoesFormProps {
  mode: 'add' | 'edit';
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  funcoesList?: DropDownItemProps<string>[];
}

export default function TemplateFuncoesForm({
  mode = 'add',
  visible,
  onClose,
  onConfirm,
  funcoesList,
}: TemplateFuncoesFormProps) {
  const { control } = useFormContext<EscalaTemplateFuncaoFormData>();
  const sortedFuncoesList = useMemo(
    () =>
      [...(funcoesList ?? [])].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'pt-BR', {
          sensitivity: 'base',
        }),
      ),
    [funcoesList],
  );

  const experiencaList = useMemo<DropDownItemProps<EscalaTemplateExperienciaEnum>[]>(() => {
    return EnumUtils.getDropDownItems(
      EscalaTemplateExperienciaEnum,
      EscalaTemplateExperienciaLabel,
    ).sort(
      (a, b) => Number(a.value) - Number(b.value),
    ) as DropDownItemProps<EscalaTemplateExperienciaEnum>[];
  }, []);

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title={mode === 'add' ? 'Adicionar Função' : 'Editar Função'}
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
        <ControlledSearchSelect
          control={control}
          name='funcaoId'
          label='Função'
          listItems={sortedFuncoesList}
          disabled={mode === 'edit'}
          searchPlaceholder='Buscar função...'
        />
        <ControlledBottomSheetSelect
          control={control}
          name='experiencia'
          label='Experiência'
          listItems={experiencaList}
        />
        <ControlledNumberInput
          control={control}
          name='quantidade'
          title='Quantidade'
          min={1}
          max={10}
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
