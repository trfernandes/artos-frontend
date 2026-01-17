import { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import { EscalaTemplateFormData, escalaTemplateSchema } from '../../../../../domain/schemas/escalaTemplateSchema';
import { AxiosError } from 'axios';
import TemplateForm from '../../../../../components/pages/ministerios/templates_equipe/TemplateForm';
import { strfyObj } from '../../../../../utils/text_utils';
import { EscalaTemplateTipoEnum } from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';

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

  const handleOnSave = useCallback(
    form.handleSubmit(
      (data) => {
        addTemplate({ ...data, ministerioId: data.ministerioId })
          .then(() => {
            router.back();
          })
          .catch((error: AxiosError<any, any>) => {
            const errorMessage = error.response?.data?.message;
            if (errorMessage && errorMessage.trim() === 'Ja existe um template com esse nome para o ministerio informado.') {
              form.setError('nome', {
                type: 'custom',
                message: 'O nome já está sendo utilizado',
              });
            }
          });
      },
      (errors) => {
        console.log('Erro ao adicionar template\n', strfyObj(errors));
      },
    ),
    [form.handleSubmit],
  );

  return (
    <FormProvider {...form}>
      <TemplateForm mode='add' ministerioId={ministerioId} onSave={handleOnSave} isLoading={isLoadingMutation} />
    </FormProvider>
  );
}
