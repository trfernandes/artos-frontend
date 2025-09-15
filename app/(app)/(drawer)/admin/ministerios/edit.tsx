import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { MinisterioFormData, ministerioSchema } from './add';
import { router, useLocalSearchParams } from 'expo-router';
import DadosTab from '../../../../../components/pages/admin/ministerios/DadosTab';
import LiderancaTab, { baseLiderSchema } from '../../../../../components/pages/admin/ministerios/LiderancaTab';
import { useEffect, useState } from 'react';
import { strfyObj } from '../../../../../utils/text_utils';
import { MinisterioStatusEnumMap, MinisterioTipoEnumMap } from '../../../../../domain/models/Ministerio';
import { MinisterioVoluntario } from '../../../../../domain/models/MinisterioVoluntario';
import FancyLoading from '../../../../../components/FancyLoading';
import z from 'zod';
import { useMinisterioVoluntarios } from '../../../../../hooks/useMinisterioVoluntarios';
import { useMinisterios } from '../../../../../hooks/useMinisterios';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';

export const editLiderSchema = baseLiderSchema.extend({
  voluntarioId: z.uuidv4().optional(),
});

export default function MinisteriosEditPage() {
  const {
    data: ministeriosData,
    setSearchParams,
    isLoading: loadingMinisterio,
    update: updateMinisterio,
  } = useMinisterios();

  const {
    add: addVoluntario,
    update: updateVoluntario,
    remove: removeVoluntario,
    isLoading: loadingVoluntarios,
  } = useMinisterioVoluntarios();

  const params = useLocalSearchParams<{ id: string }>();
  const [tabIndex, setTabIndex] = useState(0);

  const form = useForm<MinisterioFormData>({
    resolver: zodResolver(ministerioSchema),
  });

  useEffect(() => {
    if (params.id) {
      setSearchParams({
        where: {
          conditions: [{ path: 'id', operator: Operator.EQUALS, value: { type: ValueType.LITERAL, value: params.id } }],
        },
        relations: ['voluntarios', 'voluntarios.voluntario'],
      });
    }
  }, []);

  useEffect(() => {
    if (ministeriosData && ministeriosData.length > 0) {
      form.setValue('id', ministeriosData[0]?.id!);
      form.setValue('nome', ministeriosData[0]?.nome!);
      form.setValue('descricao', ministeriosData[0]?.descricao!);
      form.setValue('logo', ministeriosData[0]?.logo || '');
      form.setValue('uploadLogo', ministeriosData[0]?.logo || '');
      form.setValue('tipo', MinisterioTipoEnumMap[ministeriosData[0]?.tipo!]);
      if (ministeriosData[0]?.voluntarios && ministeriosData[0]?.voluntarios.length > 0) {
        const formVoluntarios = (ministeriosData[0]?.voluntarios ?? [])
          .filter(voluntario => voluntario.voluntario && typeof voluntario.voluntario.id === 'string')
          .map(voluntario => ({
            id: voluntario.id,
            voluntarioId: voluntario.voluntario?.id || voluntario.voluntarioId,
            voluntarioNome: voluntario.voluntario?.nome!,
            hierarquia: voluntario.hierarquia,
            foto: voluntario.voluntario?.foto,
          }));
        form.setValue('voluntarios', formVoluntarios);
      }
      form.setValue('status', MinisterioStatusEnumMap[ministeriosData[0]?.status!]);
    }
  }, [ministeriosData]);

  const tabsConfig: TabItem[] = [
    {
      title: 'Dados',
      icon: {
        library: DefaultIconsNames.info.library,
        name: DefaultIconsNames.info.name,
        size: 16,
      },
      content: <DadosTab mode={'edit'} id={params.id} />,
    },
    {
      title: 'Liderança',
      icon: { library: 'Octicons', name: 'id-badge', size: 14 },
      content: (
        <LiderancaTab
          validationSchema={editLiderSchema}
          options={{ mode: 'edit', id: params.id }}
          onAddLider={data => {
            addVoluntario({ hierarquia: data.hierarquia, voluntarioId: data.voluntarioId, ministerioId: params?.id! });
          }}
          onEditLider={data => {
            updateVoluntario({
              id: data.id!,
              data: { hierarquia: data.hierarquia, voluntarioId: data.voluntarioId, ministerioId: params?.id! },
            });
          }}
          onDeleteLider={id => {
            removeVoluntario(id);
          }}
        />
      ),
    },
    // {
    //   title: 'Permissões',
    //   icon: { library: 'MaterialCommunityIcons', name: 'security', size: 14 },
    //   content: <PermissoesTab />,
    // },
  ];

  const handleSubmit = () => {
    form.handleSubmit(
      data => {
        console.log('HandleSubmit --- Data', strfyObj(data));
        updateMinisterio({
          id: params.id,
          data: {
            ...data,
            descricao: data.descricao === null ? undefined : data.descricao,
            logo: data.logo === null ? undefined : data.logo,
            voluntarios: data.voluntarios.map(
              voluntario =>
                ({
                  id: voluntario.id,
                  voluntario: { id: voluntario.voluntarioId },
                  hierarquia: voluntario.hierarquia,
                } as MinisterioVoluntario)
            ),
          },
        });
        form.reset();
        router.back();
      },
      errors => console.log('HandleSubmit Errors', strfyObj(errors))
    )();
  };

  if (loadingMinisterio || loadingVoluntarios) {
    return <FancyLoading label="Processando..." />;
  }

  return (
    <FancyPageView style={styles.container}>
      <FormProvider {...form}>
        <FancyTabs
          onTabChange={setTabIndex}
          items={tabsConfig}
          containerStyle={styles.tabsContainer}
          contentContainerStyle={styles.tabContent}
        />
      </FormProvider>
      {tabIndex === 0 && (
        <View style={styles.buttonsContainer}>
          <FancyButton
            label="Salvar"
            type="contained"
            icon={{
              library: DefaultIconsNames.save.library,
              name: DefaultIconsNames.save.name,
              size: 16,
            }}
            onPress={handleSubmit}
          />
        </View>
      )}
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, gap: 30 },
  tabsContainer: { flex: 1, gap: 15 },
  tabContent: { flex: 1, paddingHorizontal: 20, paddingTop: 5 },
  buttonsContainer: { flexDirection: 'column', gap: 10, paddingHorizontal: 25 },
});
