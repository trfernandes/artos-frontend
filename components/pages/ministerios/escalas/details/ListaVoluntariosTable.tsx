import { Platform, Pressable, StyleSheet, View } from 'react-native';
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
import FancyActionSheet from '../../../../actions/FancyActionSheet';
import FancyListEmpty from '../../../../list/FancyListEmpty';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { useAppTheme } from '../../../../../hooks/useAppTheme';
import { ColorUtils } from '../../../../../utils/color_utils';
import { getFirstAndLastName } from '../../../../../utils/text_utils';

const ACTION_HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 16 } as const;

export const VoluntarioStatusChipLabels: Record<EscalaItemStatusEnum, string> = {
  [EscalaItemStatusEnum.Pendente]: 'Pendente',
  [EscalaItemStatusEnum.Ausente]: 'Ausente',
  [EscalaItemStatusEnum.Confirmado]: 'Confirmado',
  [EscalaItemStatusEnum.Substituido]: 'Substituído',
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: 'Aguard. aprovação',
};

export function getVoluntarioStatusChipParams(palette: ReturnType<typeof usePallete>, isDark: boolean) {
  const alpha = isDark ? 0.2 : 0.14;
  return {
    [EscalaItemStatusEnum.Pendente]: {
      label: VoluntarioStatusChipLabels[EscalaItemStatusEnum.Pendente],
      color: palette.warning,
      background: ColorUtils.withAlpha(palette.warning, isDark ? 0.22 : 0.18),
    },
    [EscalaItemStatusEnum.Ausente]: {
      label: VoluntarioStatusChipLabels[EscalaItemStatusEnum.Ausente],
      color: palette.error,
      background: ColorUtils.withAlpha(palette.error, alpha),
    },
    [EscalaItemStatusEnum.Confirmado]: {
      label: VoluntarioStatusChipLabels[EscalaItemStatusEnum.Confirmado],
      color: palette.confirm,
      background: ColorUtils.withAlpha(palette.confirm, alpha),
    },
    [EscalaItemStatusEnum.Substituido]: {
      label: VoluntarioStatusChipLabels[EscalaItemStatusEnum.Substituido],
      color: palette.secondary,
      background: ColorUtils.withAlpha(palette.secondary, alpha),
    },
    [EscalaItemStatusEnum.SubstituicaoSolicitada]: {
      label: VoluntarioStatusChipLabels[EscalaItemStatusEnum.SubstituicaoSolicitada],
      color: palette.warning,
      background: ColorUtils.withAlpha(palette.warning, isDark ? 0.22 : 0.18),
    },
  };
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
  const voluntarioStatusChipParams = getVoluntarioStatusChipParams(palette, isDark);
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

  const validEquipe = data?.filter((item) => !!item.funcao?.id) ?? [];

  return (
    <>
      <View style={styles.container}>
        {validEquipe.map((equipeItem, index) => {
          const voluntarioData = voluntariosList.find(
            (v) => v.id === equipeItem.voluntario?.voluntarioId,
          );
          const hasVoluntario = !!equipeItem.voluntario?.nome;

          return (
            <View key={index}>
              <View style={styles.row}>
                {/* Avatar com dot de status */}
                {hasVoluntario ? (
                  <Pressable
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
                  </Pressable>
                ) : (
                  <View style={styles.emptyAvatar}>
                    <DefaultIcons.Custom
                      library='MaterialIcons'
                      name='work-outline'
                      size={15}
                      color={palette.icons.inactive2}
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
                    <FancyText type='semiBold' size={12}>
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
                  <Pressable
                    hitSlop={ACTION_HIT_SLOP}
                    onPress={() => setMenuItem(equipeItem)}
                    style={styles.dotsButton}
                  >
                    <DefaultIcons.Custom
                      library='Entypo'
                      name='dots-three-vertical'
                      size={14}
                      color={accentColor ?? palette.icons.inactive}
                    />
                  </Pressable>
                )}
              </View>
              {index < validEquipe.length - 1 && <View style={styles.rowDivider} />}
            </View>
          );
        })}
      </View>

      <FancyActionSheet
        visible={!!menuItem}
        onClose={() => setMenuItem(null)}
        title={menuItem?.voluntario?.nome ?? menuItem?.funcao?.nome ?? 'Opções'}
        actions={
          menuItem
            ? menuItem.voluntario?.nome
              ? [
                  {
                    label: 'Ver detalhes',
                    icon: { library: 'MaterialIcons' as const, name: 'person', size: 18 },
                    onPress: () =>
                      handleVoluntarioClick(
                        menuItem.voluntario!.minVoluntarioId!,
                        menuItem.voluntario!.voluntarioId!,
                      ),
                  },
                  {
                    label: 'Substituir voluntário',
                    icon: { library: 'FontAwesome5' as const, name: 'exchange-alt', size: 15 },
                    onPress: () => onSubstituicaoButtonPressed?.(menuItem),
                  },
                  {
                    label: 'Remover da escala',
                    icon: { library: 'MaterialIcons' as const, name: 'person-remove', size: 18 },
                    onPress: () => onRemoverVoluntarioPressed?.(menuItem),
                    destructive: true,
                  },
                ]
              : [
                  {
                    label: 'Adicionar voluntário',
                    icon: { library: 'MaterialIcons' as const, name: 'person-add', size: 18 },
                    onPress: () => onAdicionarVoluntarioButtonPressed?.(menuItem),
                  },
                  {
                    label: 'Excluir função',
                    icon: { library: 'MaterialIcons' as const, name: 'delete-outline', size: 18 },
                    onPress: () => onExcluirFuncaoPressed?.(menuItem.funcao?.id!),
                    destructive: true,
                  },
                ]
            : []
        }
      />

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
      gap: 0,
    },
    rowDivider: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 50,
      backgroundColor: ColorUtils.withAlpha(palette.fonts.dark, 0.07),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
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
  });
}
