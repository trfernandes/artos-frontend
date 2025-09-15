import Drawer from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FancyDrawer from '../../../components/drawer/FancyDrawer';

export default function _layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={props => <FancyDrawer {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      />
    </GestureHandlerRootView>
  );
}
