import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import DadosTab from '../../../../../components/pages/pessoal/perfil/DadosTab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import MinisteriosTab from '../../../../../components/pages/pessoal/perfil/MinisteriosTab';
import { useState } from 'react';
import ChangePasswordModal from '../../../../../components/pages/pessoal/perfil/ChangePasswordModal';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { Pallete } from '../../../../../constants/colors';
import { router } from 'expo-router';
import DeleteAccountModal from '../../../../../components/pages/pessoal/perfil/DeleteAccountModal';

const TAB_DATA: TabItem[] = [
  { title: 'Dados', icon: { ...DefaultIconsNames.info, size: 16 }, content: <DadosTab /> },
  { title: 'Ministérios', icon: { library: 'Feather', name: 'grid', size: 14 }, content: <MinisteriosTab /> },
];

export default function PerfilIndexPage() {
  const [isChangePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TAB_DATA}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ flex: 1, paddingTop: 0, paddingHorizontal: 20 }}
      />
      <View style={styles.footer}>
        <View style={styles.buttonsContainer}>
          <FancyButton
            label="Editar Perfil"
            onPress={() => router.push('/pessoal/perfil/edit')}
            icon={{ ...DefaultIconsNames.edit, size: 18 }}
          />
          <FancyButton
            label="Alterar Senha"
            onPress={() => setChangePasswordModalVisible(true)}
            icon={{ library: 'Entypo', name: 'lock', size: 16 }}
          />
        </View>

        <View style={[styles.buttonsContainer, { marginTop: 12 }]}>
          <FancyButton
            icon={{ ...DefaultIconsNames.delete, size: 16 }}
            label="Excluir Conta"
            containerStyle={{ backgroundColor: Pallete.error }}
            onPress={() => setDeleteAccountModalVisible(true)}
          />
        </View>
      </View>
      {isChangePasswordModalVisible && (
        <ChangePasswordModal
          modalProps={{ visible: isChangePasswordModalVisible }}
          onClose={() => setChangePasswordModalVisible(false)}
          onConfirm={() => setChangePasswordModalVisible(false)}
        />
      )}
      {isDeleteAccountModalVisible && (
        <DeleteAccountModal
          modalProps={{ visible: isDeleteAccountModalVisible }}
          onClose={() => setDeleteAccountModalVisible(false)}
          onConfirm={() => setDeleteAccountModalVisible(false)}
        />
      )}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10 },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  buttonsContainer: {
    gap: 12,
  },
});
