import { useState } from 'react';
import { StyleSheet, View, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import AuthScreen from '../../components/pages/login/AuthScreen';
import FancyText from '../../components/FancyText';
import FancyButton from '../../components/buttons/FancyButton';
import DefaultIcons from '../../components/FancyIcons';
import FancyLoading from '../../components/FancyLoading';
import { Pallete } from '../../constants/colors';
import { EXTRA_LARGE_SIZE_FONT, LARGE_SIZE_FONT } from '../../constants/font';
import { useCadastroIgrejaEmail } from '../../hooks/useCadastroIgrejaEmail';
import { ColorUtils } from '../../utils/color_utils';

export default function IgrejaCadastroAguardandoEmailPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');

  const {
    dadosCadastro,
    loadingDados,
    status,
    isLoadingStatus,
    verificarConfirmacao,
    reenviarEmail,
    alterarEmail,
    limparDadosCadastro,
    isReenviando,
    isAlterandoEmail,
    isVerificando,
    cooldownRestante,
    cooldownAtivo,
  } = useCadastroIgrejaEmail({
    onConfirmado: async () => {
      await limparDadosCadastro();
      router.replace('/(auth)/login');
    },
    enablePolling: true,
  });

  const handleVerificar = async () => {
    const confirmado = await verificarConfirmacao();
    if (confirmado) {
      await limparDadosCadastro();
      router.replace('/(auth)/login');
    }
  };

  const handleReenviar = () => {
    reenviarEmail();
  };

  const handleAbrirModalAlterarEmail = () => {
    setNovoEmail(dadosCadastro?.responsavelEmail || '');
    setModalVisible(true);
  };

  const handleAlterarEmail = () => {
    if (!novoEmail.trim()) return;
    alterarEmail(novoEmail.trim(), {
      onSuccess: () => {
        setModalVisible(false);
      },
    });
  };

  const formatarTempoRelativo = (isoDate?: string) => {
    if (!isoDate) return null;
    const data = new Date(isoDate);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `há ${diffHoras}h`;
    return `há ${Math.floor(diffHoras / 24)} dias`;
  };

  const formatarExpiracao = (isoDate?: string) => {
    if (!isoDate) return null;
    const data = new Date(isoDate);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading inicial
  if (loadingDados || isLoadingStatus) {
    return (
      <AuthScreen
        header={() => null}
        scrollContainerStyle={styles.loadingContainer}
      >
        <FancyLoading />
      </AuthScreen>
    );
  }

  // Se não há dados de cadastro, voltar para criar igreja
  if (!dadosCadastro) {
    router.replace('/(auth)/create-igreja-account');
    return null;
  }

  const isExpirado = status?.statusSolicitacao === 'EXPIRADO';

  return (
    <AuthScreen
      disableScroll
      containerPosition={{ default: 'relative', keyboard: 'relative' }}
      scrollContainerStyle={styles.scrollContainer}
      centerContainerStyle={styles.centerContainer}
      headerWidth={{ default: '100%', keyboard: '100%' }}
      contentWidth={{ default: '100%', keyboard: '100%' }}
      fieldsContainerStyle={styles.fieldsContainer}
      header={({ keyboardVisible }) => (
        <View style={{ gap: 5 }}>
          <FancyText
            size={!keyboardVisible ? 'extraLarge' : 'large'}
            type='bold'
            color='white'
            style={{ lineHeight: !keyboardVisible ? EXTRA_LARGE_SIZE_FONT * 1.2 : LARGE_SIZE_FONT * 1.2 }}
          >
            Confirme seu e-mail
          </FancyText>
          <FancyText size={!keyboardVisible ? 'medium' : 'small'} type='medium' color='white'>
            Enviamos um link de confirmação para ativar sua igreja
          </FancyText>
        </View>
      )}
    >
      <View style={styles.content}>
        {/* Card com informações */}
        <View style={styles.card}>
          {/* Ícone de email */}
          <View style={styles.iconContainer}>
            <DefaultIcons.Custom library='MaterialCommunityIcons' name='email-outline' size={40} color={Pallete.primary} />
          </View>

          {/* Email */}
          <View style={styles.emailSection}>
            <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
              E-mail do responsável
            </FancyText>
            <FancyText size='medium' type='semiBold'>
              {dadosCadastro.responsavelEmail}
            </FancyText>
          </View>

          {/* Status */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, isExpirado && styles.statusBadgeExpirado]}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name={isExpirado ? 'alert-circle' : 'clock-outline'}
                size={16}
                color={isExpirado ? Pallete.error : Pallete.warning}
              />
              <FancyText size='extraSmall' type='medium' color={isExpirado ? Pallete.error : Pallete.warning}>
                {isExpirado ? 'Link expirado' : 'Aguardando confirmação'}
              </FancyText>
            </View>

            {status?.emailEnviadoEm && (
              <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                Enviado {formatarTempoRelativo(status.emailEnviadoEm)}
              </FancyText>
            )}

            {status?.linkExpiraEm && !isExpirado && (
              <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                Expira em: {formatarExpiracao(status.linkExpiraEm)}
              </FancyText>
            )}
          </View>

          {/* Dicas */}
          <View style={styles.tipsSection}>
            <View style={styles.tipRow}>
              <DefaultIcons.Custom library='Feather' name='info' size={14} color={Pallete.fonts.inactive} />
              <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={{ flex: 1 }}>
                Verifique a caixa de spam/lixo eletrônico
              </FancyText>
            </View>
            <View style={styles.tipRow}>
              <DefaultIcons.Custom library='Feather' name='check-circle' size={14} color={Pallete.fonts.inactive} />
              <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={{ flex: 1 }}>
                Após confirmar, toque em "Já confirmei"
              </FancyText>
            </View>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.actionsContainer}>
          {/* Botão primário - Já confirmei */}
          <FancyButton
            label={isVerificando ? 'Verificando...' : 'Já confirmei'}
            type='contained'
            disabled={isVerificando}
            icon={{ library: 'Feather', name: 'check', size: 18 }}
            containerStyle={styles.primaryButton}
            onPress={handleVerificar}
          />

          {/* Botão secundário - Reenviar */}
          <FancyButton
            label={cooldownAtivo ? `Reenviar (${cooldownRestante}s)` : 'Reenviar e-mail'}
            type='outlined'
            disabled={isReenviando || cooldownAtivo}
            icon={{ library: 'Feather', name: 'mail', size: 18 }}
            containerStyle={styles.secondaryButton}
            onPress={handleReenviar}
          />

          {/* Link - Alterar email */}
          <FancyButton
            label='Alterar e-mail'
            type='text'
            icon={{ library: 'Feather', name: 'edit-2', size: 16 }}
            onPress={handleAbrirModalAlterarEmail}
          />
        </View>
      </View>

      {/* Modal para alterar email */}
      <Modal
        visible={modalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FancyText size='large' type='bold' style={styles.modalTitle}>
              Alterar e-mail
            </FancyText>

            <FancyText size='small' color={Pallete.fonts.inactive} style={styles.modalSubtitle}>
              Digite o novo e-mail para receber o link de confirmação
            </FancyText>

            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={novoEmail}
                onChangeText={setNovoEmail}
                placeholder='Novo e-mail'
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <FancyButton
                label='Cancelar'
                type='outlined'
                containerStyle={styles.modalButton}
                onPress={() => setModalVisible(false)}
              />
              <FancyButton
                label={isAlterandoEmail ? 'Salvando...' : 'Salvar e reenviar'}
                type='contained'
                disabled={isAlterandoEmail || !novoEmail.trim()}
                containerStyle={styles.modalButton}
                onPress={handleAlterarEmail}
              />
            </View>
          </View>
        </View>
      </Modal>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 70,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    gap: 15,
  },
  fieldsContainer: {
    ...Pallete.shadows[200],
    borderRadius: 15,
    gap: 10,
    backgroundColor: Pallete.backgroundColor,
    alignItems: 'stretch',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.95),
    borderRadius: 12,
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailSection: {
    alignItems: 'center',
    gap: 4,
  },
  statusSection: {
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ColorUtils.lightenColor(Pallete.warning, 0.9),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeExpirado: {
    backgroundColor: ColorUtils.lightenColor(Pallete.error, 0.9),
  },
  tipsSection: {
    width: '100%',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Pallete.borderCard,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionsContainer: {
    gap: 12,
    paddingTop: 20,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalSubtitle: {
    textAlign: 'center',
  },
  modalInputContainer: {
    width: '100%',
  },
  modalInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: Pallete.borderCard,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});
