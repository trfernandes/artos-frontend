import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import FancyButton from '../../../components/buttons/FancyButton';
import FancyText from '../../../components/FancyText';
import FancyImage from '../../../components/images/FancyImage';
import AuthScreen from '../../../components/pages/login/AuthScreen';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useAuth } from '../../../contexts/AuthContext';
import { IgrejaRepository } from '../../../domain/services/IgrejaRepository';
import { ResponseConvitePreviewDto } from '../../../domain/dtos/Igreja/response-convite-preview.dto';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const DEFAULT_LOGO =
  'data:image/png;base64,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';

const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

function getErrorMessage(error: AxiosError | any): string {
  const data = error?.response?.data;
  const status = error?.response?.status;
  const errorCode = data?.code || data?.error?.code || data?.errorCode;
  const message = data?.message || data?.error?.message;

  if (status === 404 || errorCode === 'CONVITE_NAO_ENCONTRADO') {
    return 'Convite não encontrado. Verifique o código e tente novamente.';
  }

  if (errorCode === 'CONVITE_EXPIRADO') {
    return 'Este convite já expirou. Solicite um novo convite.';
  }

  if (errorCode === 'CONVITE_REVOGADO') {
    return 'Este convite foi revogado e não pode mais ser utilizado.';
  }

  if (errorCode === 'CONVITE_LIMITE_ATINGIDO') {
    return 'Este convite atingiu o limite de usos.';
  }

  if (errorCode === 'JA_MEMBRO') {
    return 'Você já é membro desta igreja.';
  }

  if (errorCode === 'SOLICITACAO_PENDENTE') {
    return 'Você já possui uma solicitação pendente para esta igreja.';
  }

  if (message) {
    return message;
  }

  return 'Ocorreu um erro. Tente novamente.';
}

export default function InviteTokenPage() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const { token: urlToken } = useLocalSearchParams<{ token: string }>();
  const { user, setIgrejaAtiva, updateUser, refreshMe } = useAuth();

  const [loadingPreview, setLoadingPreview] = useState(true);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [preview, setPreview] = useState<ResponseConvitePreviewDto | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleInvite = async () => {
      if (!urlToken) {
        setError('Token de convite inválido');
        setLoadingPreview(false);
        return;
      }

      // Se não estiver logado, salvar token e redirecionar para login
      if (!user) {
        await AsyncStorage.setItem(PENDING_INVITE_TOKEN_KEY, urlToken);
        Toast.show({
          type: 'info',
          text1: 'Faça login para aceitar o convite',
        });
        router.replace('/(auth)/login');
        return;
      }

      // Se logado, fazer preview
      try {
        const previewData = await IgrejaRepository.getConvitePreview(urlToken);
        setPreview(previewData);
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: errorMsg,
        });
      } finally {
        setLoadingPreview(false);
      }
    };

    handleInvite();
  }, [urlToken, user]);

  const handleAccept = async () => {
    if (!urlToken || loadingAccept) return;

    setLoadingAccept(true);
    try {
      const result = await IgrejaRepository.aceitarConvite(urlToken);

      if (result.result === 'MEMBER_CREATED') {
        Toast.show({
          type: 'success',
          text1: 'Bem-vindo!',
          text2: 'Você agora faz parte da igreja.',
        });

        // Refresh session
        await refreshMe();

        router.replace('/(app)');
      } else if (result.result === 'REQUEST_CREATED') {
        Toast.show({
          type: 'info',
          text1: 'Solicitação enviada',
          text2: 'Aguarde a aprovação da liderança.',
        });
        router.replace('/(app)/join-church/requests');
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      Toast.show({
        type: 'error',
        text1: 'Erro ao aceitar convite',
        text2: errorMsg,
      });
    } finally {
      setLoadingAccept(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(user ? '/(app)' : '/(auth)/login');
    }
  };

  if (loadingPreview) {
    return (
      <AuthScreen showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Pallete.primary} />
          <FancyText style={styles.loadingText}>Carregando convite...</FancyText>
        </View>
      </AuthScreen>
    );
  }

  if (error || !preview) {
    return (
      <AuthScreen showBackButton>
        <View style={styles.container}>
          <FancyText type="bold" size="large" style={styles.title}>
            Erro ao carregar convite
          </FancyText>
          <FancyText style={styles.errorText}>{error || 'Convite não encontrado'}</FancyText>
          <FancyButton label="Voltar" onPress={handleBack} containerStyle={styles.button} />
        </View>
      </AuthScreen>
    );
  }

  const expiresText = preview.expiresAt
    ? formatInTimeZone(new Date(preview.expiresAt), 'America/Sao_Paulo', "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : 'Sem expiração';

  return (
    <AuthScreen showBackButton>
      <View style={styles.container}>
        <FancyText type="bold" size="large" style={styles.title}>
          Você foi convidado!
        </FancyText>

        <View style={styles.churchCard}>
          <FancyImage
            source={{ uri: DEFAULT_LOGO }}
            size={60}
            style={styles.logo}
          />
          <FancyText type="semiBold" size="large" style={styles.churchName}>
            {preview.igrejaNome}
          </FancyText>
          <FancyText size="small" style={styles.infoText}>
            Válido até: {expiresText}
          </FancyText>
          {preview.autoApprove && (
            <View style={styles.autoApproveBadge}>
              <FancyText size="extraSmall" style={styles.autoApproveText}>
                Aprovação automática
              </FancyText>
            </View>
          )}
        </View>

        <FancyButton
          label={loadingAccept ? 'Aceitando...' : 'Aceitar convite'}
          onPress={handleAccept}
          disabled={loadingAccept}
          containerStyle={styles.button}
        />

        <FancyButton
          label="Cancelar"
          type="outlined"
          onPress={handleBack}
          disabled={loadingAccept}
          containerStyle={styles.button}
        />
      </View>
    </AuthScreen>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      color: palette.fonts.inactive,
    },
    container: {
      flex: 1,
      padding: 20,
      gap: 20,
    },
    title: {
      textAlign: 'center',
      marginBottom: 10,
    },
    churchCard: {
      backgroundColor: palette.backgroundColor2,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      gap: 12,
    },
    logo: {
      borderRadius: 30,
    },
    churchName: {
      textAlign: 'center',
    },
    infoText: {
      color: palette.fonts.inactive,
      textAlign: 'center',
    },
    autoApproveBadge: {
      backgroundColor: palette.confirm,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: 8,
    },
    autoApproveText: {
      color: 'white',
    },
    button: {
      marginTop: 8,
    },
    errorText: {
      color: palette.error,
      textAlign: 'center',
      marginVertical: 20,
    },
  });
}
