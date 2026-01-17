import { View, StyleSheet } from 'react-native';
import FancyFab from '../../../buttons/FancyFab';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AddLiderFormData, AddMinisterioFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import FancyList from '../../../list/FancyList';
import { Pallete } from '../../../../constants/colors';
import { VoluntarioHierarquiaEnumLabel } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { FancyTextDisplayCard } from '../../../cards/FancyTextDisplayCard';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { FancyActionButtons } from '../../../cards/Horizontal/FancyCardActionButtons';
import { useCallback, useMemo, useState } from 'react';
import AddLiderancaFormModal from './AddLiderancaFormModal';
import EditLiderancaFormModal from './EditLiderancaFormModal';
import { AppImages } from '../../../../assets/app_images';

export default function LiderancaTab() {
  const mainForm = useFormContext<AddMinisterioFormData>();

  const lideresForm = useFieldArray({
    control: mainForm.control,
    name: 'voluntarios',
    keyName: 'fieldId',
  });

  const [AddFormVisible, setAddFormVisible] = useState(false);
  const [EditFormVisible, setEditFormVisible] = useState(false);
  const [EditFormData, setEditFormData] = useState<AddLiderFormData | null>(null);

  const handleAddFormSubmit = useCallback(
    (formData: AddLiderFormData) => {
      lideresForm.append(formData);
    },
    [lideresForm.append],
  );

  const handleEditFormSubmit = useCallback(
    (formData: AddLiderFormData) => {
      const index = lideresForm.fields.findIndex((f) => f.voluntarioId === formData.voluntarioId);
      if (index !== -1) {
        lideresForm.update(index, formData);
      }
    },
    [lideresForm.fields, lideresForm.update],
  );

  const lideresSorted = useMemo(() => [...lideresForm.fields].sort((a, b) => a.voluntarioNome.localeCompare(b.voluntarioNome)), [lideresForm.fields]);

  return (
    <View style={{ flex: 1 }}>
      <FancyList
        data={lideresSorted}
        keyExtractor={(item) => item.fieldId}
        renderItem={({ item }) => {
          const commonProps = {
            source: item.fotoUrl || item.fotoThumbUrl ? { uri: item.fotoUrl || item.fotoThumbUrl || '' } : AppImages.emptyProfile,
            title: item.voluntarioNome,
            subtitle: <FancyTextDisplayCard title='Função:' value={VoluntarioHierarquiaEnumLabel[item.hierarquia]} />,
            actionButtons: (
              <FancyActionButtons
                actions={[
                  {
                    icon: { library: 'MaterialIcons', name: 'edit', size: 18 },
                    onPress: () => {
                      setEditFormData(item);
                      setEditFormVisible(true);
                    },
                  },
                  {
                    icon: {
                      library: 'MaterialIcons',
                      name: 'delete',
                      size: 18,
                      backgroundColor: Pallete.error,
                    },
                    onPress: () => {
                      lideresForm.remove(lideresForm.fields.findIndex((f) => f.fieldId === item.fieldId));
                    },
                  },
                ]}
              />
            ),
          };
          return <FancyCard.Image key={item.id} type={'image'} props={commonProps} />;
        }}
      />
      {AddFormVisible && (
        <AddLiderancaFormModal
          onButton1Press={() => {
            setAddFormVisible(false);
          }}
          onButton2Press={(data?: AddLiderFormData) => {
            data && handleAddFormSubmit(data);
            setAddFormVisible(false);
          }}
        />
      )}
      {EditFormVisible && (
        <EditLiderancaFormModal
          data={EditFormData!}
          onButton1Press={() => {
            setEditFormVisible(false);
          }}
          onButton2Press={(data?: AddLiderFormData) => {
            data && handleEditFormSubmit(data);
            setEditFormVisible(false);
          }}
        />
      )}
      <FancyFab
        onPress={() => {
          setAddFormVisible(true);
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
