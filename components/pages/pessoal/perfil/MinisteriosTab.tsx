import FancyPageView from '../../../containers/FancyPageView';

export default function MinisteriosTab() {
  return (
    <FancyPageView>
      {/* <FancyList
        data={[{ nome: 'Ministério de Louvor', dataInicio: new Date(2025, 5, 1), dataTermino: undefined }]}
        renderItem={({ item }) => (
          <FancyCard.ImageIcon
            title={item.nome}
            subtitle={`Início: ${item.dataInicio.toLocaleDateString()} Término:`}
            additionalData1={`Funções: Tecladista, Backing Vocal, Violonista`}
            cardIcon={{ ...DefaultIconsNames['calendar-day'], size: 16 }}
          />
        )}
      /> */}
    </FancyPageView>
  );
}
