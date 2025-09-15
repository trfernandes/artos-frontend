import { View, StyleSheet } from 'react-native';
import FancyScrollView from '../../../../FancyScrollView';
import FancyTextArea from '../../../../fields/FancyTextArea';
import FancyTextInput from '../../../../fields/FancyTextInput';
import EventoDatesInput from '../../../admin/eventos/EventoDatesInput';
import EventoRepeticaoInput from '../../../admin/eventos/EventoRepeticaoInput';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyButton from '../../../../buttons/FancyButton';
import SubstituicaoModal from './SubstituicaoModal';
import { useState } from 'react';

export default function EscalaEventoInformationTab() {
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);

  return (
    <View style={{ flex: 1, borderWidth: 0 }}>
      <FancyScrollView contentContainerStyle={styles.fields}>
        <FancyTextInput label="Nome" disabled />
        <EventoDatesInput disabled />
        <EventoRepeticaoInput disabled />
        <FancyTextInput label="Local" disabled />
        <FancyTextArea label="Descrição" disabled />
        <View style={{ paddingTop: 10, gap: 10, flex: 1 }}>
          <FancyButton
            label="Solicitar Substituição"
            icon={{ ...DefaultIconsNames.refresh, size: 14 }}
            onPress={() => {
              setShowSubstituteModal(true);
            }}
          />
          {/* <FancyButton
            label="Cancelar Solicitação de Substituição"
            icon={{ ...DefaultIconsNames.cancel, size: 20 }}
            containerStyle={{ backgroundColor: Pallete.error }}
          /> */}
        </View>
      </FancyScrollView>
      {showSubstituteModal && (
        <SubstituicaoModal
          modalProps={{ visible: showSubstituteModal }}
          onClose={() => setShowSubstituteModal(false)}
          onConfirm={() => setShowSubstituteModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 15,
  },
});
