import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioConfiguracoesLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Configurações do Louvor',
          headerRight: () => <MainHeaderButtons />,
          header: props => <FancyHeader leftButton="back" {...props} />,
        }}
      />
    </Stack>
  );
}
