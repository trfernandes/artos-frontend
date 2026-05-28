import React, { useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { KeyboardAwareScrollView, useResizeMode } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginBase from './LoginBase';
import FancyButton from '../../buttons/FancyButton';
import FancyText from '../../FancyText';
import { DefaultIconsNames } from '../../../constants/icons';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useKeyboardMetrics } from '../../../hooks/useKeyboardMetrics';
import { LARGE_SIZE_FONT, SMALL_SIZE_FONT } from '../../../constants/font';
import {
  AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
  AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
} from '../../../constants/authTypography';

const HORIZONTAL_GUTTER = 24;

export type AuthLayoutProps = {
  /** Conteúdo principal. Renderizado dentro do scroll do card (form) ou diretamente (stepper/message). */
  children: React.ReactNode;
  /**
   * Conteúdo fixo no rodapé do card (botões, links).
   * Fica abaixo do scroll de campos — sempre visível, acima do teclado.
   */
  footer?: React.ReactNode;
  /** Logo opcional. Renderizado acima do card (form/stepper mode). */
  logo?: React.ReactNode;
  /** Título renderizado dentro do card, fixo acima do scroll. */
  title?: string;
  /** Subtítulo dentro do card. Some com teclado por padrão (hideHeaderOnKeyboard). */
  subtitle?: string;
  /**
   * Se true (default), subtítulo some quando teclado abre para liberar espaço vertical.
   * Use false em telas sem campos de formulário (ex: admin-discovery).
   */
  hideHeaderOnKeyboard?: boolean;
  /** @deprecated Use title + subtitle props. Mantido para modo message (hideCard). */
  header?: React.ReactNode;
  /** Mostra botão voltar no topo do card. */
  showBackButton?: boolean;
  /** Callback do botão voltar. Default: router.back(). */
  onPressBack?: () => void;
  /** @deprecated Sem efeito. */
  compactTitleOnKeyboard?: string;
  /** Override pontual do estilo do card. */
  cardStyle?: StyleProp<ViewStyle>;
  /** Renderiza sem o card branco — telas de mensagem. */
  hideCard?: boolean;
  /** Override aplicado ao contentContainerStyle do scroll interno (form mode). */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Permite tap fora dos inputs para fechar o teclado. Default: true. */
  dismissKeyboardOnTap?: boolean;
  /**
   * Quando true (default), card usa KeyboardAwareScrollView no meio.
   * Quando false (stepper), FancySteps gerencia scroll internamente.
   */
  scrollableContent?: boolean;
  /**
   * Densidade do form mode:
   * - 'scrollable' (default): KAS interno, ideal para forms com 3+ campos.
   * - 'compact': sem KAS, card auto-tamanho. Ideal para forms esparsos (0–2 campos)
   *   onde nunca há overflow e o KAS introduziria espaço vazio.
   * Ignorada quando hideCard (message) ou scrollableContent=false (stepper).
   */
  density?: 'compact' | 'scrollable';
};

/**
 * Layout unificado para telas de autenticação.
 *
 * Arquitetura (form mode):
 *   KeyboardAvoidingView (iOS: padding) + useResizeMode (Android: adjustResize)
 *   └── outerContainer (flex:1, justifyContent:'center')
 *       └── CARD (flex:1, maxHeight calculado)
 *           ├── HEADER fixo (title, subtitle, back button)
 *           ├── KeyboardAwareScrollView (flex:1) — scroll ÚNICO do meio
 *           │    └── children (campos, links, checkbox…)
 *           └── FOOTER fixo (footer prop) — sempre visível acima do teclado
 *
 * O card tem flex:1 dentro de um View (não ScrollView), portanto o scroll interno
 * recebe altura limitada e flex:1 funciona corretamente — sem scroll aninhado.
 *
 * Modos:
 *   'form'    — card centralizado, scroll no meio, footer fixo.
 *   'stepper' — card preenche tela, FancySteps gerencia scroll.
 *   'message' — sem card (hideCard), conteúdo bare.
 */
export default function AuthLayout({
  children,
  footer,
  logo,
  title,
  subtitle,
  hideHeaderOnKeyboard = true,
  header,
  showBackButton,
  onPressBack,
  cardStyle,
  hideCard,
  contentContainerStyle,
  dismissKeyboardOnTap = true,
  scrollableContent = true,
  density,
}: AuthLayoutProps) {
  // Android: faz a janela redimensionar quando o teclado abre (adjustResize).
  useResizeMode();

  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { visible: isKeyboardVisible, platformInset } = useKeyboardMetrics();
  const { height: windowHeight } = useWindowDimensions();

  // Altura do footer medida via onLayout — usada para compensar `extraKeyboardSpace`
  // no KAS (evita compensação dupla do teclado quando há footer fixo).
  const [footerHeight, setFooterHeight] = useState(0);

  const androidStatusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const safeTopInset = Math.max(insets.top, androidStatusBarHeight);
  const safeBottomInset = Math.max(insets.bottom, safeTopInset);

  // Altura máxima do card. No iOS subtraímos o teclado (KAV behavior=padding não muda
  // windowHeight); no Android useResizeMode já encolhe windowHeight nativamente.
  const cardMaxHeight = windowHeight - safeTopInset - safeBottomInset - 20 - platformInset;

  const mode: 'form' | 'stepper' | 'message' = hideCard
    ? 'message'
    : !scrollableContent
      ? 'stepper'
      : 'form';

  // Densidade só se aplica ao form mode. Default 'scrollable' (KAS interno).
  const formDensity: 'compact' | 'scrollable' | null =
    mode === 'form' ? (density ?? 'scrollable') : null;

  const handleBackPress = () => {
    if (onPressBack) return onPressBack();
    router.back();
  };

  const cardBaseStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: Pallete.backgroundColor,
      ...Pallete.shadows[200],
    }),
    [Pallete]
  );

  const backBtn = (
    <FancyButton
      type='text'
      label='Voltar'
      icon={{ ...DefaultIconsNames['arrow-left'], color: Pallete.icons.inactive, size: 18 }}
      size={28}
      onPress={handleBackPress}
      containerStyle={styles.backButton}
      labelStyle={{ color: Pallete.icons.inactive }}
    />
  );

  const inCardHeader = (showBackButton || title) ? (
    <View style={styles.headerBlock}>
      {showBackButton && <View style={styles.backButtonRow}>{backBtn}</View>}
      <View style={styles.titleGroup}>
        {title && (
          <FancyText size='large' type='bold' style={styles.titleText}>
            {title}
          </FancyText>
        )}
        {subtitle && (!hideHeaderOnKeyboard || !isKeyboardVisible) && (
          <FancyText size='small' type='medium' color={Pallete.fonts.inactive} style={styles.subtitleText}>
            {subtitle}
          </FancyText>
        )}
      </View>
    </View>
  ) : null;

  // Message mode: sem card, sem teclado — conteúdo bare centralizado.
  if (mode === 'message') {
    return (
      <LoginBase enableDismissKeyboard={dismissKeyboardOnTap}>
        <View
          style={[
            styles.flex1,
            {
              paddingTop: safeTopInset,
              paddingBottom: insets.bottom,
              paddingHorizontal: HORIZONTAL_GUTTER,
            },
          ]}
        >
          {(showBackButton || header) && (
            <View style={styles.messageHeader}>
              {showBackButton && <View style={styles.backButtonRow}>{backBtn}</View>}
              {header && <View style={styles.headerContent}>{header}</View>}
            </View>
          )}
          <View style={[styles.flex1, styles.bareContent, contentContainerStyle]}>
            {children}
          </View>
        </View>
      </LoginBase>
    );
  }

  // Form / Stepper mode: card com header fixo + scroll/stepper no meio + footer fixo.
  return (
    <LoginBase enableDismissKeyboard={dismissKeyboardOnTap}>
      {/*
        iOS: KeyboardAvoidingView com behavior="padding" encolhe o container
        quando o teclado abre, mantendo footer visível sem sobreposição.
        Android: useResizeMode() já cuida via adjustResize — behavior undefined.
      */}
      <KeyboardAvoidingView
        behavior='padding'
        style={styles.flex1}
      >
        <View
          style={[
            styles.outerContainer,
            {
              paddingTop: safeTopInset,
              paddingBottom: safeBottomInset,
              paddingHorizontal: HORIZONTAL_GUTTER,
            },
          ]}
        >
          {logo && <View style={styles.logoArea}>{logo}</View>}

          <View
            style={[
              styles.card,
              cardBaseStyle,
              // Stepper: card sempre preenche (FancySteps usa flex:1 internamente).
              // Form compact: card auto-tamanho (flex:0), sem KAS — para forms esparsos.
              // Form scrollable: alterna flex conforme teclado.
              //   - teclado fechado: flex:0 → card encolhe ao conteúdo, sem espaço branco.
              //   - teclado aberto: flex:1 → card expande, KAS interno tem altura concreta
              //     e o conteúdo pode rolar atrás do header/footer fixos.
              mode === 'stepper'
                ? { flex: 1, maxHeight: cardMaxHeight }
                : formDensity === 'compact'
                  ? { flex: 0, maxHeight: cardMaxHeight }
                  : isKeyboardVisible
                    ? { flex: 1, maxHeight: cardMaxHeight }
                    : { flex: 0, maxHeight: cardMaxHeight },
              cardStyle,
            ]}
          >
            {/* HEADER FIXO — sempre visível, não rola */}
            {inCardHeader}

            {/* MEIO: 3 estratégias distintas conforme densidade/modo */}
            {formDensity === 'scrollable' ? (
              <KeyboardAwareScrollView
                // Flex do KAS precisa ACOMPANHAR o flex do card:
                //   - Teclado fechado → card é flex:0 (auto-tamanho). KAS sem flex:1 também,
                //     senão colapsa para 0 (filho flex:1 dentro de pai auto-sized → 0).
                //     Sem flex, KAS se dimensiona ao conteúdo (header + KAS + footer = card).
                //   - Teclado aberto → card é flex:1 (altura concreta). KAS flex:1 pega
                //     o espaço entre header e footer e scrolla quando o conteúdo excede.
                style={isKeyboardVisible ? styles.flex1 : undefined}
                contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                keyboardShouldPersistTaps='handled'
                keyboardDismissMode='on-drag'
                bottomOffset={20}
                extraKeyboardSpace={-footerHeight}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </KeyboardAwareScrollView>
            ) : formDensity === 'compact' ? (
              // Compact: View puro, sem scroll. Card é auto-tamanho.
              <View style={[styles.compactContent, contentContainerStyle]}>{children}</View>
            ) : (
              // Stepper: FancySteps gerencia scroll internamente
              <View style={styles.stepperContent}>{children}</View>
            )}

            {/* FOOTER FIXO — sempre visível, não rola */}
            {footer && (
              <View
                style={styles.footerBlock}
                onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
              >
                {footer}
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </LoginBase>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    flex1: { flex: 1 },

    // Container externo: centraliza o card verticalmente quando ele é menor que maxHeight.
    outerContainer: {
      flex: 1,
      justifyContent: 'center',
    },

    logoArea: {
      alignItems: 'center',
      paddingBottom: 12,
    },

    // Card base: borda/sombra. flex é controlado inline conforme o mode.
    card: {
      borderRadius: 15,
      overflow: 'hidden',
    },

    // Header do card — fica fora do scroll, sempre visível.
    // paddingTop alinhado ao paddingHorizontal (25) para evitar inconsistência visual
    // entre o topo do card e as laterais. 20 dá respiro sem espremer o back button.
    headerBlock: {
      gap: 3,
      paddingTop: 20,
      paddingHorizontal: 25,
    },

    backButton: {
      height: 40,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 0,
    },

    backButtonRow: {
      alignSelf: 'flex-start',
    },

    titleGroup: {
      gap: 2,
    },

    titleText: {
      lineHeight: LARGE_SIZE_FONT * AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
    },

    subtitleText: {
      lineHeight: SMALL_SIZE_FONT * AUTH_SUBTITLE_LINE_HEIGHT_MULTIPLIER,
    },

    // Content container do scroll do meio (form scrollable).
    // paddingBottom enxuto: combinado com footerBlock.paddingTop=6 dá um gap total de 14
    // entre o último campo e o botão do footer — mesmo ritmo do `gap: 14` entre campos.
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 25,
      paddingTop: 14,
      paddingBottom: 8,
      gap: 14,
    },

    // Conteúdo do meio em modo compact: View normal, mesmo espaçamento do scrollContent.
    compactContent: {
      paddingHorizontal: 25,
      paddingTop: 14,
      paddingBottom: 8,
      gap: 14,
    },

    // Stepper: FancySteps preenche o espaço e gerencia seu próprio scroll.
    stepperContent: {
      flex: 1,
      overflow: 'hidden',
    },

    // Footer do card — fica fora do scroll, sempre visível acima do teclado.
    // paddingTop=6 + scrollContent.paddingBottom=8 = 14 total entre conteúdo e botão.
    footerBlock: {
      paddingHorizontal: 25,
      paddingBottom: 16,
      paddingTop: 6,
      gap: 8,
    },

    // Message mode (hideCard)
    messageHeader: {
      gap: 12,
      paddingBottom: 8,
    },
    headerContent: { gap: 6 },
    bareContent: { gap: 14 },
  });
}
