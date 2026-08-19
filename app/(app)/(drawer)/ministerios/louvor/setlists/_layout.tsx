import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../../components/header/MainHeaderButtons';

export default function MinisterioLouvorSetlistsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Meus SetLists',
          header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
          headerRight: () => <MainHeaderButtons />,
        }}
      />
    </Stack>
  );
}
