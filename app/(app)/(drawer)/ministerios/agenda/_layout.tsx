import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioEventosLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Agenda', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name="details"
        options={{
          header: props => <FancyHeader leftButton="back" {...props} />,
          title: 'Detalhes do Evento',
        }}
      />
    </Stack>
  );
}
