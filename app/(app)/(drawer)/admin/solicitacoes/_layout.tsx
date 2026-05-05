import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import NotificationButton from '../../../../../components/header/NotificationButton';
import { IgrejaVoluntarioRoleEnum } from '../../../../../domain/enums/Igreja/voluntario-role.enum';
import { useRoleGuard } from '../../../../../hooks/useRoleGuard';

export default function SolicitacoesLayout() {
  const { hasAccess, loading } = useRoleGuard([
    IgrejaVoluntarioRoleEnum.ADMIN,
    IgrejaVoluntarioRoleEnum.LIDER,
    'OWNER',
  ]);

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
        options={{
          title: 'Solicitações e Convites',
          headerRight: () => <NotificationButton />,
        }}
      />
    </Stack>
  );
}
