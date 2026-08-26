import { View, StyleSheet, ModalProps, LayoutAnimation, Pressable } from 'react-native';
import EventoRepeticaoInputCustomSemana from './EventoRepeticaoInputCustomSemana';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import EventoRepeticaoInputCustomMensal from './EventoRepeticaoInputCustomMensal';
import { strfyObj } from '../../../../utils/text_utils';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMonths, format } from 'date-fns';
import { RecorrenciaDiaSemanaEnum } from '../../../../domain/enums/Evento/recorrencia-dia-semana.enum';
import { RecorrenciaSemanaMesEnum } from '../../../../domain/enums/Evento/recorrencia-semana-mes.enum';
import { RecorrenciaEnum } from '../../../../domain/enums/Evento/recorrencia.enum';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';
import FancySegmentedControl from '../../../fields/FancySegmentedControl';
import { generateRecorrenciaJoinableDescription } from '../../../../hooks/useEventosCrud';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import { ColorUtils } from '../../../../utils/color_utils';
import DefaultIcons from '../../../FancyIcons';
import ModernDatePickerField from '../../../datepicker/ModernDatePickerField';

export const schema = z
  .object({
    recorrencia: z.enum(RecorrenciaEnum),
    recorrenciaSemanaDias: z.array(z.enum(RecorrenciaDiaSemanaEnum)).optional(),
    recorrenciaACadaMeses: z.coerce
      .number()
      .int('Informe um número inteiro')
      .min(1, 'O número de meses deve ser maior que 1')
      .max(12, 'O número de meses deve ser menor igual a 12'),
    recorrenciaSemanasMes: z.array(z.enum(RecorrenciaSemanaMesEnum)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.recorrencia === RecorrenciaEnum.Mensal) {
      if (!data.recorrenciaSemanaDias || data.recorrenciaSemanaDias.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaSemanaDias'],
          message: 'Selecione ao menos um dia da semana',
        });
      }
      if (!data.recorrenciaACadaMeses) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaACadaMeses'],
          message: 'Informe o número de meses',
        });
      }
      if (!data.recorrenciaSemanasMes || data.recorrenciaSemanasMes.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaSemanasMes'],
          message: 'Selecione ao menos uma semana do mês',
        });
      }
    } else if (data.recorrencia === RecorrenciaEnum.Semanal) {
      if (!data.recorrenciaSemanaDias || data.recorrenciaSemanaDias.length < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['recorrenciaSemanaDias'],
          message: 'Selecione ao menos um dia da semana',
        });
      }
    }
  });

export type EventoRepeticaoSchemaData = z.infer<typeof schema>;

const FREQUENCIA_OPTIONS = [
  { label: 'Semanal', value: RecorrenciaEnum.Semanal },
  { label: 'Mensal', value: RecorrenciaEnum.Mensal },
];

export default function EventoRepeticaoInputCustom({ modalProps }: { modalProps?: ModalProps }) {
  const palette = usePallete();
  const eventoForm = useFormContext<EventoFormData>();
  const recorrenciaForm = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      recorrencia: eventoForm.getValues('recorrencia') || RecorrenciaEnum.Semanal,
      recorrenciaACadaMeses: eventoForm.getValues('recorrenciaACadaMeses') || 1,
      recorrenciaSemanaDias: eventoForm.getValues('recorrenciaSemanaDias') || [],
      recorrenciaSemanasMes: eventoForm.getValues('recorrenciaSemanasMes') || [],
    },
  });

  const recorrencia = recorrenciaForm.watch('recorrencia');
  const semanaDias = recorrenciaForm.watch('recorrenciaSemanaDias') || [];
  const semanasMes = recorrenciaForm.watch('recorrenciaSemanasMes') || [];
  const aCadaMeses = recorrenciaForm.watch('recorrenciaACadaMeses') || 1;

  // Validade manual: semanal precisa de pelo menos 1 dia; mensal precisa de semana + dia
  const isFormValid =
    recorrencia === RecorrenciaEnum.Semanal
      ? semanaDias.length > 0
      : semanaDias.length > 0 && semanasMes.length > 0;

  const resumoText =
    semanaDias.length > 0
      ? generateRecorrenciaJoinableDescription(
          recorrencia,
          semanaDias as any,
          aCadaMeses as any,
          semanasMes as any,
        )
      : recorrencia === RecorrenciaEnum.Mensal && semanasMes.length > 0
        ? 'Selecione também o dia da semana'
        : recorrencia === RecorrenciaEnum.Mensal
          ? 'Selecione a semana e o dia'
          : 'Selecione ao menos um dia';

  const handleClose = () => modalProps?.onRequestClose?.({} as any);

  return (
    <FancyBottomSheetModal
      visible={modalProps?.visible ?? false}
      onClose={handleClose}
      title='Configuração de recorrência'
      footer={
        <FancyButton
          label='Confirmar'
          icon={{ library: 'Feather', name: 'check', size: 16 }}
          containerStyle={!isFormValid ? { opacity: 0.45 } : undefined}
          disabled={!isFormValid}
          onPress={async (e) => {
            await recorrenciaForm.handleSubmit(
              () => {
                eventoForm.reset({
                  ...eventoForm.getValues(),
                  ...(recorrenciaForm.getValues() as EventoRepeticaoSchemaData),
                });
                handleClose();
              },
              (errors) => console.log(strfyObj(errors)),
            )();
          }}
        />
      }
    >
      <FormProvider {...eventoForm}>
        {/* Frequência */}
        <Controller
          control={recorrenciaForm.control}
          name='recorrencia'
          render={({ field: { value } }) => (
            <FancySegmentedControl
              label='Frequência'
              options={FREQUENCIA_OPTIONS}
              value={value}
              onChange={(v) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                recorrenciaForm.setValue('recorrencia', v as RecorrenciaEnum);
                recorrenciaForm.resetField('recorrenciaACadaMeses', {
                  defaultValue: v === RecorrenciaEnum.Mensal ? 1 : ('' as any),
                });
                recorrenciaForm.resetField('recorrenciaSemanaDias', { defaultValue: [] });
                recorrenciaForm.resetField('recorrenciaSemanasMes', { defaultValue: [] });
              }}
            />
          )}
        />

        {/* Seções específicas por modo */}
        <FormProvider {...recorrenciaForm}>
          {recorrencia === RecorrenciaEnum.Semanal && <EventoRepeticaoInputCustomSemana />}
          {recorrencia === RecorrenciaEnum.Mensal && <EventoRepeticaoInputCustomMensal />}
        </FormProvider>

        {/* Fim da recorrência */}
        <EventoFimRecorrenciaInput />

        {/* Resumo */}
        {isFormValid && (
          <View
            style={[
              styles.resumoCard,
              {
                backgroundColor: palette.backgroundColor2,
                borderColor: ColorUtils.withAlpha(palette.primary, 0.16),
              },
            ]}
          >
            <View style={[styles.resumoBorder, { backgroundColor: palette.primary }]} />
            <FancyText size='small' type='medium' color={palette.fonts.dark}>
              {resumoText}
            </FancyText>
          </View>
        )}
      </FormProvider>
    </FancyBottomSheetModal>
  );
}

function EventoFimRecorrenciaInput() {
  const palette = usePallete();
  const eventoForm = useFormContext<EventoFormData>();

  if (!eventoForm) return null;

  const dataInicio = eventoForm.watch('dataInicio');
  const dataFimRecorrencia = eventoForm.watch('dataFimRecorrencia');
  const hasFim = !!dataFimRecorrencia;

  const chipStyle = {
    backgroundColor: palette.backgroundColor4,
    borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
  };

  const handleAdd = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    eventoForm.setValue('dataFimRecorrencia', addMonths(dataInicio ?? new Date(), 1), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleRemove = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    eventoForm.setValue('dataFimRecorrencia', undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.fimHeaderRow}>
        <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
          Fim da recorrência
        </FancyText>

        {!hasFim && (
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [styles.fimActionButton, pressed && { opacity: 0.6 }]}
            accessibilityRole='button'
            accessibilityLabel='Definir fim da recorrência'
          >
            <View style={styles.fimActionRow}>
              <FancyText size='small' type='semiBold' color={palette.primary}>
                Definir data
              </FancyText>
              <DefaultIcons.Custom
                library='Feather'
                name='chevron-right'
                size={14}
                color={palette.primary}
              />
            </View>
          </Pressable>
        )}
      </View>

      {hasFim ? (
        <View style={styles.fimDateRow}>
          <ModernDatePickerField
            value={dataFimRecorrencia as Date}
            panelProps={{ buttonStyle: chipStyle }}
            sheetProps={{ quickActions: ['today', 'tomorrow'] }}
            onChange={(date) => {
              const day = format(date, 'dd');
              const month = format(date, 'MM');
              const year = format(date, 'yyyy');
              const newDate = new Date(Number(year), Number(month) - 1, Number(day), 23, 59);
              eventoForm.setValue('dataFimRecorrencia', newDate, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
          <Pressable
            onPress={handleRemove}
            accessibilityRole='button'
            accessibilityLabel='Remover fim da recorrência'
            style={({ pressed }) => [
              styles.fimRemoveButton,
              {
                backgroundColor: pressed
                  ? ColorUtils.withAlpha(palette.error, 0.08)
                  : palette.backgroundColor2,
                borderColor: pressed
                  ? ColorUtils.withAlpha(palette.error, 0.25)
                  : palette.borderCard,
              },
            ]}
          >
            <DefaultIcons.Custom
              library='Feather'
              name='trash-2'
              size={16}
              color={palette.fonts.inactive}
            />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.semDataChip, { backgroundColor: palette.backgroundColor2 }]}>
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            Recorrência sem data limite
          </FancyText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  resumoCard: {
    flexDirection: 'row',
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
  fimHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fimActionButton: {
    paddingVertical: 2,
  },
  fimActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  fimDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fimRemoveButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semDataChip: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
