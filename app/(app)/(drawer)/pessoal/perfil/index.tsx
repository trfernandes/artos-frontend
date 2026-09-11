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

export default function PerfilIndexPage() {
  const styles = useThemedStyles(createStyles);
  const { igrejaAtiva } = useAuth();
  const [isChangePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [isFeedbackSheetVisible, setFeedbackSheetVisible] = useState(false);

  const TAB_DATA: TabItem[] = [
    {
      title: 'Conta',
      icon: { ...DefaultIconsNames.info, size: 16 },
      content: (
        <DadosTab
          onChangePasswordButtonPress={() => setChangePasswordModalVisible(true)}
          onDeleteAccountButtonPress={() => setDeleteAccountModalVisible(true)}
          onFeedbackButtonPress={() => setFeedbackSheetVisible(true)}
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
        visible={isFeedbackSheetVisible}
        nota={null}
        onSubmit={async (texto) => {
          try {
            const feedbacksApi = (await import('../../../../../domain/api/FeedbacksApi')).feedbacksApi;
            await feedbacksApi.createFeedback({ nota: 'BOM', texto }, igrejaAtiva?.id || '');
          } catch (error) {
            console.error('Error submitting feedback:', error);
          }
        }}
        onDismiss={() => setFeedbackSheetVisible(false)}
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
