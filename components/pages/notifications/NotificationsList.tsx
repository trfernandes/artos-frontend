import NotificacaoCard from './NotificacaoCard';
import EscalaLembreteNotificacaoCard from './EscalaLembreteNotificacaoCard';
import { SectionList, SectionListData, View, StyleSheet, Pressable } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import FancyListEmpty from '../../list/FancyListEmpty';
import FancyButton from '../../buttons/FancyButton';
import { isAfter, isSameDay, startOfDay, startOfMonth, subDays } from 'date-fns';
import FancyText from '../../FancyText';
import { ResponseNotificacaoDto } from '../../../domain/dtos/Notificacao/notificacao.response';
import { NotificacaoTipoEnum } from '../../../domain/enums/Notificacao/tipo-notificacao.enum';
import { DateUtilsApi } from '../../../utils/date_utils';
import { usePallete } from '../../../hooks/usePallete';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import DefaultIcons from '../../FancyIcons';

const Hoje = { title: 'Hoje' };
const Ontem = { title: 'Ontem' };
const ultimos7Dias = { title: 'Últimos 7 dias' };
const esteMes = { title: 'Este mês' };
const maisAntigas = { title: 'Mais antigas' };

const OLDER_LIMIT = 5;

type NotifSection = SectionListData<ResponseNotificacaoDto> & {
  extraOlderCount: number;
  showHeaderAction?: boolean;
};

function SwipeableMarkAsRead({
  item,
  onMarkAsRead,
  children,
}: {
  item: ResponseNotificacaoDto;
  onMarkAsRead: (n: ResponseNotificacaoDto) => void;
  children: React.ReactNode;
}) {
  const Pallete = usePallete();
  const swipeableRef = useRef<any>(null);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={60}
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          style={[styles.markAsReadAction, { backgroundColor: Pallete.confirm }]}
          onPress={() => {
            onMarkAsRead(item);
            swipeableRef.current?.close();
          }}
        >
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='check'
            size={18}
            color={Pallete.fonts.light}
          />
          <FancyText size='extraSmall' type='semiBold' style={{ color: Pallete.fonts.light }}>
            Lida
          </FancyText>
        </Pressable>
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

export default function NotificationsList({
  dataList,
  onPress,
  onMarkAsRead,
  listEmptyLabel,
  listEmptyHelper,
  sectionHeaderAction,
}: {
  dataList: ResponseNotificacaoDto[];
  onPress?: (notification: ResponseNotificacaoDto) => void;
  onMarkAsRead?: (notification: ResponseNotificacaoDto) => void;
  listEmptyLabel?: string;
  listEmptyHelper?: string;
  sectionHeaderAction?: {
    label: string;
    onPress: () => void;
  };
}) {
  const Pallete = usePallete();
  const [showAllOlder, setShowAllOlder] = useState(false);

  const groupsData = useMemo<NotifSection[]>(() => {
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

    // Ordena cada grupo: mais recente primeiro
    for (const group of groups) {
      group.items.sort((a, b) => {
        const dateA = new Date(a.criadaEm || a.createdAt || 0).getTime();
        const dateB = new Date(b.criadaEm || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    // Limita seção "Mais antigas" a OLDER_LIMIT itens
    const olderGroup = groups.find((g) => g.key === 'older');
    const extraOlderCount =
      olderGroup && !showAllOlder && olderGroup.items.length > OLDER_LIMIT
        ? olderGroup.items.length - OLDER_LIMIT
        : 0;
    if (extraOlderCount > 0 && olderGroup) {
      olderGroup.items = olderGroup.items.slice(0, OLDER_LIMIT);
    }

    const visibleGroups = groups
      .filter((g) => g.items.length > 0)
      .map((g, index) => ({
        title: g.title,
        data: g.items,
        extraOlderCount: g.key === 'older' ? extraOlderCount : 0,
        showHeaderAction: Boolean(sectionHeaderAction && index === 0),
      }));
    return visibleGroups;
  }, [dataList, showAllOlder, sectionHeaderAction]);

  const renderCard = useCallback(
    (item: ResponseNotificacaoDto) => {
      switch (item.tipo) {
        case NotificacaoTipoEnum.EscalaLembrete:
          return <EscalaLembreteNotificacaoCard data={item} onPress={onPress} />;
        default:
          return <NotificacaoCard data={item} onPress={onPress} />;
      }
    },
    [onPress],
  );

  const renderItem = useCallback(
    (item: ResponseNotificacaoDto) => {
      const card = renderCard(item);
      const isUnread = !item.lidaEm;

      if (!isUnread || !onMarkAsRead) return card;

      return (
        <SwipeableMarkAsRead item={item} onMarkAsRead={onMarkAsRead}>
          {card}
        </SwipeableMarkAsRead>
      );
    },
    [renderCard, onMarkAsRead],
  );

  if (!dataList || dataList.length === 0) {
    return (
      <FancyListEmpty
        label={listEmptyLabel ?? 'Tudo certo por aqui'}
        helperText={listEmptyHelper}
        labelColor={Pallete.fonts.inactive}
        icon={{
          library: 'MaterialCommunityIcons',
          name: 'bell-check-outline',
          size: 58,
          color: Pallete.fonts.inactive,
        }}
      />
    );
  }

  return (
    <SectionList
      sections={groupsData}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 10 }}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <FancyText
            size='extraSmall'
            type='semiBold'
            style={{
              color: Pallete.fonts.inactive,
              textTransform: 'uppercase',
              letterSpacing: 0.7,
            }}
          >
            {section.title}
          </FancyText>
          {(section as NotifSection).showHeaderAction && sectionHeaderAction ? (
            <FancyButton
              type='text'
              mode='default'
              label={sectionHeaderAction.label}
              size={{ w: 160, h: 28 }}
              labelProps={{ size: 'extraSmall', type: 'bold' }}
              labelStyle={{ color: Pallete.primary }}
              onPress={sectionHeaderAction.onPress}
            />
          ) : null}
        </View>
      )}
      renderSectionFooter={({ section }) => {
        const extra = (section as NotifSection).extraOlderCount;
        if (extra > 0) {
          return (
            <View style={styles.showMoreContainer}>
              <FancyButton
                type='text'
                label={`Ver mais ${extra} notificações`}
                onPress={() => setShowAllOlder(true)}
              />
            </View>
          );
        }
        return <View style={{ height: 6 }} />;
      }}
      SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      renderItem={({ item }) => renderItem(item)}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingTop: 0,
    paddingBottom: 4,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markAsReadAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 24,
    marginLeft: 8,
    gap: 2,
  },
  showMoreContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
});
