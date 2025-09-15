import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancySettingItem from '../../../../FancySettingItem';
import FancyAccordeon from '../../../../FancyAccordeon';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyButton from '../../../../buttons/FancyButton';
import { Pallete } from '../../../../../constants/colors';
import { FancyCard } from '../../../../cards/Horizontal/FancyCard';
import FancyList from '../../../../list/FancyList';
import FancyScrollView from '../../../../FancyScrollView';
import FancyVerticalContainerCard from '../../../../cards/Vertical/FancyVerticalContainerCard';
import FancyDatePickerModal from '../../../../datepicker/FancyDataPickerModal';
import FancyText from '../../../../FancyText';

export const EVENTS_DATA = [
  {
    nome: 'Culto de Jovens Ruah',
    dataInicio: new Date(2025, 8, 9),
    dataTermino: new Date(2025, 8, 9),
    horaInicio: '19:30',
    horaTermino: '22:00',
  },
  {
    nome: 'Culto de Domingo',
    dataInicio: new Date(2025, 8, 10),
    dataTermino: new Date(2025, 8, 10),
    horaInicio: '18:00',
    horaTermino: '20:00',
  },
  {
    nome: 'Culto de Jovens Ruah',
    dataInicio: new Date(2025, 8, 9),
    dataTermino: new Date(2025, 8, 9),
    horaInicio: '19:30',
    horaTermino: '22:00',
  },
  {
    nome: 'Culto de Domingo',
    dataInicio: new Date(2025, 8, 10),
    dataTermino: new Date(2025, 8, 10),
    horaInicio: '18:00',
    horaTermino: '20:00',
  },
];

export const PARTICIPANTS_DATA = [
  {
    title: 'Thiago Rodrigo Fernandes',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
  },
  {
    title: 'Juliana Karen Da silva Fernandes',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
  },
  {
    title: 'Miriam Moschen',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/women/3.jpg' },
  },
  {
    title: 'Deividi Moschen',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/4.jpg' },
  },
  {
    title: 'Ladislau Gomes',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
  },
  {
    title: 'Wesliane Prata Gomes',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/women/6.jpg' },
  },
  {
    title: 'Paulo Henrique',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/7.jpg' },
  },
  {
    title: 'Dionatas Lovison',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/8.jpg' },
  },
  {
    title: 'Davi Hostfeller',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/9.jpg' },
  },
  {
    title: 'William',
    topElement: { type: 'image', imageUrl: 'https://randomuser.me/api/portraits/men/10.jpg' },
  },
];

export default function DefinicoesTab({ containerStyle }: { containerStyle?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.container, containerStyle]}>
      <FancyScrollView contentContainerStyle={{ gap: 15 }}>
        <FancySettingItem
          label={'Data Início'}
          options={[]}
          rightComponent={<FancyDatePickerModal readonly value={new Date()} />}
        />
        <FancySettingItem
          label={'Data Término'}
          options={[]}
          rightComponent={<FancyDatePickerModal readonly value={new Date()} />}
        />
        <FancySettingItem
          label={'Status'}
          options={[]}
          rightComponent={
            <FancyText size="small" type="medium" color={Pallete.fonts.inactive}>
              Pendente
            </FancyText>
          }
        />
        <FancyAccordeon title="Eventos" contentContainerStyle={{ paddingHorizontal: 10 }}>
          <FancyList
            data={EVENTS_DATA.sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime())}
            renderItem={({ item }) => (
              <FancyCard.Icon
                title={item.nome}
                subtitle={`${item.dataInicio.toLocaleDateString()} à ${item.dataTermino.toLocaleDateString()}`}
                additionalData1={`${item.horaInicio} à ${item.horaTermino}`}
                cardIcon={{ ...DefaultIconsNames['calendar-day'], size: 16 }}
                actionButtons={[{ icon: { ...DefaultIconsNames.open, size: 16 } }]}
              />
            )}
          />
        </FancyAccordeon>
        <FancyAccordeon title="Participantes" contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}>
          <FancyVerticalContainerCard
            itemHeight={140}
            data={PARTICIPANTS_DATA.sort((a, b) => a.title.localeCompare(b.title)).map(item => ({
              title: item.title,
              topElement: { type: 'image', imageUrl: item.topElement.imageUrl },
            }))}
          />
        </FancyAccordeon>
      </FancyScrollView>
      <View style={{ gap: 10, flexDirection: 'row' }}>
        <FancyButton label="Gerar" icon={{ ...DefaultIconsNames.refresh, size: 16 }} containerStyle={{ flex: 1 }} />
        <FancyButton
          label="Excluir"
          icon={{ ...DefaultIconsNames.delete, size: 16 }}
          containerStyle={{ flex: 1, backgroundColor: Pallete.error }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
