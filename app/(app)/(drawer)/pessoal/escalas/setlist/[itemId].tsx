import { useLocalSearchParams } from 'expo-router';

import EventoSetlistItemDetailsView from '../../../../../../components/pages/common/EventoSetlistItemDetailsView';

export default function EscalasSetlistItemPage() {
  const params = useLocalSearchParams<{
    itemId?: string;
    eventoId?: string;
    ministerioId?: string;
    dataOcorrencia?: string;
    modo?: 'lider' | 'responsavel' | 'leitura';
  }>();

  if (!params.itemId || !params.eventoId || !params.ministerioId || !params.dataOcorrencia) {
    return null;
  }

  return (
    <EventoSetlistItemDetailsView
      itemId={params.itemId}
      eventoId={params.eventoId}
      ministerioId={params.ministerioId}
      dataOcorrencia={params.dataOcorrencia}
      canEdit={params.modo !== 'leitura'}
    />
  );
}
