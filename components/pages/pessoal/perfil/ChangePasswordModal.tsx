import FancyModalDialog, { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useForm } from 'react-hook-form';
import ControlledPasswordInput from '../../../forms/ControlledPasswordInput';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';
import { strfyObj } from '../../../../utils/text_utils';

const schema = z
  .object({
    senhaAtual: z.string().min(6, 'Senha atual inválida'),
    novaSenha: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
    confirmarSenha: z.string(),
  })
  .refine(data => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarSenha'],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordModal(props: FancyModalDialogProps) {
  const { changePassword } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange', // 👈 importante para validar em tempo real
  });

  const handleConfirm = handleSubmit(async data => {
    try {
      const ok = await changePassword(data.senhaAtual, data.novaSenha);
      if (ok) {
        props.onConfirm?.();
        Toast.show({ type: 'success', text1: 'Senha alterada com sucesso!' });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao alterar a senha',
          text2: 'Verifique a senha atual e tente novamente.',
        });
      }
    } catch (e: AxiosError | any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao alterar a senha',
        text2: e?.response?.data?.message || 'Tente novamente.',
      });
      console.log('ERRO CHANGE PASSWORD: \n', strfyObj(e));
    }
  });

  return (
    <FancyModalDialog
      {...props}
      centerContainerStyle={{ gap: 15 }}
      title="Alterar Senha"
      onConfirm={handleConfirm}
      button2={{
        disabled: !isValid || isSubmitting, // 👈 botão só habilita quando válido
        label: isSubmitting ? 'Alterando...' : 'Confirmar',
      }}
    >
      <ControlledPasswordInput control={control} name="senhaAtual" label="Senha Atual" />
      <ControlledPasswordInput control={control} name="novaSenha" label="Nova Senha" />
      <ControlledPasswordInput control={control} name="confirmarSenha" label="Confirmar Nova Senha" />
    </FancyModalDialog>
  );
}
