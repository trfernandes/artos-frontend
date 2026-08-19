import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import FancyButton from '../../../components/buttons/FancyButton';
import FancyText from '../../../components/FancyText';
import FancyLoading from '../../../components/FancyLoading';
import DefaultIcons from '../../../components/FancyIcons';
import FancyPageView from '../../../components/containers/FancyPageView';
import FancyList from '../../../components/list/FancyList';
import { FancyAlert } from '../../../components/modal/FancyAlert';
import { ThemePalette } from '../../../constants/colors';
import { IgrejaRepository } from '../../../domain/services/IgrejaRepository';
import { ResponseIgrejaSolicitacaoDto } from '../../../domain/dtos/Igreja/response-igreja-solicitacao.dto';
import { useState } from 'react';
import { APP_TZ } from '../../../utils/date_utils';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';

type StatusType = 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELED';

function formatDateTime(dateStr: string): string {
  const utcDate = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
  return formatInTimeZone(new Date(utcDate), APP_TZ, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export default function JoinChurchRequestsPage() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const {
    data: solicitacoes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['join-church-requests'],
    queryFn: () => IgrejaRepository.listarMinhasSolicitacoes(),
    refetchOnMount: 'always',
  });

  const cancelMutation = useMutation({
    mutationFn: (solicitacaoId: string) => IgrejaRepository.cancelarMinhaSolicitacao(solicitacaoId),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Solicitação cancelada' });
      queryClient.invalidateQueries({ queryKey: ['join-church-requests'] });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Erro ao cancelar solicitação' });
    },
    onSettled: () => setCancelingId(null),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleCancel = (item: ResponseIgrejaSolicitacaoDto) => {
    FancyAlert.alert(
      'Cancelar solicitação?',
      `Deseja cancelar sua solicitação para "${item.igreja?.nome}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => {
            setCancelingId(item.id);
            cancelMutation.mutate(item.id);
          },
        },
      ],
    );
  };

  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Aguardando aprovação',
          accentColor: Pallete.warning,
          icon: 'clock-outline',
          iconLib: 'MaterialCommunityIcons' as const,
        };
      case 'APPROVED':
        return {
          label: 'Aprovado',
          accentColor: Pallete.confirm,
          icon: 'check-circle-outline',
          iconLib: 'MaterialCommunityIcons' as const,
        };
      case 'DENIED':
        return {
          label: 'Negado',
          accentColor: Pallete.error,
          icon: 'close-circle-outline',
          iconLib: 'MaterialCommunityIcons' as const,
        };
      default:
        return {
          label: 'Cancelado',
          accentColor: Pallete.disabled2,
          icon: 'cancel',
          iconLib: 'MaterialIcons' as const,
        };
    }
  };

  const renderItem = ({ item }: { item: ResponseIgrejaSolicitacaoDto }) => {
    const status = (item.status as StatusType) || 'PENDING';
    const config = getStatusConfig(status);
    const isPending = status === 'PENDING';
    const isDenied = status === 'DENIED';
    const isCanceling = cancelingId === item.id;

    return (
      <View
        style={[
          styles.cardOuter,
          {
            borderColor: ColorUtils.withAlpha(Pallete.borderCard, 0.45),
            ...Pallete.shadows[200],
          },
        ]}
      >
        <View style={styles.cardInner}>
          <View style={[styles.accentStrip, { backgroundColor: config.accentColor }]} />
          <View style={styles.cardContent}>
            <View
              style={[
                styles.churchIcon,
                { backgroundColor: ColorUtils.withAlpha(config.accentColor, 0.1) },
              ]}
            >
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='church'
                size={20}
                color={config.accentColor}
              />
            </View>

            <View style={styles.infoCol}>
              <FancyText type='semiBold' size='small' numberOfLines={1}>
                {item.igreja?.nome || 'Igreja'}
              </FancyText>
              <View style={styles.metaRow}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='calendar-clock-outline'
                  size={11}
                  color={Pallete.fonts.inactive}
                />
                <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                  {formatDateTime(item.createdAt)}
                </FancyText>
              </View>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: ColorUtils.withAlpha(config.accentColor, 0.12) },
                ]}
              >
                <DefaultIcons.Custom
                  library={config.iconLib}
                  name={config.icon as any}
                  size={11}
                  color={config.accentColor}
                />
                <FancyText size='extraSmall' type='semiBold' style={{ color: config.accentColor }}>
                  {config.label}
                </FancyText>
              </View>
              {isDenied && item.message && (
                <View
                  style={[
                    styles.messageBox,
                    { backgroundColor: ColorUtils.withAlpha(Pallete.error, 0.06) },
                  ]}
                >
                  <FancyText size='extraSmall' color={Pallete.error}>
                    {item.message}
                  </FancyText>
                </View>
              )}
            </View>

            {isPending && (
              <FancyButton
                type='outlined'
                size={34}
                icon={{
                  library: 'MaterialIcons',
                  name: 'close',
                  size: 16,
                  color: isCanceling ? Pallete.fonts.inactive : Pallete.error,
                }}
                onPress={() => handleCancel(item)}
                disabled={isCanceling}
                isLoading={isCanceling}
                containerStyle={[
                  styles.cancelBtn,
                  {
                    borderColor: ColorUtils.withAlpha(Pallete.error, 0.3),
                    backgroundColor: ColorUtils.withAlpha(Pallete.error, 0.06),
                  },
                ]}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <FancyPageView style={styles.page}>
        <FancyLoading />
      </FancyPageView>
    );
  }

  if (error) {
    return (
      <FancyPageView style={styles.page}>
        <View style={styles.center}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name='error-outline'
            size={48}
            color={Pallete.fonts.inactive}
          />
          <FancyText color={Pallete.fonts.inactive}>Erro ao carregar</FancyText>
          <FancyButton label='Tentar novamente' onPress={() => refetch()} />
        </View>
      </FancyPageView>
    );
  }

  return (
    <FancyPageView style={styles.page}>
      <FancyList
        data={solicitacoes || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={styles.listContent}
        listEmptyProps={{
          label: 'Sem solicitações',
          helperText: 'Insira um código de convite para\nsolicitar entrada em uma igreja',
          actionLabel: 'Inserir código',
          onActionPress: () => router.push('/(app)/join-church'),
          icon: {
            library: 'MaterialCommunityIcons',
            name: 'clipboard-text-outline',
            size: 55,
          },
        }}
        ListFooterComponent={
          <FancyButton
            label='Inserir novo código'
            type='text'
            onPress={() => router.push('/(app)/join-church')}
            containerStyle={{ marginTop: 10 }}
            icon={{ library: 'MaterialIcons', name: 'add', size: 18, color: Pallete.primary }}
          />
        }
      />
    </FancyPageView>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: Pallete.backgroundColor,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      gap: 12,
    },
    cardOuter: {
      borderRadius: 18,
      borderWidth: 0.5,
      backgroundColor: Pallete.backgroundColor,
    },
    cardInner: {
      borderRadius: 17,
      overflow: 'hidden',
    },
    accentStrip: {
      height: 3,
      width: '100%',
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 12,
      paddingHorizontal: 14,
    },
    churchIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    infoCol: {
      flex: 1,
      gap: 3,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginTop: 3,
    },
    messageBox: {
      marginTop: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
    },
    cancelBtn: {
      width: 34,
      height: 34,
      minWidth: 34,
      alignSelf: 'center',
    },
  });
}
