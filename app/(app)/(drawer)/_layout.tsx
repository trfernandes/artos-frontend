import Drawer from 'expo-router/drawer';
import FancyDrawer from '../../../components/drawer/FancyDrawer';
import { useAuth } from '../../../contexts/AuthContext';

export default function _layout() {
  const { igrejaAtiva, loading } = useAuth();

  if (loading) return null;

  return (
    <Drawer
      drawerContent={(props) => <FancyDrawer {...props} key={igrejaAtiva?.id} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
