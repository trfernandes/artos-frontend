import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Pallete } from '../../../../../constants/colors';
import { useState } from 'react';
import FormModal from '../../../../../components/pages/ministerios/funcoes/FormModal';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';

export default function MinisterioFuncoesIndex() {
  const [formVisible, setFormVisible] = useState(false);
  return (
    <FancyListPage
      listProps={{
        data: [
          { nome: 'Guitarrista' },
          { nome: 'Tecladista' },
          { nome: 'Baterista' },
          { nome: 'Ministro(a)' },
          { nome: 'Violonista' },
          { nome: 'Baixista' },
          { nome: 'Backing-Vocal' },
        ],
        renderItem: ({ item }) => (
          <FancyCard.Image
            type="icon"
            props={{
              title: item.nome,
              cardIcon: { library: 'FontAwesome6', name: 'person-rays', size: 16 },
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.edit, size: 18 },
                  onPress: () => {
                    setFormVisible(true);
                  },
                },
                { icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error }, onPress: () => {} },
              ],
            }}
          />
        ),
      }}
    >
      {formVisible && (
        <FormModal
          title="Nova Função"
          modalProps={{ visible: formVisible }}
          onClose={() => setFormVisible(false)}
          onConfirm={() => setFormVisible(false)}
        />
      )}
    </FancyListPage>
  );
}
