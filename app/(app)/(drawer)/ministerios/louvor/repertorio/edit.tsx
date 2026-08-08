import { router, useLocalSearchParams } from 'expo-router';
import RepertorioEditorScreen from '../../../../../../components/pages/ministerios/louvor/repertorio/RepertorioEditorScreen';

export default function MinisterioLouvorRepertorioEditPage() {
  const params = useLocalSearchParams<{ ministerioId?: string; id?: string; readOnly?: string }>();
  return (
    <RepertorioEditorScreen
      ministerioId={params.ministerioId}
      musicaId={params.id}
      readOnly={params.readOnly === '1'}
      onSaved={() => router.back()}
    />
  );
}
