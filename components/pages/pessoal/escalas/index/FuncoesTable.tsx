import { View, StyleSheet } from 'react-native';
import { Pallete } from '../../../../../constants/colors';
import {
  EscalaItem,
  EscalaItemStatusEnum,
  EscalaItemStatusEnumLabel,
} from '../../../../../domain/models/EscalaItem';
import FancyChips from '../../../../FancyChips';
import { IconLibrary } from '../../../../FancyIcons';
import FancySeparator from '../../../../FancySeparator';
import FancyText from '../../../../FancyText';
import FancyVerticalSpacer from '../../../../FancyVerticalSpacer';
import { VoluntarioStatusChipParams } from '../../../ministerios/escalas/details/ListaVoluntariosTable';
import { BOLD_FONT, SMALL_SIZE_FONT, SEMI_BOLD_FONT, MEDIUM_SIZE_FONT } from '../../../../../constants/font';
import FancyButton from '../../../../buttons/FancyButton';

export default function FuncoesTable({
  data,
  onConfirmButtonPress,
  onSubButtonPress,
}: {
  data: EscalaItem[];
  onConfirmButtonPress?: (dadosEscala: EscalaItem) => void;
  onSubButtonPress?: (dadosEscala: EscalaItem) => void;
}) {
  return (
    <View>
      <View style={styles.rowContainer}>
        <FancyText style={[styles.headerItem, styles.column1]}>Função</FancyText>
        <FancyText style={[styles.headerItem, styles.column2]}>Status</FancyText>
        <FancyText style={[styles.headerItem, styles.column3, { textAlign: 'center' }]}>Ações</FancyText>
      </View>
      <FancyVerticalSpacer height={7} />
      <FancySeparator />
      <FancyVerticalSpacer height={9} />
      <View style={styles.valuesContainer}>
        {data?.map((equipeItem, index) => {
          return (
            <View style={{ gap: 10, borderWidth: 0, alignItems: 'center' }} key={index}>
              <View style={styles.rowContainer}>
                <View style={[styles.column1, { justifyContent: 'center' }]}>
                  <FancyText style={[styles.valueItem]} ellipsizeMode="tail" numberOfLines={2}>
                    {equipeItem.funcao.nome}
                  </FancyText>
                </View>
                <View style={[styles.column2, { justifyContent: 'center' }]}>
                  <FancyChips
                    label={EscalaItemStatusEnumLabel[equipeItem.status]}
                    color={VoluntarioStatusChipParams[equipeItem.status].color}
                    backgroundColor={VoluntarioStatusChipParams[equipeItem.status].background}
                    size="medium"
                    style={{ alignItems: 'center' }}
                  />
                </View>
                <View
                  style={[
                    styles.column3,
                    {
                      borderWidth: 0,
                      gap: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    },
                  ]}
                >
                  <FancyButton
                    mode="icon"
                    size={24}
                    disabled={equipeItem.status !== EscalaItemStatusEnum.Pendente}
                    icon={{
                      library: 'MaterialCommunityIcons' as IconLibrary,
                      name: 'check-bold',
                      size: 15,
                      color:
                        equipeItem.status !== EscalaItemStatusEnum.Pendente ? Pallete.icons.inactive : Pallete.icons.light,
                    }}
                    containerStyle={{
                      backgroundColor:
                        equipeItem.status === EscalaItemStatusEnum.Pendente ? Pallete.confirm : Pallete.icons.inactive2,
                      aspectRatio: 1,
                      borderWidth: 0,
                      marginVertical: 1,
                    }}
                    onPress={() => onConfirmButtonPress?.(equipeItem)}
                  />
                  <FancyButton
                    mode="icon"
                    size={24}
                    disabled={equipeItem.status !== EscalaItemStatusEnum.Pendente}
                    icon={{
                      library: 'FontAwesome6' as IconLibrary,
                      name: 'repeat',
                      size: 12,
                      color:
                        equipeItem.status !== EscalaItemStatusEnum.Pendente ? Pallete.icons.inactive : Pallete.icons.light,
                    }}
                    containerStyle={{
                      backgroundColor:
                        equipeItem.status === EscalaItemStatusEnum.Pendente ? Pallete.terciary : Pallete.icons.inactive2,
                      aspectRatio: 1,
                    }}
                    onPress={() => onSubButtonPress?.(equipeItem)}
                  />
                </View>
              </View>
              {index < data.length - 1 && <FancySeparator />}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column1: { flex: 3, borderWidth: 0 },
  column2: { flex: 3, borderWidth: 0 },
  column3: { flex: 1.5, borderWidth: 0 },
  headerItem: {
    fontFamily: BOLD_FONT,
    fontSize: SMALL_SIZE_FONT,
  },
  valueItem: {
    fontFamily: SEMI_BOLD_FONT,
    fontSize: SMALL_SIZE_FONT,
    lineHeight: MEDIUM_SIZE_FONT + 2,
    flexShrink: 1,
  },
  valuesContainer: { gap: 10 },
  rowContainer: { flexDirection: 'row', paddingHorizontal: 15, gap: 6 },
});
