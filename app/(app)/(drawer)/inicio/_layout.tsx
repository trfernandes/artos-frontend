import { Stack } from 'expo-router';
import FancyHeader from '../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../components/header/MainHeaderButtons';

export default function InicioLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Início',
          header: props => <FancyHeader leftButton="menu" {...props} />,
          headerRight: () => <MainHeaderButtons />,
        }}
      />
    </Stack>
  );
}
