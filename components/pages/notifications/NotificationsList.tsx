import NotificacaoCard from './NotificacaoCard';
import EscalaLembreteNotificacaoCard from './EscalaLembreteNotificacaoCard';
import { SectionList, SectionListData, View, StyleSheet } from 'react-native';
import { useCallback, useMemo } from 'react';
import FancyListEmpty from '../../list/FancyListEmpty';
import { isAfter, isSameDay, startOfDay, startOfMonth, subDays } from 'date-fns';
import FancyText from '../../FancyText';
import { ResponseNotificacaoDto } from '../../../domain/dtos/Notificacao/notificacao.response';
import { NotificacaoTipoEnum } from '../../../domain/enums/Notificacao/tipo-notificacao.enum';
import { DateUtilsApi } from '../../../utils/date_utils';
import { usePallete } from '../../../hooks/usePallete';

const Hoje = { title: 'Hoje', hours: 0 };
const Ontem = { title: 'Ontem', hours: 24 };
const ultimos7Dias = { title: 'Últimos 7 dias', hours: 168 };
const esteMes = { title: 'Este mês', hours: 720 };
const maisAntigas = { title: 'Mais antigas', hours: Infinity };

export default function NotificationsList({
  dataList,
  onPress,
}: {
  dataList: ResponseNotificacaoDto[];
  onPress?: (notification: ResponseNotificacaoDto) => void;
}) {
  const Pallete = usePallete();
  const groupsData = useMemo<SectionListData<ResponseNotificacaoDto>[]>(() => {
    const groups: { key: string; title: string; items: ResponseNotificacaoDto[] }[] = [
      { key: 'today', title: Hoje.title, items: [] },
      { key: 'yesterday', title: Ontem.title, items: [] },
      { key: 'last7', title: ultimos7Dias.title, items: [] },
      { key: 'thisMonth', title: esteMes.title, items: [] },
      { key: 'older', title: maisAntigas.title, items: [] },
    ];

    const now = new Date();
    const hoje = startOfDay(now);
    const ontem = startOfDay(subDays(now, 1));
    const seteDiasAtras = startOfDay(subDays(now, 7));
    const inicioMes = startOfMonth(now);

    for (const notificacao of dataList) {
      const createdAt = notificacao.criadaEm || notificacao.createdAt;
      if (!createdAt) continue;

      const criadaEm = DateUtilsApi.dateOnlyFromApi(createdAt);

      let targetKey: string;

      if (isSameDay(criadaEm, hoje)) {
        targetKey = 'today';
      } else if (isSameDay(criadaEm, ontem)) {
        targetKey = 'yesterday';
      } else if (isAfter(criadaEm, seteDiasAtras) && criadaEm < ontem) {
        targetKey = 'last7';
      } else if (criadaEm >= inicioMes) {
        targetKey = 'thisMonth';
      } else {
        targetKey = 'older';
      }

      const group = groups.find((g) => g.key === targetKey);
      if (group) {
        group.items.push(notificacao);
      }
    }

    // transformar em sections para o SectionList
    return groups
      .filter((g) => g.items.length > 0) // opcional: esconder grupos vazios
      .map((g) => ({
        title: g.title,
        data: g.items,
      }));
  }, [dataList]);

  const renderItem = useCallback((item: ResponseNotificacaoDto) => {
    switch (item.tipo) {
      case NotificacaoTipoEnum.EscalaLembrete:
        return <EscalaLembreteNotificacaoCard data={item} onPress={onPress} />;
      default:
        return <NotificacaoCard data={item} onPress={onPress} />;
    }
  }, [onPress]);

  if (!dataList || dataList.length === 0) {
    return (
      <FancyListEmpty
        label='Tudo certo por aqui'
        labelColor={Pallete.fonts.inactive}
        icon={{ library: 'MaterialCommunityIcons', name: 'bell-check-outline', size: 58, color: Pallete.fonts.inactive }}
      />
    );
  }

  return (
    <SectionList
      sections={groupsData}
      contentContainerStyle={{ paddingBottom: 10 }}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <FancyText size={'small'} type={'bold'} style={{ opacity: 0.7 }}>
            {section.title}
          </FancyText>
        </View>
      )}
      SectionSeparatorComponent={() => <View style={{ height: 10 }} />}
      renderSectionFooter={() => <View style={{ height: 10 }} />}
      ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      renderItem={({ item }) => <View style={styles.itemWrapper}>{renderItem(item)}</View>}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: { paddingTop: 8, paddingHorizontal: 15 },
  itemWrapper: { paddingHorizontal: 15 },
});
