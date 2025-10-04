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
import Toast from 'react-native-toast-message';
import { strfyObj } from '../../../../../utils/text_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { router } from 'expo-router';
import { permissoesSchema } from '../../../../../components/pages/admin/ministerios/PermissoesTab';
import { useMinisteriosCrud as useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { MinisterioVoluntario } from '../../../../../domain/models/MinisterioVoluntario';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { useAuth, UserMinisterio } from '../../../../../contexts/AuthContext';

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

  const form = useForm<MinisterioFormData>({
    resolver: zodResolver(ministerioSchema),
    defaultValues: { status: MinisterioStatusEnum.Ativo },
  });

  const { user, updateUser } = useAuth();

  const { add: addMinisterios, isLoading: isLoadingMinisterios } = useMinisteriosCrud();
  const { add: addVoluntarios, isLoading: isLoadingVoluntarios } = useMinisterioVoluntariosCrud();

  const handleSubmit = async () => {
    await form.handleSubmit(
      async data => {
        const { voluntarios, ...ministerio } = data;

        const newMinisterio: Ministerio = await addMinisterios({
          ...ministerio,
        } as unknown as Ministerio);

        voluntarios.forEach(async voluntario => {
          await addVoluntarios({
            ministerioId: newMinisterio.id,
            voluntarioId: voluntario.voluntarioId,
            hierarquia: voluntario.hierarquia,
          } as MinisterioVoluntario);
        });

        const ministerios: UserMinisterio[] = [
          { id: newMinisterio.id!, nome: newMinisterio.nome, tipo: newMinisterio.tipo },
          ...(user?.ministerios || []),
        ];
        updateUser({ ...user, ministerios });

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

  if (isLoadingMinisterios || isLoadingVoluntarios) {
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
