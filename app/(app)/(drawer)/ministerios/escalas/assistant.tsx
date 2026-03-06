import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancySteps from '../../../../../components/steps/FancySteps';
import { FancyStepsConfig } from '../../../../../components/steps/FancyStepsConfig';
import { useCallback } from 'react';
import axios from 'axios';
import { Pallete } from '../../../../../constants/colors';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EscalaEventosArraySchema,
  EscalaFormData,
  EscalaParticipantesArraySchema,
  EscalaSchema,
} from '../../../../../domain/schemas/escalaSchema';
import AssistenteParametrosStep from '../../../../../components/pages/ministerios/escalas/assistant/AssistenteParametrosStep';
import AssistenteEventosStep from '../../../../../components/pages/ministerios/escalas/assistant/AssistenteEventosStep';
import AssistenteParticipantesStep from '../../../../../components/pages/ministerios/escalas/assistant/AssistenteParticipantesStep';
import AssistenteRevisaoStep from '../../../../../components/pages/ministerios/escalas/assistant/AssistenteRevisaoStep';
import { router, useLocalSearchParams } from 'expo-router';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLoading } from '../../../../../contexts/LoadingContext';
import AssistenteResultadoStep from '../../../../../components/pages/ministerios/escalas/assistant/AssistenteResultadoStep';
import {
  AssistenteEscalaProvider,
  useAssistenteEscala,
} from '../../../../../contexts/pages/escalas/AssistantContext';
import { endOfMonth } from 'date-fns';
import Toast from 'react-native-toast-message';
import { EscalaRepository } from '../../../../../domain/services/EscalaRepository';
import { Operator, ValueType, Conjunction } from '../../../../../domain/utils/query_utils';
import {
  CreateEscalaDto,
  CreateEscalaEventoDto,
  CreateEscalaEventoEquipePersonalizadaDto,
  CreateEscalaEventoEquipePorTemplateDto,
} from '../../../../../domain/dtos/Escala/escala.create';
import { EscalaTemplateTipoEnum } from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { useEscalaNomeValidator } from '../../../../../hooks/useEscalaNomeValidator';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';

const DUPLICATE_NAME_MESSAGE = 'Já existe uma escala com esse nome neste ministério.';

const normalizeEscalaName = (value?: string | null) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const mapEscalaFormToDto = (
  ministerioId: string,
  usuarioId: string,
  values: EscalaFormData,
): CreateEscalaDto => {
  const eventos =
    values.eventos
      ?.filter((evento) => evento.selected)
      .map((evento) => {
        let equipe:
          | CreateEscalaEventoEquipePorTemplateDto
          | CreateEscalaEventoEquipePersonalizadaDto
          | null;

        if (evento.template.templateBase) {
          equipe = {
            origem: 'porTemplate',
            templateId:
              'id' in evento.template.templateBase
                ? (evento.template.templateBase as { id?: string }).id
                : undefined,
          } as CreateEscalaEventoEquipePorTemplateDto;
        } else {
          equipe = {
            origem: 'personalizada',
            tipo: evento.template.tipo,
            funcoes:
              evento.template.tipo === EscalaTemplateTipoEnum.Funcoes
                ? evento.template.funcoes?.map((funcao) => ({
                    id: funcao.funcaoId!,
                    quantidade: funcao.quantidade,
                    experienciaMinima: funcao.experiencia,
                  }))
                : undefined,
            fixos:
              evento.template.tipo === EscalaTemplateTipoEnum.Fixo
                ? evento.template.fixos?.map((fixo) => ({
                    voluntarioId: fixo.minVolId,
                    funcaoId: fixo.funcaoId,
                  }))
                : undefined,
          } as CreateEscalaEventoEquipePersonalizadaDto;
        }
        return {
          id: evento.eventoId,
          data: DateUtilsApi.dateOnlyToApi(evento.dataOcorrencia),
          equipe: equipe,
        } as CreateEscalaEventoDto;
      }) ?? [];

  const participantes =
    values.participantes
      ?.filter((e) => e.selected)
      .map((participante) => ({
        minVolId: participante.minVolId,
        voluntarioId: participante.voluntarioId,
      })) ?? [];

  return {
    ministerioId,
    criadoPor: usuarioId,
    nome: values.nome,
    dataInicio: DateUtilsApi.dateOnlyToApi(values.dataInicio),
    dataTermino: DateUtilsApi.dateOnlyToApi(values.dataTermino),
    ...(eventos.length ? { eventos } : {}),
    ...(participantes.length ? { participantes } : {}),
  };
};

function AssistenteWrapper() {
  const {
    ministerioId,
    setResultado,
    index,
    setIndex,
    nextStep,
    previousStep,
    setShouldLoadEvents,
    resultado,
    setTempoGeracaoEscala,
  } = useAssistenteEscala();

  const { showLoading, hideLoading } = useLoading();

  const { generate: generateEscala, isGenerating: isGeneratingEscala } = useEscalasCrud();

  const dataAtual = new Date();

  const form = useForm({
    resolver: zodResolver(EscalaSchema),
    defaultValues: {
      dataInicio: new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1),
      dataTermino: endOfMonth(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1)),
      markEventsAll: true,
      markParticipantsAll: true,
      eventos: [],
    },
  });

  form.register('dataInicio', {
    onChange: () => {
      setShouldLoadEvents(true);
    },
  });

  form.register('dataTermino', {
    onChange: () => {
      setShouldLoadEvents(true);
    },
  });

  const nomeWatch = form.watch('nome');
  const dataInicioWatch = form.watch('dataInicio');
  const dataTerminoWatch = form.watch('dataTermino');
  const eventosWatch = form.watch('eventos');
  const participantesWatch = form.watch('participantes');

  const { user, igrejaAtiva } = useAuth();
  const { validateNome, validateNomeDebounced, isCheckingName } =
    useEscalaNomeValidator(ministerioId);

  const handleNomeBlurValidation = useCallback(
    async (nome: string) => {
      const nomeNormalizado = nome?.trim() ?? '';

      if (!nomeNormalizado) {
        return;
      }

      try {
        const result = await validateNomeDebounced(nomeNormalizado);

        if (result.exists) {
          form.setError('nome', { message: DUPLICATE_NAME_MESSAGE });
          return;
        }

        if (form.formState.errors.nome?.message === DUPLICATE_NAME_MESSAGE) {
          form.clearErrors('nome');
        }
      } catch (error) {
        if (__DEV__) {
          console.log('[AssistenteEscala] erro ao validar nome no blur:', error);
        }
      }
    },
    [form, validateNomeDebounced],
  );

  const validateUniqueNameBeforeNext = useCallback(
    async (nome: string): Promise<boolean> => {
      const nomeNormalizado = nome?.trim() ?? '';

      if (!nomeNormalizado) {
        return true;
      }

      if (!ministerioId) {
        Toast.show({
          type: 'error',
          text1: 'Ministério não identificado',
          text2: 'Volte e entre novamente no assistente.',
        });
        return false;
      }

      if (!igrejaAtiva?.id) {
        Toast.show({
          type: 'error',
          text1: 'Igreja não selecionada',
          text2: 'Selecione uma igreja para continuar.',
        });
        return false;
      }

      try {
        const result = await validateNome(nomeNormalizado);
        if (result.exists) {
          form.setError('nome', { message: DUPLICATE_NAME_MESSAGE });
          return false;
        }
      } catch (error) {
        // Fallback para ambientes em que o endpoint validar-nome ainda não existe.
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          throw error;
        }

        const duplicates = await EscalaRepository.search({
          where: {
            conjunction: Conjunction.AND,
            conditions: [
              {
                path: 'ministerio.id',
                operator: Operator.EQUALS,
                value: {
                  type: ValueType.LITERAL,
                  value: ministerioId,
                },
              },
              {
                path: 'nome',
                operator: Operator.ILIKE,
                value: {
                  type: ValueType.LITERAL,
                  value: nomeNormalizado,
                },
              },
            ],
          },
        });

        const normalizedTarget = normalizeEscalaName(nomeNormalizado);
        const exists = (duplicates ?? []).some(
          (escala) => normalizeEscalaName(escala.nome) === normalizedTarget,
        );

        if (exists) {
          form.setError('nome', { message: DUPLICATE_NAME_MESSAGE });
          return false;
        }
      }

      if (form.formState.errors.nome?.message === DUPLICATE_NAME_MESSAGE) {
        form.clearErrors('nome');
      }

      return true;
    },
    [form, igrejaAtiva?.id, ministerioId, validateNome],
  );

  const handleGenerate = useCallback(
    async (values: EscalaFormData) => {
      try {
        showLoading('Gerando escala...');
        const start = Date.now();
        const payload = mapEscalaFormToDto(ministerioId, user?.user?.id!, values);
        const resultado = await generateEscala(payload);
        const time = Date.now() - start;
        setTempoGeracaoEscala?.(time);
        setResultado(resultado);
        nextStep();
      } finally {
        hideLoading();
      }
    },
    [generateEscala],
  );

  const handleViewResults = useCallback(() => {
    if (!resultado) return;

    router.push({
      pathname: '/ministerios/escalas/details',
      params: {
        ministerioId,
        escalaId: resultado.id,
        viewMode: 'view',
      },
    });
  }, [resultado]);

  const stepsConfig: FancyStepsConfig = {
    steps: [
      {
        title: 'Parâmetros',
        content: (
          <AssistenteParametrosStep
            isCheckingName={isCheckingName}
            onNomeBlur={handleNomeBlurValidation}
          />
        ),
        actions: [
          {
            label: 'Anterior',
            enabled: false,
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-left',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
          },
          {
            label: 'Próximo',
            enabled: !isCheckingName,
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-right',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
            iconPosition: 'right',
            onPress: async () => {
              showLoading();
              form.clearErrors();

              try {
                const values = {
                  nome: nomeWatch,
                  dataInicio: dataInicioWatch,
                  dataTermino: dataTerminoWatch,
                };

                const validation = EscalaSchema.safeParse(values);

                if (!validation.success) {
                  validation.error.issues.forEach((err) => {
                    form.setError(err.path[0] as keyof EscalaFormData, { message: err.message });
                  });
                  return;
                }

                const nomeDisponivel = await validateUniqueNameBeforeNext(values.nome);
                if (!nomeDisponivel) {
                  return;
                }

                const dataInicioApi = DateUtilsApi.dateOnlyToApi(values.dataInicio);
                const dataTerminoApi = DateUtilsApi.dateOnlyToApi(values.dataTermino);

                const escalasConflitantes = await EscalaRepository.search({
                  where: {
                    conditions: [
                      {
                        path: 'ministerio.id',
                        operator: Operator.EQUALS,
                        value: {
                          type: ValueType.LITERAL,
                          value: ministerioId,
                        },
                      },
                      {
                        conditions: [
                          {
                            path: 'dataInicio',
                            operator: Operator.LTE,
                            value: {
                              type: ValueType.LITERAL,
                              value: dataTerminoApi,
                            },
                          },
                          {
                            path: 'dataTermino',
                            operator: Operator.GTE,
                            value: {
                              type: ValueType.LITERAL,
                              value: dataInicioApi,
                            },
                          },
                        ],
                        conjunction: Conjunction.AND,
                      },
                    ],
                    conjunction: Conjunction.AND,
                  },
                });

                if (escalasConflitantes && escalasConflitantes.length > 0) {
                  Toast.show({
                    text1: 'Dados Inválidos',
                    text2: `Já existe(m) ${escalasConflitantes.length} escala(s) com datas que se sobrepõem ao período selecionado.`,
                    type: 'error',
                  });
                  return;
                }

                nextStep();
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Não foi possível validar os parâmetros.',
                  text2: getApiErrorMessage(error, 'Tente novamente em instantes.'),
                });
              } finally {
                hideLoading();
              }
            },
          },
        ],
      },
      {
        title: 'Eventos',
        content: <AssistenteEventosStep />,
        actions: [
          {
            label: 'Anterior',
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-left',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
            onPress: () => previousStep(),
          },
          {
            label: 'Próximo',
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-right',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
            iconPosition: 'right',
            onPress: () => {
              showLoading();
              form.clearErrors();

              const values = eventosWatch;
              const validation = EscalaEventosArraySchema.safeParse(values);

              if (!validation.success) {
                validation.error.issues.forEach((err) => {
                  Toast.show({
                    text2: `${err.message}!` as string,
                    type: 'error',
                  });
                });
                hideLoading();
                return;
              }

              hideLoading();
              nextStep();
            },
          },
        ],
      },
      {
        title: 'Participantes',
        content: <AssistenteParticipantesStep />,
        actions: [
          {
            label: 'Anterior',
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-left',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
            onPress: () => previousStep(),
          },
          {
            label: 'Próximo',
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-right',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
            iconPosition: 'right',
            onPress: () => {
              form.clearErrors();

              const values = participantesWatch;

              if (!values || values.length === 0) {
                Toast.show({
                  type: 'error',
                  text1: 'Sem participantes com função',
                  text2:
                    'Cadastre função em pelo menos um voluntário do ministério para continuar.',
                });
                return;
              }

              const validation = EscalaParticipantesArraySchema.safeParse(values);

              if (!validation.success) {
                validation.error.issues.forEach((err) => {
                  Toast.show({
                    text2: `${err.message}!` as string,
                    type: 'error',
                  });
                });
                return;
              }
              nextStep();
            },
          },
        ],
      },
      {
        title: 'Revisão',
        content: <AssistenteRevisaoStep />,
        actions: [
          {
            label: 'Anterior',
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-left',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
            onPress: () => previousStep(),
          },
          {
            label: 'Gerar',
            icon: {
              library: 'MaterialIcons',
              name: 'play-arrow',
              size: 16,
              style: { borderWidth: 0, width: 10, lineHeight: 10 },
            },
            iconPosition: 'right',
            color: Pallete.secondary,
            onPress: () => {
              handleGenerate(form.getValues() as EscalaFormData);
            },
          },
        ],
      },
      {
        title: 'Resultado',
        content: <AssistenteResultadoStep />,
        actions: [
          {
            label: 'Sair',
            icon: {
              library: 'MaterialIcons',
              name: 'exit-to-app',
              size: 16,
              color: Pallete.fonts.inactive,
            },
            type: 'outlined',
            containerStyle: {
              flex: 0,
              paddingHorizontal: 14,
              borderColor: Pallete.border,
              borderWidth: 1.5,
            },
            labelStyle: { color: Pallete.fonts.inactive },
            onPress: () => {
              router.push({ pathname: '/ministerios/escalas', params: { ministerioId } });
            },
          },
          {
            label: 'Reiniciar',
            icon: {
              library: 'MaterialCommunityIcons',
              name: 'arrow-u-left-top',
              size: 14,
              style: { borderWidth: 0, width: 12, lineHeight: 12 },
            },
            onPress: () => {
              setIndex(0);
              setResultado(null);
              form.reset();
            },
          },
          {
            label: 'Visualizar',
            icon: {
              library: 'MaterialCommunityIcons',
              name: 'table-eye',
              size: 14,
              style: { borderWidth: 0, width: 14, lineHeight: 14 },
            },
            color: Pallete.secondary,
            onPress: handleViewResults,
          },
        ],
      },
    ],
  };

  return (
    <FancyPageView
      style={[styles.container, { pointerEvents: isGeneratingEscala ? 'none' : 'auto' }]}
    >
      <FormProvider {...form}>
        <FancySteps
          config={stepsConfig}
          index={index}
          setIndex={setIndex}
          containerStyle={{ borderWidth: 0 }}
          headerContainerStyle={{ paddingHorizontal: 15 }}
          contentContainerStyle={{ paddingHorizontal: 15, flex: 1 }}
          navigationContainerStyle={{ paddingHorizontal: 15 }}
        />
      </FormProvider>
    </FancyPageView>
  );
}

export default function MinisterioEscalasAssistenteIndex() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  return (
    <AssistenteEscalaProvider ministerioId={ministerioId}>
      <AssistenteWrapper />
    </AssistenteEscalaProvider>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, paddingHorizontal: 5 },
});
