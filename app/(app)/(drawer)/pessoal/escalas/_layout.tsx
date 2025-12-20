import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function EscalasLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Minhas Escalas', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name="evento"
        options={{ title: 'Detalhes de Evento', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
    </Stack>
  );
}
