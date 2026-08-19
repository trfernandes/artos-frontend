import { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../../buttons/FancyButton';
import FancyText from '../../../../FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
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
import { StyleSheet, View } from 'react-native';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';
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
  visible: boolean;
  modalProps?: FancyModalDialogProps<EscalaEventoTemplateFormData>;
  data?: EscalaEventoFormData;
}

export default function EventoFormModal({
  modalProps,
  data,
  ministerioId,
  visible,
}: EventoFormModalProps) {
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
      (f) => f.funcaoIds || f.experiencia || f.quantidade,
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
          .filter((f) => f.opcoes?.length)
          .map((f) => ({
            funcaoIds: f.opcoes!.map((o) => o.funcaoId),
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

  // ControlledSearchSelect dispara onChange enquanto o <Modal> do próprio
  // picker ainda está fechando (FancySearchSelect.scheduleClose). Empilhar o
  // <Modal> do FancyAlert em cima dele fazia o iOS ignorar a apresentação do
  // alerta silenciosamente (nenhum crash, só nunca aparecia — por isso os
  // botões "Sim"/"Não" nunca disparavam e as funções nunca carregavam).
  // Guarda a mudança pendente e só abre o alerta no onClosed do picker,
  // quando o Modal nativo já terminou de fechar de verdade.
  const pendingTemplateChangeRef = useRef<string | null>(null);

  const handleTemplateBaseChange = useCallback((newTemplateBaseId: string) => {
    const previousTemplateBaseId = prevTemplateBaseIdRef.current || '';
    const nextTemplateBaseId = newTemplateBaseId || '';

    console.log(
      `[DEBUG-tplsw] handleTemplateBaseChange prev="${previousTemplateBaseId}" next="${nextTemplateBaseId}"`,
    );

    if (previousTemplateBaseId === nextTemplateBaseId) {
      console.log('[DEBUG-tplsw] guard bail: prev === next, nada agendado');
      return;
    }

    pendingTemplateChangeRef.current = nextTemplateBaseId;
    console.log(`[DEBUG-tplsw] pendingTemplateChangeRef setado para "${nextTemplateBaseId}"`);
  }, []);

  const handleTemplateSelectClosed = useCallback(() => {
    console.log(
      `[DEBUG-tplsw] handleTemplateSelectClosed chamado, pending="${pendingTemplateChangeRef.current}"`,
    );
    const nextTemplateBaseId = pendingTemplateChangeRef.current;
    if (nextTemplateBaseId === null) {
      console.log('[DEBUG-tplsw] pending null, saindo sem abrir alerta');
      return;
    }
    pendingTemplateChangeRef.current = null;

    const previousTemplateBaseId = prevTemplateBaseIdRef.current || '';

    console.log('[DEBUG-tplsw] chamando FancyAlert.alert agora');
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
  }, [applyTemplateSelection, formTemplate]);

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

  // Mesma corrida de <Modal> nativo do picker de template base — guarda o
  // valor pendente e só abre o alerta quando o sheet terminou de fechar.
  const pendingTipoChangeRef = useRef<EscalaTemplateTipoEnum | null>(null);

  const handleTipoSelectClosed = useCallback(
    (onChange: (value: EscalaTemplateTipoEnum) => void) => {
      const newTipo = pendingTipoChangeRef.current;
      if (newTipo === null) return;
      pendingTipoChangeRef.current = null;

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
              onChange(newTipo);
              handleChangeTipo(newTipo);
            },
          },
        ],
      );
    },
    [handleChangeTipo],
  );

  const isDataLoading =
    isLoadingFuncoesDoMinisterio ||
    isLoadingMinisterioVoluntarios ||
    isLoadingMinisterioVoluntariosMutation ||
    isLoadingTemplates;

  const Pallete = usePallete();

  const handleSubmitForm = useCallback(() => {
    formTemplate.handleSubmit(
      (formData) => {
        modalProps?.onButton2Press?.(formData);
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
  }, [formTemplate, modalProps]);

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={() => modalProps?.onButton1Press?.()}
      title={data?.nome}
      titleSize='largeMedium'
      footer={
        <View style={styles.buttonsContainer}>
          <FancyButton
            label='Cancelar'
            type='outlined'
            onPress={() => modalProps?.onButton1Press?.()}
            containerStyle={styles.button}
          />
          <FancyButton label='Salvar' onPress={handleSubmitForm} containerStyle={styles.button} />
        </View>
      }
    >
      {isDataLoading ? (
        <FancyLoading />
      ) : (
        <>
          {data?.dataOcorrencia && (
            <View style={{ gap: 6 }}>
              <FancyText size='extraSmall' type='semiBold' color={Pallete.fonts.inactive}>
                Data
              </FancyText>
              <View
                style={[
                  styles.dataBox,
                  { backgroundColor: Pallete.backgroundColor, borderColor: Pallete.border },
                  Pallete.shadows[200],
                ]}
              >
                <FancyText type='medium' size='small' color={Pallete.fonts.dark}>
                  {format(data.dataOcorrencia, 'dd/MM/yyyy HH:mm')}
                </FancyText>
              </View>
            </View>
          )}

          <ControlledSearchSelect
            label='Template Base'
            control={formTemplate.control}
            name='templateBase.id'
            listItems={templatesDropDownList}
            searchPlaceholder='Buscar template...'
            onChange={(newTemplateBaseId) => {
              handleTemplateBaseChange(newTemplateBaseId as string);
            }}
            onClosed={handleTemplateSelectClosed}
          />

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
                  pendingTipoChangeRef.current = newValue;
                }}
                onClosed={() => handleTipoSelectClosed(onChange)}
              />
            )}
          />

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
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, height: 44 },
  dataBox: {
    borderWidth: 0.6,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});
