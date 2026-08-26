import { useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../../../../../components/containers/FancyPageView';
import MusicasTocadasInsightsView from '../../../../../../components/pages/ministerios/louvor/repertorio/MusicasTocadasInsightsView';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { MinisterioTipoEnum } from '../../../../../../domain/enums/Ministerio/ministerio-tipo.enum';

export default function MusicasTocadasInsightsPage() {
  const params = useLocalSearchParams<{
    ministerioId?: string;
    eventoId?: string;
    dataOcorrencia?: string;
  }>();
  const { igrejaAtiva } = useAuth();
  const ministerioId =
    params.ministerioId ||
    igrejaAtiva?.ministerios?.find((ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor)
      ?.id;

  if (!ministerioId) return null;

  return (
    <FancyPageView>
      <MusicasTocadasInsightsView
        ministerioId={ministerioId}
        eventoId={params.eventoId}
        dataOcorrencia={params.dataOcorrencia}
      />
    </FancyPageView>
  );
}
