import FancyPageView from '../../../../components/containers/FancyPageView';
import { useAuth } from '../../../../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../../../../domain/enums/Igreja/voluntario-role.enum';
import DashboardVoluntario from '../../../../components/pages/inicio/DashboardVoluntario';
import DashboardLider from '../../../../components/pages/inicio/DashboardLider';
import DashboardAdmin from '../../../../components/pages/inicio/DashboardAdmin';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import FeedbackPrompt from '../../../../components/FeedbackPrompt';
import FeedbackSheet from '../../../../components/FeedbackSheet';
import { useFeedbackPrompt } from '../../../../hooks/useFeedbackPrompt';

export default function InicioIndex() {
  const { igrejaAtiva } = useAuth();
  const queryClient = useQueryClient();
  const role = igrejaAtiva?.role;
  const { showPrompt, selectedNota, onSelectNota, onSubmitFeedback, onDismiss } =
    useFeedbackPrompt(igrejaAtiva?.id || null);

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

  return (
    <FancyPageView>
      {showPrompt && (
        <FeedbackPrompt
          onSelect={onSelectNota}
          onDismiss={onDismiss}
          isLoading={false}
        />
      )}
      {renderDashboard()}
      <FeedbackSheet
        visible={!!selectedNota}
        nota={selectedNota}
        onSubmit={onSubmitFeedback}
        onDismiss={onDismiss}
      />
    </FancyPageView>
  );
}
