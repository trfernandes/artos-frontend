import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import FancyBottomSheetModal from '../modal/FancyBottomSheetModal';
import FancyButton from '../buttons/FancyButton';
import FancyCalendar from '../calendar/FancyCalendar';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';

export type ModernDateQuickAction = 'today' | 'tomorrow';

export type ModernDatePickerSheetProps = {
  visible: boolean;
  value?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disablePastDates?: boolean;
  title?: string;
  quickActions?: ModernDateQuickAction[];
};

function normalizeDay(date?: Date) {
  if (!date) return undefined;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function clampDay(candidate: Date, min?: Date, max?: Date) {
  const day = normalizeDay(candidate)!;
  const minDay = normalizeDay(min);
  const maxDay = normalizeDay(max);

  if (minDay && isBefore(day, minDay)) return new Date(minDay);
  if (maxDay && isAfter(day, maxDay)) return new Date(maxDay);
  return day;
}

function sameDay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function ModernDatePickerSheet({
  visible,
  value,
  onClose,
  onConfirm,
  minimumDate,
  maximumDate,
  disablePastDates = false,
  title = 'Selecionar data',
  quickActions = ['today', 'tomorrow'],
}: ModernDatePickerSheetProps) {
  const palette = usePallete();
  const [draftDate, setDraftDate] = useState<Date>(value ? new Date(value) : new Date());

  const effectiveMinDate = useMemo(() => {
    const min = normalizeDay(minimumDate);
    if (!disablePastDates) return min;

    const today = startOfDay(new Date());
    if (!min) return today;
    return isBefore(min, today) ? today : min;
  }, [minimumDate, disablePastDates]);

  useEffect(() => {
    if (!visible) return;
    const source = value ? new Date(value) : new Date();
    setDraftDate(clampDay(source, effectiveMinDate, maximumDate));
  }, [visible, value, effectiveMinDate, maximumDate]);

  const quickActionDate = (action: ModernDateQuickAction) => {
    const base = startOfDay(new Date());
    const target = action === 'tomorrow' ? addDays(base, 1) : base;
    setDraftDate(clampDay(target, effectiveMinDate, maximumDate));
  };

  const footer = (
    <View style={styles.footerButtons}>
      <FancyButton
        label='Cancelar'
        type='outlined'
        onPress={onClose}
        containerStyle={styles.footerButton}
      />
      <FancyButton
        label='Confirmar'
        onPress={() => onConfirm(draftDate)}
        containerStyle={styles.footerButton}
      />
    </View>
  );

  return (
    <FancyBottomSheetModal visible={visible} onClose={onClose} title={title} footer={footer}>
      <View style={styles.container}>
        {quickActions.length > 0 && (
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => {
              const label = action === 'today' ? 'Hoje' : 'Amanhã';
              const preview =
                action === 'today' ? startOfDay(new Date()) : addDays(startOfDay(new Date()), 1);
              const previewClamped = clampDay(preview, effectiveMinDate, maximumDate);
              const selected = sameDay(previewClamped, draftDate);

              return (
                <QuickActionChip
                  key={action}
                  label={label}
                  selected={selected}
                  onPress={() => quickActionDate(action)}
                />
              );
            })}
          </View>
        )}

        <FancyCalendar
          containerStyle={[styles.calendar, { backgroundColor: 'transparent', borderWidth: 0 }]}
          dayModeTopPadding={10}
          value={draftDate}
          onChangeSelectedDate={(d) => setDraftDate(new Date(d))}
          minimumDate={effectiveMinDate}
          maximumDate={maximumDate}
          dayViewProps={{ disablePastDates }}
        />

        <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
          Toque em uma data e confirme.
        </FancyText>
      </View>
    </FancyBottomSheetModal>
  );
}

function QuickActionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const palette = usePallete();

  return (
    <FancyButton
      label={label}
      type={selected ? 'contained' : 'light'}
      size={{ h: 34, w: 84 }}
      onPress={onPress}
      containerStyle={[
        styles.quickActionChip,
        !selected && {
          borderWidth: 1,
          borderColor: palette.borderCard,
          backgroundColor: palette.backgroundColor4,
        },
      ]}
      labelProps={{ size: 'extraSmall', type: 'semiBold' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickActionChip: {
    minWidth: 0,
  },
  calendar: {
    marginHorizontal: 0,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  footerButton: {
    flex: 1,
    height: 40,
  },
});
