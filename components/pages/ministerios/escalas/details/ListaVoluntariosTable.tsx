import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { EscalaItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import FancyText from '../../../../FancyText';

import FancyAvatarImage from '../../../../images/FancyImage';
import DefaultIcons from '../../../../FancyIcons';
import { ThemePalette } from '../../../../../constants/colors';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { useState, useCallback } from 'react';
import VoluntarioDetailsModal from './VoluntarioDetailsModal';
import {
  EscalaItemStatusEnum,
  EscalaItemStatusEnumLabel,
} from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { EscalaTemplateExperienciaLabel } from '../../../../../domain/enums/EscalaTemplate/escala-template-experiencia.enum';
import { AppImages } from '../../../../../assets/app_images';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
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
  onExcluirFuncaoPressed,
  viewMode,
  accentColor,
}: {
  data: EscalaItemEquipeType[];
  onSubstituicaoButtonPressed?: (data: EscalaItemEquipeType) => void;
  onAdicionarVoluntarioButtonPressed?: (data: EscalaItemEquipeType) => void;
  onRemoverVoluntarioPressed?: (data: EscalaItemEquipeType) => void;
  onExcluirFuncaoPressed?: (funcaoId: string) => void;
  viewMode?: 'view' | 'edit';
  accentColor?: string;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useAppTheme();
  const voluntarioStatusChipParams = getVoluntarioStatusChipParams(isDark);
  const { data: voluntariosData } = useVoluntariosCrud({ autoFetch: true });
  const voluntariosList = voluntariosData ?? [];
  const [voluntarioDetailsProps, setVoluntarioDetailsProps] = useState<{
    isVisible: boolean;
    ministerioVoluntarioId?: string;
    voluntarioId?: string;
  }>({ isVisible: false });
  const [menuItem, setMenuItem] = useState<EscalaItemEquipeType | null>(null);

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
          const voluntarioData = voluntariosList.find(
            (v) => v.id === equipeItem.voluntario?.voluntarioId,
          );
          const hasVoluntario = !!equipeItem.voluntario?.nome;

          return (
            <View key={index} style={[styles.rowBlock, palette.shadows[100]]}>
              <View style={styles.row}>
                {/* Avatar com dot de status */}
                {hasVoluntario ? (
                  <TouchableOpacity
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() =>
                      handleVoluntarioClick(
                        equipeItem.voluntario?.minVoluntarioId!,
                        equipeItem.voluntario?.voluntarioId!,
                      )
                    }
                    style={styles.avatarWrapper}
                  >
                    <FancyAvatarImage
                      source={
                        voluntarioData?.fotoThumbUrl || voluntarioData?.fotoUrl
                          ? { uri: voluntarioData?.fotoThumbUrl || voluntarioData?.fotoUrl || '' }
                          : AppImages.emptyProfile
                      }
                      size={36}
                      style={styles.avatar}
                    />
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: voluntarioStatusChipParams[equipeItem.status].color },
                      ]}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emptyAvatar}>
                    <DefaultIcons.Custom
                      library='MaterialIcons'
                      name='work-outline'
                      size={15}
                      color='#94A3B8'
                    />
                  </View>
                )}

                {/* Info: Função + Nome */}
                <View style={styles.infoColumn}>
                  <FancyText
                    type='medium'
                    size='extraSmall'
                    color={palette.fonts.inactive}
                    numberOfLines={1}
                  >
                    {equipeItem.funcao?.nome}
                    {hasVoluntario && equipeItem.funcao?.experiencia
                      ? ` · ${EscalaTemplateExperienciaLabel[equipeItem.funcao.experiencia]}`
                      : !hasVoluntario && equipeItem.funcao?.expMinima
                        ? ` · mín: ${EscalaTemplateExperienciaLabel[equipeItem.funcao.expMinima]}`
                        : ''}
                  </FancyText>
                  {hasVoluntario ? (
                    <FancyText type='semiBold' size={13}>
                      {getFirstAndLastName(equipeItem.voluntario?.nome)}
                    </FancyText>
                  ) : (
                    <FancyText type='semiBold' size={13} color={palette.fonts.inactive}>
                      Sem Voluntário
                    </FancyText>
                  )}
                </View>

                {/* Menu de ações */}
                {isEditMode && (
                  <TouchableOpacity
                    hitSlop={ACTION_HIT_SLOP}
                    onPress={() => setMenuItem(equipeItem)}
                    style={[
                      styles.dotsButton,
                      accentColor
                        ? { backgroundColor: ColorUtils.withAlpha(accentColor, 0.12), borderWidth: 1, borderColor: ColorUtils.withAlpha(accentColor, 0.22) }
                        : { backgroundColor: ColorUtils.withAlpha(palette.fonts.dark, 0.08) },
                    ]}
                  >
                    <DefaultIcons.Custom
                      library='Entypo'
                      name='dots-three-vertical'
                      size={12}
                      color={accentColor ?? palette.icons.dark}
                    />
                  </TouchableOpacity>
                )}
              </View>

            </View>
          );
        })}

      </View>

      <FancyBottomSheetModal
        visible={!!menuItem}
        onClose={() => setMenuItem(null)}
        title={menuItem?.voluntario?.nome ?? menuItem?.funcao?.nome ?? 'Opções'}
      >
        <View style={styles.menuSheet}>
          {menuItem && (menuItem.voluntario?.nome
            ? (
              <>
                <TouchableOpacity
                  style={styles.menuSheetItem}
                  onPress={() => {
                    setMenuItem(null);
                    requestAnimationFrame(() =>
                      handleVoluntarioClick(menuItem.voluntario?.minVoluntarioId!, menuItem.voluntario?.voluntarioId!)
                    );
                  }}
                >
                  <DefaultIcons.Custom library='MaterialIcons' name='person' size={18} color={palette.icons.dark} />
                  <FancyText size='small' type='medium' color={palette.fonts.dark}>Ver detalhes</FancyText>
                </TouchableOpacity>
                <View style={styles.menuSheetDivider} />
                <TouchableOpacity
                  style={styles.menuSheetItem}
                  onPress={() => {
                    setMenuItem(null);
                    requestAnimationFrame(() => onSubstituicaoButtonPressed?.(menuItem));
                  }}
                >
                  <DefaultIcons.Custom library='FontAwesome5' name='exchange-alt' size={15} color={palette.icons.dark} />
                  <FancyText size='small' type='medium' color={palette.fonts.dark}>Substituir voluntário</FancyText>
                </TouchableOpacity>
                <View style={styles.menuSheetDivider} />
                <TouchableOpacity
                  style={styles.menuSheetItem}
                  onPress={() => {
                    setMenuItem(null);
                    requestAnimationFrame(() => onRemoverVoluntarioPressed?.(menuItem));
                  }}
                >
                  <DefaultIcons.Custom library='MaterialIcons' name='person-remove' size={18} color={palette.error} />
                  <FancyText size='small' type='medium' color={palette.error}>Remover da escala</FancyText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.menuSheetItem}
                  onPress={() => {
                    setMenuItem(null);
                    requestAnimationFrame(() => onAdicionarVoluntarioButtonPressed?.(menuItem));
                  }}
                >
                  <DefaultIcons.Custom library='MaterialIcons' name='person-add' size={18} color={palette.primary} />
                  <FancyText size='small' type='medium' color={palette.fonts.dark}>Adicionar voluntário</FancyText>
                </TouchableOpacity>
                <View style={styles.menuSheetDivider} />
                <TouchableOpacity
                  style={styles.menuSheetItem}
                  onPress={() => {
                    setMenuItem(null);
                    requestAnimationFrame(() => onExcluirFuncaoPressed?.(menuItem.funcao?.id!));
                  }}
                >
                  <DefaultIcons.Custom library='MaterialIcons' name='delete-outline' size={18} color={palette.error} />
                  <FancyText size='small' type='medium' color={palette.error}>Excluir função</FancyText>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
      </FancyBottomSheetModal>

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
      gap: 8,
    },
    rowBlock: {
      borderRadius: 12,
      backgroundColor: palette.backgroundColor2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 10,
      gap: 10,
      minHeight: 44,
    },
    avatarWrapper: {
      position: 'relative',
      alignSelf: 'center',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignSelf: 'center',
    },
    statusDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 11,
      height: 11,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: palette.backgroundColor,
    },
    emptyAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.backgroundColor3,
      borderWidth: 1,
      borderColor: palette.borderCard,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    infoColumn: {
      flex: 1,
      gap: 2,
      justifyContent: 'center',
    },
    dotsButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    menuSheet: {
      paddingBottom: 8,
    },
    menuSheetItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    menuSheetDivider: {
      height: 1,
      backgroundColor: palette.borderCard,
    },
  });
}
