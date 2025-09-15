import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioFuncoesLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Funções', headerRight: () => <MainHeaderButtons /> }} />
    </Stack>
  );
}
