import { View, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyValueLine from '../../fields/FancyValueLine';
import FancyContainer from '../../FancyContainer';
import FancyText from '../../FancyText';

export interface EventoInfoCardProps {
  eventoNome: string;
  eventoCor: string;
  dataOcorrencia: Date;
  local?: string;
  descricao?: string;
}

export default function EventoInfoCard({ eventoNome, eventoCor, dataOcorrencia, local, descricao }: EventoInfoCardProps) {
  return (
    <FancyContainer
      title={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 0,
            paddingHorizontal: 15,
            paddingVertical: 13,
          }}
        >
          <View style={{ height: 10, width: 10, backgroundColor: eventoCor, borderRadius: 999 }} />
          <FancyText size={'largeMedium'} type={'bold'} style={{ marginVertical: 0, opacity: 0.8 }}>
            {eventoNome}
          </FancyText>
        </View>
      }
      containerStyle={{ paddingBottom: 16 }}
      children={
        <View style={styles.fields}>
          <FancyValueLine
            dataContainerStyle={styles.dataContainer}
            title='Data/Hora:'
            value={format(dataOcorrencia, "EEE, d 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            showSeparator={true}
          />
          <FancyValueLine title='Descrição:' value={descricao ?? 'Não definida'} showSeparator={true} dataContainerStyle={styles.dataContainer} />
          <FancyValueLine title='Local:' value={local ?? 'Não definido'} dataContainerStyle={styles.dataContainer} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 14,
    paddingTop: 4,
    // paddingBottom: 16,
  },
  dataContainer: { paddingHorizontal: 15 },
});
