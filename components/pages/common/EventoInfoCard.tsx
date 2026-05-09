import { View, StyleSheet } from 'react-native';
import FancyValueLine from '../../fields/FancyValueLine';
import FancyContainer from '../../FancyContainer';
import FancyText from '../../FancyText';
import { formatAppDateTime } from '../../../utils/date_utils';

export interface EventoInfoCardProps {
  eventoNome: string;
  eventoCor: string;
  dataOcorrencia: Date;
  ministerioNome?: string;
  local?: string;
  descricao?: string;
  horarioEnsaio?: string;
}

export default function EventoInfoCard({
  eventoNome,
  eventoCor,
  dataOcorrencia,
  ministerioNome,
  local,
  descricao,
  horarioEnsaio,
}: EventoInfoCardProps) {
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
            value={formatAppDateTime(dataOcorrencia, "EEE, d 'de' MMM 'de' yyyy 'às' HH:mm") ?? ''}
            multiline={true}
            showSeparator={true}
          />
          {ministerioNome ? (
            <FancyValueLine
              title='Ministério:'
              value={ministerioNome}
              showSeparator={true}
              dataContainerStyle={styles.dataContainer}
            />
          ) : null}
          <FancyValueLine
            title='Descrição:'
            value={descricao ?? 'Não definida'}
            showSeparator={true}
            dataContainerStyle={styles.dataContainer}
            multiline={true}
          />
          <FancyValueLine
            title='Local:'
            value={local ?? 'Não definido'}
            dataContainerStyle={styles.dataContainer}
            showSeparator={!!horarioEnsaio}
          />
          {horarioEnsaio && (
            <FancyValueLine
              title='Horário de ensaio:'
              value={`às ${horarioEnsaio}`}
              dataContainerStyle={styles.dataContainer}
            />
          )}
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
