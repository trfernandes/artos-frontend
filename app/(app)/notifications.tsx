import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../components/containers/FancyPageView';
import { Pallete } from '../../constants/colors';
import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from 'expo-router';
import FancyButton from '../../components/buttons/FancyButton';
import { BOLD_FONT, EXTRA_SMALL_SIZE_FONT } from '../../constants/font';
import FancyTabs, { TabItem } from '../../components/tabs/FancyTabs';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import NotificationsList from '../../components/pages/notifications/NotificationsList';
import FancyLoading from '../../components/FancyLoading';
import { ResponseNotificacaoDto } from '../../domain/dtos/Notificacao/notificacao.response';

export default function NotificationsPage() {
  const { setOptions } = useNavigation();

  const { isLoading, isLoadingMutation, marcarComoLida, marcarTodasComoLidas, notificacoes, quantidadeNaoLidas } = useNotificacoesCrud();

  useEffect(() => {
    setOptions({
      headerRight: () => (
        <FancyButton
          label='Marcar todas como lidas'
          containerStyle={{ gap: 5, paddingRight: 8, marginTop: 8 }}
          labelStyle={{
            fontSize: EXTRA_SMALL_SIZE_FONT,
            fontFamily: BOLD_FONT,
            color: Pallete.fonts.dark,
            opacity: 0.8,
          }}
          type='text'
          iconPosition='left'
          icon={{
            library: 'MaterialIcons',
            name: 'checklist-rtl',
            size: 13,
            color: Pallete.icons.dark,
            style: { borderWidth: 0, lineHeight: 10, opacity: 0.8 },
          }}
          onPress={marcarTodasComoLidas}
        />
      ),
    });
  }, []);

  const [notificacoesData, setNotificacoesData] = useState<ResponseNotificacaoDto[]>([]);

  useEffect(() => {
    setNotificacoesData(notificacoes);
  }, [notificacoes]);

  const todasNotificacoesData = useMemo(() => notificacoesData, [notificacoesData]);
  const naoLidasData = useMemo(() => notificacoesData?.filter((n) => !n.lidaEm || n.lidaEm === null) ?? [], [notificacoesData]);

  const TAB_ITEMS: TabItem[] = [
    {
      title: 'Não lidas',
      content: <NotificationsList dataList={naoLidasData} />,
    },
    {
      title: 'Todas',
      content: (
        <View style={{ flex: 1 }}>
          <NotificationsList dataList={todasNotificacoesData} />
        </View>
      ),
    },
  ];

  if (isLoading) return <FancyLoading />;
  if (isLoadingMutation) return <FancyLoading label='Processando...' />;

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TAB_ITEMS}
        containerStyle={{ marginTop: 5, flex: 1 }}
        headerStyle={{ paddingHorizontal: 15 }}
        contentContainerStyle={{ flex: 1 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  itemContainer: {
    flexDirection: 'row',
    borderWidth: 0,

    paddingVertical: 0,
    gap: 15,
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    borderWidth: 0,
    backgroundColor: Pallete.backgroundColor2,
    padding: 10,
    // height: 40,
    // width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  textsContainer: { gap: 5, flex: 1, borderWidth: 0, justifyContent: 'center' },
  dateContainer: { justifyContent: 'center' },
});
