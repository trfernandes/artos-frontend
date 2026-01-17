import FancyPageView from '../../../../components/containers/FancyPageView';

export default function InicioIndex() {
  return (
    <FancyPageView style={{ paddingHorizontal: 20, paddingTop: 10 }}>
      {/* <FancyCard.Image
        type="icon"
        props={{
          title: (
            <FancyText size={'medium'} type="bold">
              Escalas do mês
            </FancyText>
          ),
          subtitle: (
            <View style={{ paddingLeft: 5, gap: 10, paddingTop: 5 }}>
              <ProximaEscalaItem data={new Date(2025, 7, 9)} nomeEvento="Ruah Movment" nomeFuncao="Tecladista" />
              <ProximaEscalaItem data={new Date(2025, 7, 10)} nomeEvento="Culto de Domingo" nomeFuncao="Ministro(a)" />
            </View>
          ),
          cardIcon: { ...DefaultIconsNames['calendar-day'], size: 20 },
          contentContainerStyle: { paddingVertical: 10, paddingHorizontal: 20 },
        }}
      /> */}
      {/* <Button title="Testar notificação local" onPress={scheduleLocalTestNotification} />
      <Button
        title="Testar notificação escala local"
        onPress={() => scheduleLocalEscalaNotification('Ruah Movement', new Date(2025, 7, 9, 19, 30))}
      /> */}
    </FancyPageView>
  );
}
