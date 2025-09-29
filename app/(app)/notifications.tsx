import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../components/containers/FancyPageView';
import FancyList from '../../components/list/FancyList';
import DefaultIcons, { CustomIconProps } from '../../components/FancyIcons';
import { DefaultIconsNames } from '../../constants/icons';
import { Pallete } from '../../constants/colors';
import FancyText from '../../components/FancyText';
import FancySeparator from '../../components/FancySeparator';
import DateUtils from '../../utils/date_utils';
import { router } from 'expo-router';
import FancyHeaderButton from '../../components/header/FancyHeaderButton';
import FancyListEmpty from '../../components/list/FancyListEmpty';
import { useState } from 'react';

export interface NotificationItem {
  title: string;
  subtitle: string;
  icon?: CustomIconProps;
  date: Date;
  isRead?: boolean;
}

const FAKE_NOTIF_DATA: NotificationItem[] = [
  {
    date: new Date(),
    title: 'Escala',
    subtitle: 'Existem novas escalas para você!',
    icon: { ...DefaultIconsNames['calendar-day'], size: 18 },
    isRead: false,
  },
  {
    date: new Date(),
    title: 'Escala',
    subtitle: 'Você está escalado para um evento amanhã!',
    icon: { ...DefaultIconsNames['calendar-day'], size: 18 },
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [data, setData] = useState<NotificationItem[]>(FAKE_NOTIF_DATA);

  return (
    <FancyPageView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0, paddingRight: 10 }}>
        <FancyHeaderButton
          buttonProps={{
            containerStyle: { marginLeft: 10, height: 40, minHeight: 40, width: 40, minWidth: 40, borderWidth: 0 },
          }}
          icon={{ ...DefaultIconsNames['chevron-left'], size: 24 }}
          onPress={router.back}
        />
        <FancyText
          size="medium"
          type="bold"
          color={Pallete.fonts.dark}
          style={{ alignItems: 'center', justifyContent: 'center', flex: 1, lineHeight: 22, borderWidth: 0 }}
        >
          Notificações
        </FancyText>
        <View style={{ flexDirection: 'row' }}>
          <FancyHeaderButton
            icon={{
              library: 'MaterialIcons',
              name: 'done-all',
              size: 22,
              color: data.length > 0 ? Pallete.icons.dark : Pallete.icons.inactive2,
            }}
            buttonProps={{ containerStyle: { marginRight: 8, borderWidth: 0 } }}
            onPress={function (): void {
              throw new Error('Function not implemented.');
            }}
          />
        </View>
      </View>
      {data.length > 0 ? (
        <FancyList
          data={data}
          ItemSeparatorComponent={() => <FancySeparator style={{ marginVertical: 15 }} />}
          contentContainerStyle={{ gap: 0, paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              {/* ICONE */}
              <View style={styles.iconContainer}>
                <DefaultIcons.Custom {...DefaultIconsNames['calendar-day']} size={26} color={Pallete.icons.dark} />
              </View>
              {/* TEXTOS */}
              <View style={styles.textsContainer}>
                <FancyText size={'small'} type="semiBold" color={Pallete.fonts.inactive} numberOfLines={1}>
                  {item.title}
                </FancyText>
                <FancyText size={'small'} type="medium" color={Pallete.fonts.dark} numberOfLines={2}>
                  {item.subtitle}
                </FancyText>
                <FancyText size={'extraSmall'} type="bold" color={Pallete.fonts.inactive} numberOfLines={1}>
                  {DateUtils.timeAgoText(item.date)}
                </FancyText>
              </View>
              {/* TEMPO */}
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Pallete.error }} />
            </View>
          )}
        />
      ) : (
        <FancyListEmpty />
      )}
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
