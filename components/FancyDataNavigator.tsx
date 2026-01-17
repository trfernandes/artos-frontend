import { View, StyleSheet } from 'react-native';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';
import FancyButton from './buttons/FancyButton';

export type FancyDataNavigatorProps = {
  title: string;
  subtitle?: string;
  showOpenButton?: boolean;
  onNextPress?: () => void;
  onPreviousPress?: () => void;
  onOpenPress?: () => void;
};

export default function FancyDataNavigator({ showOpenButton = false, ...props }: FancyDataNavigatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.dataContainer}>
          <FancyText size={'large'} type='bold' color={Pallete.fonts.dark}>
            Title
          </FancyText>
          {props.subtitle && (
            <FancyText size={'medium'} type='medium' color={Pallete.fonts.inactive}>
              Subtitle
            </FancyText>
          )}
        </View>
        <View style={styles.buttonsContainer}>
          {showOpenButton && (
            <FancyButton
              icon={{ name: 'external-link', library: 'Feather', color: Pallete.icons.light, size: 16 }}
              containerStyle={styles.button}
              onPress={props.onOpenPress}
            />
          )}
          <FancyButton
            icon={{ name: 'chevron-left', library: 'Entypo', color: Pallete.icons.light, size: 18 }}
            containerStyle={styles.button}
            onPress={props.onPreviousPress}
          />
          <FancyButton
            icon={{ name: 'chevron-right', library: 'Entypo', color: Pallete.icons.light, size: 18 }}
            containerStyle={styles.button}
            onPress={props.onNextPress}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Pallete.backgroundColor2, borderRadius: 5 },
  contentContainer: { padding: 15, flexDirection: 'row' },
  dataContainer: { flex: 1, justifyContent: 'center', gap: 4 },
  buttonsContainer: { flexDirection: 'row', gap: 5 },
  button: { maxWidth: 35, minWidth: 35, maxHeight: 35, minHeight: 35, padding: 0 },
});
