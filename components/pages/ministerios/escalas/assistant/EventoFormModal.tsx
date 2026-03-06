import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import {
  EscalaEventoFormData,
  EscalaEventoTemplateFixoFormData,
  EscalaEventoTemplateFormData,
  EscalaEventoTemplateFuncaoFormData,
  EscalaEventoTemplateSchema,
} from '../../../../../domain/schemas/escalaSchema';
import { format } from 'date-fns';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet } from 'react-native';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';
import FancyVerticalSpacer from '../../../../FancyVerticalSpacer';
import { EnumUtils } from '../../../../../utils/enum_utils';
import FancyBottomSheetSelect from '../../../../fields/FancyBottomSheetSelect';
import { FancyAlert } from '../../../../modal/FancyAlert';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import {
  DynamicQuery,
  Operator,
  ValueType,
  OrderDirection,
} from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../FancyLoading';
import { useFuncoesDoMinisterio } from '../../../../../hooks/useFuncoesDoMinisterio';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { EscalaFormFuncaoList } from './EscalaFormFuncaoList';
import { EscalaFormFixoList } from './EscalaFormFixoList';
import {
  EscalaTemplateTipoEnum,
  EscalaTemplateTipoLabel,
} from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { ResponseEscalaTemplateDto } from '../../../../../domain/dtos/EscalaTemplate/escala-template.response';

interface EventoFormModalProps {
  ministerioId: string;
  modalProps?: FancyModalDialogProps<EscalaEventoTemplateFormData>;
  data?: EscalaEventoFormData;
}

export default function EventoFormModal({ modalProps, data, ministerioId }: EventoFormModalProps) {
  const templatesParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'ministerioId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
        ],
      },
      relations: ['voluntarios.voluntario', 'voluntarios.funcao', 'funcoes.funcao'],
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    }),
    [ministerioId],
  );

  const { data: templatesList = [], isLoading: isLoadingTemplates } = useEscalaTemplatesCrud({
    autoFetch: true,
    initialParams: templatesParams,
  });

  const {
    funcoesList,
    funcoesDropDownList,
    isLoading: isLoadingFuncoesDoMinisterio,
  } = useFuncoesDoMinisterio(ministerioId);

  const {
    ministerioVoluntariosDropDownList,
    ministerioVoluntariosList,
    isLoadingMinisterioVoluntarios,
    isLoadingMinisterioVoluntariosMutation,
  } = useVoluntariosDoMinisterioCrud(ministerioId);

  const templatesDropDownList = useMemo<DropDownItemProps<string>[]>(() => {
    const list = templatesList ?? [];
    return [
      { title: '(Personalizado)', value: '' },
      ...list.map((t) => ({
        title: t.nome,
        value: t.id || '',
      })),
    ];
  }, [templatesList]);

  const formTemplate = useForm<EscalaEventoTemplateFormData>({
    resolver: zodResolver(EscalaEventoTemplateSchema),
    defaultValues: {
      templateBase: data?.template.templateBase.id
        ? data.template.templateBase
        : { id: '', nome: '' },
      tipo: data?.template.tipo || EscalaTemplateTipoEnum.Funcoes,
      funcoes: data?.template.funcoes || [],
      fixos: data?.template.fixos || [],
    },
  });

  const prevTemplateBaseIdRef = useRef<string>(formTemplate.getValues('templateBase.id') || '');

  // Reset form when modal opens with new data
  useEffect(() => {
    if (data) {
      formTemplate.reset({
        templateBase: data.template.templateBase.id
          ? data.template.templateBase
          : { id: '', nome: '' },
        tipo: data.template.tipo || EscalaTemplateTipoEnum.Funcoes,
        funcoes: data.template.funcoes || [],
        fixos: data.template.fixos || [],
      });
      prevTemplateBaseIdRef.current = data.template.templateBase.id || '';
    }
  }, [data?.eventoId]);

  useEffect(() => {
    const fixosMudou = formTemplate.formState.dirtyFields.fixos?.filter(
      (f) => f.funcaoId || f.minVolId,
    );
    const funcoesMudou = formTemplate.formState.dirtyFields.funcoes?.filter(
      (f) => f.funcaoId || f.experiencia || f.quantidade,
    );

    if (fixosMudou || funcoesMudou) {
      formTemplate.setValue('templateBase.id', '');
      formTemplate.setValue('templateBase.nome', '');
      formTemplate.setValue('tipo', data?.template.tipo || EscalaTemplateTipoEnum.Funcoes);
    }
  }, [formTemplate.formState.isDirty]);

  const loadTemplateData = useCallback(
    (template: ResponseEscalaTemplateDto) => {
      if (template.tipo === EscalaTemplateTipoEnum.Funcoes) {
        if (!template.funcoes) return;

        const funcoes: EscalaEventoTemplateFuncaoFormData[] = template.funcoes
          .filter((f) => f.funcao?.id)
          .map((f) => ({
            funcaoId: f.funcao!.id!,
            experiencia: f.experiencia,
            quantidade: f.quantidade,
          }));

        formTemplate.setValue('funcoes', funcoes);
      } else if (template.tipo === EscalaTemplateTipoEnum.Fixo) {
        if (!template.voluntarios) return;

        const fixos: EscalaEventoTemplateFixoFormData[] = template.voluntarios.map((f) => ({
          minVolId: f.voluntario?.id!,
          funcaoId: f.funcao?.id || f.funcaoId,
        }));

        formTemplate.setValue('fixos', fixos);
      }
    },
    [formTemplate],
  );

  const applyTemplateSelection = useCallback(
    (templateId: string) => {
      const selectedTemplate = templatesList?.find((t) => t.id === templateId);

      formTemplate.setValue('templateBase.id', templateId);

      if (selectedTemplate) {
        formTemplate.setValue('templateBase.nome', selectedTemplate.nome);
        formTemplate.setValue('tipo', selectedTemplate.tipo);
        formTemplate.setValue('funcoes', []);
        formTemplate.setValue('fixos', []);
        loadTemplateData(selectedTemplate);
      } else {
        formTemplate.setValue('templateBase.nome', '');
        formTemplate.setValue('tipo', EscalaTemplateTipoEnum.Funcoes);
        formTemplate.setValue('funcoes', []);
        formTemplate.setValue('fixos', []);
      }

      prevTemplateBaseIdRef.current = templateId;
    },
    [formTemplate, loadTemplateData, templatesList],
  );

  const handleTemplateBaseChange = useCallback(
    (newTemplateBaseId: string) => {
      const previousTemplateBaseId = prevTemplateBaseIdRef.current || '';
      const nextTemplateBaseId = newTemplateBaseId || '';

      if (previousTemplateBaseId === nextTemplateBaseId) {
        return;
      }

      FancyAlert.alert(
        'Edição',
        'A mudança de template base vai acarretar a perda dos dados inseridos, realmente deseja prosseguir?',
        [
          {
            text: 'Não',
            style: 'cancel',
            onPress: () => {
              formTemplate.setValue('templateBase.id', previousTemplateBaseId);
            },
          },
          {
            text: 'Sim',
            style: 'default',
            onPress: () => {
              applyTemplateSelection(nextTemplateBaseId);
            },
          },
        ],
      );
    },
    [applyTemplateSelection, formTemplate],
  );

  const templateBaseIdWatch = formTemplate.watch('templateBase.id');
  const templateTipoWatch = formTemplate.watch('tipo');

  const handleChangeTipo = useCallback(
    (newTipo: EscalaTemplateTipoEnum) => {
      if (newTipo === EscalaTemplateTipoEnum.Fixo) {
        formTemplate.setValue('funcoes', []);
      } else {
        formTemplate.setValue('fixos', []);
      }
    },
    [formTemplate],
  );

  const isDataLoading =
    isLoadingFuncoesDoMinisterio ||
    isLoadingMinisterioVoluntarios ||
    isLoadingMinisterioVoluntariosMutation ||
    isLoadingTemplates;

  return (
      <FancyModalDialog
        {...modalProps}
        title={`${data?.nome} - ${format(data?.dataOcorrencia!, 'dd/MM/yyyy HH:ss')}`}
        titleAlign='left'
        onButton2Press={(_) => {
          formTemplate.handleSubmit(
            (data) => {
              modalProps?.onButton2Press?.(data);
            },
            (errors) => {
              const erro = errors.funcoes || errors.fixos;

              if (erro) {
                FancyAlert.alert('Erro', erro?.message, [
                  {
                    text: 'Ok',
                  },
                ]);
              }
            },
          )();
        }}
        centerContainerStyle={styles.container}
      >
        {isDataLoading ? (
          <FancyLoading />
        ) : (
          <>
            <ControlledSearchSelect
              label='Template Base'
              control={formTemplate.control}
              name='templateBase.id'
              listItems={templatesDropDownList}
              searchPlaceholder='Buscar template...'
              onChange={(newTemplateBaseId) => {
                handleTemplateBaseChange(newTemplateBaseId as string);
              }}
            />
            <FancyVerticalSpacer height={12} />

            <Controller
              control={formTemplate.control}
              name={'tipo'}
              render={({ field: { onChange, value } }) => (
                <FancyBottomSheetSelect
                  label='Tipo de Equipe'
                  listItems={EnumUtils.getDropDownItems(
                    EscalaTemplateTipoEnum,
                    EscalaTemplateTipoLabel,
                  )}
                  disabled={templateBaseIdWatch !== ''}
                  value={value}
                  onChange={(newValue) => {
                    if (value === newValue && !value) return;
                    FancyAlert.alert(
                      'Alteração de tipo',
                      'Essa mudança vai resultar em excluir toda a equipe, deseja continuar?',
                      [
                        {
                          text: 'Não',
                          style: 'cancel',
                        },
                        {
                          text: 'Sim',
                          style: 'default',
                          onPress: () => {
                            onChange(newValue);
                            handleChangeTipo(newValue);
                          },
                        },
                      ],
                    );
                  }}
                />
              )}
            />

            <FancyVerticalSpacer height={16} />

            <FormProvider {...formTemplate}>
              {templateTipoWatch === EscalaTemplateTipoEnum.Funcoes ? (
                <EscalaFormFuncaoList
                  ministerioId={ministerioId}
                  funcoesDropDownList={funcoesDropDownList}
                  funcoesList={funcoesList}
                />
              ) : templateTipoWatch === EscalaTemplateTipoEnum.Fixo ? (
                <EscalaFormFixoList
                  funcoesList={funcoesList}
                  funcoesDropDownList={funcoesDropDownList}
                  ministerioVoluntariosDropDownList={ministerioVoluntariosDropDownList}
                  ministerioVoluntariosList={ministerioVoluntariosList}
                />
              ) : null}
            </FormProvider>
          </>
        )}
      </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
  },
});
