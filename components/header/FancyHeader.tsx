import { StyleSheet, View } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { DefaultIconsNames } from '../../constants/icons';
import FancyHeaderButton from './FancyHeaderButton';

export type FancyHeaderProps = {
  leftButton?: 'menu' | 'back' | 'close' | React.ReactNode;
} & NativeStackHeaderProps;

export default function FancyHeader({ navigation, back, options, ...props }: FancyHeaderProps) {
  const nav = useNavigation<DrawerNavigationProp<Record<string, object>>>();

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {back && props.leftButton === 'back' ? (
          <HeaderBackButton title={options.title} onPress={navigation.goBack} />
        ) : (
          <HeaderMenuButton title={options.title} onPress={() => nav.toggleDrawer()} />
        )}
      </View>
      {options.headerRight && (
        <View style={styles.rightContainer}>
          {options.headerRight?.({
            canGoBack: false,
          })}
        </View>
      )}
    </View>
  );
}

const HeaderMenuButton = (props: { title?: string; onPress?: () => void }) => (
  <View style={[styles.buttonContainer, { position: 'absolute', left: 10, gap: 2 }]}>
    <FancyHeaderButton
      icon={{ ...DefaultIconsNames.menu, size: 24 }}
      onPress={props.onPress!}
      buttonProps={{
        containerStyle: {
          marginLeft: -6,
        },
      }}
    />
    {props.title && (
      <FancyText size="medium" type="bold" color={Pallete.fonts.dark} style={styles.headerTitle}>
        {props.title}
      </FancyText>
    )}
  </View>
);

const HeaderBackButton = (props: { title?: string; onPress: () => void }) => (
  <View style={[styles.buttonContainer, { position: 'absolute', left: 15, gap: 4, marginLeft: -10 }]}>
    <FancyHeaderButton
      icon={{ library: 'MaterialCommunityIcons', name: 'arrow-left-thin', size: 28 }}
      onPress={props.onPress}
      buttonProps={{
        containerStyle: {
          width: 36,
        },
      }}
    />
    {props.title && (
      <FancyText size="medium" type="bold" color={Pallete.fonts.dark} style={styles.headerTitle}>
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
    backgroundColor: Pallete.backgroundColor,
    flexDirection: 'row',
    paddingRight: 0,
    gap: 10,
    alignItems: 'center',
    height: 40,
  },
  buttonContainer: { justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  leftContainer: {
    flex: 1,
    borderWidth: DESING_MODE,
    borderColor: 'red',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    height: '100%',
  },
  rightContainer: { borderWidth: DESING_MODE, borderColor: 'blue', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { alignItems: 'center', justifyContent: 'center', flex: 1, lineHeight: 22, borderWidth: 0 },
});
