import { View } from 'react-native';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyText from '../../../../../components/FancyText';
import { useState } from 'react';
import Visualizar from '../../../../../components/pages/ministerios/solicitacoes/Visualizar';

const DATA: {
  solicitante: string;
  substituo: string;
  evento: { nome: string; dataInicio: Date; dataFim: Date };
  funcao: string;
}[] = [
  {
    solicitante: 'Thiago Fernandes',
    substituo: 'Leonardo Carpes',
    evento: { nome: 'Culto de Jovens RUAH', dataInicio: new Date(), dataFim: new Date() },
    funcao: 'Tecladista',
  },
  {
    solicitante: 'Juliana Fernandes',
    substituo: 'Miriam Moschen',
    evento: { nome: 'Culto de Domingo', dataInicio: new Date(), dataFim: new Date() },
    funcao: 'Ministro(a)',
  },
];

export default function MinisterioSolicitacoesIndex() {
  const [visualizarModal, setVisualizarModal] = useState(false);
  return (
    <FancyListPage
      showFab={false}
      listProps={{
        data: DATA,
        renderItem: ({ item }) => (
          <FancyCard.Image
            type='icon'
            props={{
              title: (
                <View style={{ gap: 3, paddingBottom: 5 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <FancyText size={'small'} type='medium'>
                      De:
                    </FancyText>
                    <FancyText size={'small'} type='semiBold'>
                      {item.solicitante}
                    </FancyText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <FancyText size={'small'} type='medium'>
                      Para:
                    </FancyText>
                    <FancyText size={'small'} type='semiBold'>
                      {item.substituo}
                    </FancyText>
                  </View>
                </View>
              ),
              cardIcon: {
                ...DefaultIconsNames.refresh,
                size: 15,
              },
              subtitle: `${item.evento.dataFim.toLocaleDateString()} - ${item.evento.dataFim.toLocaleDateString()}`,
              additionalData1: `${item.evento.nome}`,
              additionalData2: `${item.funcao}`,
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.confirm, size: 18 },
                  onPress: () => setVisualizarModal(true),
                },
                { icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error }, onPress: () => {} },
              ],
            }}
          />
        ),
      }}
    >
      {visualizarModal && (
        <Visualizar
          modalProps={{ visible: visualizarModal }}
          onClose={() => setVisualizarModal(false)}
          onConfirm={() => setVisualizarModal(false)}
        />
      )}
    </FancyListPage>
  );
}
