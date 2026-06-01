import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';
import FancyButton from '../../../components/buttons/FancyButton';
import FancyText from '../../../components/FancyText';
import FancyImage from '../../../components/images/FancyImage';
import FancyTextInput from '../../../components/fields/FancyTextInput';
import DefaultIcons from '../../../components/FancyIcons';
import FancyPageView from '../../../components/containers/FancyPageView';
import FancyScrollView from '../../../components/FancyScrollView';
import { ThemePalette } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { IgrejaRepository } from '../../../domain/services/IgrejaRepository';
import { ResponseConvitePreviewDto } from '../../../domain/dtos/Igreja/response-convite-preview.dto';
import { extractInviteToken } from '../../../utils/inviteToken';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

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
    return 'Você já faz parte desta igreja.';
  }

  if (errorCode === 'SOLICITACAO_PENDENTE') {
    return 'Você já possui uma solicitação pendente para esta igreja.';
  }

  if (message) {
    return message;
  }

  return 'Ocorreu um erro. Tente novamente.';
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export default function JoinChurchPage() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const { refreshMe } = useAuth();
  const { data: solicitacoes } = useQuery({
    queryKey: ['join-church-requests'],
    queryFn: () => IgrejaRepository.listarMinhasSolicitacoes(),
    refetchOnMount: 'always',
  });
  const pendingCount = solicitacoes?.filter((s) => s.status === 'PENDING').length ?? 0;
  const [token, setToken] = useState('');
  const [preview, setPreview] = useState<ResponseConvitePreviewDto | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    const extractedToken = extractInviteToken(token);

    if (!extractedToken) {
      setError('Digite o código do convite');
      return;
    }

    setLoadingPreview(true);
    setPreview(null);
    setError(null);

    try {
      const previewData = await IgrejaRepository.getConvitePreview(extractedToken);
      setPreview(previewData);
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAccept = async () => {
    const extractedToken = extractInviteToken(token);

    if (!extractedToken || !preview || loadingAccept) return;

    setLoadingAccept(true);
    setError(null);
    try {
      const result = await IgrejaRepository.aceitarConvite(extractedToken);

      if (result.result === 'MEMBER_CREATED') {
        Toast.show({
          type: 'success',
          text1: 'Bem-vindo!',
          text2: 'Você agora faz parte da igreja.',
        });
        await refreshMe();
        router.replace('/(app)/(drawer)');
      } else if (result.result === 'REQUEST_CREATED') {
        Toast.show({
          type: 'info',
          text1: 'Solicitação enviada',
          text2: 'Aguarde a aprovação da liderança.',
        });
        router.push('/(app)/join-church/requests');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoadingAccept(false);
    }
  };

  const handleReset = () => {
    setToken('');
    setPreview(null);
    setError(null);
  };

  const expiresText = preview?.expiresAt
    ? (() => {
        const [datePart] = preview.expiresAt.split(/[T ]/);
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      })()
    : null;

  return (
    <FancyPageView style={styles.pageContainer}>
      <FancyScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Estado A: Inserir código */}
        {!preview && (
          <View style={styles.inputSection}>
            {/* Ícone central */}
            <View style={styles.iconContainer}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='ticket-confirmation-outline'
                size={48}
                color={Pallete.primary}
              />
            </View>

            <FancyText type='bold' size='large' style={styles.title}>
              Entrar em uma igreja
            </FancyText>
            <FancyText size='small' color={Pallete.fonts.inactive} style={styles.subtitle}>
              Cole o código de convite que você recebeu do responsável da igreja
            </FancyText>

            <View style={styles.inputCard}>
              <FancyTextInput
                placeholder='Digite ou cole o código aqui'
                value={token}
                disabled={loadingPreview}
                inputProps={{
                  autoCapitalize: 'none',
                  autoCorrect: false,
                  multiline: false,
                  onChangeText: (text) => {
                    setToken(text);
                    setError(null);
                  },
                  onSubmitEditing: handlePreview,
                  returnKeyType: 'go',
                }}
                containerStyle={styles.input}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='error-outline'
                    size={18}
                    color={Pallete.error}
                  />
                  <FancyText size='small' color={Pallete.error} style={styles.errorText}>
                    {error}
                  </FancyText>
                </View>
              )}

              <FancyButton
                label='Buscar igreja'
                isLoading={loadingPreview}
                onPress={handlePreview}
                disabled={loadingPreview || !token.trim()}
                containerStyle={styles.primaryButton}
                icon={{
                  library: 'MaterialIcons',
                  name: 'search',
                  size: 20,
                }}
              />
            </View>

            <View style={styles.infoBox}>
              <DefaultIcons.Custom
                library='MaterialIcons'
                name='info-outline'
                size={18}
                color={Pallete.fonts.inactive}
              />
              <FancyText size='extraSmall' color={Pallete.fonts.inactive} style={styles.infoText}>
                Alguns convites aprovam sua entrada automaticamente. Outros aguardam liberação da
                liderança.
              </FancyText>
            </View>
          </View>
        )}

        {/* Estado B: Igreja encontrada */}
        {preview && (
          <View style={styles.previewSection}>
            {/* Card principal com design moderno */}
            <View style={styles.previewCard}>
              {/* Header com gradiente visual */}
              <View style={styles.cardHeader}>
                {/* Avatar grande da igreja */}
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarContainer}>
                    {preview.igreja.logoUrl ? (
                      <FancyImage
                        source={{ uri: preview.igreja.logoUrl }}
                        size={100}
                        style={styles.churchLogo}
                      />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <DefaultIcons.Custom
                          library='MaterialCommunityIcons'
                          name='church'
                          size={48}
                          color={Pallete.primary}
                        />
                      </View>
                    )}
                  </View>
                </View>

                {/* Nome da igreja */}
                <FancyText type='bold' size='large' style={styles.churchName}>
                  {preview.igreja.nome}
                </FancyText>
              </View>

              {/* Info section */}
              <View style={styles.infoSection}>
                {expiresText && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <DefaultIcons.Custom
                        library='MaterialIcons'
                        name='schedule'
                        size={16}
                        color={Pallete.fonts.inactive}
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                        Validade do convite
                      </FancyText>
                      <FancyText
                        size='small'
                        type='semiBold'
                        style={{ opacity: 0.8 }}
                        color={Pallete.fonts.dark}
                      >
                        {expiresText}
                      </FancyText>
                    </View>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <DefaultIcons.Custom
                      library='MaterialIcons'
                      name={preview.autoApprove ? 'flash-on' : 'hourglass-empty'}
                      size={16}
                      color={preview.autoApprove ? Pallete.confirm : Pallete.warning}
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                      Tipo de entrada
                    </FancyText>
                    <FancyText
                      size='small'
                      type='semiBold'
                      color={preview.autoApprove ? Pallete.confirm : Pallete.warning}
                    >
                      {preview.autoApprove ? 'Acesso imediato' : 'Aguarda aprovação'}
                    </FancyText>
                  </View>
                </View>
              </View>

              {/* Mensagem de erro */}
              {error && (
                <View style={styles.errorContainer}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='error-outline'
                    size={18}
                    color={Pallete.error}
                  />
                  <FancyText size='small' color={Pallete.error} style={styles.errorText}>
                    {error}
                  </FancyText>
                </View>
              )}

              {/* Botões de ação */}
              <View style={styles.actionsContainer}>
                <FancyButton
                  label={preview.autoApprove ? 'Entrar na Igreja' : 'Solicitar Entrada'}
                  isLoading={loadingAccept}
                  onPress={handleAccept}
                  disabled={loadingAccept}
                  containerStyle={styles.mainActionButton}
                  icon={{
                    library: 'MaterialIcons',
                    name: preview.autoApprove ? 'login' : 'send',
                    size: 14,
                    color: Pallete.fonts.light,
                  }}
                />

                <FancyButton
                  label='Usar outro código'
                  type='text'
                  size={36}
                  onPress={handleReset}
                  disabled={loadingAccept}
                />
              </View>
            </View>
          </View>
        )}

        {/* Link para ver solicitações */}
        <View style={styles.footer}>
          <View style={styles.footerButtonWrap}>
            <FancyButton
              label='Ver minhas solicitações'
              type='text'
              onPress={() => router.push('/(app)/join-church/requests')}
              icon={{
                library: 'MaterialIcons',
                name: 'history',
                size: 18,
                color: Pallete.primary,
              }}
            />
            {pendingCount > 0 && (
              <View style={styles.badge} pointerEvents='none'>
                <FancyText size='extraSmall' type='bold' color={Pallete.fonts.light}>
                  {pendingCount}
                </FancyText>
              </View>
            )}
          </View>
        </View>
      </FancyScrollView>
    </FancyPageView>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: Pallete.backgroundColor,
    },
    scrollContent: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 40,
      flexGrow: 1,
    },
    inputSection: {
      alignItems: 'center',
      paddingTop: 20,
    },
    iconContainer: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: `${Pallete.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    inputCard: {
      width: '100%',
      backgroundColor: Pallete.backgroundColor2,
      borderRadius: 16,
      padding: 20,
      gap: 16,
    },
    input: {
      marginBottom: 0,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: `${Pallete.error}10`,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
    },
    errorText: {
      flex: 1,
    },
    primaryButton: {
      marginTop: 4,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginTop: 20,
      paddingHorizontal: 16,
    },
    infoText: {
      flex: 1,
    },
    previewSection: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: 10,
    },
    previewCard: {
      backgroundColor: Pallete.backgroundColor,
      borderRadius: 20,
      overflow: 'hidden',
      ...Pallete.shadows[300],
    },
    cardHeader: {
      paddingTop: 16,
      paddingBottom: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      gap: 8,
    },
    avatarWrapper: {
      padding: 4,
      borderRadius: 56,
      backgroundColor: Pallete.backgroundColor,
      ...Pallete.shadows[200],
    },
    avatarContainer: {
      borderRadius: 50,
      overflow: 'hidden',
    },
    churchLogo: {
      borderRadius: 50,
    },
    avatarFallback: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${Pallete.primary}12`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    churchName: {
      textAlign: 'center',
      color: Pallete.fonts.dark,
    },
    infoSection: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 10,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    infoIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: `${Pallete.primary}08`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoTextContainer: {
      flex: 1,
      gap: 2,
    },
    actionsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 8,
    },
    mainActionButton: {
      borderRadius: 12,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: 10,
      alignItems: 'center',
    },
    footerButtonWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: 6,
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 6,
      backgroundColor: Pallete.warning,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
