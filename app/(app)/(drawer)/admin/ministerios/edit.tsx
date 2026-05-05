import { InteractionManager, StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../../components/tabs/FancyTabs';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import DadosTab from '../../../../../components/pages/admin/ministerios/DadosTab';
import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { strfyObj } from '../../../../../utils/text_utils';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useAuth } from '../../../../../contexts/AuthContext';
import { MinisterioStatusEnumMap } from '../../../../../domain/enums/Ministerio/ministerio-status.enum';
import { MinisterioTipoEnumMap } from '../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import VoluntarioTab from '../../../../../components/pages/admin/ministerios/VoluntarioTab';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { sendImageToServer } from '../../../../../utils/image_utils';
import { UpdateMinisterioDto } from '../../../../../domain/dtos/Ministerio/ministerio.update';
import { EditMinisterioFormData, EditMinisterioSchema } from '../../../../../domain/schemas/ministerioAdminSchema';

export default function MinisteriosEditPage() {
  const params = useLocalSearchParams<{ id: string }>();

  const { showLoading, hideLoading } = useLoading();

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
    }),
    [params.id],
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
  } = useMinisterioVoluntariosCrud({ autoFetch: false });

  const { user, updateUser, igrejaAtiva } = useAuth();

  const [tabIndex, setTabIndex] = useState(0);

  const form = useForm<EditMinisterioFormData>({
    resolver: zodResolver(EditMinisterioSchema),
  });

  useEffect(() => {
    if (!ministeriosData?.[0]) return;
    const m = ministeriosData[0];

    form.reset({
      id: m.id!,
      nome: m.nome!,
      descricao: m.descricao ?? '',
      logoUrl: m.logoUrl ?? null,
      logoThumbUrl: m.logoThumbUrl ?? null,
      uploadLogo: m.logoThumbUrl || m.logoUrl || '',
      tipo: MinisterioTipoEnumMap[m.tipo!],
      status: MinisterioStatusEnumMap[m.status!],
    });
  }, [ministeriosData, form]);

  const handleAddLider = useCallback(
    (data: { hierarquia: VoluntarioHierarquiaEnum; ministerioId: string; voluntarioId: string }) => {
      addVoluntario?.({
        voluntarioId: data.voluntarioId,
        hierarquia: data.hierarquia,
        ministerioId: data.ministerioId,
      });
    },
    [addVoluntario, params.id],
  );

  const handleEditLider = useCallback(
    (data: any) => {
      updateVoluntario?.({
        id: data.id!,
        data: {
          hierarquia: data.hierarquia,
          voluntarioId: data.voluntarioId,
          ministerioId: data.ministerioId,
        },
      });
    },
    [updateVoluntario, params.id],
  );

  const handleDeleteLider = useCallback(
    (id: string) => {
      removeVoluntario?.(id);
    },
    [removeVoluntario],
  );

  const tabsConfig: TabItem[] = useMemo(
    () => [
      {
        title: 'Dados',
        icon: {
          library: DefaultIconsNames.info.library,
          name: DefaultIconsNames.info.name,
          size: 16,
        },
        content: <DadosTab mode='edit' id={params.id} />,
      },
      {
        title: 'Voluntários',
        icon: { library: 'Octicons', name: 'people', size: 14 },
        content: <VoluntarioTab ministerioId={params.id} />,
      },
    ],
    [params.id, handleAddLider, handleEditLider, handleDeleteLider],
  );

  const handleSubmit = useCallback(() => {
    form.handleSubmit(
      async (data) => {
        showLoading('Salvando...');

        try {
          const updateData: UpdateMinisterioDto = {
            igrejaId: igrejaAtiva!.id,
            nome: data.nome,
            descricao: data.descricao === null ? undefined : data.descricao,
            tipo: data.tipo,
            status: data.status,
            logoUrl: null,
            logoThumbUrl: null,
          };

          //Enviar logo para o servidor e guardar as URLs retornadas
          if (data.logoUpload?.uri) {
            const { imageThumbUrl, imageUrl } = await sendImageToServer('ministerios', data.logoUpload);

            updateData.logoUrl = imageUrl;
            updateData.logoThumbUrl = imageThumbUrl;

            form.setValue('logoUrl', imageUrl);
            form.setValue('logoThumbUrl', imageThumbUrl);
            form.setValue('logoUpload', null);
          }

          const editedMinisterio = await updateMinisterio?.({
            id: params.id,
            data: updateData,
          });

          if (!editedMinisterio) {
            return;
          }

          //Atualizar informações do ministério no usuário logado
          // Atualiza o ministério editado na igreja ativa do usuário logado
          if (igrejaAtiva) {
            const hierarquia = editedMinisterio.voluntarios?.find((v) => v.voluntario?.id === user?.user.id)?.hierarquia ?? VoluntarioHierarquiaEnum.Voluntario;
            const novoMinisterio = {
              id: editedMinisterio.id!,
              nome: editedMinisterio.nome,
              logoThumbUrl: editedMinisterio.logoThumbUrl,
              logoUrl: editedMinisterio.logoUrl,
              tipo: editedMinisterio.tipo,
              hierarquia,
            };
            const novaIgreja = {
              ...igrejaAtiva,
              ministerios: [
                ...igrejaAtiva.ministerios.filter((m) => m.id !== novoMinisterio.id),
                novoMinisterio,
              ],
            };
            const novasIgrejas = (user?.igrejas || []).map((ig) =>
              ig.id === igrejaAtiva.id ? novaIgreja : ig
            );
            updateUser({ ...user, igrejas: novasIgrejas });
          }

          form.reset();
          router.back();
        } finally {
          hideLoading();
        }
      },
      (errors) => console.log('HandleSubmit Errors', strfyObj(errors)),
    )();
  }, [form, params.id, updateMinisterio, user, updateUser]);

  const didHideRef = useRef(false);
  const ready = useMemo(() => !loadingMinisterio, [loadingMinisterio]);

  useEffect(() => {
    if (!ready) return;
    if (didHideRef.current) return;

    const task = InteractionManager.runAfterInteractions(() => {
      hideLoading();
      didHideRef.current = true;
    });

    return () => task.cancel();
  }, [ready, hideLoading]);

  if (loadingMinisterio) return <FancyPageView />;

  return (
    <FancyPageView style={styles.container}>
      <FormProvider {...form}>
        <FancyTabs
          onTabChange={setTabIndex}
          items={tabsConfig}
          headerStyle={{ paddingHorizontal: 15 }}
          containerStyle={styles.tabsContainer}
          contentContainerStyle={styles.tabContent}          
        />
      </FormProvider>

      {tabIndex === 0 && (
        <View style={styles.buttonsContainer}>
          <FancyButton
            label='Salvar'
            type='contained'
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
  container: { gap: 30 },
  tabsContainer: { flex: 1, gap: 15 },
  tabContent: { flex: 1, paddingHorizontal: 20, paddingTop: 5 },
  buttonsContainer: { flexDirection: 'column', gap: 10, paddingHorizontal: 15 },
});
