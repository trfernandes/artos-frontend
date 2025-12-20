import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EscalItemEquipeType } from '../../../../../app/(app)/(drawer)/ministerios/escalas/details';
import FancyText from '../../../../FancyText';
import { BOLD_FONT, EXTRA_SMALL_SIZE_FONT, SEMI_BOLD_FONT, SMALL_SIZE_FONT } from '../../../../../constants/font';
import FancyAvatarImage from '../../../../images/FancyImage';
import FancySeparator from '../../../../FancySeparator';
import FancyVerticalSpacer from '../../../../FancyVerticalSpacer';
import { EscalaItemStatusEnum, EscalaItemStatusEnumLabel } from '../../../../../domain/models/EscalaItem';
import DefaultIcons from '../../../../FancyIcons';
import { Pallete } from '../../../../../constants/colors';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { useState } from 'react';
import VoluntarioDetailsModal from './VoluntarioDetailsModal';
import { useLoading } from '../../../../../contexts/LoadingContext';
import FancyChips from '../../../../FancyChips';

export const VoluntarioStatusChipParams = {
  [EscalaItemStatusEnum.Pendente]: {
    label: 'Pendente',
    color: '#B45309', // Laranja escuro
    background: '#FEF3C7', // Laranja claro (Amber 100)
  },
  [EscalaItemStatusEnum.Ausente]: {
    label: 'Ausente',
    color: '#B91C1C', // Vermelho escuro (error)
    background: '#FEE2E2', // Vermelho claro (Red 100)
  },
  [EscalaItemStatusEnum.Confirmado]: {
    label: 'Confirmado',
    color: '#166534', // Verde escuro (success)
    background: '#DCFCE7', // Verde claro (Green 100)
  },
  [EscalaItemStatusEnum.Substituido]: {
    label: 'Substituído',
    color: '#1D4ED8', // Azul escuro
    background: '#DBEAFE', // Azul claro (Blue 100)
  },
  [EscalaItemStatusEnum.SubstituicaoSolicitada]: {
    label: 'Substituído',
    color: '#1D4ED8', // Azul escuro
    background: '#DBEAFE', // Azul claro (Blue 100)
  },
} as const;

export default function ListaVoluntariosTable({
  data,
  onSubstituicaoButtonPressed,
  viewMode,
}: {
  data: EscalItemEquipeType[];
  onSubstituicaoButtonPressed?: (data: EscalItemEquipeType) => void;
  viewMode?: 'view' | 'edit';
}) {
  const { data: voluntariosData } = useVoluntariosCrud({ autoFetch: true });
  const [voluntarioDetailsProps, setVoluntarioDetailsProps] = useState<{
    isVisible: boolean;
    ministerioVoluntarioId?: string;
    voluntarioId?: string;
  }>({ isVisible: false });

  const { showLoading } = useLoading();

  return (
    <>
      <View style={styles.container}>
        <View style={styles.rowContainer}>
          <FancyText style={[styles.headerItem, styles.column1]}>Função</FancyText>
          <FancyText style={[styles.headerItem, styles.column2]}>Voluntário</FancyText>
          <FancyText style={[styles.headerItem, styles.column3]}>Status</FancyText>
          {!viewMode || (viewMode === 'edit' && <View style={styles.column4}></View>)}
        </View>
        <FancyVerticalSpacer height={7} />
        <FancySeparator />
        <FancyVerticalSpacer height={9} />
        <View style={styles.valuesContainer}>
          {data?.map((equipeItem, index) => {
            const voluntarioFoto = voluntariosData.find(v => v.id === equipeItem.voluntario.voluntarioId)?.foto;
            return (
              <View style={{ gap: 10 }} key={index}>
                <View style={styles.rowContainer}>
                  <View style={[styles.column1, { justifyContent: 'center' }]}>
                    <FancyText style={[styles.valueItem]} ellipsizeMode="tail" numberOfLines={2}>
                      {equipeItem.funcao.nome}
                    </FancyText>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      showLoading('Carregando detalhes do voluntário...');
                      setVoluntarioDetailsProps({
                        isVisible: true,
                        ministerioVoluntarioId: equipeItem.voluntario.minVoluntarioId,
                        voluntarioId: equipeItem.voluntario.voluntarioId,
                      });
                    }}
                    style={[styles.column2, { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }]}
                  >
                    <FancyAvatarImage
                      source={
                        voluntarioFoto
                          ? { uri: voluntarioFoto, width: 25, height: 25 }
                          : require('../../../../../assets/images/empty_profile_image.png')
                      }
                      style={{ width: 25, height: 25 }}
                    />
                    <FancyText style={styles.valueItem} ellipsizeMode="tail" numberOfLines={2}>
                      {equipeItem.voluntario.nome}
                    </FancyText>
                  </TouchableOpacity>
                  <FancyText style={[styles.valueItem, styles.column3]} ellipsizeMode="tail" numberOfLines={2}>
                    <FancyChips
                      label={EscalaItemStatusEnumLabel[equipeItem.status]}
                      color={VoluntarioStatusChipParams[equipeItem.status].color}
                      backgroundColor={VoluntarioStatusChipParams[equipeItem.status].background}
                      size="small"
                    />
                  </FancyText>
                  {!viewMode ||
                    (viewMode === 'edit' && (
                      <View
                        style={[
                          styles.column4,
                          { borderWidth: 0, gap: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
                        ]}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: Pallete.terciary,
                            borderRadius: 100,
                            width: 22,
                            height: 22,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          onPress={() => onSubstituicaoButtonPressed?.(equipeItem)}
                        >
                          <DefaultIcons.Custom library="FontAwesome5" name="exchange-alt" size={12} color={Pallete.icons.light} />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
                {index < data.length - 1 && <FancySeparator />}
              </View>
            );
          })}
        </View>
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

const styles = StyleSheet.create({
  column1: { flex: 3, borderWidth: 0 },
  column2: { flex: 6, borderWidth: 0 },
  column3: { flex: 4, borderWidth: 0 },
  column4: { flex: 1.5, borderWidth: 0 },
  container: {},
  headerItem: {
    fontFamily: BOLD_FONT,
    fontSize: SMALL_SIZE_FONT,
  },
  valueItem: {
    fontFamily: SEMI_BOLD_FONT,
    fontSize: EXTRA_SMALL_SIZE_FONT,
    lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
    flexShrink: 1,
  },
  valuesContainer: { gap: 10 },
  rowContainer: { flexDirection: 'row', paddingHorizontal: 15, gap: 6 },
});
