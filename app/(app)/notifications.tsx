import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../components/containers/FancyPageView';
import { Pallete } from '../../constants/colors';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigation } from 'expo-router';
import FancyButton from '../../components/buttons/FancyButton';
import { BOLD_FONT, EXTRA_SMALL_SIZE_FONT } from '../../constants/font';
import FancyTabs, { TabItem } from '../../components/tabs/FancyTabs';
import { useNotificacoesCrud } from '../../hooks/useNotificacoesCrud';
import NotificationsList from '../../components/pages/notifications/NotificationsList';
import FancyLoading from '../../components/FancyLoading';

export default function NotificationsPage() {
  const { setOptions } = useNavigation();

  const { isLoading, isLoadingMutation, marcarTodasComoLidas, notificacoes } = useNotificacoesCrud({
    enabled: true,
  });

  const handleMarcarTodasComoLidas = useCallback(() => {
    marcarTodasComoLidas();
  }, [marcarTodasComoLidas]);

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
          onPress={handleMarcarTodasComoLidas}
        />
      ),
    });
  }, [handleMarcarTodasComoLidas, setOptions]);

  const naoLidasData = useMemo(() => notificacoes?.filter((n) => !n.lidaEm || n.lidaEm === null) ?? [], [notificacoes]);

  const TAB_ITEMS: TabItem[] = [
    {
      title: 'Não lidas',
      icon: { library: 'MaterialCommunityIcons', name: 'email-outline', size: 14 },
      content: <NotificationsList dataList={naoLidasData} />,
    },
    {
      title: 'Todas',
      icon: { library: 'MaterialCommunityIcons', name: 'bell-outline', size: 14 },
      content: (
        <View style={{ flex: 1 }}>
          <NotificationsList dataList={notificacoes} />
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
        containerStyle={{ flex: 1 }}
        headerStyle={{ paddingHorizontal: 15 }}
        contentContainerStyle={{ flex: 1 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
});
