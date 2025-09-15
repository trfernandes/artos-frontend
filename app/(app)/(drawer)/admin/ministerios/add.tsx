import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyStepsHeader from '../../../../../components/steps/FancyStepsHeader';
import { useState } from 'react';
import FancyStepsNavigation from '../../../../../components/steps/FancyStepsNavigation';
import { FancyStepsConfig } from '../../../../../components/steps/FancyStepsConfig';
import { Pallete } from '../../../../../constants/colors';
import DadosTab from '../../../../../components/pages/admin/ministerios/DadosTab';
import LiderancaTab, { baseLiderSchema } from '../../../../../components/pages/admin/ministerios/LiderancaTab';
import { DefaultIconsNames } from '../../../../../constants/icons';
import z from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ministerio, MinisterioStatusEnum, MinisterioTipoEnum } from '../../../../../domain/models/Ministerio';
import { MinisterioVoluntario } from '../../../../../domain/models/MinisterioVoluntario';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MinisteriosRepository } from '../../../../../domain/services/MinisteriosRepository';
import Toast from 'react-native-toast-message';
import { strfyObj } from '../../../../../utils/text_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { MinisterioVoluntariosRepository } from '../../../../../domain/services/MinisterioVoluntariosRepository';
import { router } from 'expo-router';
import { AxiosError } from 'axios';
import { ErrorConstants } from '../../../../../utils/api_errors';
import { permissoesSchema } from '../../../../../components/pages/admin/ministerios/PermissoesTab';

export const addLiderSchema = baseLiderSchema;

export const ministerioSchema = z.object({
  id: z.uuidv4().nullable().optional(),
  nome: z
    .string({
      message: 'Campo obrigatório',
    })
    .min(1, { message: 'Campo obrigatório' }),
  tipo: z.enum(MinisterioTipoEnum, {
    message: 'Campo obrigatório',
  }),
  logo: z.string().nullable().optional(),
  uploadLogo: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  status: z.enum(MinisterioStatusEnum, {
    message: 'Campo obrigatório',
  }),
  voluntarios: z
    .array(addLiderSchema)
    .min(1, { message: 'É obrigatório informar pelo menos um líder' })
    .refine(
      lideres => {
        const ids = lideres.map(lider => lider.voluntarioId);
        const uniqueIds = new Set(ids);
        return uniqueIds.size === lideres.length;
      },
      { error: 'Esse líder já foi incluído' }
    ),
  permissoes: z.array(permissoesSchema).optional(),
});

export type MinisterioFormData = z.infer<typeof ministerioSchema>;
export type MinisterioLiderancaFormData = z.infer<typeof addLiderSchema>;

export default function MinisteriosAddPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const queryClient = useQueryClient();

  const form = useForm<MinisterioFormData>({
    resolver: zodResolver(ministerioSchema),
    defaultValues: { status: MinisterioStatusEnum.Ativo },
  });

  const addMinisterioMutation = useMutation({
    mutationFn: (newMinisterio: Ministerio) => {
      return MinisteriosRepository.add(newMinisterio);
    },
    onError: (error: AxiosError, variables) => {
      const errorCode =
        error.response && error.response.data && typeof error.response.data === 'object' && 'errorCode' in error.response.data
          ? (error.response.data as { errorCode?: string }).errorCode
          : undefined;

      if (errorCode === ErrorConstants.UniqueConstraintError) {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Já existe um ministério com esse nome!' });
        setStepIndex(0);
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Erro ao adicionar líderes' });
      }
      console.log(
        'Erro ao adicionar ministério\n',
        error.message,
        error.response ? error.response.data : undefined,
        '\n',
        strfyObj(variables)
      );
    },
  });

  const addVoluntariosMutation = useMutation({
    mutationFn: async (newVoluntarios: MinisterioVoluntario[]) => {
      return await Promise.all(newVoluntarios.map(voluntario => MinisterioVoluntariosRepository.add(voluntario)));
    },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Ministério adicionado com sucesso!' });
    },
    onError: (error, variables) => {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Erro ao adicionar líderes' });
      console.log('Erro ao adicionar voluntário\n', error, '\n', variables);
    },
  });

  const handleSubmit = async () => {
    await form.handleSubmit(
      async data => {
        const { voluntarios, ...ministerio } = data;
        console.log('Adicionando ministerio...', strfyObj(ministerio), strfyObj(voluntarios));
        const newMinisterio = await addMinisterioMutation.mutateAsync({
          ...ministerio,
        } as unknown as Ministerio);

        console.log('Adicionando voluntário...');
        await addVoluntariosMutation.mutateAsync(
          voluntarios.map(
            voluntario =>
              ({
                ministerioId: newMinisterio.id,
                voluntarioId: voluntario.voluntarioId,
                hierarquia: voluntario.hierarquia,
              } as MinisterioVoluntario)
          )
        );

        queryClient.invalidateQueries({ queryKey: ['ministerios'] });
        form.reset();
        router.back();
      },
      errors => {
        console.log(`Erro ao adicionar ministério\n ${strfyObj(errors)}`);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: errors.voluntarios?.message || 'Erro ao submeter o formulário',
        });
      }
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
        content: (
          <LiderancaTab
            validationSchema={addLiderSchema}
            options={{ mode: 'add' }}
            onDeleteLider={() => {
              Toast.show({
                type: 'success',
                text1: 'Exclusão',
                text2: 'Líder removido com sucesso!',
              });
            }}
          />
        ),
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

  if (addMinisterioMutation.isPending) {
    return <FancyLoading label="Adicionando..." />;
  }

  return (
    <FancyPageView style={styles.container}>
      <FancyStepsHeader index={stepIndex} config={STEPS} />
      <FormProvider {...form}>
        <View style={styles.contentContainer}>{STEPS.steps[stepIndex].content}</View>
      </FormProvider>
      <FancyStepsNavigation config={STEPS} stepIndex={stepIndex} setStepIndex={setStepIndex} />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16, gap: 20, alignItems: 'center' },
  contentContainer: { width: '100%', gap: 20, flex: 1, paddingHorizontal: 20 },
  buttonsContainer: { width: '100%', gap: 10, flexDirection: 'row' },
  button: {
    flex: 1,
  },
  errorText: { color: Pallete.error },
});
