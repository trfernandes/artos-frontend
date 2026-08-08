import { Platform, StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import {
  BOLD_FONT,
  EXTRA_LARGE_SIZE_FONT,
  EXTRA_SMALL_SIZE_FONT,
  ITALIC_BOLD_FONT,
  ITALIC_FONT,
  ITALIC_MEDIUM_FONT,
  ITALIC_SEMI_BOLD_FONT,
  LARGE_MEDIUM_SIZE_FONT,
  LARGE_SIZE_FONT,
  MEDIUM_FONT,
  MEDIUM_SIZE_FONT,
  REGULAR_FONT,
  SEMI_BOLD_FONT,
  SMALL_SIZE_FONT,
} from '../constants/font';
import React from 'react';
import { usePallete } from '../hooks/usePallete';

export type FancyTextProps = {
  children?: React.ReactNode;
  type?:
    | 'normal'
    | 'normalItalic'
    | 'medium'
    | 'mediumItalic'
    | 'semiBold'
    | 'semiBoldItalic'
    | 'bold'
    | 'boldItalic';
  size?: 'extraSmall' | 'small' | 'medium' | 'large' | 'largeMedium' | 'extraLarge' | number;
  color?: string;
  style?: StyleProp<TextStyle>;
} & TextProps;

export default function FancyText(props: FancyTextProps) {
  const palette = usePallete();
  const { size = 'medium', type = 'normal', color = palette.fonts.dark } = props;

  const fontSize =
    size === 'extraSmall'
      ? EXTRA_SMALL_SIZE_FONT
      : size === 'small'
        ? SMALL_SIZE_FONT
        : size === 'medium'
          ? MEDIUM_SIZE_FONT
          : size === 'large'
            ? LARGE_SIZE_FONT
            : size === 'largeMedium'
              ? LARGE_MEDIUM_SIZE_FONT
              : size === 'extraLarge'
                ? EXTRA_LARGE_SIZE_FONT
                : size;
  const fontFamily =
    type === 'bold'
      ? BOLD_FONT
      : type === 'semiBold'
        ? SEMI_BOLD_FONT
        : type === 'medium'
          ? MEDIUM_FONT
          : type === 'normalItalic'
            ? ITALIC_FONT
            : type === 'semiBoldItalic'
              ? ITALIC_SEMI_BOLD_FONT
              : type === 'mediumItalic'
                ? ITALIC_MEDIUM_FONT
                : type === 'boldItalic'
                  ? ITALIC_BOLD_FONT
                  : REGULAR_FONT;

  return (
    <Text
      {...props}
      allowFontScaling={false}
      style={[
        styles.text,
        { fontSize, fontFamily, color, lineHeight: Math.round(fontSize * 1.25) },
        props.style,
      ]}
    >
      {props.children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    // remove padding interno da fonte no Android
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
    // controla o espaçamento vertical (linha única)
    lineHeight: undefined, // no iOS limpa o default; no Android geralmente ignora se includeFontPadding=false
    // ou force lineHeight = fontSize se preferir
    // lineHeight: 16,

    // centralização
    textAlignVertical: 'center', // Android-only, vertical centering

    // zera margens internas (se o Text tiver sido estilizado globalmente)
    margin: 0,
    padding: 0,
  },
});
