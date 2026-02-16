import Drawer from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import FancyDrawer from '../../../components/drawer/FancyDrawer';
import { useAuth } from '../../../contexts/AuthContext';

export default function _layout() {
  const { igrejaAtiva, user, loading } = useAuth();

  if (loading) return null;

  if (user && (!user.igrejas || user.igrejas.length === 0)) {
    return <Redirect href='/(app)/join-church' />;
  }
  
  return (
    <Drawer
      drawerContent={(props) => <FancyDrawer {...props} key={igrejaAtiva?.id} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
