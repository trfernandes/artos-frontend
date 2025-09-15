import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisteriosLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Ministérios', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name="add"
        options={{ title: 'Novo Ministério', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: 'Editar Ministério', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
    </Stack>
  );
}
