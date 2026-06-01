import { router, useLocalSearchParams } from 'expo-router';
import RepertorioEditorScreen from '../../../../../../components/pages/ministerios/louvor/repertorio/RepertorioEditorScreen';

export default function MinisterioLouvorRepertorioAddPage() {
  const params = useLocalSearchParams<{ ministerioId?: string }>();
  return (
    <RepertorioEditorScreen ministerioId={params.ministerioId} onSaved={() => router.back()} />
  );
}
