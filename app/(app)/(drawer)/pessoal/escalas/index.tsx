import { StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyCalendar from '../../../../../components/calendar/FancyCalendar';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import FancySeparator from '../../../../../components/FancySeparator';
import FancyList from '../../../../../components/list/FancyList';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyListEmpty from '../../../../../components/list/FancyListEmpty';

interface Funcao {
  nomeFuncao: string;
  nomeMinisterio: string;
  evento: {
    nome: string;
    dataInicio: Date;
    dataFim: Date;
    horarioInicio: string;
    horarioFim: string;
    observacoes?: string;
  };
}

const DATA = [
  {
    nomeFuncao: 'Tecladista',
    nomeMinisterio: 'Ministério de Louvor',
    evento: {
      nome: 'Culto de Jovens RUAH',
      dataInicio: new Date(2025, 7, 9),
      dataFim: new Date(2025, 7, 9),
      horarioInicio: '19:30',
      horarioFim: '22:00',
      observacoes: 'Ensaio às 17:30',
    },
  },
  {
    nomeFuncao: 'Violonista',
    nomeMinisterio: 'Ministério de Louvor',
    evento: {
      nome: 'Culto de Domingo',
      dataInicio: new Date(2025, 7, 10),
      dataFim: new Date(2025, 7, 10),
      horarioInicio: '18:00',
      horarioFim: '20:00',
      observacoes: 'Ensaio às 16:00',
    },
  },
  {
    nomeFuncao: 'Recepcionista',
    nomeMinisterio: 'Hospitalidade',
    evento: {
      nome: 'Culto de Domingo',
      dataInicio: new Date(2025, 7, 10),
      dataFim: new Date(2025, 7, 10),
      horarioInicio: '18:00',
      horarioFim: '20:00',
      observacoes: 'Ensaio às 16:00',
    },
  },
  {
    nomeFuncao: 'Fotógrafo',
    nomeMinisterio: 'Mídia',
    evento: {
      nome: 'Culto de Domingo',
      dataInicio: new Date(2025, 7, 10),
      dataFim: new Date(2025, 7, 10),
      horarioInicio: '18:00',
      horarioFim: '20:00',
      observacoes: 'Ensaio às 16:00',
    },
  },
  {
    nomeFuncao: 'Guardador de Veículos',
    nomeMinisterio: 'Engaje',
    evento: {
      nome: 'Culto de Domingo',
      dataInicio: new Date(2025, 7, 10),
      dataFim: new Date(2025, 7, 10),
      horarioInicio: '18:00',
      horarioFim: '20:00',
      observacoes: 'Ensaio às 16:00',
    },
  },
  {
    nomeFuncao: 'Intercessor',
    nomeMinisterio: 'Intercessão',
    evento: {
      nome: 'Culto de Domingo',
      dataInicio: new Date(2025, 7, 3),
      dataFim: new Date(2025, 7, 3),
      horarioInicio: '18:00',
      horarioFim: '20:00',
    },
  },
];

export default function EscalasIndexPage() {
  const filterEscalas = (date: Date) =>
    DATA.filter(item => item.evento.dataInicio.getDate() === date.getDate());

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [funcoesData, setFuncoesData] = useState<Funcao[]>();

  const handleChangeDate = (date: Date) => {
    setSelectedDate(date);
    setFuncoesData(filterEscalas(date)); // Agora a lista é atualizada imediatamente
  };

  const today = new Date();

  useFocusEffect(
    useCallback(() => {
      // 1. Reseta a data para a data atual
      setSelectedDate(today);
      // 2. Atualiza a lista de funções com a data atual
      setFuncoesData(filterEscalas(today));
    }, [])
  );

  return (
    <FancyPageView style={styles.container}>
      <FancyCalendar
        value={selectedDate}
        markedDates={DATA.map(item => item.evento.dataInicio)}
        onChangeDate={handleChangeDate}
        containerStyle={{ height: 300 }}
      />
      <FancySeparator style={{ paddingVertical: 5 }} />
      <View style={styles.eventsListContainer}>
        {funcoesData && funcoesData.length > 0 ? (
          <FancyList
            bottomSpace={-10}
            data={funcoesData}
            renderItem={({ item, index }) => (
              <FancyCard.Icon
                containerStyle={{ paddingHorizontal: 5 }}
                key={index}
                isCollapsable={true}
                title={item.nomeFuncao}
                subtitle={item.nomeMinisterio}
                additionalData1={`${item.evento.nome}`}
                additionalData2={`${item.evento.horarioInicio} - ${item.evento.horarioFim}`}
                cardIcon={{ library: 'Octicons', name: 'id-badge', size: 16 }}
                actionButtons={[
                  {
                    icon: {
                      library: DefaultIconsNames.open.library,
                      name: DefaultIconsNames.open.name,
                      size: 18,
                    },
                    onPress: () => {
                      router.push(`/pessoal/escalas/evento`);
                    },
                  },
                ]}
              />
            )}
          />
        ) : (
          <FancyListEmpty />
        )}
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10, gap: 6 },
  eventsListContainer: { flex: 1 },
});
