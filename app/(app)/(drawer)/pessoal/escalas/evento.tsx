import { useLocalSearchParams } from 'expo-router';
import EventoDetails from '../../../../../components/pages/pessoal/escalas/evento/EventoDetails';

export default function EscalaEventoPage() {
  const { evento, dataOcorrencia } = useLocalSearchParams<{
    evento: string;
    dataOcorrencia: string;
  }>();

  return (
    <EventoDetails
      evento={evento ? JSON.parse(evento) : null}
      dataOcorrencia={dataOcorrencia ? new Date(dataOcorrencia) : new Date()}
    />
  );
}
