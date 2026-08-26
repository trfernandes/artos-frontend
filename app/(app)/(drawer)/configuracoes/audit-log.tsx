import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../../../components/containers/FancyPageView';
import FancyList from '../../../../components/list/FancyList';
import FancyListItemCard from '../../../../components/cards/FancyListItemCard';
import FancyLoading from '../../../../components/FancyLoading';
import { useAuditLog } from '../../../../hooks/useAuditLog';
import { usePallete } from '../../../../hooks/usePallete';
import { ColorUtils } from '../../../../utils/color_utils';
import { formatDataInclusaoRelativa } from '../../../../utils/date_utils';
import { AuditLogAcaoEnum } from '../../../../domain/enums/AuditLog/audit-log-acao.enum';
import { IconLibrary } from '../../../../components/FancyIcons';
import FancyVerticalSpacer from '../../../../components/FancyVerticalSpacer';

const ACAO_ICON: Record<AuditLogAcaoEnum, { library: IconLibrary; name: string }> = {
  [AuditLogAcaoEnum.Criacao]: { library: 'MaterialCommunityIcons', name: 'plus-circle-outline' },
  [AuditLogAcaoEnum.Edicao]: { library: 'MaterialCommunityIcons', name: 'pencil-outline' },
  [AuditLogAcaoEnum.Exclusao]: { library: 'MaterialCommunityIcons', name: 'trash-can-outline' },
};

export default function AuditLogScreen() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId?: string }>();
  const palette = usePallete();
  const { data, isLoading, refetch, isRefetching } = useAuditLog(ministerioId || undefined);

  if (isLoading) {
    return (
      <FancyPageView style={styles.page}>
        <FancyLoading />
      </FancyPageView>
    );
  }

  return (
    <FancyPageView style={styles.page}>
      <FancyVerticalSpacer height={16} />
      <FancyList
        containerStyle={styles.listContainer}
        data={data ?? []}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        renderItem={({ item }) => (
          <FancyListItemCard
            leading={{
              type: 'icon',
              icon: { ...ACAO_ICON[item.acao], color: palette.secondary },
              backgroundColor: ColorUtils.withAlpha(palette.secondary, 0.14),
            }}
            title={item.descricao}
            subtitle={`${item.autor?.nome ?? 'Alguém'} · ${formatDataInclusaoRelativa(item.createdAt) ?? ''}`}
          />
        )}
        listEmptyProps={{
          label: 'Nenhum registro ainda',
          helperText: 'Edições sensíveis em escalas, ministérios e vínculos aparecem aqui.',
          icon: { library: 'MaterialCommunityIcons', name: 'history', size: 55 },
          muted: false,
        }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  listContainer: {
    flex: 1,
  },
});
