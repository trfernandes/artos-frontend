import { router, useLocalSearchParams } from 'expo-router';
import FancyListPage from '../../../../../../components/pages/base/FancyBaseListPage';
import SetlistResumoCard from '../../../../../../components/pages/ministerios/louvor/setlists/SetlistResumoCard';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { MinisterioTipoEnum } from '../../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { useSetlistsResumo } from '../../../../../../hooks/useSetlistsResumo';
import { ResponseSetlistResumoDto } from '../../../../../../domain/dtos/Evento/setlists-resumo.dto';

export default function MinisterioLouvorSetlistsIndexPage() {
  const params = useLocalSearchParams<{ ministerioId?: string }>();
  const { igrejaAtiva } = useAuth();
  const ministerioId =
    params.ministerioId ||
    igrejaAtiva?.ministerios?.find((ministerio) => ministerio.tipo === MinisterioTipoEnum.Louvor)
      ?.id;

  const { data: setlists = [], isLoading } = useSetlistsResumo(ministerioId);

  const abrirSetlist = (item: ResponseSetlistResumoDto) => {
    router.push({
      pathname: '/ministerios/agenda/details',
      params: {
        eventoId: item.eventoId,
        dataOcorrencia: item.dataOcorrencia,
        ministerioId,
        initialTab: 'setlist',
      },
    });
  };

  if (!ministerioId) return null;

  return (
    <FancyListPage
      contentLoading={isLoading}
      listProps={{
        listEmptyProps: {
          label: 'Nenhum SetList encontrado',
          helperText: 'Os SetLists dos cultos do ministério aparecerão aqui.',
          icon: { library: 'MaterialCommunityIcons', name: 'playlist-music-outline', size: 68 },
        },
        data: setlists,
        renderItem: ({ item }) => (
          <SetlistResumoCard data={item} onPress={() => abrirSetlist(item)} />
        ),
      }}
    />
  );
}
