import React, { useEffect, useState } from 'react';
import {
  DimensionValue,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view';
import FancyButton from '../../buttons/FancyButton';
import FancyText from '../../FancyText';
import { DefaultIconsNames } from '../../../constants/icons';
import { ThemePalette } from '../../../constants/colors';
import { router, useSegments } from 'expo-router';
import LoginBase from './LoginBase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { LARGE_SIZE_FONT } from '../../../constants/font';
import { AUTH_TITLE_LINE_HEIGHT_MULTIPLIER } from '../../../constants/authTypography';

const AUTH_HORIZONTAL_GUTTER = 30;
const BACK_BUTTON_SIZE = 35;
const BACK_BUTTON_CONTENT_GAP = 12;
const OPEN_BOTTOM_GAP = 8;

type WidthOptions = { default?: DimensionValue; keyboard?: DimensionValue };
type RenderContent = React.ReactNode | ((params: { keyboardVisible: boolean }) => React.ReactNode);
type StyleWithKeyboard =
  | StyleProp<ViewStyle>
  | ((params: { keyboardVisible: boolean }) => StyleProp<ViewStyle>);

type AuthScreenProps = {
  children: RenderContent;
  header?: RenderContent;
  topContent?: RenderContent;
  hideTopContentOnKeyboard?: boolean;
  showBackButton?: boolean;
  centerWithinBackButtonArea?: boolean;
  onPressBack?: () => void;
  scrollContainerStyle?: StyleWithKeyboard;
  centerContainerStyle?: StyleWithKeyboard;
  headerContainerStyle?: StyleWithKeyboard;
  fieldsContainerStyle?: StyleWithKeyboard;
  backButtonContainerStyle?: StyleWithKeyboard;
  headerWidth?: WidthOptions;
  contentWidth?: WidthOptions;
  containerPosition?: { default?: 'absolute' | 'relative'; keyboard?: 'absolute' | 'relative' };
  paddingTopOnKeyboard?: number;
  keyboardBottomSpacing?: number;
  alignTopOnKeyboard?: boolean;
  keyboardAwareProps?: Partial<KeyboardAwareScrollViewProps>;
  disableScroll?: boolean;
  compactTitleOnKeyboard?: string;
};

/** @deprecated Use AuthLayout instead. Será removido após Fase 2 da refatoração de teclado. */
export default function AuthScreen({
  children,
  header,
  topContent,
  hideTopContentOnKeyboard,
  showBackButton,
  centerWithinBackButtonArea = false,
  onPressBack,
  scrollContainerStyle,
  centerContainerStyle,
  headerContainerStyle,
  fieldsContainerStyle,
  backButtonContainerStyle,
  headerWidth,
  contentWidth,
  containerPosition,
  paddingTopOnKeyboard,
  keyboardBottomSpacing,
  alignTopOnKeyboard = false,
  keyboardAwareProps,
  disableScroll = false,
  compactTitleOnKeyboard,
}: AuthScreenProps) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const segments = useSegments();
  const isAuthRoute = segments.some((s) => s === '(auth)' || s === 'auth');
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const safeTopInset = Math.max(insets.top, androidStatusBarHeight);

  // Layout constants
  const resolvedScrollTopPadding = Math.max(25, safeTopInset + 8);
  const resolvedBackButtonTop = safeTopInset + 10;
  const resolvedBackButtonLeft = isAuthRoute ? AUTH_HORIZONTAL_GUTTER : 25;

  // Layout modes
  const shouldCenterWithinBackButtonArea = !!(centerWithinBackButtonArea && showBackButton);
  const isCompactKeyboardMode = !!(keyboardVisible && showBackButton && compactTitleOnKeyboard);
  const shouldUseAreaLayout = shouldCenterWithinBackButtonArea;
  const shouldUseOpenAreaLayout = shouldUseAreaLayout && keyboardVisible;
  const shouldUseClosedAreaLayout = shouldUseAreaLayout && !keyboardVisible;

  // Top inset below back button
  const contentStartBelowBackButton =
    resolvedBackButtonTop + BACK_BUTTON_SIZE + BACK_BUTTON_CONTENT_GAP;

  // Padding top for center container
  const resolvedCenterPaddingTop = keyboardVisible
    ? shouldUseOpenAreaLayout
      ? contentStartBelowBackButton
      : (paddingTopOnKeyboard ?? 0)
    : shouldUseClosedAreaLayout
      ? contentStartBelowBackButton
      : 0;

  // Bottom spacing
  const defaultBottomSpacing = keyboardBottomSpacing ?? 20;
  const resolvedBottomSpacing =
    keyboardVisible && shouldUseAreaLayout
      ? (keyboardBottomSpacing ?? OPEN_BOTTOM_GAP)
      : defaultBottomSpacing;

  // Alignment
  const shouldTopAlign =
    shouldUseOpenAreaLayout || isCompactKeyboardMode || (keyboardVisible && alignTopOnKeyboard);
  const shouldStretchFieldsOnKeyboard = shouldUseOpenAreaLayout || isCompactKeyboardMode;

  const keyboardAwareExtraScrollHeight = resolvedBottomSpacing;

  // Position style for centerContainer
  const centerContainerPositionStyle = (() => {
    if (shouldUseAreaLayout) {
      return {
        position: 'relative' as const,
        paddingTop: resolvedCenterPaddingTop,
        width: '100%' as const,
        alignSelf: 'stretch' as const,
      };
    }

    const resolvedPosition = keyboardVisible
      ? containerPosition?.keyboard || 'relative'
      : containerPosition?.default || 'absolute';

    return {
      position: resolvedPosition,
      ...(resolvedPosition === 'absolute'
        ? ({ top: 0, left: 0, right: 0, bottom: 0 } as const)
        : null),
      paddingTop: resolvedCenterPaddingTop,
    };
  })();

  // Content block styles
  const contentBlockStyles = [
    styles.contentBlock,
    isAuthRoute || shouldUseAreaLayout
      ? ({ width: '100%' as const, alignSelf: 'stretch' as const } as const)
      : null,
    shouldUseOpenAreaLayout ? ({ flex: 1 as const, minHeight: 0 } as const) : null,
  ];

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const headerNode = typeof header === 'function' ? header({ keyboardVisible }) : header;
  const topNode = typeof topContent === 'function' ? topContent({ keyboardVisible }) : topContent;
  const childrenNode = typeof children === 'function' ? children({ keyboardVisible }) : children;

  // Width styles for auth routes
  const headerWidthStyle = isAuthRoute
    ? ({ width: '100%' as const } as const)
    : keyboardVisible
      ? headerWidth?.keyboard !== undefined
        ? { width: headerWidth.keyboard }
        : null
      : headerWidth?.default !== undefined
        ? { width: headerWidth.default }
        : null;

  const contentWidthStyle = isAuthRoute
    ? ({ width: '100%' as const } as const)
    : keyboardVisible
      ? contentWidth?.keyboard !== undefined
        ? { width: contentWidth.keyboard }
        : null
      : contentWidth?.default !== undefined
        ? { width: contentWidth.default }
        : null;

  const { contentContainerStyle: contentContainerStyleProp, ...restKeyboardAwareProps } =
    keyboardAwareProps || {};

  // Composed style arrays
  const scrollContainerStyles = [
    styles.scrollContainer,
    { paddingTop: resolvedScrollTopPadding },
    typeof scrollContainerStyle === 'function'
      ? scrollContainerStyle({ keyboardVisible })
      : scrollContainerStyle,
    contentContainerStyleProp,
    isAuthRoute ? ({ paddingHorizontal: AUTH_HORIZONTAL_GUTTER } as const) : null,
  ];

  const centerContainerStyles = [
    styles.centerContainer,
    centerContainerPositionStyle,
    shouldUseClosedAreaLayout && !keyboardVisible
      ? ({ justifyContent: 'center' as const } as const)
      : shouldTopAlign
        ? ({ justifyContent: 'flex-start' as const } as const)
        : null,
    typeof centerContainerStyle === 'function'
      ? centerContainerStyle({ keyboardVisible })
      : centerContainerStyle,
  ];

  const headerContainerStyles = [
    styles.headerContainer,
    headerWidthStyle,
    typeof headerContainerStyle === 'function'
      ? headerContainerStyle({ keyboardVisible })
      : headerContainerStyle,
  ];

  const fieldsContainerStyles = [
    styles.fieldsContainer,
    contentWidthStyle,
    keyboardVisible && resolvedBottomSpacing > 0 ? { marginBottom: resolvedBottomSpacing } : null,
    typeof fieldsContainerStyle === 'function'
      ? fieldsContainerStyle({ keyboardVisible })
      : fieldsContainerStyle,
    shouldStretchFieldsOnKeyboard ? { flex: 1 as const, minHeight: 0 } : null,
  ];

  const backButtonContainerStyles = [
    styles.backButtonContainer,
    { top: resolvedBackButtonTop, left: resolvedBackButtonLeft },
    typeof backButtonContainerStyle === 'function'
      ? backButtonContainerStyle({ keyboardVisible })
      : backButtonContainerStyle,
  ];

  const scrollProps: KeyboardAwareScrollViewProps = {
    enableOnAndroid: true,
    enableAutomaticScroll: true,
    extraScrollHeight: keyboardAwareExtraScrollHeight,
    keyboardShouldPersistTaps: 'handled',
    ...restKeyboardAwareProps,
  };

  const content = (
    <>
      {showBackButton && (
        <View
          style={[
            backButtonContainerStyles,
            isCompactKeyboardMode
              ? {
                  flexDirection: 'row' as const,
                  alignItems: 'center' as const,
                  justifyContent: 'flex-start' as const,
                  gap: 10,
                }
              : null,
          ]}
        >
          <FancyButton
            icon={{ ...DefaultIconsNames['chevron-left'], color: Pallete.icons.dark }}
            size={30}
            onPress={onPressBack || (() => router.back())}
            containerStyle={{
              backgroundColor: Pallete.backgroundColor3,
              width: BACK_BUTTON_SIZE,
              height: BACK_BUTTON_SIZE,
              borderRadius: BACK_BUTTON_SIZE / 2,
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
            }}
          />
          {isCompactKeyboardMode && (
            <FancyText
              type='bold'
              size='medium'
              color='white'
              numberOfLines={1}
              style={styles.compactHeaderTitle}
            >
              {compactTitleOnKeyboard}
            </FancyText>
          )}
        </View>
      )}

      <View style={centerContainerStyles}>
        <View style={contentBlockStyles}>
          {topNode && !(hideTopContentOnKeyboard && keyboardVisible) ? topNode : null}

          {headerNode && !isCompactKeyboardMode ? (
            <View style={headerContainerStyles}>{headerNode}</View>
          ) : null}

          <View style={fieldsContainerStyles}>{childrenNode}</View>
        </View>
      </View>
    </>
  );

  return (
    <LoginBase>
      {disableScroll ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <View
            style={[
              {
                flex: 1,
                marginBottom: keyboardVisible
                  ? shouldUseAreaLayout
                    ? resolvedBottomSpacing
                    : 0
                  : Platform.OS === 'ios'
                    ? 0
                    : 22,
              },
              scrollContainerStyles,
            ]}
          >
            {content}
          </View>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAwareScrollView {...scrollProps} contentContainerStyle={scrollContainerStyles}>
          {content}
        </KeyboardAwareScrollView>
      )}
    </LoginBase>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 25,
      justifyContent: 'center',
      gap: 20,
      paddingBottom: 20,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      gap: 20,
    },
    headerContainer: {
      gap: 6,
    },
    contentBlock: {
      gap: 20,
      alignItems: 'center' as const,
      minHeight: 0,
    },
    fieldsContainer: {
      borderRadius: 15,
      padding: 25,
      gap: 15,
      backgroundColor: Pallete.backgroundColor,
      ...Pallete.shadows[200],
      overflow: 'hidden',
    },
    backButtonContainer: {
      position: 'absolute' as const,
      left: 25,
      top: 35,
      zIndex: 1000,
      elevation: 1000,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    compactHeaderTitle: {
      flexShrink: 1,
      maxWidth: '82%',
      lineHeight: LARGE_SIZE_FONT * AUTH_TITLE_LINE_HEIGHT_MULTIPLIER,
    },
  });
}
