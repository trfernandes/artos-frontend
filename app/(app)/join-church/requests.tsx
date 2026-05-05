import { StyleSheet, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
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
import { FancyAlert } from '../../../components/modal/FancyAlert';
import { FancyCard } from '../../../components/cards/Horizontal/FancyCard';
import { ThemePalette } from '../../../constants/colors';
import { IgrejaRepository } from '../../../domain/services/IgrejaRepository';
import { ResponseIgrejaSolicitacaoDto } from '../../../domain/dtos/Igreja/response-igreja-solicitacao.dto';
import { useState } from 'react';
import { APP_TZ } from '../../../utils/date_utils';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

type StatusType = 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELED';

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; bgColor: string; icon: string; iconLib: string }> = {
  PENDING: {
    label: 'Aguardando aprovação',
    color: '#D97706',
    bgColor: '#FEFCF3',
    icon: 'clock-outline',
    iconLib: 'MaterialCommunityIcons',
  },
  APPROVED: {
    label: 'Aprovado',
    color: '#059669',
    bgColor: '#F6FDF9',
    icon: 'check-circle-outline',
    iconLib: 'MaterialCommunityIcons',
  },
  DENIED: {
    label: 'Negado',
    color: '#DC2626',
    bgColor: '#FEF7F7',
    icon: 'close-circle-outline',
    iconLib: 'MaterialCommunityIcons',
  },
  CANCELED: {
    label: 'Cancelado',
    color: '#6B7280',
    bgColor: '#FAFAFA',
    icon: 'cancel',
    iconLib: 'MaterialIcons',
  },
};

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

  const { data: solicitacoes, isLoading, error, refetch } = useQuery({
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

  const renderItem = ({ item }: { item: ResponseIgrejaSolicitacaoDto }) => {
    const config = STATUS_CONFIG[item.status as StatusType] || STATUS_CONFIG.PENDING;
    const isPending = item.status === 'PENDING';
    const isDenied = item.status === 'DENIED';
    const isCanceling = cancelingId === item.id;

    return (
      <View style={styles.cardWrapper}>
        <FancyCard.Image
          type='icon'
          props={{
            title: item.igreja?.nome || 'Igreja',
            subtitle: (
              <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
                Solicitado em {formatDateTime(item.createdAt)}
              </FancyText>
            ),
            additionalData1: (
              <View style={styles.statusRow}>
                <DefaultIcons.Custom
                  library={config.iconLib as any}
                  name={config.icon as any}
                  size={14}
                  color={config.color}
                />
                <FancyText size='extraSmall' type='semiBold' style={{ color: config.color }}>
                  {config.label}
                </FancyText>
              </View>
            ),
            additionalData2: isDenied && item.message ? (
              <View style={styles.messageBox}>
                <FancyText size='extraSmall' color={Pallete.error}>
                  {item.message}
                </FancyText>
              </View>
            ) : undefined,
            cardIcon: {
              library: 'MaterialCommunityIcons',
              name: 'church',
              size: 18,
              backgroundColor: config.color,
              color: '#FFFFFF',
            },
            actionButtons: isPending ? (
              <TouchableOpacity
                onPress={() => handleCancel(item)}
                disabled={isCanceling}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <DefaultIcons.Custom
                  library='MaterialIcons'
                  name='close'
                  size={16}
                  color={isCanceling ? Pallete.fonts.inactive : Pallete.error}
                />
              </TouchableOpacity>
            ) : undefined,
            containerStyle: [
              styles.card,
              { borderColor: config.color, backgroundColor: config.bgColor },
            ],
            contentContainerStyle: styles.cardContent,
            centerContainerStyle: { gap: 6 },
            backgroundColor: config.bgColor,
          }}
        />
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
          <DefaultIcons.Custom library='MaterialIcons' name='error-outline' size={48} color={Pallete.fonts.inactive} />
          <FancyText color={Pallete.fonts.inactive}>Erro ao carregar</FancyText>
          <FancyButton label='Tentar novamente' onPress={() => refetch()} />
        </View>
      </FancyPageView>
    );
  }

  const isEmpty = !solicitacoes || solicitacoes.length === 0;

  return (
    <FancyPageView style={styles.page}>
      {isEmpty ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='clipboard-text-outline'
              size={40}
              color={Pallete.primary}
            />
          </View>
          <FancyText type='semiBold' size='large'>
            Sem solicitações
          </FancyText>
          <FancyText size='small' color={Pallete.fonts.inactive} style={{ textAlign: 'center' }}>
            Insira um código de convite para{'\n'}solicitar entrada em uma igreja
          </FancyText>
          <FancyButton
            label='Inserir código'
            onPress={() => router.push('/(app)/join-church')}
            containerStyle={{ marginTop: 8 }}
          />
        </View>
      ) : (
        <FlatList
          data={solicitacoes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 11 }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Pallete.primary]}
              tintColor={Pallete.primary}
            />
          }
          ListFooterComponent={
            <FancyButton
              label='Inserir novo código'
              type='text'
              onPress={() => router.push('/(app)/join-church')}
              containerStyle={{ marginTop: 20 }}
              icon={{ library: 'MaterialIcons', name: 'add', size: 18, color: Pallete.primary }}
            />
          }
        />
      )}
    </FancyPageView>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: Pallete.backgroundColor,
    },
    list: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
    },
    cardWrapper: {
      position: 'relative',
    },
    card: {
      width: '100%',
      borderRadius: 30,
      borderWidth: 1,
      ...Pallete.shadows[100],
    },
    cardContent: {
      paddingVertical: 6,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    messageBox: {
      marginTop: 6,
      backgroundColor: `${Pallete.error}08`,
      padding: 10,
      borderRadius: 8,
    },
    chevronContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      gap: 12,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${Pallete.primary}10`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    cancelButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: `${Pallete.error}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
