import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EscalaItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import FancyText from '../../../../FancyText';
import { SEMI_BOLD_FONT, SMALL_SIZE_FONT } from '../../../../../constants/font';
import FancyAvatarImage from '../../../../images/FancyImage';
import DefaultIcons from '../../../../FancyIcons';
import { Pallete } from '../../../../../constants/colors';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { useState, useCallback } from 'react';
import VoluntarioDetailsModal from './VoluntarioDetailsModal';
import FancyChips from '../../../../FancyChips';
import { EscalaItemStatusEnum, EscalaItemStatusEnumLabel } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { AppImages } from '../../../../../assets/app_images';
import FancySeparator from '../../../../FancySeparator';

const ACTION_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 } as const;

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

export default function ListaVoluntariosTable({
  data,
  onSubstituicaoButtonPressed,
  onAdicionarVoluntarioButtonPressed,
  onAdicionarFuncaoPressed,
  onExcluirFuncaoPressed,
  onExcluirEvento,
  viewMode,
}: {
  data: EscalaItemEquipeType[];
  onSubstituicaoButtonPressed?: (data: EscalaItemEquipeType) => void;
  onAdicionarVoluntarioButtonPressed?: (data: EscalaItemEquipeType) => void;
  onAdicionarFuncaoPressed?: () => void;
  onExcluirFuncaoPressed?: (funcaoId: string) => void;
  onExcluirEvento?: () => void;
  viewMode?: 'view' | 'edit';
}) {
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
          const voluntarioData = voluntariosData.find((v) => v.id === equipeItem.voluntario?.voluntarioId);
          const hasVoluntario = !!equipeItem.voluntario?.nome;

          return (
            <View key={index} style={styles.rowBlock}>
              <View style={styles.row}>
                {/* Avatar ou placeholder */}
                {hasVoluntario ? (
                  <TouchableOpacity
                    onPress={() =>
                      handleVoluntarioClick(equipeItem.voluntario?.minVoluntarioId!, equipeItem.voluntario?.voluntarioId!)
                    }
                  >
                    <FancyAvatarImage
                      source={
                        voluntarioData?.fotoThumbUrl || voluntarioData?.fotoUrl
                          ? { uri: voluntarioData?.fotoThumbUrl || voluntarioData?.fotoUrl || '' }
                          : AppImages.emptyProfile
                      }
                      style={styles.avatar}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emptyAvatar}>
                    <DefaultIcons.Custom library='MaterialIcons' name='person-outline' size={18} color='#CBD5E1' />
                  </View>
                )}

                {/* Info: Função + Nome */}
                <View style={styles.infoColumn}>
                  <FancyText type='medium' size='extraSmall' color={Pallete.fonts.inactive} numberOfLines={1}>
                    {equipeItem.funcao?.nome}
                  </FancyText>
                  {hasVoluntario ? (
                    <FancyText type='semiBold' size='extraSmall'>
                      {equipeItem.voluntario?.nome}
                    </FancyText>
                  ) : (
                    <FancyText type='normal' size='small' color={Pallete.fonts.inactive}>
                      Não escalado
                    </FancyText>
                  )}
                </View>

                {/* Status */}
                {hasVoluntario && (
                  <View style={{ alignSelf: 'center' }}>
                    <FancyChips
                      label={EscalaItemStatusEnumLabel[equipeItem.status]}
                      color={VoluntarioStatusChipParams[equipeItem.status].color}
                      backgroundColor={VoluntarioStatusChipParams[equipeItem.status].background}
                      size='small'
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
                        <DefaultIcons.Custom library='FontAwesome5' name='exchange-alt' size={12} color={Pallete.icons.light} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        hitSlop={ACTION_HIT_SLOP}
                        onPress={() => onAdicionarVoluntarioButtonPressed?.(equipeItem)}
                        style={[styles.actionButton, styles.actionButtonAdd]}
                      >
                        <DefaultIcons.Custom library='MaterialIcons' name='person-add' size={14} color={Pallete.icons.light} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      hitSlop={ACTION_HIT_SLOP}
                      onPress={() => onExcluirFuncaoPressed?.(equipeItem.funcao?.id!)}
                      style={[styles.actionButton, styles.actionButtonDelete]}
                    >
                      <DefaultIcons.Custom library='MaterialIcons' name='close' size={16} color={Pallete.icons.light} />
                    </TouchableOpacity>
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

        {/* Botão Adicionar Função */}
        {isEditMode && (
          <>
            <TouchableOpacity onPress={onAdicionarFuncaoPressed} style={styles.addFuncaoButton}>
              <View style={styles.addFuncaoIcon}>
                <DefaultIcons.Custom library='MaterialIcons' name='add' size={14} color={Pallete.icons.light} />
              </View>
              <FancyText style={styles.addFuncaoText} numberOfLines={1}>Adicionar Função</FancyText>
            </TouchableOpacity>

            {/* Botão Excluir Evento */}
            <TouchableOpacity onPress={onExcluirEvento} style={styles.deleteEventoButton}>
              <View style={styles.deleteEventoIcon}>
                <DefaultIcons.Custom library='MaterialIcons' name='delete-outline' size={14} color={Pallete.icons.light} />
              </View>
              <FancyText style={styles.deleteEventoText} numberOfLines={1}>Excluir Evento</FancyText>
            </TouchableOpacity>
          </>
        )}
      </View>

      {voluntarioDetailsProps.isVisible && voluntarioDetailsProps.ministerioVoluntarioId && voluntarioDetailsProps.voluntarioId && (
        <VoluntarioDetailsModal
          ministerioVoluntarioId={voluntarioDetailsProps.ministerioVoluntarioId}
          voluntarioId={voluntarioDetailsProps.voluntarioId}
          onClose={() => setVoluntarioDetailsProps({ isVisible: false })}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  rowBlock: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 10,
    minHeight: 52,
  },
  rowSeparator: {
    marginHorizontal: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignSelf: 'center',
  },
  emptyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  infoColumn: {
    flex: 1,
    gap: 1,
    justifyContent: 'center',
  },
  actionsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  actionButton: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: Pallete.terciary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonAdd: {
    backgroundColor: Pallete.primary,
  },
  actionButtonDelete: {
    backgroundColor: Pallete.error,
  },
  addFuncaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#FAFBFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  addFuncaoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Pallete.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFuncaoText: {
    fontSize: SMALL_SIZE_FONT,
    fontFamily: SEMI_BOLD_FONT,
    color: Pallete.fonts.dark,
  },
  deleteEventoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#FAFBFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  deleteEventoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Pallete.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteEventoText: {
    fontSize: SMALL_SIZE_FONT,
    fontFamily: SEMI_BOLD_FONT,
    color: Pallete.fonts.dark,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginBottom: 6,
    gap: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  separatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
});
