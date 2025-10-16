import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioEscalasLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Escalas', headerRight: () => <MainHeaderButtons /> }} />     
      <Stack.Screen
        name="edit"
        options={{ title: 'Editar Evento', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
      <Stack.Screen
        name="assistant"
        options={{ title: 'Assistente de Escala', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
    </Stack>
  );
}
