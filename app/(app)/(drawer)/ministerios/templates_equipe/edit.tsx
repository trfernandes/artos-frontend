import { FormProvider, useForm } from 'react-hook-form';
import TemplateForm from '../../../../../components/pages/ministerios/templates_equipe/TemplateForm';
import { router, useLocalSearchParams } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EscalaTemplateFormData,
  escalaTemplateSchema,
} from '../../../../../domain/schemas/escalaTemplateSchema';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import { useCallback, useEffect, useMemo } from 'react';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { strfyObj } from '../../../../../utils/text_utils';
import { EscalaTemplateTipoEnumMap } from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';

export default function MinisterioTemplatesEditPage() {
  const { ministerioId, templateId } = useLocalSearchParams<{
    ministerioId: string;
    templateId: string;
  }>();

  const dataParams = useMemo(() => {
    if (!templateId) return undefined;

    return {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: templateId },
          },
        ],
      },
      relations: ['voluntarios.voluntario', 'voluntarios.funcao', 'funcoes.funcao'],
    } as DynamicQuery;
  }, [templateId]);

  const {
    data: templatesData,
    update: updateTemplate,
    isLoading,
    isLoadingMutation,
  } = useEscalaTemplatesCrud({ autoFetch: true, initialParams: dataParams });

  const form = useForm<EscalaTemplateFormData>({
    resolver: zodResolver(escalaTemplateSchema),
  });

  useEffect(() => {
    const template = templatesData?.[0];
    if (template) {
      form.reset({
        ministerioId: ministerioId,
        id: template.id,
        nome: template.nome,
        funcoes: template.funcoes
          ? template.funcoes.map((f) => ({
              funcaoId: f.funcao?.id,
              experiencia: f.experiencia,
              quantidade: f.quantidade,
            }))
          : [],
        voluntarios: template.voluntarios
          ? template.voluntarios?.map((v) => ({
              id: v.id,
              voluntarioId: v.voluntario?.id,
              funcaoId: v.funcao?.id,
            }))
          : [],
        respSetListFuncoesId: template.respSetListFuncoes?.id,
        respSetListVoluntariosId: template.respSetListVoluntarios?.id,
        tipo: EscalaTemplateTipoEnumMap[template.tipo],
      });
    }
  }, [templatesData]);

  const handleOnSave = useCallback(
    form.handleSubmit(
      (data) => {
        if (!data.id) return;

        updateTemplate?.({
          id: data.id,
          data: {
            ...data,
          },
        })?.then(() => {
          router.back();
        });
      },
      (errors) =>
        console.log(
          'Erro no submit do formulário\n',
          '=> Erros: ',
          strfyObj(errors),
          '\n=> Data: ',
          strfyObj(form.getValues()),
        ),
    ),
    [form.handleSubmit],
  );

  if (isLoading) return <FancyLoading />;

  return (
    <FormProvider {...form}>
      <TemplateForm
        mode='edit'
        ministerioId={ministerioId}
        onSave={handleOnSave}
        isLoading={isLoadingMutation}
      />
    </FormProvider>
  );
}
