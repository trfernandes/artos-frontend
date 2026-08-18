import { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import {
  EscalaTemplateFormData,
  escalaTemplateSchema,
} from '../../../../../domain/schemas/escalaTemplateSchema';
import { AxiosError } from 'axios';
import TemplateForm from '../../../../../components/pages/ministerios/templates_equipe/TemplateForm';
import { strfyObj } from '../../../../../utils/text_utils';
import { EscalaTemplateTipoEnum } from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { useLoading } from '../../../../../contexts/LoadingContext';

export default function MinisterioTemplatesAddPage() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  const form = useForm<EscalaTemplateFormData>({
    resolver: zodResolver(escalaTemplateSchema),
    defaultValues: {
      ministerioId,
      tipo: EscalaTemplateTipoEnum.Funcoes,
      respSetListFuncoesId: undefined,
      respSetListVoluntariosId: undefined,
    },
  });

  const { add: addTemplate, isLoadingMutation } = useEscalaTemplatesCrud();
  const { showLoading, hideLoading } = useLoading();

  const handleOnSave = useCallback(
    form.handleSubmit(
      async (data) => {
        showLoading('Salvando...');
        try {
          const { respSetListVoluntariosId, respSetListFuncoesId, ...rest } = data;
          await addTemplate({
            ...rest,
            ministerioId: data.ministerioId,
            respSetListVoluntarios: respSetListVoluntariosId,
            respSetListFuncoes: respSetListFuncoesId,
          });
          router.back();
        } catch (error) {
          const errorMessage = (error as AxiosError<any, any>).response?.data?.message;
          if (
            errorMessage &&
            errorMessage.trim() ===
              'Ja existe um template com esse nome para o ministerio informado.'
          ) {
            form.setError('nome', {
              type: 'custom',
              message: 'O nome já está sendo utilizado',
            });
          }
        } finally {
          hideLoading();
        }
      },
      (errors) => {
        console.log('Erro ao adicionar template\n', strfyObj(errors));
      },
    ),
    [form.handleSubmit],
  );

  return (
    <FormProvider {...form}>
      <TemplateForm
        mode='add'
        ministerioId={ministerioId}
        onSave={handleOnSave}
        isLoading={isLoadingMutation}
      />
    </FormProvider>
  );
}
