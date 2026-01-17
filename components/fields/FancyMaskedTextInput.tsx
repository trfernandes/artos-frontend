import { useCallback } from 'react';
import FancyTextInput, { FancyTextInputProps } from './FancyTextInput';

/**
 * Tipos de máscara suportados:
 * - 'phone': (XX) XXXXX-XXXX
 * - 'cpf': XXX.XXX.XXX-XX
 * - 'cnpj': XX.XXX.XXX/XXXX-XX
 * - 'cep': XXXXX-XXX
 * - 'date': XX/XX/XXXX
 * - 'custom': usa o pattern fornecido (9 = número, A = letra, * = qualquer)
 */
export type MaskType = 'phone' | 'cpf' | 'cnpj' | 'cep' | 'date' | 'custom';

export type FancyMaskedTextInputProps = Omit<FancyTextInputProps, 'inputProps'> & {
  maskType: MaskType;
  /** Padrão customizado. Use: 9 = número, A = letra, * = qualquer caractere */
  customPattern?: string;
  onChangeText?: (rawValue: string, maskedValue: string) => void;
  inputProps?: Omit<FancyTextInputProps['inputProps'], 'onChangeText'>;
};

const MASK_PATTERNS: Record<Exclude<MaskType, 'custom'>, string> = {
  phone: '(99) 99999-9999',
  cpf: '999.999.999-99',
  cnpj: '99.999.999/9999-99',
  cep: '99999-999',
  date: '99/99/9999',
};

const applyMask = (value: string, pattern: string): string => {
  if (!value) return '';

  const cleanValue = value.replace(/\D/g, '');
  let maskedValue = '';
  let valueIndex = 0;

  for (let i = 0; i < pattern.length && valueIndex < cleanValue.length; i++) {
    const patternChar = pattern[i];

    if (patternChar === '9') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else if (patternChar === 'A') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else if (patternChar === '*') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else {
      maskedValue += patternChar;
    }
  }

  return maskedValue;
};

const getRawValue = (value: string): string => {
  return value.replace(/\D/g, '');
};

export default function FancyMaskedTextInput({
  maskType,
  customPattern,
  onChangeText,
  value,
  inputProps,
  ...props
}: FancyMaskedTextInputProps) {
  const pattern = maskType === 'custom' ? (customPattern || '') : MASK_PATTERNS[maskType];
  const maskedValue = applyMask(value || '', pattern);

  const handleChangeText = useCallback(
    (text: string) => {
      const rawValue = getRawValue(text);
      const newMaskedValue = applyMask(rawValue, pattern);
      onChangeText?.(rawValue, newMaskedValue);
    },
    [pattern, onChangeText]
  );

  return (
    <FancyTextInput
      {...props}
      value={maskedValue}
      inputProps={{
        ...inputProps,
        onChangeText: handleChangeText,
        keyboardType: 'numeric',
        maxLength: pattern.length,
      }}
    />
  );
}
