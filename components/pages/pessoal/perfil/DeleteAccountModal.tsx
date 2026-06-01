import { useState } from 'react';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useAuth } from '../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyVerticalSpacer from '../../../FancyVerticalSpacer';

export default function DeleteAccountModal(props: FancyModalDialogProps<any>) {
  const Pallete = usePallete();
  const { deleteAccount } = useAuth();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleConfirm = async () => {
    if (!senha.trim()) {
      setErro('Digite sua senha para confirmar.');
      return;
    }
    setErro('');
    const ok = await deleteAccount(senha);
    if (ok) {
      Toast.show({ type: 'success', text1: 'Conta excluída com sucesso' });
      props.onButton2Press?.();
    } else {
      Toast.show({ type: 'error', text1: 'Erro ao excluir conta', text2: 'Tente novamente.' });
    }
  };

  return (
    <FancyModalDialog
      {...props}
      title='Excluir Conta'
      onButton2Press={handleConfirm}
      button1={{ label: 'Cancelar' }}
      button2={{
        label: 'Sim, excluir',
        containerStyle: { backgroundColor: Pallete.error },
      }}
    >
      <FancyText>
        Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.
      </FancyText>
      <FancyVerticalSpacer height={12} />
      <FancyTextInput
        label='Confirme sua senha'
        value={senha}
        errorMessage={erro}
        inputProps={{
          secureTextEntry: true,
          autoCapitalize: 'none',
          onChangeText: (v: string) => {
            setSenha(v);
            setErro('');
          },
        }}
      />
    </FancyModalDialog>
  );
}
