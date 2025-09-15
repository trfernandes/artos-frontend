import { StyleSheet, View } from 'react-native';
import FancyList from '../../../list/FancyList';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyFab from '../../../buttons/FancyFab';
import { useState } from 'react';
import { strfyObj } from '../../../../utils/text_utils';
import { MinisterioVoluntario } from '../../../../domain/models/MinisterioVoluntario';

export default function VoluntarioMinisterioTab(props: { ministerios: MinisterioVoluntario[] | null | undefined }) {
  const [modalFormProps, setModalFormProps] = useState<{ visible: boolean; mode?: 'add' | 'edit' }>({ visible: false });

  console.log('VoluntarioMinisterioTab', props.ministerios ? strfyObj(props.ministerios) : 'vazio');

  if (!props.ministerios) return null;

  return (
    <View style={styles.container}>
      {props.ministerios ? (
        <FancyList
          data={props.ministerios}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item, index }) => (
            <FancyCard.Image
              key={index}
              type="icon"
              props={{
                title: item.ministerio?.nome,
                cardIcon: { library: 'Feather', name: 'grid', size: 16 },
                isCollapsable: true,
              }}
            />
          )}
        />
      ) : null}
      <FancyFab onPress={() => setModalFormProps({ visible: true, mode: 'add' })} />
      {/* {modalFormProps.visible && (
        <FancyModalDialog
          title={`${modalFormProps.mode && modalFormProps.mode === 'add' ? 'Adicionar' : 'Editar'} Ministério`}
          centerContainerStyle={{ gap: 15 }}
          onConfirm={() => setModalFormProps({ visible: false })}
          onClose={() => setModalFormProps({ visible: false })}
        >
          <FancyDropDown
            label="Ministério"
            listItems={MINISTERIOS_DATA.map(item => ({ title: item.nome, value: '' }))}
          />
          <FancySettingItem
            label={'Data Início'}
            options={[]}
            rightComponent={<FancyDatePickerModal readonly={modalFormProps.mode === 'edit'} />}
            disabled={modalFormProps.mode === 'edit'}
          />
          <FancySettingItem label={'Data Término'} options={[]} rightComponent={<FancyDatePickerModal />} />
        </FancyModalDialog>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
});
