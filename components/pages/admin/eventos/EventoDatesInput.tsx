import { useEffect, useRef, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { Control, Controller, Path, useFormContext } from 'react-hook-form';
import { addHours, format } from 'date-fns';
import FancyErrorText from '../../../forms/FancyErrorText';
import { EventoFormData } from '../../../../domain/schemas/eventoSchema';
import DefaultIcons from '../../../FancyIcons';
import { RecorrenciaEnum } from '../../../../domain/enums/Evento/recorrencia.enum';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import { ColorUtils } from '../../../../utils/color_utils';
import ModernDatePickerField from '../../../datepicker/ModernDatePickerField';
import ModernTimePickerField from '../../../time_picker/ModernTimePickerField';

const ONE_HOUR_MS = 60 * 60 * 1000;
const UNDO_REMOVE_END_TIMEOUT_MS = 4000;

function getSafeDurationMs(start?: Date, end?: Date) {
  if (!start || !end) return null;
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;

  const diff = endMs - startMs;
  return diff > 0 ? diff : null;
}

function shiftEndPreservingDuration(previousStart: Date, previousEnd: Date, nextStart: Date) {
  const preservedDuration = getSafeDurationMs(previousStart, previousEnd) ?? ONE_HOUR_MS;
  return new Date(nextStart.getTime() + preservedDuration);
}

function formatDurationLabel(durationMs?: number | null) {
  if (!durationMs || durationMs <= 0) return null;

  const totalMinutes = Math.round(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
}

export default function EventoDatesInput({
  disabled = false,
  onClearEndDate,
}: {
  disabled?: boolean;
  onClearEndDate?: () => void;
}) {
  const palette = usePallete();
  const undoRemoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastRemovedEndState, setLastRemovedEndState] = useState<{
    dataTermino: Date;
    recorrencia: RecorrenciaEnum | undefined;
  } | null>(null);
  const {
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<EventoFormData>();

  const dataInicioWatch = watch('dataInicio');
  const dataTerminoWatch = watch('dataTermino');
  const hasEndDate = !!dataTerminoWatch;
  const hasUndoRemoveFeedback = !!lastRemovedEndState;
  const durationMs = getSafeDurationMs(dataInicioWatch, dataTerminoWatch);
  const durationLabel = formatDurationLabel(durationMs);
  const isEndBeforeStart =
    !!dataInicioWatch &&
    !!dataTerminoWatch &&
    dataTerminoWatch.getTime() <= dataInicioWatch.getTime();
  const shouldShowFooterStatus = isEndBeforeStart || (!hasEndDate && !hasUndoRemoveFeedback);

  const clearUndoRemoveTimeout = () => {
    if (undoRemoveTimeoutRef.current) {
      clearTimeout(undoRemoveTimeoutRef.current);
      undoRemoveTimeoutRef.current = null;
    }
  };

  const hideUndoRemoveFeedback = () => {
    clearUndoRemoveTimeout();
    setLastRemovedEndState(null);
  };

  useEffect(() => {
    return () => clearUndoRemoveTimeout();
  }, []);

  const handleAddEndDate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hideUndoRemoveFeedback();
    const newDate = addHours(getValues('dataInicio'), 1);
    setValue('dataTermino', newDate, { shouldDirty: true, shouldValidate: true });
    onClearEndDate?.();
  };

  const handleRemoveEndDate = () => {
    const currentEndDate = getValues('dataTermino');
    if (!currentEndDate) return;

    const currentRecorrencia = getValues('recorrencia');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    clearUndoRemoveTimeout();
    setLastRemovedEndState({
      dataTermino: new Date(currentEndDate),
      recorrencia: currentRecorrencia,
    });
    undoRemoveTimeoutRef.current = setTimeout(() => {
      setLastRemovedEndState(null);
      undoRemoveTimeoutRef.current = null;
    }, UNDO_REMOVE_END_TIMEOUT_MS);
    setValue('dataTermino', undefined, { shouldDirty: true, shouldValidate: true });
    setValue('recorrencia', RecorrenciaEnum.Semanal, { shouldDirty: true, shouldValidate: true });
    onClearEndDate?.();
  };

  const handleUndoRemoveEndDate = () => {
    if (!lastRemovedEndState) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    clearUndoRemoveTimeout();

    setValue('dataTermino', new Date(lastRemovedEndState.dataTermino), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('recorrencia', lastRemovedEndState.recorrencia ?? RecorrenciaEnum.Semanal, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setLastRemovedEndState(null);
  };

  const handleStartDateTimeChange = (nextStart: Date, previousStart: Date) => {
    const currentEnd = getValues('dataTermino');
    if (!currentEnd) return;

    const nextEnd = shiftEndPreservingDuration(previousStart, currentEnd, nextStart);

    if (nextEnd.getTime() !== currentEnd.getTime()) {
      setValue('dataTermino', nextEnd, { shouldDirty: true, shouldValidate: true });
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: palette.backgroundColor,
      borderColor: palette.borderCard,
      ...palette.shadows[100],
    },
  ];

  const chipStyle = {
    backgroundColor: palette.backgroundColor4,
    borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
  };

  const combinedErrors = [errors.dataInicio?.message, errors.dataTermino?.message]
    .filter(Boolean)
    .join('\n');

  return (
    <View style={{ gap: 4 }}>
      <View style={cardStyle}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='calendar-clock-outline'
              size={18}
              color={disabled ? palette.fonts.inactive2 : palette.primary}
            />
            <FancyText
              size='small'
              type='bold'
              color={disabled ? palette.fonts.inactive2 : palette.fonts.dark}
            >
              Data e hora
            </FancyText>
          </View>

          {durationLabel && (
            <View style={[styles.durationBadge, { backgroundColor: palette.backgroundColor4 }]}>
              <FancyText size='extraSmall' type='semiBold' color={palette.primary}>
                {`Duração: ${durationLabel}`}
              </FancyText>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: palette.borderCard }]} />

        <View style={styles.section}>
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            Início
          </FancyText>
          <DateInput
            control={control}
            name='dataInicio'
            disabled={disabled}
            chipStyle={chipStyle}
            onChange={handleStartDateTimeChange}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: palette.borderCard }]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
              Término
            </FancyText>

            {!hasEndDate && (
              <InlineActionButton
                label='Configurar término'
                disabled={disabled}
                tone='primary'
                onPress={handleAddEndDate}
              />
            )}
          </View>

          {hasEndDate ? (
            <View style={styles.endDateRow}>
              <DateInput
                control={control}
                name='dataTermino'
                disabled={disabled}
                chipStyle={chipStyle}
              />
              <IconActionButton
                iconName='trash-2'
                disabled={disabled}
                accessibilityLabel='Remover término'
                onPress={handleRemoveEndDate}
              />
            </View>
          ) : (
            <View style={[styles.semDataChip, { backgroundColor: palette.backgroundColor2 }]}>
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                Sem término
              </FancyText>
            </View>
          )}

          {!hasEndDate && hasUndoRemoveFeedback && (
            <View
              style={[
                styles.undoRow,
                { backgroundColor: palette.backgroundColor4, borderColor: palette.borderCard },
              ]}
            >
              <FancyText
                size='extraSmall'
                type='medium'
                color={palette.fonts.inactive}
                style={{ flex: 1 }}
              >
                Término removido
              </FancyText>
              <Pressable
                disabled={disabled}
                onPress={handleUndoRemoveEndDate}
                style={({ pressed }) => [
                  styles.undoAction,
                  pressed && !disabled ? { opacity: 0.65 } : null,
                ]}
                accessibilityRole='button'
                accessibilityLabel='Desfazer remoção do término'
              >
                <FancyText
                  size='extraSmall'
                  type='semiBold'
                  color={disabled ? palette.fonts.inactive2 : palette.primary}
                >
                  Desfazer
                </FancyText>
              </Pressable>
            </View>
          )}
        </View>

        {shouldShowFooterStatus && (
          <>
            <View style={[styles.divider, { backgroundColor: palette.borderCard }]} />

            <View style={styles.footerRow}>
              <DefaultIcons.Custom
                library='Feather'
                name={isEndBeforeStart ? 'alert-triangle' : 'minus-circle'}
                size={13}
                color={isEndBeforeStart ? palette.error : palette.fonts.inactive}
              />
              <FancyText
                size='extraSmall'
                type='medium'
                color={isEndBeforeStart ? palette.error : palette.fonts.inactive}
                style={{ flex: 1 }}
              >
                {isEndBeforeStart
                  ? 'Término deve ser depois do início'
                  : 'Evento sem horário de término'}
              </FancyText>
            </View>
          </>
        )}
      </View>

      <FancyErrorText message={combinedErrors} />
    </View>
  );
}

function DateInput({
  control,
  disabled,
  name,
  onChange,
  chipStyle,
}: {
  control: Control<EventoFormData>;
  disabled?: boolean;
  name: Path<EventoFormData>;
  onChange?: (date: Date, previousDate: Date) => void;
  chipStyle?: object;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange: fieldOnChange, value } }) => {
        if (!value) return <></>;

        return (
          <View style={styles.dateRow}>
            <ModernDatePickerField
              disabled={disabled}
              value={value as Date}
              panelProps={{ buttonStyle: chipStyle }}
              sheetProps={{ quickActions: ['today', 'tomorrow'] }}
              onChange={(date) => {
                const day = format(date, 'dd');
                const month = format(date, 'MM');
                const year = format(date, 'yyyy');
                const hour = format(value as Date, 'HH');
                const minutes = format(value as Date, 'mm');
                const newDate = new Date(
                  Number(year),
                  Number(month) - 1,
                  Number(day),
                  Number(hour),
                  Number(minutes),
                );
                if (date.getTime() !== newDate.getTime()) {
                  const previousValue = value as Date;
                  fieldOnChange(newDate);
                  onChange?.(newDate, previousValue);
                }
              }}
            />
            <ModernTimePickerField
              disabled={disabled}
              value={{
                hour: Number(format(value as Date, 'HH')),
                minute: Number(format(value as Date, 'mm')),
              }}
              panelProps={{ buttonStyle: chipStyle }}
              sheetProps={{
                minuteStep: 5,
                allowManualInput: true,
                quickActions: ['now', '+30m', '+1h'],
              }}
              onChange={(time) => {
                const y = (value as Date).getFullYear();
                const m = (value as Date).getMonth();
                const d = (value as Date).getDate();
                const newDate = new Date(y, m, d, time.hour, time.minute);
                if ((value as Date)?.getTime() !== newDate.getTime()) {
                  const previousValue = value as Date;
                  fieldOnChange(newDate);
                  onChange?.(newDate, previousValue);
                }
              }}
            />
          </View>
        );
      }}
    />
  );
}

// ── Estilos ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 0.6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  endDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  semDataChip: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconActionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  undoRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  undoAction: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  actionButton: {
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

function InlineActionButton({
  label,
  onPress,
  disabled,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger';
}) {
  const palette = usePallete();
  const color =
    tone === 'danger'
      ? disabled
        ? palette.fonts.inactive2
        : palette.error
      : disabled
        ? palette.fonts.inactive2
        : palette.primary;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && !disabled ? { opacity: 0.6 } : null]}
      accessibilityRole='button'
      accessibilityLabel={label}
    >
      <View style={styles.actionButtonRow}>
        <FancyText size='small' type='semiBold' color={color} numberOfLines={1}>
          {label}
        </FancyText>
        {tone === 'primary' && (
          <DefaultIcons.Custom library='Feather' name='chevron-right' size={14} color={color} />
        )}
      </View>
    </Pressable>
  );
}

function IconActionButton({
  iconName,
  accessibilityLabel,
  onPress,
  disabled,
}: {
  iconName: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const palette = usePallete();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.iconActionButton,
        {
          backgroundColor:
            pressed && !disabled
              ? ColorUtils.withAlpha(palette.error, 0.08)
              : palette.backgroundColor2,
          borderColor:
            pressed && !disabled ? ColorUtils.withAlpha(palette.error, 0.25) : palette.borderCard,
          opacity: disabled ? 0.65 : 1,
        },
      ]}
    >
      <DefaultIcons.Custom
        library='Feather'
        name={iconName}
        size={16}
        color={disabled ? palette.fonts.inactive2 : palette.fonts.inactive}
      />
    </Pressable>
  );
}
