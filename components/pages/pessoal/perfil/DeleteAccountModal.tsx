import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useAuth } from '../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import FancyText from '../../../FancyText';
import { Pallete } from '../../../../constants/colors';

export default function DeleteAccountModal(props: FancyModalDialogProps) {
  const { deleteAccount } = useAuth();

  const handleConfirm = async () => {
    const ok = await deleteAccount();
    if (ok) {
      Toast.show({ type: 'success', text1: 'Conta excluída com sucesso' });
      props.onConfirm?.(); // fecha modal e volta tela inicial
    } else {
      Toast.show({ type: 'error', text1: 'Erro ao excluir conta', text2: 'Tente novamente.' });
    }
  };

  return (
    <FancyModalDialog
      {...props}
      title="Excluir Conta"
      OnButton2Press={handleConfirm}
      button1={{
        label: 'Cancelar',
      }}
      button2={{
        label: 'Sim, excluir',
        containerStyle: { backgroundColor: Pallete.error },
      }}
    >
      <FancyText>Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.</FancyText>
    </FancyModalDialog>
  );
}
