import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import FancyText from '../../../FancyText';
import { useFormContext } from 'react-hook-form';
import { generateRecorrenciaJoinableDescription } from '../../../../hooks/useEventosCrud';
import FancyErrorText from '../../../forms/FancyErrorText';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';
import { RecorrenciaEnum } from '../../../../domain/enums/Evento/recorrencia.enum';
import FancySegmentedControl from '../../../fields/FancySegmentedControl';
import { FancyAlert } from '../../../modal/FancyAlert';
import { usePallete } from '../../../../hooks/usePallete';
import DefaultIcons from '../../../FancyIcons';
import { ColorUtils } from '../../../../utils/color_utils';

export type RecorrenciaValue = { type: 'Nunca' } | { type: 'Personalizado' };
export type EventoRepeticaoInputProps = {
  disabled?: boolean;
  setRepeticaoModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const RECORRENCIA_OPTIONS = [
  { label: 'Nunca', value: 'NUNCA' as const },
  { label: 'Personalizado', value: 'PERSONALIZADO' as const },
];

export default function EventoRepeticaoInput({
  disabled = false,
  setRepeticaoModalVisible,
}: EventoRepeticaoInputProps) {
  const palette = usePallete();
  const {
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<EventoFormData>();

  const recorrencia = watch('recorrencia');
  const recorrenciaSemanaDias = watch('recorrenciaSemanaDias');
  const recorrenciaSemanasMes = watch('recorrenciaSemanasMes');

  const isPersonalizado = recorrencia !== undefined && recorrencia !== RecorrenciaEnum.Nunca;
  const isConfigurado =
    (recorrenciaSemanaDias?.length ?? 0) > 0 || (recorrenciaSemanasMes?.length ?? 0) > 0;

  const handleRecorrenciaChange = (v: 'NUNCA' | 'PERSONALIZADO') => {
    if (v === 'NUNCA') {
      if (isConfigurado) {
        FancyAlert.alert('Limpar recorrência?', 'Os dias configurados serão removidos.', [
          { text: 'Cancelar', style: 'destructive', onPress: () => {} },
          {
            text: 'Confirmar',
            onPress: () => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setValue('recorrencia', RecorrenciaEnum.Nunca);
              setValue('recorrenciaSemanaDias', []);
              setValue('recorrenciaSemanasMes', []);
              setValue('recorrenciaACadaMeses', undefined as any);
            },
          },
        ]);
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setValue('recorrencia', RecorrenciaEnum.Nunca);
      }
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setValue('recorrencia', RecorrenciaEnum.Semanal);
      setRepeticaoModalVisible(true);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <FancySegmentedControl
        label='Recorrência'
        options={RECORRENCIA_OPTIONS}
        value={isPersonalizado ? 'PERSONALIZADO' : 'NUNCA'}
        onChange={handleRecorrenciaChange}
        disabled={disabled}
      />

      {isPersonalizado && (
        <>
          <Pressable
            onPress={() => setRepeticaoModalVisible(true)}
            style={({ pressed }) => [
              styles.resumoCard,
              {
                backgroundColor: palette.backgroundColor2,
                borderColor: ColorUtils.withAlpha(palette.primary, 0.16),
              },
              pressed && { opacity: 0.78 },
            ]}
          >
            <View style={[styles.resumoBorder, { backgroundColor: palette.primary }]} />
            {isConfigurado ? (
              <>
                <FancyText
                  size='small'
                  type='medium'
                  color={palette.fonts.dark}
                  style={styles.resumoText}
                >
                  {getValues('recorrencia') !== undefined &&
                    generateRecorrenciaJoinableDescription(
                      getValues('recorrencia')!,
                      getValues('recorrenciaSemanaDias')!,
                      getValues('recorrenciaACadaMeses')!,
                      getValues('recorrenciaSemanasMes')!,
                    )}
                </FancyText>
                <View style={styles.linkRow}>
                  <FancyText size='small' type='semiBold' color={palette.primary}>
                    Configurar
                  </FancyText>
                  <DefaultIcons.Custom
                    library='Feather'
                    name='chevron-right'
                    size={14}
                    color={palette.primary}
                  />
                </View>
              </>
            ) : (
              <>
                <FancyText
                  size='small'
                  type='normal'
                  color={palette.fonts.inactive}
                  style={styles.resumoText}
                >
                  Nenhum dia configurado
                </FancyText>
                <View style={styles.linkRow}>
                  <FancyText size='small' type='semiBold' color={palette.primary}>
                    Configurar
                  </FancyText>
                  <DefaultIcons.Custom
                    library='Feather'
                    name='chevron-right'
                    size={14}
                    color={palette.primary}
                  />
                </View>
              </>
            )}
          </Pressable>
        </>
      )}

      {(errors.recorrencia ||
        errors.recorrenciaACadaMeses ||
        errors.recorrenciaSemanaDias ||
        errors.recorrenciaSemanasMes) && (
        <FancyErrorText
          message={`${errors.recorrencia ? errors.recorrencia?.message + '\n' : ''} ${
            errors.recorrenciaACadaMeses ? errors.recorrenciaACadaMeses?.message + '\n' : ''
          } ${errors.recorrenciaSemanaDias ? errors.recorrenciaSemanaDias?.message + '\n' : ''} ${
            errors.recorrenciaSemanasMes ? errors.recorrenciaSemanasMes?.message : ''
          }`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 12,
  },
  resumoText: {
    flex: 1,
    minWidth: 0,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    marginLeft: 8,
  },
  resumoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 11,
  },
  resumoBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
});
