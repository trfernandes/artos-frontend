import { StyleSheet, View } from 'react-native';
import { ResponseEscalaDto } from '../../../../../domain/dtos/Escala/escala.response';
import { EscalaStatusEnum } from '../../../../../domain/enums/Escala/escala-status.enum';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import EscalaHeader, { InlineAction } from './EscalaHeader';
import { useMemo } from 'react';
import { StatusDistribution } from './escalaHeader.utils';

export default function Header({
  escala,
  viewMode,
  isRegenerating,
  isPublishing,
  isScreenBlocked,
  onPublishPress,
  onGeneratePress,
  onDeletePress,
}: {
  escala?: ResponseEscalaDto;
  viewMode?: 'view' | 'edit';
  isRegenerating?: boolean;
  isPublishing?: boolean;
  isScreenBlocked?: boolean;
  onPublishPress: () => void;
  onGeneratePress: () => void;
  onDeletePress: () => void;
}) {
  if (!escala) return null;

  const {
    confirmedCount,
    totalCount,
    statusDistribution,
    periodStart,
    periodEnd,
    createdAt,
    updatedAt,
  } = useMemo(() => {
    const items = escala?.itens ?? [];

    const assignedItems = items.filter((item) => Boolean(item.voluntarioId));
    const resolvedTotal = assignedItems.length;
    const resolvedConfirmed = assignedItems.filter(
      (item) => item.status === EscalaItemStatusEnum.Confirmado,
    ).length;

    const resolvedDistribution: StatusDistribution | undefined =
      resolvedTotal > 0
        ? {
            confirmado: resolvedConfirmed,
            pendente: assignedItems.filter((i) => i.status === EscalaItemStatusEnum.Pendente)
              .length,
            ausente: assignedItems.filter((i) => i.status === EscalaItemStatusEnum.Ausente).length,
            substituido: assignedItems.filter(
              (i) =>
                i.status === EscalaItemStatusEnum.Substituido ||
                i.status === EscalaItemStatusEnum.SubstituicaoSolicitada,
            ).length,
          }
        : undefined;

    const startDate = new Date(escala.dataInicio);
    const endDate = new Date(escala.dataTermino);
    const createdDate = new Date(escala.createdAt);
    const updatedDate = new Date(escala.updatedAt);

    return {
      confirmedCount: resolvedTotal > 0 ? resolvedConfirmed : undefined,
      totalCount: resolvedTotal > 0 ? resolvedTotal : undefined,
      statusDistribution: resolvedDistribution,
      periodStart: startDate,
      periodEnd: endDate,
      createdAt: createdDate,
      updatedAt: updatedDate,
    };
  }, [escala]);

  const actions: InlineAction[] | undefined =
    !viewMode || viewMode === 'edit'
      ? [
          ...(escala.status === EscalaStatusEnum.Gerada
            ? [
                {
                  key: 'recalculate',
                  icon: {
                    library: 'MaterialCommunityIcons' as const,
                    name: 'calculator-variant-outline',
                  },
                  label: isRegenerating ? 'Recalculando...' : 'Recalcular',
                  variant: 'primary' as const,
                  isLoading: isRegenerating,
                  disabled: isScreenBlocked || escala.status !== EscalaStatusEnum.Gerada,
                  onPress: onGeneratePress,
                },
                {
                  key: 'publish',
                  icon: { library: 'MaterialIcons' as const, name: 'rocket-launch' },
                  label: 'Publicar escala',
                  variant: 'neutral' as const,
                  isLoading: isPublishing,
                  disabled: isScreenBlocked,
                  onPress: onPublishPress,
                },
              ]
            : []),
          ...(escala.status !== EscalaStatusEnum.Gerada
            ? [
                {
                  key: 'recalculate',
                  icon: {
                    library: 'MaterialCommunityIcons' as const,
                    name: 'calculator-variant-outline',
                  },
                  label: isRegenerating ? 'Recalculando...' : 'Recalcular',
                  variant: 'primary' as const,
                  isLoading: isRegenerating,
                  disabled: true,
                  onPress: onGeneratePress,
                },
              ]
            : []),
          {
            key: 'delete',
            icon: { library: 'MaterialIcons' as const, name: 'delete-outline' },
            label: 'Excluir escala',
            variant: 'danger' as const,
            disabled: isScreenBlocked,
            onPress: onDeletePress,
          },
        ]
      : undefined;

  return (
    <View style={styles.container}>
      <EscalaHeader
        title={escala.nome}
        status={escala.status}
        periodStart={periodStart}
        periodEnd={periodEnd}
        createdAt={createdAt}
        updatedAt={updatedAt}
        confirmedCount={confirmedCount}
        totalCount={totalCount}
        statusDistribution={statusDistribution}
        variant='default'
        actions={actions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
});
