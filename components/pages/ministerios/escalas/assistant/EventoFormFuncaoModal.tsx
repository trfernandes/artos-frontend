import { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyChips from '../../../../FancyChips';
import FancyText from '../../../../FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';
import ControlledBottomSheetSelect from '../../../../forms/ControlledBottomSheetSelect';
import { EnumUtils } from '../../../../../utils/enum_utils';
import {
  EscalaEventoTemplateFuncaoFormData,
  EscalaEventoTemplateFuncaoSchema,
} from '../../../../../domain/schemas/escalaSchema';
import { strfyObj } from '../../../../../utils/text_utils';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import {
  EscalaTemplateExperienciaEnum,
  EscalaTemplateExperienciaLabel,
} from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';

export interface EventoFormFuncaoModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  data?: EscalaEventoTemplateFuncaoFormData;
  funcoesSelectionList: DropDownItemProps<string>[];
  isSaving?: boolean;
  onClose: () => void;
  onSubmit: (data: EscalaEventoTemplateFuncaoFormData) => void;
}

export default function EventoFormFuncaoModal({
  visible,
  mode,
  data,
  funcoesSelectionList,
  isSaving,
  onClose,
  onSubmit,
}: EventoFormFuncaoModalProps) {
  const palette = usePallete();
  const form = useForm<EscalaEventoTemplateFuncaoFormData>({
    resolver: zodResolver(EscalaEventoTemplateFuncaoSchema),
    defaultValues: data || { quantidade: 1 },
  });

  useEffect(() => {
    if (!visible) return;
    form.reset(data || { quantidade: 1 });
  }, [visible, data]);

  const handleConfirm = () => {
    form.handleSubmit(
      (values) => onSubmit(values),
      (errors) => console.log('Erro no formulário de adição de equipe', strfyObj(errors)),
    )();
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title={mode === 'add' ? 'Nova Função' : 'Editar Função'}
      footer={
        <FancyButton
          label={mode === 'add' ? 'Adicionar' : 'Salvar'}
          type='contained'
          isLoading={isSaving}
          onPress={handleConfirm}
          containerStyle={{ marginBottom: 8 }}
        />
      }
    >
      <View style={{ gap: 12 }}>
        <ControlledSearchSelect
          control={form.control}
          name='funcaoId'
          listItems={funcoesSelectionList}
          label='Função'
          disabled={mode === 'edit'}
          searchPlaceholder='Buscar função...'
        />
        <ControlledBottomSheetSelect
          control={form.control}
          name='experiencia'
          label='Experiência'
          listItems={EnumUtils.getDropDownItems(
            EscalaTemplateExperienciaEnum,
            EscalaTemplateExperienciaLabel,
          )}
        />
        <Controller
          control={form.control}
          name='quantidade'
          render={({ field: { value, onChange } }) => {
            const base = [1, 2, 3, 4, 5, 6];
            const options = value && value > 6 ? [...base, value] : base;
            return (
              <View style={{ gap: 8 }}>
                <FancyText type='semiBold' size='small' color={palette.fonts.inactive}>
                  Quantidade
                </FancyText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {options.map((n) => {
                    const selected = value === n;
                    return (
                      <FancyChips
                        key={n}
                        label={String(n)}
                        onPress={() => onChange(n)}
                        outlined={!selected}
                        color={selected ? palette.fonts.light : palette.fonts.inactive}
                        backgroundColor={selected ? palette.primary : undefined}
                        style={{
                          minWidth: 46,
                          minHeight: 44,
                          paddingHorizontal: 14,
                          justifyContent: 'center',
                        }}
                        labelProps={{ style: { fontSize: 15 } }}
                      />
                    );
                  })}
                </View>
              </View>
            );
          }}
        />
      </View>
    </FancyBottomSheetModal>
  );
}
