import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import DadosTab from '../../../../../components/pages/pessoal/perfil/DadosTab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import MinisteriosTab from '../../../../../components/pages/pessoal/perfil/MinisteriosTab';
import { useState } from 'react';
import ChangePasswordModal from '../../../../../components/pages/pessoal/perfil/ChangePasswordModal';
import DeleteAccountModal from '../../../../../components/pages/pessoal/perfil/DeleteAccountModal';
import { ThemePalette } from '../../../../../constants/colors';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import FeedbackSheet from '../../../../../components/FeedbackSheet';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useFeedbackPrompt } from '../../../../../hooks/useFeedbackPrompt';

export default function PerfilIndexPage() {
  const styles = useThemedStyles(createStyles);
  const { igrejaAtiva } = useAuth();
  const [isChangePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const { selectedNota, onSelectNota, onSubmitFeedback, onDismiss } = useFeedbackPrompt(
    igrejaAtiva?.id || null,
  );

  const TAB_DATA: TabItem[] = [
    {
      title: 'Conta',
      icon: { ...DefaultIconsNames.info, size: 16 },
      content: (
        <DadosTab
          onChangePasswordButtonPress={() => setChangePasswordModalVisible(true)}
          onDeleteAccountButtonPress={() => setDeleteAccountModalVisible(true)}
          onFeedbackButtonPress={() => onSelectNota('RUIM')}
        />
      ),
    },
    {
      title: 'Ministérios',
      icon: { library: 'Feather', name: 'grid', size: 14 },
      content: <MinisteriosTab />,
    },
  ];

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs items={TAB_DATA} />
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
      <FeedbackSheet
        visible={!!selectedNota}
        nota={selectedNota}
        onSubmit={onSubmitFeedback}
        onDismiss={onDismiss}
      />
    </FancyPageView>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: { paddingTop: 0 },
    footer: {
      padding: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
      backgroundColor: palette.backgroundColor,
    },
    buttonsContainer: {
      gap: 12,
    },
  });
}
