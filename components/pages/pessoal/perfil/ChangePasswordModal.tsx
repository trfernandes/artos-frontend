import { StyleSheet, View } from 'react-native';
import { FancyModalDialogProps } from '../../../modal/FancyModalDialog';
import { useForm } from 'react-hook-form';
import ControlledPasswordInput from '../../../forms/ControlledPasswordInput';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancyText from '../../../FancyText';
import { usePallete } from '../../../../hooks/usePallete';

const schema = z
  .object({
    senhaAtual: z.string().min(6, 'Senha atual inválida'),
    novaSenha: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarSenha'],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordModal(props: FancyModalDialogProps<any>) {
  const { changePassword } = useAuth();
  const palette = usePallete();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const visible = Boolean(props.modalProps?.visible);
  const handleClose = () => props.onButton1Press?.();

  const handleConfirm = handleSubmit(async (data) => {
    try {
      const ok = await changePassword(data.senhaAtual, data.novaSenha);
      if (ok) {
        props.onButton2Press?.();
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
    }
  });

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={handleClose}
      title='Alterar senha'
      footer={
        <View style={styles.footerActions}>
          <FancyButton
            label='Cancelar'
            type='outlined'
            onPress={handleClose}
            disabled={isSubmitting}
            containerStyle={styles.footerButton}
          />
          <FancyButton
            label={isSubmitting ? 'Alterando...' : 'Confirmar'}
            icon={{ library: 'MaterialCommunityIcons', name: 'lock-check-outline', size: 16 }}
            onPress={handleConfirm}
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            containerStyle={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.introBlock}>
          <FancyText type='bold' size='medium' color={palette.fonts.dark}>
            Atualize sua senha de acesso
          </FancyText>
          <FancyText size='small' color={palette.fonts.inactive}>
            Informe a senha atual e escolha uma nova senha com pelo menos 6 caracteres.
          </FancyText>
        </View>

        <ControlledPasswordInput control={control} name='senhaAtual' label='Senha atual' />
        <ControlledPasswordInput control={control} name='novaSenha' label='Nova senha' />
        <ControlledPasswordInput control={control} name='confirmarSenha' label='Confirmar nova senha' />
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  introBlock: {
    gap: 4,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
  footerButton: {
    flex: 1,
    height: 38,
  },
});
