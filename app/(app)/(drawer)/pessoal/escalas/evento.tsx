import { useLocalSearchParams } from 'expo-router';
import EventoDetails from '../../../../../components/pages/pessoal/escalas/evento/EventoDetails';

export default function EscalaEventoPage() {
  const { evento, dataOcorrencia, horarioEnsaio, ministerioNome, ministerioId, responsavelSetlistVoluntarioId } = useLocalSearchParams<{
    evento: string;
    dataOcorrencia: string;
    horarioEnsaio?: string;
    ministerioNome?: string;
    ministerioId?: string;
    responsavelSetlistVoluntarioId?: string;
  }>();

  return (
    <EventoDetails
      evento={evento ? JSON.parse(evento) : null}
      dataOcorrencia={dataOcorrencia ? new Date(dataOcorrencia) : new Date()}
      horarioEnsaio={horarioEnsaio || undefined}
      ministerioNome={ministerioNome || undefined}
      ministerioId={ministerioId || undefined}
      responsavelSetlistVoluntarioId={responsavelSetlistVoluntarioId || undefined}
    />
  );
}
