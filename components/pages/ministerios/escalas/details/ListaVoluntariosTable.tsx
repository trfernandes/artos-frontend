import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { EscalaItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import FancyText from '../../../../FancyText';

import FancyAvatarImage from '../../../../images/FancyImage';
import DefaultIcons from '../../../../FancyIcons';
import { ThemePalette } from '../../../../../constants/colors';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { useState, useCallback } from 'react';
import VoluntarioDetailsModal from './VoluntarioDetailsModal';
import FancyChips from '../../../../FancyChips';
import {
  EscalaItemStatusEnum,
  EscalaItemStatusEnumLabel,
} from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { AppImages } from '../../../../../assets/app_images';
import FancySeparator from '../../../../FancySeparator';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { useAppTheme } from '../../../../../hooks/useAppTheme';
import { ColorUtils } from '../../../../../utils/color_utils';
import { getFirstAndLastName } from '../../../../../utils/text_utils';

const ACTION_HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 16 } as const;

export const VoluntarioStatusChipParams = {
  [EscalaItemStatusEnum.Pendente]: {
    label: 'Pendente',
    color: '#B45309',
    background: '#FEF3C7',
  },
  [EscalaItemStatusEnum.Ausente]: {
    label: 'Ausente',
    color: '#B91C1C',
    background: '#FEE2E2',
  },
  [EscalaItemStatusEnum.Confirmado]: {
    label: 'Confirmado',
    color: '#166534',
    background: '#DCFCE7',
  },
  [EscalaItemStatusEnum.Substituido]: {
    label: 'Substituído',
    color: '#1D4ED8',
    background: '#DBEAFE',
  },
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: {
    label: 'Substituído',
    color: '#1D4ED8',
    background: '#DBEAFE',
  },
} as const;

function getVoluntarioStatusChipParams(isDark: boolean) {
  if (!isDark) return VoluntarioStatusChipParams;

  return {
    [EscalaItemStatusEnum.Pendente]: {
      ...VoluntarioStatusChipParams[EscalaItemStatusEnum.Pendente],
      background: ColorUtils.withAlpha(
        VoluntarioStatusChipParams[EscalaItemStatusEnum.Pendente].color,
        0.22,
      ),
    },
    [EscalaItemStatusEnum.Ausente]: {
      ...VoluntarioStatusChipParams[EscalaItemStatusEnum.Ausente],
      background: ColorUtils.withAlpha(
        VoluntarioStatusChipParams[EscalaItemStatusEnum.Ausente].color,
        0.2,
      ),
    },
    [EscalaItemStatusEnum.Confirmado]: {
      ...VoluntarioStatusChipParams[EscalaItemStatusEnum.Confirmado],
      background: ColorUtils.withAlpha(
        VoluntarioStatusChipParams[EscalaItemStatusEnum.Confirmado].color,
        0.2,
      ),
    },
    [EscalaItemStatusEnum.Substituido]: {
      ...VoluntarioStatusChipParams[EscalaItemStatusEnum.Substituido],
      background: ColorUtils.withAlpha(
        VoluntarioStatusChipParams[EscalaItemStatusEnum.Substituido].color,
        0.2,
      ),
    },
    [EscalaItemStatusEnum.SubstituicaoSolicitada]: {
      ...VoluntarioStatusChipParams[EscalaItemStatusEnum.SubstituicaoSolicitada],
      background: ColorUtils.withAlpha(
        VoluntarioStatusChipParams[EscalaItemStatusEnum.SubstituicaoSolicitada].color,
        0.2,
      ),
    },
  } as const;
}

export default function ListaVoluntariosTable({
  data,
  onSubstituicaoButtonPressed,
  onAdicionarVoluntarioButtonPressed,
  onRemoverVoluntarioPressed,
  onAdicionarFuncaoPressed,
  onExcluirFuncaoPressed,
  onExcluirEvento,
  viewMode,
}: {
  data: EscalaItemEquipeType[];
  onSubstituicaoButtonPressed?: (data: EscalaItemEquipeType) => void;
  onAdicionarVoluntarioButtonPressed?: (data: EscalaItemEquipeType) => void;
  onRemoverVoluntarioPressed?: (data: EscalaItemEquipeType) => void;
  onAdicionarFuncaoPressed?: () => void;
  onExcluirFuncaoPressed?: (funcaoId: string) => void;
  onExcluirEvento?: () => void;
  viewMode?: 'view' | 'edit';
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useAppTheme();
  const voluntarioStatusChipParams = getVoluntarioStatusChipParams(isDark);
  const { data: voluntariosData } = useVoluntariosCrud({ autoFetch: true });
  const [voluntarioDetailsProps, setVoluntarioDetailsProps] = useState<{
    isVisible: boolean;
    ministerioVoluntarioId?: string;
    voluntarioId?: string;
  }>({ isVisible: false });

  const handleVoluntarioClick = useCallback((minVoluntarioId: string, voluntarioId: string) => {
    setVoluntarioDetailsProps({
      isVisible: true,
      ministerioVoluntarioId: minVoluntarioId,
      voluntarioId: voluntarioId,
    });
  }, []);

  const isEditMode = !viewMode || viewMode === 'edit';

  return (
    <>
      <View style={styles.container}>
        {data?.map((equipeItem, index) => {
          const voluntarioData = voluntariosData.find(
            (v) => v.id === equipeItem.voluntario?.voluntarioId,
          );
          const hasVoluntario = !!equipeItem.voluntario?.nome;

          return (
            <View key={index} style={styles.rowBlock}>
              <View style={styles.row}>
                {/* Avatar ou placeholder */}
                {hasVoluntario ? (
                  <TouchableOpacity
                    onPress={() =>
                      handleVoluntarioClick(
                        equipeItem.voluntario?.minVoluntarioId!,
                        equipeItem.voluntario?.voluntarioId!,
                      )
                    }
                  >
                    <FancyAvatarImage
                      source={
                        voluntarioData?.fotoThumbUrl || voluntarioData?.fotoUrl
                          ? { uri: voluntarioData?.fotoThumbUrl || voluntarioData?.fotoUrl || '' }
                          : AppImages.emptyProfile
                      }
                      size={28}
                      style={styles.avatar}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emptyAvatar}>
                    <DefaultIcons.Custom
                      library='MaterialIcons'
                      name='work-outline'
                      size={14}
                      color='#94A3B8'
                    />
                  </View>
                )}

                {/* Info: Função + Nome */}
                <View style={styles.infoColumn}>
                  <FancyText
                    type='medium'
                    size={10}
                    color={palette.fonts.inactive}
                    numberOfLines={1}
                  >
                    {equipeItem.funcao?.nome}
                  </FancyText>
                  {hasVoluntario ? (
                    <FancyText type='semiBold' size={10}>
                      {getFirstAndLastName(equipeItem.voluntario?.nome)}
                    </FancyText>
                  ) : (
                    <FancyText type='semiBold' size={10} color={palette.fonts.inactive}>
                      Sem Voluntário
                    </FancyText>
                  )}
                </View>

                {/* Status */}
                {hasVoluntario && (
                  <View style={{ alignSelf: 'center' }}>
                    <FancyChips
                      label={EscalaItemStatusEnumLabel[equipeItem.status]}
                      color={voluntarioStatusChipParams[equipeItem.status].color}
                      backgroundColor={voluntarioStatusChipParams[equipeItem.status].background}
                      size='small'
                      style={{ paddingVertical: 1, paddingHorizontal: 5, borderWidth: 1 }}
                      labelProps={{ style: { fontSize: 9 } }}
                    />
                  </View>
                )}

                {/* Coluna de Ações */}
                {isEditMode && (
                  <View style={styles.actionsColumn}>
                    {hasVoluntario ? (
                      <TouchableOpacity
                        hitSlop={ACTION_HIT_SLOP}
                        onPress={() => onSubstituicaoButtonPressed?.(equipeItem)}
                        style={styles.actionButton}
                      >
                        <DefaultIcons.Custom
                          library='FontAwesome5'
                          name='exchange-alt'
                          size={12}
                          color={palette.icons.light}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        hitSlop={ACTION_HIT_SLOP}
                        onPress={() => onAdicionarVoluntarioButtonPressed?.(equipeItem)}
                        style={[styles.actionButton, styles.actionButtonAdd]}
                      >
                        <DefaultIcons.Custom
                          library='MaterialIcons'
                          name='person-add'
                          size={14}
                          color={palette.icons.light}
                        />
                      </TouchableOpacity>
                    )}
                    {hasVoluntario ? (
                      <TouchableOpacity
                        hitSlop={ACTION_HIT_SLOP}
                        onPress={() => onRemoverVoluntarioPressed?.(equipeItem)}
                        style={[styles.actionButton, styles.actionButtonWarning]}
                      >
                        <DefaultIcons.Custom
                          library='MaterialIcons'
                          name='person-remove'
                          size={15}
                          color={palette.icons.light}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        hitSlop={ACTION_HIT_SLOP}
                        onPress={() => onExcluirFuncaoPressed?.(equipeItem.funcao?.id!)}
                        style={[styles.actionButton, styles.actionButtonDelete]}
                      >
                        <DefaultIcons.Custom
                          library='MaterialIcons'
                          name='delete-outline'
                          size={15}
                          color={palette.icons.light}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {index < data.length - 1 && <FancySeparator style={styles.rowSeparator} />}
            </View>
          );
        })}

        {/* Separador */}
        {isEditMode && (
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <View style={styles.separatorDot} />
            <View style={styles.separatorLine} />
          </View>
        )}

        {/* Ações do evento */}
        {isEditMode && (
          <View style={styles.footerActions}>
            <TouchableOpacity onPress={onAdicionarFuncaoPressed} style={styles.footerPill}>
              <DefaultIcons.Custom library='MaterialIcons' name='add' size={14} color={palette.icons.light} />
              <FancyText type='semiBold' size={10} color={palette.fonts.light} numberOfLines={1}>
                Nova Função
              </FancyText>
            </TouchableOpacity>
            <TouchableOpacity onPress={onExcluirEvento} style={styles.footerPillDanger}>
              <DefaultIcons.Custom library='MaterialIcons' name='delete-outline' size={14} color={palette.icons.light} />
              <FancyText type='semiBold' size={10} color={palette.fonts.light} numberOfLines={1}>
                Excluir Evento
              </FancyText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {voluntarioDetailsProps.isVisible &&
        voluntarioDetailsProps.ministerioVoluntarioId &&
        voluntarioDetailsProps.voluntarioId && (
          <VoluntarioDetailsModal
            ministerioVoluntarioId={voluntarioDetailsProps.ministerioVoluntarioId}
            voluntarioId={voluntarioDetailsProps.voluntarioId}
            onClose={() => setVoluntarioDetailsProps({ isVisible: false })}
          />
        )}
    </>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      gap: 2,
    },
    rowBlock: {
      gap: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 3,
      paddingHorizontal: 4,
      gap: 8,
      minHeight: 40,
    },
    rowSeparator: {
      marginHorizontal: 4,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignSelf: 'center',
    },
    emptyAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#E2E8F0',
      borderWidth: 1,
      borderColor: '#CBD5E1',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    infoColumn: {
      flex: 1,
      gap: -2,
      justifyContent: 'center',
    },
    actionsColumn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      alignSelf: 'center',
    },
    actionButton: {
      width: Platform.OS === 'ios' ? 28 : 23,
      height: Platform.OS === 'ios' ? 28 : 23,
      borderRadius: Platform.OS === 'ios' ? 14 : 12,
      backgroundColor: palette.terciary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonAdd: {
      backgroundColor: palette.primary,
    },
    actionButtonDelete: {
      backgroundColor: palette.error,
    },
    actionButtonWarning: {
      backgroundColor: palette.warning,
    },
    footerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingTop: 4,
      paddingBottom: 1,
      paddingHorizontal: 4,
    },
    footerPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    footerPillDanger: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: palette.error,
    },
    separatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
      marginBottom: 2,
      gap: 8,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: palette.borderCard,
    },
    separatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: palette.disabled2,
    },
  });
}
