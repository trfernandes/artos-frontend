import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import FancyScrollView from '../../../../FancyScrollView';
import FancyLoading from '../../../../FancyLoading';
import FancyListEmpty from '../../../../list/FancyListEmpty';
import FancyText from '../../../../FancyText';
import FancyAvatarImage from '../../../../images/FancyImage';
import FancyChips from '../../../../FancyChips';
import DefaultIcons from '../../../../FancyIcons';
import { useEscalaItensCrud } from '../../../../../hooks/useEscalaItensCrud';
import { DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { useAuth } from '../../../../../contexts/AuthContext';
import { AppImages } from '../../../../../assets/app_images';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { EscalaItemStatusEnum, EscalaItemStatusEnumLabel } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';

const STATUS_VISUALS: Record<
  EscalaItemStatusEnum,
  {
    color: string;
    backgroundColor: string;
    label: string;
  }
> = {
  [EscalaItemStatusEnum.Pendente]: {
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Pendente],
  },
  [EscalaItemStatusEnum.Confirmado]: {
    color: '#166534',
    backgroundColor: '#DCFCE7',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Confirmado],
  },
  [EscalaItemStatusEnum.Ausente]: {
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Ausente],
  },
  [EscalaItemStatusEnum.Substituido]: {
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    label: EscalaItemStatusEnumLabel[EscalaItemStatusEnum.Substituido],
  },
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: {
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    label: 'Substituição',
  },
};

export default function EscalaEventoEquipeTab({
  eventoId,
  dataOcorrencia,
}: {
  eventoId: string;
  dataOcorrencia: Date;
}) {
  const palette = usePallete();
  const { user } = useAuth();

  const searchParams: DynamicQuery = useMemo(
    () =>
      ({
        where: {
          conditions: [
            {
              path: 'evento.id',
              operator: Operator.EQUALS,
              value: {
                type: ValueType.LITERAL,
                value: eventoId,
              },
            },
            {
              path: 'dataOcorrencia',
              operator: Operator.EQUALS,
              value: {
                type: ValueType.LITERAL,
                value: DateUtilsApi.dateOnlyToApi(dataOcorrencia),
              },
            },
          ],
        },
        relations: ['voluntario.voluntario', 'funcao'],
        orderBy: [{ path: 'funcao.nome', direction: OrderDirection.ASC }],
      }) as DynamicQuery,
    [eventoId, dataOcorrencia],
  );

  const { data, isLoading } = useEscalaItensCrud({
    autoFetch: true,
    initialParams: searchParams,
    includeFotos: true,
  });

  const equipe = useMemo(() => data ?? [], [data]);

  if (isLoading) return <FancyLoading />;

  if (!equipe.length) {
    return (
      <FancyListEmpty
        label='Nenhuma equipe escalada para este evento'
        icon={{ library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 60 }}
      />
    );
  }

  return (
    <FancyScrollView contentContainerStyle={styles.contentContainer}>
      {equipe.map((item) => {
        const voluntario = item.voluntario?.voluntario;
        const fotoSource =
          voluntario?.fotoThumbUrl || voluntario?.fotoUrl
            ? { uri: voluntario.fotoThumbUrl || voluntario.fotoUrl || '' }
            : AppImages.emptyProfile;
        const isCurrentUser = user?.user?.id === voluntario?.id;
        const statusVisual = STATUS_VISUALS[item.status];
        const isAssigned = !!voluntario?.nome;

        return (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: palette.backgroundColor2,
                borderColor: isCurrentUser
                  ? ColorUtils.withAlpha(palette.primary, 0.28)
                  : palette.borderCard,
              },
            ]}
          >
            <View style={styles.cardTopRow}>
              <FancyAvatarImage source={fotoSource} size={52} />

              <View style={styles.identityColumn}>
                <View style={styles.nameRow}>
                  <FancyText
                    type='bold'
                    size='small'
                    color={palette.fonts.dark}
                    numberOfLines={2}
                    style={styles.nameText}
                  >
                    {isAssigned ? voluntario?.nome : 'Vaga aberta'}
                  </FancyText>
                  {isCurrentUser ? (
                    <FancyChips
                      label='Você'
                      size='small'
                      color={palette.primary}
                      backgroundColor={ColorUtils.withAlpha(palette.primary, 0.12)}
                      style={styles.youChip}
                    />
                  ) : null}
                </View>

                <View style={styles.funcaoRow}>
                  <DefaultIcons.Custom
                    library='MaterialIcons'
                    name='work-outline'
                    size={14}
                    color={palette.fonts.inactive}
                  />
                  <FancyText
                    type='semiBold'
                    size='extraSmall'
                    color={palette.fonts.inactive}
                    numberOfLines={2}
                    style={styles.funcaoText}
                  >
                    {item.funcao?.nome || 'Função não informada'}
                  </FancyText>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <FancyChips
                label={isAssigned ? statusVisual.label : 'Sem escalado'}
                size='small'
                color={isAssigned ? statusVisual.color : palette.fonts.inactive}
                backgroundColor={
                  isAssigned
                    ? statusVisual.backgroundColor
                    : ColorUtils.withAlpha(palette.fonts.inactive, 0.12)
                }
              />
            </View>
          </View>
        );
      })}
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 6,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identityColumn: {
    flex: 1,
    gap: 7,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameText: {
    flex: 1,
    opacity: 0.9,
  },
  youChip: {
    marginTop: 1,
  },
  funcaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  funcaoText: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
