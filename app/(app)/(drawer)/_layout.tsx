import Drawer from 'expo-router/drawer';
import FancyDrawer from '../../../components/drawer/FancyDrawer';

export default function _layout() {
  return (
    <Drawer
      drawerContent={(props) => <FancyDrawer {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
