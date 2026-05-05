import { StyleSheet, View } from 'react-native';
import NotificationButton from './NotificationButton';

export default function MainHeaderButtons() {
  return (
    <View style={styles.container}>
      <NotificationButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: 0 },
});
