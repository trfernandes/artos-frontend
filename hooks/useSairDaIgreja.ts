import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import apiClient from '../domain/api/api-client';
import { IgrejaVoluntarioRoleEnum } from '../domain/enums/Igreja/voluntario-role.enum';
import { useAuth } from '../contexts/AuthContext';
import { FancyAlert } from '../components/modal/FancyAlert';

type SairDaIgrejaParams = {
  igrejaId: string;
  role?: IgrejaVoluntarioRoleEnum;
};

export const useSairDaIgreja = () => {
  const queryClient = useQueryClient();
  const { user, refreshMe } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ igrejaId, voluntarioId }: { igrejaId: string; voluntarioId: string }) => {
      const { data } = await apiClient.delete(`/igrejas/${igrejaId}/voluntarios/${voluntarioId}`);
      return data?.data ?? data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['igrejas'] });
      await refreshMe();
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Você saiu da igreja com sucesso.',
      });
    },
    onError: (error: any) => {
      const mensagem = error?.response?.data?.message || 'Não foi possível sair da igreja. Tente novamente.';
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: mensagem,
      });
    },
  });

  const validateRole = (role?: IgrejaVoluntarioRoleEnum) => {
    if (role === IgrejaVoluntarioRoleEnum.ADMIN) {
      FancyAlert.alert(
        'Ação não permitida',
        'Administradores devem excluir a igreja nas configurações para sair.',
      );
      return false;
    }
    return true;
  };

  const sairDaIgreja = ({ igrejaId, role }: SairDaIgrejaParams) => {
    if (!validateRole(role)) return;
    const voluntarioId = user?.user?.id;
    if (!voluntarioId) {
      FancyAlert.alert('Erro', 'Não foi possível identificar o usuário.');
      return;
    }
    mutation.mutate({ igrejaId, voluntarioId });
  };

  return {
    sairDaIgreja,
    validateRole,
    isPending: mutation.isPending,
  };
};
