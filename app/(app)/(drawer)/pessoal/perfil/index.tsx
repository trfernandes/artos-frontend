import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import DadosTab from '../../../../../components/pages/pessoal/perfil/DadosTab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import MinisteriosTab from '../../../../../components/pages/pessoal/perfil/MinisteriosTab';
import { useState } from 'react';
import ChangePasswordModal from '../../../../../components/pages/pessoal/perfil/ChangePasswordModal';
import DeleteAccountModal from '../../../../../components/pages/pessoal/perfil/DeleteAccountModal';

export default function PerfilIndexPage() {
  const [isChangePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const TAB_DATA: TabItem[] = [
    {
      title: 'Conta',
      icon: { ...DefaultIconsNames.info, size: 16 },
      content: (
        <DadosTab
          onChangePasswordButtonPress={() => setChangePasswordModalVisible(true)}
          onDeleteAccountButtonPress={() => setDeleteAccountModalVisible(true)}
        />
      ),
    },
    { title: 'Ministérios', icon: { library: 'Feather', name: 'grid', size: 14 }, content: <MinisteriosTab /> },
  ];

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TAB_DATA}
        containerStyle={{ flex: 1 }}
        headerStyle={{ paddingHorizontal: 20 }}
        contentContainerStyle={{ flex: 1, paddingTop: 0, paddingHorizontal: 20 }}
      />
      {isChangePasswordModalVisible && (
        <ChangePasswordModal
          modalProps={{ visible: isChangePasswordModalVisible }}
          onButton1Press={() => setChangePasswordModalVisible(false)}
          onButton2Press={() => setChangePasswordModalVisible(false)}
        />
      )}
      {isDeleteAccountModalVisible && (
        <DeleteAccountModal
          modalProps={{ visible: isDeleteAccountModalVisible }}
          onButton1Press={() => setDeleteAccountModalVisible(false)}
          onButton2Press={() => setDeleteAccountModalVisible(false)}
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
