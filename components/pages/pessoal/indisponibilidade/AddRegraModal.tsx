import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useForm, useWatch, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import FancyErrorText from '../../../forms/FancyErrorText';
import ControlledDateInput from '../../../forms/ControlledDateInput';
import ControlledNumberInput from '../../../forms/ControlledNumberInput';
import ControlledFancyToggle from '../../../forms/ControlledFancyToggle';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import FancySegmentedControl from '../../../fields/FancySegmentedControl';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import { ColorUtils } from '../../../../utils/color_utils';
import { RegraIndisponibilidadeTipo } from '../../../../domain/dtos/RegraIndisponibilidadeVoluntario/regra-indisponibilidade-voluntario.response';

const DIAS_NOMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TODOS_DIAS = [0, 1, 2, 3, 4, 5, 6];

function AnimatedDiaChip({
  onPress,
  isSelected,
  children,
  style,
}: {
  onPress: () => void;
  isSelected: boolean;
  children: React.ReactNode;
  style: object;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () =>
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole='checkbox'
      accessibilityState={{ checked: isSelected }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const schema = z
  .object({
    tipo: z.enum(['DIAS_SEMANA', 'PERIODO', 'LIMITE_MENSAL']),
    diasSemana: z.array(z.number()).optional(),
    dataInicio: z.date().nullable().optional(),
    dataFim: z.date().nullable().optional(),
    recorrente: z.boolean().optional(),
    limiteMensal: z.number().optional(),
    motivo: z.string().trim().min(1, 'Informe o motivo').max(255, 'Máximo de 255 caracteres'),
  })
  .superRefine((val, ctx) => {
    if (val.tipo === 'DIAS_SEMANA' && (!val.diasSemana || val.diasSemana.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['diasSemana'],
        message: 'Selecione ao menos um dia da semana',
      });
    }
    if (val.tipo === 'PERIODO') {
      if (!val.dataInicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dataInicio'],
          message: 'Data inicial obrigatória',
        });
      }
      if (!val.dataFim) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dataFim'],
          message: 'Data final obrigatória',
        });
      }
      if (val.dataInicio && val.dataFim && !val.recorrente && val.dataFim < val.dataInicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dataFim'],
          message: 'Data final deve ser ≥ data inicial',
        });
      }
    }
    if (val.tipo === 'LIMITE_MENSAL') {
      if (!val.limiteMensal || val.limiteMensal < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['limiteMensal'],
          message: 'Informe o limite (mínimo 1)',
        });
      }
      if (!val.dataInicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dataInicio'],
          message: 'Data de início obrigatória',
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

export type AddRegraModalResult = {
  tipo: RegraIndisponibilidadeTipo;
  diasSemana?: number[];
  dataInicio?: string;
  dataFim?: string;
  recorrente?: boolean;
  limiteMensal?: number;
  motivo?: string;
};

export type AddRegraModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (result: AddRegraModalResult) => void;
  initialValues?: Partial<AddRegraModalResult>;
  isEditing?: boolean;
};

export default function AddRegraModal({
  visible,
  onClose,
  onConfirm,
  initialValues,
  isEditing,
}: AddRegraModalProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  const { control, handleSubmit, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: 'DIAS_SEMANA',
      diasSemana: [],
      dataInicio: null,
      dataFim: null,
      recorrente: false,
      limiteMensal: 2,
      motivo: '',
    },
  });

  useEffect(() => {
    if (visible && initialValues) {
      reset({
        tipo: initialValues.tipo ?? 'DIAS_SEMANA',
        diasSemana: initialValues.diasSemana ?? [],
        dataInicio: initialValues.dataInicio
          ? new Date(initialValues.dataInicio + 'T00:00:00Z')
          : null,
        dataFim: initialValues.dataFim ? new Date(initialValues.dataFim + 'T00:00:00Z') : null,
        recorrente: initialValues.recorrente ?? false,
        limiteMensal: initialValues.limiteMensal ?? 2,
        motivo: initialValues.motivo ?? '',
      });
    } else if (!visible) {
      reset({
        tipo: 'DIAS_SEMANA',
        diasSemana: [],
        dataInicio: null,
        dataFim: null,
        recorrente: false,
        limiteMensal: 2,
        motivo: '',
      });
    }
  }, [visible, initialValues, reset]);

  const tipo = useWatch({ control, name: 'tipo' });
  const diasSemana = useWatch({ control, name: 'diasSemana' }) ?? [];
  const dataInicio = useWatch({ control, name: 'dataInicio' });
  const dataFim = useWatch({ control, name: 'dataFim' });
  const { errors } = useFormState({ control });

  useEffect(() => {
    if (dataInicio && dataFim && dataFim < dataInicio) {
      setValue('dataFim', dataInicio, { shouldValidate: true });
    }
  }, [dataInicio, dataFim, setValue]);

  const toggleDia = (idx: number) => {
    const next = diasSemana.includes(idx)
      ? diasSemana.filter((d) => d !== idx)
      : [...diasSemana, idx];
    setValue('diasSemana', next, { shouldValidate: true });
  };

  const setAtalho = (dias: number[]) => {
    setValue('diasSemana', dias, { shouldValidate: true });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    const result: AddRegraModalResult = { tipo: values.tipo as RegraIndisponibilidadeTipo };
    if (values.tipo === 'DIAS_SEMANA') {
      result.diasSemana = values.diasSemana;
    } else if (values.tipo === 'PERIODO') {
      result.dataInicio = values.dataInicio
        ? values.dataInicio.toISOString().slice(0, 10)
        : undefined;
      result.dataFim = values.dataFim ? values.dataFim.toISOString().slice(0, 10) : undefined;
      result.recorrente = values.recorrente;
    } else if (values.tipo === 'LIMITE_MENSAL') {
      result.limiteMensal = values.limiteMensal;
      result.dataInicio = values.dataInicio
        ? values.dataInicio.toISOString().slice(0, 10)
        : undefined;
    }
    result.motivo = values.motivo.trim();
    onConfirm(result);
    reset();
  };

  const TIPOS: { label: string; value: RegraIndisponibilidadeTipo }[] = [
    { label: 'Semanal', value: 'DIAS_SEMANA' },
    { label: 'Período', value: 'PERIODO' },
    { label: 'Mensal', value: 'LIMITE_MENSAL' },
  ];

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={handleClose}
      title={isEditing ? 'Editar regra de indisponibilidade' : 'Nova regra de indisponibilidade'}
      footer={
        <View style={styles.footerActions}>
          <FancyButton
            label='Cancelar'
            type='outlined'
            onPress={handleClose}
            containerStyle={styles.footerButton}
          />
          <FancyButton
            label={isEditing ? 'Atualizar' : 'Salvar'}
            onPress={handleSubmit(onSubmit)}
            containerStyle={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.content}>
        <FancySegmentedControl<RegraIndisponibilidadeTipo>
          label='Tipo de regra'
          options={TIPOS}
          value={tipo}
          onChange={(v) => setValue('tipo', v, { shouldValidate: false })}
        />

        {/* DIAS_SEMANA */}
        {tipo === 'DIAS_SEMANA' && (
          <View style={styles.secao}>
            <FancyText size='small' type='semiBold' color={palette.fonts.inactive}>
              Dias da semana
            </FancyText>
            {errors.diasSemana && <FancyErrorText message={errors.diasSemana.message as string} />}
            <View style={styles.chipRow}>
              {(() => {
                const todosSelected = TODOS_DIAS.every((d) => diasSemana.includes(d));
                return (
                  <AnimatedDiaChip
                    onPress={() => setAtalho(todosSelected ? [] : TODOS_DIAS)}
                    isSelected={todosSelected}
                    style={[
                      styles.chip,
                      todosSelected
                        ? { backgroundColor: palette.secondary, borderColor: palette.secondary }
                        : {
                            backgroundColor: ColorUtils.withAlpha(palette.secondary, 0.1),
                            borderColor: ColorUtils.withAlpha(palette.secondary, 0.25),
                          },
                    ]}
                  >
                    <FancyText
                      size='small'
                      type='bold'
                      color={todosSelected ? palette.fonts.light : palette.secondary}
                    >
                      Todos
                    </FancyText>
                  </AnimatedDiaChip>
                );
              })()}
              {DIAS_NOMES.map((nome, idx) => {
                const sel = diasSemana.includes(idx);
                return (
                  <AnimatedDiaChip
                    key={idx}
                    onPress={() => toggleDia(idx)}
                    isSelected={sel}
                    style={[
                      styles.chip,
                      sel
                        ? { backgroundColor: palette.primary, borderColor: palette.primary }
                        : {
                            backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
                            borderColor: ColorUtils.withAlpha(palette.primary, 0.19),
                          },
                    ]}
                  >
                    <FancyText
                      size='small'
                      type='bold'
                      color={sel ? palette.fonts.light : palette.primary}
                    >
                      {nome}
                    </FancyText>
                  </AnimatedDiaChip>
                );
              })}
            </View>
          </View>
        )}

        {/* PERIODO */}
        {tipo === 'PERIODO' && (
          <View style={styles.secao}>
            <ControlledDateInput control={control} name='dataInicio' label='Data início' />
            <ControlledDateInput control={control} name='dataFim' label='Data fim' />
            <ControlledFancyToggle
              control={control}
              name='recorrente'
              label='Repetir anualmente'
              option1={{ title: 'Não', value: false }}
              option2={{ title: 'Sim', value: true }}
            />
          </View>
        )}

        {/* LIMITE_MENSAL */}
        {tipo === 'LIMITE_MENSAL' && (
          <View style={styles.secao}>
            <ControlledNumberInput
              control={control}
              name='limiteMensal'
              title='Escalas por mês'
              min={1}
              max={31}
            />
            <ControlledDateInput control={control} name='dataInicio' label='A partir de' />
            <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
              Você não será escalado mais que este número de vezes em um mesmo mês, a partir da data
              escolhida.
            </FancyText>
          </View>
        )}

        <ControlledTextArea control={control} name='motivo' label='Motivo' />
      </View>
    </FancyBottomSheetModal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    content: {
      gap: 16,
    },
    footerActions: {
      flexDirection: 'row',
      gap: 10,
      paddingBottom: 2,
    },
    footerButton: {
      flex: 1,
    },
    secao: {
      gap: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
