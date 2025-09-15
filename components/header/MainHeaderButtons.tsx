import { StyleSheet, View } from 'react-native';
import FancyHeaderButton from './FancyHeaderButton';
import { router } from 'expo-router';
import { Pallete } from '../../constants/colors';

export default function MainHeaderButtons() {
  return (
    <View style={styles.container}>
      <View style={styles.hasNotificationContainer}>
        <View style={styles.hasNotification} />
      </View>
      <FancyHeaderButton
        icon={{ library: 'Feather', name: 'bell', size: 20 }}
        onPress={function (): void {
          router.push('/notifications');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: 3 },
  hasNotification: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: Pallete.error,
  },
  hasNotificationContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: 8,
    top: 4,
    padding: 1.2,
    borderRadius: 4,
    backgroundColor: 'white',
    zIndex: 1,
  },
});
