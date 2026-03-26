import { View, StyleSheet } from 'react-native';
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
import FancyFab from '../../../buttons/FancyFab';
import FancyText from '../../../FancyText';
import FancyButton from '../../../buttons/FancyButton';
import DefaultIcons from '../../../FancyIcons';
import { usePallete } from '../../../../hooks/usePallete';

export default function LiderancaTab() {
  const palette = usePallete();
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

  const isEmpty = lideresSorted.length === 0;

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name='group-add'
            size={60}
            color={palette.fonts.inactive2}
          />
          <View style={styles.emptyTextContainer}>
            <FancyText type='bold' size='largeMedium' style={[styles.emptyTitle, { color: palette.fonts.dark }]}>
              Adicione ao menos um líder
            </FancyText>
            <FancyText size='small' style={[styles.emptySubtitle, { color: palette.fonts.inactive2 }]}>
              Líderes são responsáveis pela gestão e organização do ministério. Todo ministério precisa ter pelo menos um líder cadastrado.
            </FancyText>
          </View>
          <FancyButton
            label='Adicionar Líder'
            icon={{ library: 'MaterialIcons', name: 'add', size: 18 }}
            onPress={() => setAddFormVisible(true)}
            containerStyle={styles.button}
          />
        </View>
      ) : (
        <>
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
          <FancyFab
            onPress={() => {
              setAddFormVisible(true);
            }}
          />
        </>
      )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 24,
  },
  emptyTextContainer: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  button: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
});
