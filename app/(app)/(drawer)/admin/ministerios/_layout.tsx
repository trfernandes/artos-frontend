import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';
import { IgrejaVoluntarioRoleEnum } from '../../../../../domain/enums/Igreja/voluntario-role.enum';
import { useRoleGuard } from '../../../../../hooks/useRoleGuard';

export default function MinisteriosLayout() {
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
        options={{ title: 'Ministérios', headerRight: () => <MainHeaderButtons /> }}
      />
      <Stack.Screen
        name='add'
        options={{
          title: 'Novo Ministério',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
      <Stack.Screen
        name='edit'
        options={{
          title: 'Editar Ministério',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
    </Stack>
  );
}
