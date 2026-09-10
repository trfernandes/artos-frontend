import { useState } from 'react';
import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useAuth } from '../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';
import FancyTextInput from '../../../fields/FancyTextInput';
import FancyVerticalSpacer from '../../../FancyVerticalSpacer';

const PALAVRA_CONFIRMACAO = 'EXCLUIR';

export default function DeleteAccountModal(props: FancyModalDialogProps<any>) {
  const Pallete = usePallete();
  const { deleteAccount } = useAuth();
  const [senha, setSenha] = useState('');
  const [palavraConfirmacao, setPalavraConfirmacao] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroPalavra, setErroPalavra] = useState('');

  const handleConfirm = async () => {
    let temErro = false;
    if (!senha.trim()) {
      setErroSenha('Digite sua senha para confirmar.');
      temErro = true;
    }
    if (palavraConfirmacao.trim().toUpperCase() !== PALAVRA_CONFIRMACAO) {
      setErroPalavra(`Digite "${PALAVRA_CONFIRMACAO}" para confirmar.`);
      temErro = true;
    }
    if (temErro) return;

    try {
      const ok = await deleteAccount(senha);
      if (ok) {
        Toast.show({ type: 'success', text1: 'Conta excluída com sucesso' });
        props.onButton2Press?.();
      } else {
        Toast.show({ type: 'error', text1: 'Erro ao excluir conta', text2: 'Tente novamente.' });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir conta',
        text2: 'Verifique sua senha e tente novamente.',
      });
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
        Tem certeza que deseja excluir sua conta? Seus dados pessoais serão anonimizados e essa ação
        não pode ser desfeita.
      </FancyText>
      <FancyVerticalSpacer height={12} />
      <FancyTextInput
        label='Confirme sua senha'
        value={senha}
        errorMessage={erroSenha}
        inputProps={{
          secureTextEntry: true,
          autoCapitalize: 'none',
          onChangeText: (v: string) => {
            setSenha(v);
            setErroSenha('');
          },
        }}
      />
      <FancyVerticalSpacer height={12} />
      <FancyTextInput
        label={`Digite "${PALAVRA_CONFIRMACAO}" para confirmar`}
        value={palavraConfirmacao}
        errorMessage={erroPalavra}
        inputProps={{
          autoCapitalize: 'characters',
          onChangeText: (v: string) => {
            setPalavraConfirmacao(v);
            setErroPalavra('');
          },
        }}
      />
    </FancyModalDialog>
  );
}
