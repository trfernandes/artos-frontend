import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FancyBottomSheetModal from '../modal/FancyBottomSheetModal';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import DateUtils from '../../utils/date_utils';

export type ModernTimeQuickAction = 'now' | '+30m' | '+1h';

export type ModernTimePickerSheetProps = {
  visible: boolean;
  value?: { hour: number; minute: number };
  onClose: () => void;
  onConfirm: (time: { hour: number; minute: number }) => void;
  title?: string;
  minuteStep?: 1 | 5 | 10 | 15;
  allowManualInput?: boolean; // compat: ignorado nesta versão (wheel premium)
  quickActions?: ModernTimeQuickAction[];
  presetTimes?: Array<{ hour: number; minute: number; label?: string }>;
  wheelVisibleRows?: 3 | 5;
};

type TimeValue = { hour: number; minute: number };

const WHEEL_ITEM_HEIGHT = 42;
const DEFAULT_PRESET_TIMES: Array<{ hour: number; minute: number }> = [
  { hour: 8, minute: 0 },
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 19, minute: 0 },
  { hour: 19, minute: 30 },
  { hour: 20, minute: 0 },
  { hour: 21, minute: 0 },
];

const pad2 = (n: number) => n.toString().padStart(2, '0');

function clampTime(time: TimeValue): TimeValue {
  const hour = Math.min(23, Math.max(0, Math.floor(time.hour || 0)));
  const minute = Math.min(59, Math.max(0, Math.floor(time.minute || 0)));
  return { hour, minute };
}

function roundToStep(time: TimeValue, step: number): TimeValue {
  const total = time.hour * 60 + time.minute;
  const rounded = Math.round(total / step) * step;
  const normalized = ((rounded % (24 * 60)) + (24 * 60)) % (24 * 60);
  return { hour: Math.floor(normalized / 60), minute: normalized % 60 };
}

function addMinutesToTime(time: TimeValue, delta: number): TimeValue {
  const total = time.hour * 60 + time.minute + delta;
  const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
  return { hour: Math.floor(normalized / 60), minute: normalized % 60 };
}

function timeEquals(a?: TimeValue, b?: TimeValue) {
  if (!a || !b) return false;
  return a.hour === b.hour && a.minute === b.minute;
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

export default function ModernTimePickerSheet({
  visible,
  value,
  onClose,
  onConfirm,
  title = 'Selecionar horário',
  minuteStep = 5,
  quickActions = ['now', '+30m', '+1h'],
  presetTimes = DEFAULT_PRESET_TIMES,
  wheelVisibleRows = 5,
}: ModernTimePickerSheetProps) {
  const palette = usePallete();
  const [draftTime, setDraftTime] = useState<TimeValue>(clampTime(value ?? { hour: 0, minute: 0 }));

  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);

  const wheelHeight = WHEEL_ITEM_HEIGHT * wheelVisibleRows;
  const centerOffset = (wheelHeight - WHEEL_ITEM_HEIGHT) / 2;

  const minuteOptions = useMemo(() => {
    const items: number[] = [];
    for (let minute = 0; minute < 60; minute += minuteStep) items.push(minute);
    return items;
  }, [minuteStep]);

  const normalizedPresets = useMemo(
    () =>
      presetTimes.map((item) => {
        const rounded = roundToStep(clampTime(item), minuteStep);
        return {
          ...rounded,
          label: item.label ?? DateUtils.formatHour(rounded.hour, rounded.minute),
        };
      }),
    [presetTimes, minuteStep],
  );

  const getMinuteIndex = useCallback(
    (minute: number) => {
      const idx = minuteOptions.findIndex((m) => m === minute);
      return idx >= 0 ? idx : 0;
    },
    [minuteOptions],
  );

  const scrollToDraft = useCallback(
    (time: TimeValue, animated: boolean) => {
      const hourIndex = clampIndex(time.hour, 24);
      const minuteIndex = clampIndex(getMinuteIndex(time.minute), minuteOptions.length);

      hourRef.current?.scrollTo({ y: hourIndex * WHEEL_ITEM_HEIGHT, animated });
      minuteRef.current?.scrollTo({ y: minuteIndex * WHEEL_ITEM_HEIGHT, animated });
    },
    [getMinuteIndex, minuteOptions.length],
  );

  const syncDraftAndScroll = useCallback(
    (next: TimeValue, animated = true) => {
      const rounded = roundToStep(clampTime(next), minuteStep);
      setDraftTime(rounded);
      requestAnimationFrame(() => scrollToDraft(rounded, animated));
    },
    [minuteStep, scrollToDraft],
  );

  useEffect(() => {
    if (!visible) return;

    const defaultTime = (() => {
      const now = new Date();
      return { hour: now.getHours(), minute: now.getMinutes() };
    })();
    const source = roundToStep(clampTime(value ?? defaultTime), minuteStep);
    setDraftTime(source);
    requestAnimationFrame(() => scrollToDraft(source, false));
  }, [visible, value, minuteStep, scrollToDraft]);

  const handleQuickAction = (action: ModernTimeQuickAction) => {
    if (action === 'now') {
      const now = new Date();
      syncDraftAndScroll({ hour: now.getHours(), minute: now.getMinutes() });
      return;
    }

    const delta = action === '+30m' ? 30 : 60;
    syncDraftAndScroll(addMinutesToTime(draftTime, delta));
  };

  const onHourScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const nextHour = clampIndex(Math.round(y / WHEEL_ITEM_HEIGHT), 24);
    setDraftTime((prev) => ({ hour: nextHour, minute: prev.minute }));
  };

  const onMinuteScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const minuteIndex = clampIndex(Math.round(y / WHEEL_ITEM_HEIGHT), minuteOptions.length);
    const minute = minuteOptions[minuteIndex] ?? 0;
    setDraftTime((prev) => ({ hour: prev.hour, minute }));
  };

  const footer = (
    <View style={styles.footerButtons}>
      <FancyButton label='Cancelar' type='outlined' onPress={onClose} containerStyle={styles.footerButton} />
      <FancyButton label='Confirmar' onPress={() => onConfirm(draftTime)} containerStyle={styles.footerButton} />
    </View>
  );

  return (
    <FancyBottomSheetModal visible={visible} onClose={onClose} title={title} footer={footer}>
      <View style={styles.container}>
        <View style={[styles.previewCard, { backgroundColor: palette.backgroundColor4, borderColor: palette.borderCard }]}>
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            Horário selecionado
          </FancyText>
          <FancyText size='large' type='bold' color={palette.fonts.dark} style={styles.previewValue}>
            {DateUtils.formatHour(draftTime.hour, draftTime.minute)}
          </FancyText>
          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
            Toque em atalhos ou role para ajustar
          </FancyText>
        </View>

        {quickActions.length > 0 && (
          <View style={styles.block}>
            <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
              Atalhos
            </FancyText>
            <View style={styles.chipWrap}>
              {quickActions.map((action) => (
                <TimeChip
                  key={action}
                  label={action === 'now' ? 'Agora' : action === '+30m' ? '+30 min' : '+1h'}
                  onPress={() => handleQuickAction(action)}
                />
              ))}
            </View>
          </View>
        )}

        {normalizedPresets.length > 0 && (
          <View style={styles.block}>
            <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
              Horários sugeridos
            </FancyText>
            <View style={styles.chipWrap}>
              {normalizedPresets.map((preset, idx) => (
                <TimeChip
                  key={`${preset.hour}:${preset.minute}:${idx}`}
                  label={preset.label}
                  selected={timeEquals(preset, draftTime)}
                  onPress={() => syncDraftAndScroll(preset)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.block}>
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            Ajuste fino
          </FancyText>

          <View
            style={[
              styles.wheelCard,
              {
                height: wheelHeight + 28,
                backgroundColor: palette.backgroundColor4,
                borderColor: palette.borderCard,
              },
            ]}
          >
            <View style={styles.wheelLabelsRow}>
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                Hora
              </FancyText>
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                Minuto
              </FancyText>
            </View>

            <View style={[styles.wheelRow, { height: wheelHeight }]}>
              <WheelColumn
                refObj={hourRef}
                items={Array.from({ length: 24 }, (_, h) => ({ key: `h-${h}`, label: pad2(h), selected: draftTime.hour === h }))}
                height={wheelHeight}
                centerOffset={centerOffset}
                onMomentumScrollEnd={onHourScrollEnd}
                onLayout={() => scrollToDraft(draftTime, false)}
              />

              <FancyText size='large' type='bold' color={palette.fonts.inactive} style={styles.colon}>
                :
              </FancyText>

              <WheelColumn
                refObj={minuteRef}
                items={minuteOptions.map((m) => ({ key: `m-${m}`, label: pad2(m), selected: draftTime.minute === m }))}
                height={wheelHeight}
                centerOffset={centerOffset}
                onMomentumScrollEnd={onMinuteScrollEnd}
                onLayout={() => scrollToDraft(draftTime, false)}
              />

              <View
                pointerEvents='none'
                style={[
                  styles.centerHighlight,
                  {
                    top: centerOffset,
                    height: WHEEL_ITEM_HEIGHT,
                    borderColor: ColorUtils.withAlpha(palette.primary, 0.32),
                    backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
                  },
                ]}
              />

              <LinearGradient
                pointerEvents='none'
                colors={[palette.backgroundColor4, ColorUtils.withAlpha(palette.backgroundColor4, 0)]}
                style={[styles.topFade, { height: centerOffset }]}
              />
              <LinearGradient
                pointerEvents='none'
                colors={[ColorUtils.withAlpha(palette.backgroundColor4, 0), palette.backgroundColor4]}
                style={[styles.bottomFade, { height: centerOffset }]}
              />
            </View>
          </View>

          <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
            Intervalo de minutos: {minuteStep} min
          </FancyText>
        </View>
      </View>
    </FancyBottomSheetModal>
  );
}

function WheelColumn({
  refObj,
  items,
  height,
  centerOffset,
  onMomentumScrollEnd,
  onLayout,
}: {
  refObj: RefObject<ScrollView | null>;
  items: Array<{ key: string; label: string; selected?: boolean }>;
  height: number;
  centerOffset: number;
  onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onLayout?: () => void;
}) {
  const palette = usePallete();

  return (
    <ScrollView
      ref={refObj}
      snapToInterval={WHEEL_ITEM_HEIGHT}
      decelerationRate='fast'
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      style={{ flex: 1, height }}
      contentContainerStyle={{ paddingVertical: centerOffset, alignItems: 'center' }}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollEndDrag={onMomentumScrollEnd}
      onLayout={onLayout}
      scrollEventThrottle={16}
    >
      {items.map((item) => (
        <View key={item.key} style={styles.wheelItem}>
          <FancyText
            size={item.selected ? 'medium' : 'small'}
            type={item.selected ? 'bold' : 'medium'}
            color={item.selected ? palette.primary : palette.fonts.inactive}
          >
            {item.label}
          </FancyText>
        </View>
      ))}
    </ScrollView>
  );
}

function TimeChip({
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? ColorUtils.withAlpha(palette.primary, 0.14) : palette.backgroundColor4,
          borderColor: selected ? ColorUtils.withAlpha(palette.primary, 0.45) : palette.borderCard,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
      accessibilityRole='button'
      accessibilityState={{ selected: !!selected }}
    >
      <FancyText size='small' type={selected ? 'bold' : 'semiBold'} color={selected ? palette.primary : palette.fonts.dark}>
        {label}
      </FancyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  previewValue: {
    letterSpacing: 0.5,
  },
  block: {
    gap: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 52,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  wheelCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
    overflow: 'hidden',
  },
  wheelLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  wheelItem: {
    height: WHEEL_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colon: {
    width: 26,
    textAlign: 'center',
  },
  centerHighlight: {
    position: 'absolute',
    left: 6,
    right: 6,
    borderWidth: 1,
    borderRadius: 12,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
