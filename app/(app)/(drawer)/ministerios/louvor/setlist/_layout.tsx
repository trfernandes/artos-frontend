import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../../components/header/FancyHeader';

export default function MinisterioLouvorSetlistLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen
        name='details'
        options={{
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'SetList',
        }}
      />
    </Stack>
  );
}
