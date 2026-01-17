import React, { useEffect, useState } from 'react';
import { DimensionValue, Keyboard, KeyboardAvoidingView, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewProps } from 'react-native-keyboard-aware-scroll-view';
import FancyButton from '../../buttons/FancyButton';
import { DefaultIconsNames } from '../../../constants/icons';
import { Pallete } from '../../../constants/colors';
import { router } from 'expo-router';
import LoginBase from './LoginBase';

type WidthOptions = { default?: DimensionValue; keyboard?: DimensionValue };
type RenderContent = React.ReactNode | ((params: { keyboardVisible: boolean }) => React.ReactNode);
type StyleWithKeyboard = StyleProp<ViewStyle> | ((params: { keyboardVisible: boolean }) => StyleProp<ViewStyle>);

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
  keyboardAwareProps,
  disableScroll = false,
}: AuthScreenProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

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

  const centerPosition = keyboardVisible ? containerPosition?.keyboard || 'relative' : containerPosition?.default || 'absolute';

  const { contentContainerStyle: contentContainerStyleProp, ...restKeyboardAwareProps } = keyboardAwareProps || {};

  const scrollContainerStyles = [
    styles.scrollContainer,
    typeof scrollContainerStyle === 'function' ? scrollContainerStyle({ keyboardVisible }) : scrollContainerStyle,
    contentContainerStyleProp,
  ];

  const centerContainerStyles = [
    styles.centerContainer,
    { position: centerPosition, paddingTop: keyboardVisible ? paddingTopOnKeyboard || 0 : 0 },
    typeof centerContainerStyle === 'function' ? centerContainerStyle({ keyboardVisible }) : centerContainerStyle,
  ];

  const headerContainerStyles = [
    styles.headerContainer,
    headerWidthStyle,
    typeof headerContainerStyle === 'function' ? headerContainerStyle({ keyboardVisible }) : headerContainerStyle,
  ];

  const fieldsContainerStyles = [
    styles.fieldsContainer,
    contentWidthStyle,
    typeof fieldsContainerStyle === 'function' ? fieldsContainerStyle({ keyboardVisible }) : fieldsContainerStyle,
  ];

  const backButtonContainerStyles = [
    styles.backButtonContainer,
    typeof backButtonContainerStyle === 'function' ? backButtonContainerStyle({ keyboardVisible }) : backButtonContainerStyle,
  ];

  const scrollProps: KeyboardAwareScrollViewProps = {
    enableOnAndroid: true,
    enableAutomaticScroll: true,
    extraScrollHeight: 20,
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
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </View>
      )}

      <View style={centerContainerStyles}>
        {topNode && !(hideTopContentOnKeyboard && keyboardVisible) ? topNode : null}

        {headerNode ? <View style={headerContainerStyles}>{headerNode}</View> : null}

        <View style={fieldsContainerStyles}>{childrenNode}</View>
      </View>
    </>
  );

  return (
    <LoginBase>
      {disableScroll ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -10}
        >
          <View style={[{ flex: 1 }, scrollContainerStyles]}>{content}</View>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAwareScrollView  {...scrollProps}  contentContainerStyle={scrollContainerStyles}>
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
    borderWidth: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    gap: 20,
    borderWidth: 0,
  },
  headerContainer: {
    gap: 6,
    borderWidth: 0,
  },
  fieldsContainer: {
    borderRadius: 15,
    padding: 25,
    gap: 15,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
    borderWidth: 0,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 25,
    top: 20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 0,
  },
});
