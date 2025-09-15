import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function VoluntariosLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Voluntários', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name="details"
        options={{ title: '', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
    </Stack>
  );
}
