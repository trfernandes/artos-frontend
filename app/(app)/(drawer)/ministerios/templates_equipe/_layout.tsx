import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioTemplateEquipeLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Templates de Equipe', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen name="form" options={{ header: props => <FancyHeader leftButton="back" {...props} /> }} />
    </Stack>
  );
}
