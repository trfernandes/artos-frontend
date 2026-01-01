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
import { useEffect, useMemo, useCallback, useState } from 'react';
import { strfyObj } from '../../../../../utils/text_utils';
import { MinisterioStatusEnumMap, MinisterioTipoEnumMap } from '../../../../../domain/models/Ministerio';
import {
  HierarquiaEnum,
  MinisterioVoluntarioModel,
  MinisterioVoluntarioStatusEnum,
} from '../../../../../domain/models/MinisterioVoluntario';
import { ImageUtils } from '../../../../../utils/image_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import z from 'zod';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useAuth, UserMinisterio } from '../../../../../contexts/AuthContext';

export const editLiderSchema = baseLiderSchema.extend({
  voluntarioId: z.uuidv4().optional(),
});

export default function MinisteriosEditPage() {
  const params = useLocalSearchParams<{ id: string }>();

  const ministerioSearchParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: params.id },
          },
        ],
      },
      relations: ['voluntarios', 'voluntarios.voluntario'],
    }),
    [params.id]
  );

  const {
    data: ministeriosData,
    isLoading: loadingMinisterio,
    update: updateMinisterio,
  } = useMinisteriosCrud({ initialParams: ministerioSearchParams });

  const {
    add: addVoluntario,
    update: updateVoluntario,
    remove: removeVoluntario,
    isLoading: loadingVoluntarios,
  } = useMinisterioVoluntariosCrud({ autoFetch: false });

  const { user, updateUser } = useAuth();

  const [tabIndex, setTabIndex] = useState(0);

  const form = useForm<MinisterioFormData>({
    resolver: zodResolver(ministerioSchema),
  });

  // ✅ Usa reset em vez de vários setValue
  useEffect(() => {
    if (!ministeriosData?.[0]) return;
    const m = ministeriosData[0];

    form.reset({
      id: m.id!,
      nome: m.nome!,
      descricao: m.descricao ?? '',
      logo: m.logo ? ImageUtils.rawToDataUri(m.logo) ?? m.logo : '',
      uploadLogo: m.logo ?? '',
      tipo: MinisterioTipoEnumMap[m.tipo!],
      status: MinisterioStatusEnumMap[m.status!],
      voluntarios: (m.voluntarios ?? [])
        .filter(v => v.voluntario && typeof v.voluntario.id === 'string')
        .map(v => ({
          ...v,
          foto: v.voluntario?.foto ? ImageUtils.rawToDataUri(v.voluntario?.foto) ?? v.voluntario?.foto : undefined,
        })),
    });
  }, [ministeriosData, form]);

  if (loadingMinisterio || loadingVoluntarios) {
    return <FancyLoading label="Processando..." />;
  }

  // ✅ Handlers estáveis
  const handleAddLider = useCallback(
    (data: { hierarquia: HierarquiaEnum; voluntarioId: string }) => {
      addVoluntario({
        voluntario: { id: data.voluntarioId },
        hierarquia: data.hierarquia,
        ministerio: { id: params.id! },
        status: MinisterioVoluntarioStatusEnum.Ativo,
        dataInicio: new Date(),
      });
    },
    [addVoluntario, params.id]
  );

  const handleEditLider = useCallback(
    (data: any) => {
      updateVoluntario({
        id: data.id!,
        data: {
          hierarquia: data.hierarquia,
          voluntario: { id: data.voluntarioId },
          ministerio: { id: params.id! },
        },
      });
    },
    [updateVoluntario, params.id]
  );

  const handleDeleteLider = useCallback(
    (id: string) => {
      removeVoluntario(id);
    },
    [removeVoluntario]
  );

  // ✅ Tabs memoizadas corretamente
  const tabsConfig: TabItem[] = useMemo(
    () => [
      {
        title: 'Dados',
        icon: {
          library: DefaultIconsNames.info.library,
          name: DefaultIconsNames.info.name,
          size: 16,
        },
        content: <DadosTab mode="edit" id={params.id} />,
      },
      {
        title: 'Liderança',
        icon: { library: 'Octicons', name: 'id-badge', size: 14 },
        content: (
          <LiderancaTab
            validationSchema={editLiderSchema}
            options={{ mode: 'edit', id: params.id }}
            onAddLider={handleAddLider}
            onEditLider={handleEditLider}
            onDeleteLider={handleDeleteLider}
          />
        ),
      },
    ],
    [params.id, handleAddLider, handleEditLider, handleDeleteLider]
  );

  // ✅ Submit estável
  const handleSubmit = useCallback(() => {
    form.handleSubmit(
      async data => {
        const editedMinisterio = await updateMinisterio({
          id: params.id,
          data: {
            ...data,
            descricao: data.descricao === null ? undefined : data.descricao,
            logo: data.logo === null ? undefined : data.logo,
            voluntarios: data.voluntarios.map(
              v =>
                ({
                  id: v.id,
                  voluntario: { id: v.voluntarioId },
                  hierarquia: v.hierarquia,
                } as MinisterioVoluntarioModel)
            ),
          },
        });

        const ministeriosExistentes = user?.ministerios || [];

        const novoMinisterio: UserMinisterio = {
          id: editedMinisterio.id!,
          nome: editedMinisterio.nome,
          logo: editedMinisterio.logo,
          tipo: editedMinisterio.tipo,
          hierarquia: editedMinisterio.voluntarios?.find(v => v.voluntario?.id === user?.id)?.hierarquia,
        };

        // Atualiza se já existe, senão adiciona
        const ministeriosAtualizados = [...ministeriosExistentes.filter(m => m.id !== novoMinisterio.id), novoMinisterio];

        updateUser({ ...user, ministerios: ministeriosAtualizados });

        form.reset();
        router.back();
      },
      errors => console.log('HandleSubmit Errors', strfyObj(errors))
    )();
  }, [form, params.id, updateMinisterio, user, updateUser]);

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
