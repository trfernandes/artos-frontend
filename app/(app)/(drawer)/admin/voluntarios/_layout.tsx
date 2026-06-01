import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import NotificationButton from '../../../../../components/header/NotificationButton';
import { IgrejaVoluntarioRoleEnum } from '../../../../../domain/enums/Igreja/voluntario-role.enum';
import { useRoleGuard } from '../../../../../hooks/useRoleGuard';

export default function VoluntariosLayout() {
  const { hasAccess, loading } = useRoleGuard([IgrejaVoluntarioRoleEnum.ADMIN, 'OWNER']);

  if (loading || !hasAccess) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{ title: 'Voluntários', headerRight: () => <NotificationButton /> }}
      />
      <Stack.Screen
        name='details'
        options={{
          title: 'Detalhes',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
    </Stack>
  );
}
