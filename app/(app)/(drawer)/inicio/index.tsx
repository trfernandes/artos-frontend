import FancyPageView from '../../../../components/containers/FancyPageView';
import { useAuth } from '../../../../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../../../../domain/enums/Igreja/voluntario-role.enum';
import DashboardVoluntario from '../../../../components/pages/inicio/DashboardVoluntario';
import DashboardLider from '../../../../components/pages/inicio/DashboardLider';
import DashboardAdmin from '../../../../components/pages/inicio/DashboardAdmin';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function InicioIndex() {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();
  const role = igrejaAtiva?.role;

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.refetchQueries({ queryKey: ['dashboard'], type: 'active' });
    }, [queryClient]),
  );

  const renderDashboard = () => {
    switch (role) {
      case IgrejaVoluntarioRoleEnum.ADMIN:
        return <DashboardAdmin />;
      case IgrejaVoluntarioRoleEnum.LIDER:
        return <DashboardLider />;
      default:
        return <DashboardVoluntario />;
    }
  };

  return <FancyPageView>{renderDashboard()}</FancyPageView>;
}
