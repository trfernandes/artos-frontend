import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import FancyBottomSheetModal from '../modal/FancyBottomSheetModal';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import FancyTextInput from './FancyTextInput';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

type Props = {
  label?: string;
  title?: string;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  containerStyle?: StyleProp<ViewStyle>;
  presetValues?: number[];
};

const DEFAULT_PRESETS = [90, 100, 110, 120, 130, 140, 150];
const ADJUSTMENTS = [-10, -5, 5, 10] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function FancyBpmField({
  label = 'BPM',
  title = 'Selecionar BPM',
  value = 0,
  onChange,
  disabled = false,
  min = 0,
  max = 300,
  containerStyle,
  presetValues = DEFAULT_PRESETS,
}: Props) {
  const palette = usePallete();
  const [visible, setVisible] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [inputValue, setInputValue] = useState(value > 0 ? String(value) : '');

  useEffect(() => {
    if (!visible) {
      setDraftValue(value);
      setInputValue(value > 0 ? String(value) : '');
    }
  }, [value, visible]);

  const displayValue = value > 0 ? String(value) : 'Definir';
  const currentValue = draftValue > 0 ? draftValue : 0;

  const normalizedPresets = useMemo(
    () => presetValues.map((item) => clamp(item, min, max)).filter((item, index, arr) => arr.indexOf(item) === index),
    [presetValues, min, max],
  );

  const handleOpen = () => {
    if (disabled) return;
    setDraftValue(value);
    setInputValue(value > 0 ? String(value) : '');
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleSetDraft = (nextValue: number) => {
    const safeValue = clamp(nextValue, min, max);
    setDraftValue(safeValue);
    setInputValue(safeValue > 0 ? String(safeValue) : '');
  };

  const handleAdjust = (delta: number) => {
    handleSetDraft((draftValue || 0) + delta);
  };

  const handleInputChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, '');
    setInputValue(cleaned);
    if (!cleaned) {
      setDraftValue(0);
      return;
    }
    handleSetDraft(Number(cleaned));
  };

  const handleConfirm = () => {
    onChange?.(draftValue > 0 ? clamp(draftValue, min, max) : 0);
    setVisible(false);
  };

  return (
    <>
      <View style={[styles.fieldContainer, containerStyle]}>
        <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive} style={styles.label}>
          {label}
        </FancyText>

        <Pressable
          onPress={handleOpen}
          disabled={disabled}
          style={({ pressed }) => [
            styles.inputContainer,
            {
              backgroundColor: palette.backgroundColor,
              borderColor: pressed && !disabled ? palette.primary : palette.border,
              ...palette.shadows[200],
            },
            disabled && styles.inputContainerDisabled,
          ]}
        >
          <FancyText
            size='small'
            type='medium'
            color={value > 0 ? palette.fonts.dark : palette.fonts.inactive}
            numberOfLines={1}
            style={styles.inputValue}
          >
            {displayValue}
          </FancyText>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name='metronome'
              size={18}
              color={disabled ? palette.fonts.inactive2 : palette.icons.inactive}
            />
          </View>
        </Pressable>
      </View>

      <FancyBottomSheetModal
        visible={visible}
        onClose={handleClose}
        title={title}
        footer={
          <FancyButton
            label='Confirmar'
            icon={{ library: 'MaterialCommunityIcons', name: 'check', size: 18 }}
            onPress={handleConfirm}
          />
        }
      >
        <View style={styles.sheetContent}>
          <View
            style={[
              styles.currentCard,
              {
                backgroundColor: palette.backgroundColor4,
                borderColor: ColorUtils.withAlpha(palette.primary, 0.14),
                ...palette.shadows[100],
              },
            ]}
          >
            <View style={styles.currentValueBlock}>
              <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive} style={styles.currentEyebrow}>
                BPM atual
              </FancyText>
              <View style={styles.currentValueRow}>
                <FancyText size='extraLarge' type='bold' color={palette.fonts.dark} style={styles.currentValue}>
                  {currentValue || '—'}
                </FancyText>
                <FancyText size='small' type='semiBold' color={palette.fonts.inactive} style={styles.currentUnit}>
                  bpm
                </FancyText>
              </View>
            </View>
            <View
              style={[
                styles.currentIconWrap,
                { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1) },
              ]}
            >
              <MaterialCommunityIcons name='metronome' size={18} color={palette.primary} />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
              Atalhos
            </FancyText>
            <View style={styles.chipsRow}>
              {normalizedPresets.map((preset) => {
                const selected = preset === draftValue;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => handleSetDraft(preset)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? palette.primary : palette.backgroundColor4,
                        borderColor: selected ? palette.primary : ColorUtils.withAlpha(palette.border, 0.82),
                        ...(!selected ? palette.shadows[100] : {}),
                      },
                    ]}
                  >
                    <FancyText
                      size='extraSmall'
                      type='semiBold'
                      color={selected ? palette.fonts.light : palette.fonts.dark}
                      style={styles.chipLabel}
                    >
                      {preset}
                    </FancyText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
              Ajuste rápido
            </FancyText>
            <View
              style={[
                styles.quickAdjustRail,
                {
                  backgroundColor: palette.backgroundColor4,
                  borderColor: ColorUtils.withAlpha(palette.border, 0.9),
                },
              ]}
            >
              {ADJUSTMENTS.map((delta, index) => (
                <Pressable
                  key={delta}
                  onPress={() => handleAdjust(delta)}
                  style={[
                    styles.quickAdjustControl,
                    index < ADJUSTMENTS.length - 1 && {
                      borderRightWidth: 1,
                      borderRightColor: ColorUtils.withAlpha(palette.border, 0.88),
                    },
                  ]}
                >
                  <FancyText
                    size='extraSmall'
                    type='bold'
                    color={delta > 0 ? palette.primary : palette.fonts.dark}
                    style={styles.quickAdjustLabel}
                  >
                    {delta > 0 ? `+${delta}` : `${delta}`}
                  </FancyText>
                </Pressable>
              ))}
            </View>
          </View>

          <FancyTextInput
            label='Valor manual'
            value={inputValue}
            inputProps={{
              keyboardType: 'numeric',
              onChangeText: handleInputChange,
            }}
            rightContainer={[
              {
                icon: { library: 'MaterialCommunityIcons', name: 'metronome', size: 18 },
              },
            ]}
          />
        </View>
      </FancyBottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    gap: 6,
  },
  label: {
    paddingLeft: 2,
    includeFontPadding: false,
  },
  inputContainer: {
    minHeight: 44,
    borderWidth: 0.6,
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  inputValue: {
    flex: 1,
    includeFontPadding: false,
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    gap: 16,
  },
  currentCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  currentValueBlock: {
    flex: 1,
    gap: 2,
  },
  currentEyebrow: {
    includeFontPadding: false,
  },
  currentValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  currentValue: {
    includeFontPadding: false,
    lineHeight: 34,
  },
  currentUnit: {
    includeFontPadding: false,
    paddingBottom: 3,
  },
  currentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionBlock: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 56,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    includeFontPadding: false,
  },
  quickAdjustRail: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  quickAdjustControl: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  quickAdjustLabel: {
    includeFontPadding: false,
  },
});
