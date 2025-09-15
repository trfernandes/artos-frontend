import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import VoluntarioDadosTab from '../../../../../components/pages/admin/voluntarios/DadosTab';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { useVoluntarios } from '../../../../../hooks/useVoluntarios';
import { useEffect } from 'react';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import VoluntarioMinisterioTab from '../../../../../components/pages/admin/voluntarios/MinisterioTab';

export default function VoluntariosDetailsPage() {
  const parametros = useLocalSearchParams<{
    id: string;
  }>();

  const { data, setSearchParams } = useVoluntarios();

  useEffect(() => {
    setSearchParams({
      where: {
        conditions: [
          { path: 'id', operator: Operator.EQUALS, value: { type: ValueType.LITERAL, value: parametros.id } },
        ],
      },
      relations: ['ministerios.ministerio'],
    });
  }, []);

  // console.log('VoluntariosDetailsPage', strfyObj(data));

  const TAB_DATA: TabItem[] = [
    {
      title: 'Dados',
      icon: { ...DefaultIconsNames.info, size: 16 },
      content: <VoluntarioDadosTab voluntario={data?.[0]} />,
    },
    {
      title: 'Ministério',
      icon: { library: 'Feather', name: 'grid', size: 15 },
      content: <VoluntarioMinisterioTab ministerios={data?.[0].ministerios} />,
    },
  ];

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={TAB_DATA} containerStyle={{ flex: 1 }} contentContainerStyle={{ flex: 1 }} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
});
