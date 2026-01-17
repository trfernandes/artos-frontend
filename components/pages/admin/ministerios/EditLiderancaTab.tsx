import { View, StyleSheet } from 'react-native';
import FancyFab from '../../../buttons/FancyFab';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AddMinisterioFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import FancyList from '../../../list/FancyList';
import { Pallete } from '../../../../constants/colors';
import { VoluntarioHierarquiaEnumLabel } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { FancyActionButtons } from '../../../cards/Horizontal/FancyCardActionButtons';
import { useState } from 'react';
import AddLiderancaFormModal from './AddLiderancaFormModal';
import { AppImages } from '../../../../assets/app_images';

export default function AddLiderancaTab() {
  const mainForm = useFormContext<AddMinisterioFormData>();

  const lideresForm = useFieldArray({
    control: mainForm.control,
    name: 'voluntarios',
    keyName: 'fieldId',
  });

  const [formVisible, setFormVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <FancyList
        data={lideresForm.fields}
        keyExtractor={(item) => item.fieldId}
        renderItem={({ item }) => {
          const commonProps = {
            source: item.fotoThumbUrl || item.fotoUrl ? { uri: item.fotoThumbUrl || item.fotoUrl || '' } : AppImages.emptyProfile,
            title: item.voluntarioNome,
            subtitle: <FancyTextDisplayCard title='Função:' value={VoluntarioHierarquiaEnumLabel[item.hierarquia]} />,
            actionButtons: (
              <FancyActionButtons
                actions={[
                  {
                    icon: { library: 'MaterialIcons', name: 'edit', size: 18 },
                    onPress: () => {},
                  },
                  {
                    icon: {
                      library: 'MaterialIcons',
                      name: 'delete',
                      size: 18,
                      backgroundColor: Pallete.error,
                    },
                    onPress: () => {},
                  },
                ]}
              />
            ),
          };
          return <FancyCard.Image key={item.id} type={'image'} props={commonProps} />;
        }}
      />
      {formVisible && (
        <AddLiderancaFormModal
          onButton1Press={() => {
            setFormVisible(false);
          }}
          onButton2Press={() => {
            setFormVisible(false);
          }}
        />
      )}
      <FancyFab
        onPress={() => {
          setFormVisible(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerList: { height: '100%' },
  contentList: { gap: 10 },
});
