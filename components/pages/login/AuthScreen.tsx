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
  const AUTH_HORIZONTAL_GUTTER = 30;
  const BACK_BUTTON_SIZE = 40;
  const BACK_BUTTON_CONTENT_GAP = 8;
  const OPEN_TOP_GAP = 16;
  const OPEN_BOTTOM_GAP = 16;
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [contentAreaHeight, setContentAreaHeight] = useState(0);
  const [contentBlockHeight, setContentBlockHeight] = useState(0);
  const segments = useSegments();
  const isAuthRoute = segments[0] === '(auth)';
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
  const safeTopInset = Math.max(insets.top, androidStatusBarHeight);
  const resolvedScrollTopPadding = Math.max(25, safeTopInset + 8);
  const resolvedBackButtonTop = safeTopInset + 10;
  const shouldCenterWithinBackButtonArea = !!(centerWithinBackButtonArea && showBackButton);
  const isCompactKeyboardMode = !!(keyboardVisible && showBackButton && compactTitleOnKeyboard);
  const shouldUseAreaLayout = shouldCenterWithinBackButtonArea;
  const shouldUseOpenAreaLayout = shouldUseAreaLayout && keyboardVisible;
  const shouldUseClosedAreaLayout = shouldUseAreaLayout && !keyboardVisible;
  const compactHeaderBottom = resolvedBackButtonTop + BACK_BUTTON_SIZE;
  const openTopInset = compactHeaderBottom + OPEN_TOP_GAP;
  const centerAreaTopInset = resolvedBackButtonTop + BACK_BUTTON_SIZE + BACK_BUTTON_CONTENT_GAP;
  const availableClosedAreaHeight = Math.max(0, contentAreaHeight - centerAreaTopInset);
  const closedSlack = availableClosedAreaHeight - contentBlockHeight;
  const closedInnerTopOffset = closedSlack <= 0 ? 0 : closedSlack / 2;
  const closedTopOffset = centerAreaTopInset + closedInnerTopOffset;
  const resolvedCenterPaddingTop = keyboardVisible
    ? shouldUseOpenAreaLayout
      ? isCompactKeyboardMode
        ? openTopInset
        : paddingTopOnKeyboard || 0
      : paddingTopOnKeyboard || 0
    : shouldUseClosedAreaLayout
      ? closedTopOffset
      : shouldCenterWithinBackButtonArea
        ? centerAreaTopInset
        : 0;

  const bottomSpacing = keyboardBottomSpacing ?? 20;
  const resolvedBottomSpacing =
    keyboardVisible && shouldUseAreaLayout ? OPEN_BOTTOM_GAP : bottomSpacing;
  const shouldTopAlignLegacy = isCompactKeyboardMode || (keyboardVisible && alignTopOnKeyboard);
  const shouldUseTopAlign = shouldUseOpenAreaLayout || shouldUseClosedAreaLayout;
  const shouldStretchFieldsOnKeyboard = shouldUseOpenAreaLayout || isCompactKeyboardMode;
  const shouldUseCompactAndroidKeyboardSafeBottom = keyboardVisible && shouldUseAreaLayout;
  const keyboardAwareExtraScrollHeight =
    keyboardVisible && shouldUseAreaLayout ? OPEN_BOTTOM_GAP : resolvedBottomSpacing;

  const centerContainerPositionStyle = shouldUseAreaLayout
    ? {
        position: 'relative' as const,
        paddingTop: resolvedCenterPaddingTop,
        width: '100%' as const,
        alignSelf: 'stretch' as const,
      }
    : {
        position: keyboardVisible
          ? containerPosition?.keyboard || 'relative'
          : containerPosition?.default || 'absolute',
        paddingTop: resolvedCenterPaddingTop,
      };

  const contentBlockStyles = [
    styles.contentBlock,
    isAuthRoute || shouldUseAreaLayout
      ? ({ width: '100%' as const, alignSelf: 'stretch' as const } as const)
      : null,
    shouldUseOpenAreaLayout ? ({ flex: 1 as const, minHeight: 0 } as const) : null,
  ];

  const centerContainerOnLayout = (height: number) => {
    if (Math.abs(contentAreaHeight - height) > 0.5) {
      setContentAreaHeight(height);
    }
  };

  const contentBlockOnLayout = (height: number) => {
    if (Math.abs(contentBlockHeight - height) > 0.5) {
      setContentBlockHeight(height);
    }
  };

  useEffect(() => {
    if (!shouldUseClosedAreaLayout) {
      if (contentAreaHeight !== 0) setContentAreaHeight(0);
      if (contentBlockHeight !== 0) setContentBlockHeight(0);
    }
  }, [shouldUseClosedAreaLayout, contentAreaHeight, contentBlockHeight]);

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
    shouldUseTopAlign
      ? { justifyContent: 'flex-start' as const }
      : shouldTopAlignLegacy
        ? { justifyContent: 'flex-start' as const }
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
    { top: resolvedBackButtonTop },
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
  const shouldUseKeyboardFallbackScroll =
    disableScroll && keyboardVisible && Platform.OS === 'android';

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
            size={35}
            onPress={onPressBack || (() => router.back())}
            containerStyle={{
              backgroundColor: Pallete.backgroundColor3,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
            }}
          />
          {isCompactKeyboardMode && (
            <FancyText type='bold' size='large' color='white' numberOfLines={1}>
              {compactTitleOnKeyboard}
            </FancyText>
          )}
        </View>
      )}

      <View
        style={[centerContainerStyles, keyboardVisible ? {} : null]}
        onLayout={(event) => centerContainerOnLayout(event.nativeEvent.layout.height)}
      >
        <View
          style={contentBlockStyles}
          onLayout={(event) => contentBlockOnLayout(event.nativeEvent.layout.height)}
        >
          {topNode && !(hideTopContentOnKeyboard && keyboardVisible) ? topNode : null}

          {headerNode && !isCompactKeyboardMode ? (
            <View style={headerContainerStyles}>{headerNode}</View>
          ) : null}

          <View style={[fieldsContainerStyles]}>{childrenNode}</View>
        </View>
      </View>
    </>
  );

  return (
    <LoginBase>
      {shouldUseKeyboardFallbackScroll ? (
        <KeyboardAwareScrollView {...scrollProps} contentContainerStyle={scrollContainerStyles}>
          {content}
        </KeyboardAwareScrollView>
      ) : disableScroll ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : !keyboardVisible ? 0 : 0}
        >
          <View
            style={[
              {
                flex: 1,
                marginBottom:
                  Platform.OS === 'ios'
                    ? 0
                    : keyboardVisible
                      ? shouldUseCompactAndroidKeyboardSafeBottom
                        ? OPEN_BOTTOM_GAP
                        : 0
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
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
      // borderWidth: 2,
      overflow: 'hidden',
    },
    backButtonContainer: {
      position: 'absolute' as const,
      left: 25,
      top: 35,
      zIndex: 10,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  });
}
