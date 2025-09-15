import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FancySettingItem from '../../../FancySettingItem';
import FancyButton from '../../../buttons/FancyButton';
import { Pallete } from '../../../../constants/colors';
import FancyText from '../../../FancyText';
import { DefaultIconsNames } from '../../../../constants/icons';
import EventosEscalaParametrizacao from './EventosEscalaParametrizacao';
import { useState } from 'react';
import EventosEscalaEquipe from './EventosEscalaEquipe';

export default function EventosEscalaForm() {
  const [paramsModalVisible, setParamsModalVisible] = useState(false);
  const [modalEquipeVisible, setModalEquipeVisible] = useState(false);
  return (
    <View style={styles.container}>
      <FancySettingItem
        label="Parametrização"
        value="Nenhuma"
        options={[]}
        rightComponent={
          <TouchableOpacity
            onPress={() => setParamsModalVisible(true)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 5,
            }}
          >
            <FancyText size="small" type="medium" style={{ borderWidth: 0 }}>
              Nenhuma
            </FancyText>
            <FancyButton
              mode="icon"
              type="text"
              size={25}
              icon={{ ...DefaultIconsNames['chevron-right'], color: Pallete.icons.inactive }}
              onPress={() => setParamsModalVisible(true)}
              containerStyle={{ borderWidth: 0, marginRight: -10 }}
              iconStyle={{ borderWidth: 0 }}
            />
          </TouchableOpacity>
        }
        icon={{ ...DefaultIconsNames.options, size: 18 }}
      >
        <View style={styles.settingsItemsContainer}>
          <View style={styles.settingItemData}>
            <FancyText size={'small'} type="semiBold">
              Template
            </FancyText>
            <FancyText size="small" type="medium" color={Pallete.icons.inactive}>
              Equipe Completa
            </FancyText>
          </View>
          <View style={styles.settingItemData}>
            <FancyText size={'small'} type="semiBold">
              Tipo
            </FancyText>
            <FancyText size="small" type="medium" color={Pallete.icons.inactive}>
              Funções
            </FancyText>
          </View>

          <View style={styles.settingItemData}>
            <FancyText size={'small'} type="semiBold">
              Tamanho da Equipe
            </FancyText>
            <FancyText size="small" type="medium" color={Pallete.icons.inactive}>
              11 Voluntários
            </FancyText>
          </View>
        </View>
      </FancySettingItem>
      <FancySettingItem
        label="Equipe"
        options={[]}
        icon={{ ...DefaultIconsNames.group, size: 18 }}
        rightComponent={
          <TouchableOpacity
            onPress={() => setModalEquipeVisible(true)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 5,
            }}
          >
            <FancyText size="small" type="medium" style={{ borderWidth: 0 }}>
              Não Gerado
            </FancyText>
            <FancyButton
              mode="icon"
              type="text"
              size={25}
              icon={{ ...DefaultIconsNames['chevron-right'], color: Pallete.icons.inactive }}
              onPress={() => setParamsModalVisible(true)}
              containerStyle={{ borderWidth: 0, marginRight: -10 }}
              iconStyle={{ borderWidth: 0 }}
            />
          </TouchableOpacity>
        }
      />
      {paramsModalVisible && (
        <EventosEscalaParametrizacao
          modalProps={{ visible: paramsModalVisible }}
          onClose={() => setParamsModalVisible(false)}
          onConfirm={() => {
            setParamsModalVisible(false);
          }}
        />
      )}
      {modalEquipeVisible && <EventosEscalaEquipe modalProps={{ visible: modalEquipeVisible }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  buttonsContainer: { flexDirection: 'row', gap: 10 },
  settingsItemsContainer: { gap: 12, paddingBottom: 10 },
  settingItemData: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
});
