import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { DefaultIconsNames } from '../../constants/icons';
import FancyHeaderButton from './FancyHeaderButton';
import { useTopSafeInset } from '../../hooks/useTopSafeInset';
import { usePallete } from '../../hooks/usePallete';

const HEADER_CONTENT_HEIGHT = 40;
const HEADER_HORIZONTAL_GUTTER = 15;

export type FancyHeaderProps = {
  leftButton?: 'menu' | 'back' | 'close' | React.ReactNode;
  leftButtonOnPress?: () => void;
  applyTopSafeArea?: boolean;
} & Partial<NativeStackHeaderProps>;

export default function FancyPageHeader({
  navigation,
  back,
  options,
  leftButtonOnPress,
  applyTopSafeArea = true,
  ...props
}: FancyHeaderProps) {
  const nav = useNavigation<DrawerNavigationProp<Record<string, object>>>();
  const topSafeInset = useTopSafeInset();
  const palette = usePallete();
  const topInset = applyTopSafeArea ? topSafeInset : 0;
  const headerHeight = topInset + HEADER_CONTENT_HEIGHT;

  return (
    <View
      style={[
        styles.container,
        {
          height: headerHeight,
          paddingTop: topInset,
          backgroundColor: palette.backgroundColor,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.leftContainer}>
          {props.leftButton === 'menu' ? (
            <HeaderMenuButton title={options?.title} onPress={() => nav.toggleDrawer()} color={palette.fonts.dark} />
          ) : back || props.leftButton === 'back' ? (
            <HeaderBackButton
              title={options?.title}
              onPress={leftButtonOnPress || navigation?.goBack || nav.goBack}
              color={palette.fonts.dark}
            />
          ) : (
            <HeaderMenuButton title={options?.title} onPress={() => nav.toggleDrawer()} color={palette.fonts.dark} />
          )}
        </View>
        {options?.headerRight && (
          <View style={styles.rightContainer}>
            {options.headerRight?.({
              canGoBack: false,
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const HeaderMenuButton = (props: { title?: string; onPress?: () => void; color: string }) => (
  <View style={[styles.buttonContainer, { position: 'absolute', left: HEADER_HORIZONTAL_GUTTER, gap: 10 }]}>
    <FancyHeaderButton
      icon={{ ...DefaultIconsNames.menu, size: 24 }}
      onPress={props.onPress!}
      buttonProps={{
        containerStyle: {
          width: 24,
          minWidth: 24,
        },
      }}
    />
    {props.title && (
      <FancyText size='medium' type='bold' color={props.color} style={styles.headerTitle} numberOfLines={1} ellipsizeMode='tail'>
        {props.title}
      </FancyText>
    )}
  </View>
);

const HeaderBackButton = (props: { title?: string; onPress: () => void; color: string }) => (
  <View style={[styles.buttonContainer, { position: 'absolute', left: HEADER_HORIZONTAL_GUTTER, gap: 10, borderWidth: 0 }]}>
    <FancyHeaderButton
      icon={{ library: 'MaterialCommunityIcons', name: 'arrow-left-thin', size: 28 }}
      onPress={props.onPress}
      buttonProps={{
        containerStyle: {
          width: 28,
          minWidth: 28,
        },
      }}
    />
    {props.title && (
      <FancyText size='medium' type='bold' color={props.color} style={styles.headerTitle} numberOfLines={1} ellipsizeMode='tail'>
        {props.title}
      </FancyText>
    )}
  </View>
);

const DESING_MODE = 0;

const styles = StyleSheet.create({
  container: {
    borderWidth: DESING_MODE,
    borderColor: 'black',
    backgroundColor: 'transparent',
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 0,
    gap: 10,
    alignItems: 'center',
  },
  buttonContainer: { justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  leftContainer: {
    flex: 1,
    borderColor: 'red',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    height: '100%',
  },
  rightContainer: {
    borderWidth: DESING_MODE,
    borderColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HEADER_HORIZONTAL_GUTTER,
  },
  headerTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    lineHeight: 22,
    borderWidth: 0,
  },
});
