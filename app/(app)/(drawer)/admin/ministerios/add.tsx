import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyStepsHeader from '../../../../../components/steps/FancyStepsHeader';
import { useState } from 'react';
import FancyStepsNavigation from '../../../../../components/steps/FancyStepsNavigation';
import { FancyStepsConfig } from '../../../../../components/steps/FancyStepsConfig';
import { Pallete } from '../../../../../constants/colors';
import DadosTab from '../../../../../components/pages/admin/ministerios/DadosTab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { strfyObj } from '../../../../../utils/text_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { router } from 'expo-router';
import { useMinisteriosCrud as useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import { MinisterioStatusEnum } from '../../../../../domain/enums/Ministerio/ministerio-status.enum';
import { ResponseMinisterioDto } from '../../../../../domain/dtos/Ministerio/ministerio.response';
import LiderancaTab from '../../../../../components/pages/admin/ministerios/LiderancaTab';
import { AddMinisterioFormData, AddMinisterioSchema } from '../../../../../domain/schemas/ministerioAdminSchema';
import { sendImageToServer } from '../../../../../utils/image_utils';
import { CreateMinisterioDto } from '../../../../../domain/dtos/Ministerio/ministerio.create';
import { useLoading } from '../../../../../contexts/LoadingContext';

export default function MinisteriosAddPage() {
  const [stepIndex, setStepIndex] = useState(0);

  const { showLoading, hideLoading } = useLoading();

  const form = useForm<AddMinisterioFormData>({
    resolver: zodResolver(AddMinisterioSchema),
    defaultValues: { status: MinisterioStatusEnum.Ativo, logoUpload: null, logoUrl: null, logoThumbUrl: null },
  });

  const { user, updateUser, igrejaAtiva } = useAuth();

  const { add: addMinisterios, isLoading: isLoadingMinisterios } = useMinisteriosCrud();
  const { add: addVoluntarios, isLoading: isLoadingVoluntarios } = useMinisterioVoluntariosCrud({ muteMessages: true });

  const handleSubmit = async () => {
    await form.handleSubmit(
      async (data) => {
        showLoading('Salvando');

        try {
          const { voluntarios, ...ministerio } = data;

          const newMinisterioData: CreateMinisterioDto = {
            igrejaId: igrejaAtiva!.id,
            nome: ministerio.nome,
            tipo: ministerio.tipo,
            descricao: ministerio.descricao || undefined,
            status: MinisterioStatusEnum.Ativo,
            logoUrl: null,
            logoThumbUrl: null,
          };

          //Enviar logo para o servidor e guardar as URLs retornadas
          if (data.logoUpload?.uri) {
            const { imageThumbUrl, imageUrl } = await sendImageToServer('ministerios', data.logoUpload);

            newMinisterioData.logoUrl = imageUrl;
            newMinisterioData.logoThumbUrl = imageThumbUrl;

            form.setValue('logoUrl', imageUrl);
            form.setValue('logoThumbUrl', imageThumbUrl);
            form.setValue('logoUpload', null);
          }

          const newMinisterio: ResponseMinisterioDto = await addMinisterios(newMinisterioData);

          // Adiciona voluntários ao ministério
          await Promise.all(
            voluntarios.map((voluntario) =>
              addVoluntarios({
                ministerioId: newMinisterio.id,
                voluntarioId: voluntario.voluntarioId,
                hierarquia: voluntario.hierarquia,
              }),
            ),
          );

          // Atualiza o usuário logado com o novo ministério na igreja ativa
          if (igrejaAtiva) {
            const novaIgreja = {
              ...igrejaAtiva,
              ministerios: [
                ...igrejaAtiva.ministerios,
                {
                  id: newMinisterio.id!,
                  nome: newMinisterio.nome,
                  tipo: newMinisterio.tipo,
                  hierarquia: voluntarios[0]?.hierarquia, // ou lógica adequada
                  logoUrl: newMinisterio.logoUrl,
                  logoThumbUrl: newMinisterio.logoThumbUrl,
                },
              ],
            };
            const novasIgrejas = (user?.igrejas || []).map((ig) => (ig.id === igrejaAtiva.id ? novaIgreja : ig));
            updateUser({ ...user, igrejas: novasIgrejas });
          }

          form.reset();
          router.back();
        } finally {
          hideLoading();
        }
      },
      (errors) => {
        console.log(`Erro ao adicionar ministério\n ${strfyObj(errors)}`);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: errors.voluntarios?.message || 'Erro ao submeter o formulário',
        });
      },
    )();
  };

  const STEPS: FancyStepsConfig = {
    steps: [
      {
        title: 'Dados',
        content: <DadosTab mode={'add'} />,
        actions: [
          {
            label: 'Anterior',
            icon: {
              library: DefaultIconsNames['arrow-left'].library,
              name: DefaultIconsNames['arrow-left'].name,
              size: 20,
            },
            enabled: false,
          },
          {
            label: 'Próximo',
            icon: {
              library: DefaultIconsNames['arrow-right'].library,
              name: DefaultIconsNames['arrow-right'].name,
              size: 20,
            },
            iconPosition: 'right',
            onPress: async () => {
              const isValid = await form.trigger(['id', 'nome', 'tipo', 'descricao']);
              if (isValid) {
                setStepIndex(1);
              }
            },
          },
        ],
      },
      {
        title: 'Liderança',
        content: <LiderancaTab />,
        actions: [
          {
            label: 'Anterior',
            icon: { library: 'Feather', name: 'arrow-left', size: 20 },
            onPress: 'previous',
          },
          {
            label: 'Finalizar',
            icon: { library: 'Feather', name: 'check', size: 20 },
            iconPosition: 'right',
            onPress: handleSubmit,
            color: Pallete.confirm,
          },
        ],
      },
    ],
  };

  if (isLoadingMinisterios || isLoadingVoluntarios) {
    return <FancyLoading />;
  }

  return (
    <FancyPageView style={styles.container}>
      <FancyStepsHeader index={stepIndex} config={STEPS} containerStyle={{ paddingHorizontal: 15 }} />
      <FormProvider {...form}>
        <View style={styles.contentContainer}>{STEPS.steps[stepIndex].content}</View>
      </FormProvider>
      <FancyStepsNavigation
        config={STEPS}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        containerStyle={{ paddingHorizontal: 15 }}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 5, gap: 20, alignItems: 'center' },
  contentContainer: { width: '100%', gap: 20, flex: 1, paddingHorizontal: 15 },
  buttonsContainer: { width: '100%', gap: 10, flexDirection: 'row' },
  button: {
    flex: 1,
  },
  errorText: { color: Pallete.error },
});
