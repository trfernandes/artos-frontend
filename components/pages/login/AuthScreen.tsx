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
import { DefaultIconsNames } from '../../../constants/icons';
import { Pallete } from '../../../constants/colors';
import { router } from 'expo-router';
import LoginBase from './LoginBase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

export default function AuthScreen({
  children,
  header,
  topContent,
  hideTopContentOnKeyboard,
  showBackButton,
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
}: AuthScreenProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const androidStatusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0;
  const safeTopInset = Math.max(insets.top, androidStatusBarHeight);
  const resolvedScrollTopPadding = Math.max(25, safeTopInset + 8);
  const resolvedBackButtonTop = safeTopInset + 10;

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

  const headerWidthStyle = keyboardVisible
    ? headerWidth?.keyboard !== undefined
      ? { width: headerWidth.keyboard }
      : null
    : headerWidth?.default !== undefined
      ? { width: headerWidth.default }
      : null;

  const contentWidthStyle = keyboardVisible
    ? contentWidth?.keyboard !== undefined
      ? { width: contentWidth.keyboard }
      : null
    : contentWidth?.default !== undefined
      ? { width: contentWidth.default }
      : null;

  const centerPosition = keyboardVisible
    ? containerPosition?.keyboard || 'relative'
    : containerPosition?.default || 'absolute';

  const { contentContainerStyle: contentContainerStyleProp, ...restKeyboardAwareProps } =
    keyboardAwareProps || {};

  const scrollContainerStyles = [
    styles.scrollContainer,
    { paddingTop: resolvedScrollTopPadding },
    typeof scrollContainerStyle === 'function'
      ? scrollContainerStyle({ keyboardVisible })
      : scrollContainerStyle,
    contentContainerStyleProp,
  ];

  const bottomSpacing = keyboardBottomSpacing ?? 20;
  const centerContainerStyles = [
    styles.centerContainer,
    { position: centerPosition, paddingTop: keyboardVisible ? paddingTopOnKeyboard || 0 : 0 },
    keyboardVisible && alignTopOnKeyboard ? { justifyContent: 'flex-start' as const } : null,
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
    keyboardVisible && bottomSpacing > 0 ? { marginBottom: bottomSpacing } : null,
    typeof fieldsContainerStyle === 'function'
      ? fieldsContainerStyle({ keyboardVisible })
      : fieldsContainerStyle,
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
    extraScrollHeight: bottomSpacing,
    keyboardShouldPersistTaps: 'handled',
    ...restKeyboardAwareProps,
  };

  const content = (
    <>
      {showBackButton && (
        <View style={backButtonContainerStyles}>
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
        </View>
      )}

      <View style={[centerContainerStyles, keyboardVisible ? {} : null]}>
        {topNode && !(hideTopContentOnKeyboard && keyboardVisible) ? topNode : null}

        {headerNode ? <View style={headerContainerStyles}>{headerNode}</View> : null}

        <View style={[fieldsContainerStyles]}>{childrenNode}</View>
      </View>
    </>
  );

  return (
    <LoginBase>
      {disableScroll ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : !keyboardVisible ? 0 : 0}
        >
          <View
            style={[
              { flex: 1, marginBottom: Platform.OS === 'ios' ? 0 : 22 },
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

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 40,
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
    alignItems: 'flex-start' as const,
  },
});
