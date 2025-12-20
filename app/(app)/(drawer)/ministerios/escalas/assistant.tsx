import { StyleSheet } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancySteps from '../../../../../components/steps/FancySteps';
import { FancyStepsConfig } from '../../../../../components/steps/FancyStepsConfig';
import { useCallback } from 'react';
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
import { EscalaTemplateTipoEnum } from '../../../../../domain/models/EscalaTemplate';
import { useAuth } from '../../../../../contexts/AuthContext';
import {
  GerarEscalaDto,
  GerarEscalaEventoDto,
  GerarEscalaEventoEquipePersonalizadaDto,
  GerarEscalaEventoEquipePorTemplateDto,
} from '../../../../../domain/api/EscalaApi';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { strfyObj } from '../../../../../utils/text_utils';
import AssistenteResultadoStep from '../../../../../components/pages/ministerios/escalas/assistant/AssistenteResultadoStep';
import {
  AssistenteEscalaProvider,
  useAssistenteEscala,
} from '../../../../../contexts/pages/escalas/AssistantContext';
import { areIntervalsOverlapping, endOfMonth } from 'date-fns';
import Toast from 'react-native-toast-message';
import { EscalaRepository } from '../../../../../domain/services/EscalaRepository';
import { Operator, ValueType, Conjunction } from '../../../../../domain/utils/query_utils';

const mapEscalaFormToDto = (
  ministerioId: string,
  usuarioId: string,
  values: EscalaFormData
): GerarEscalaDto => {
  const toIsoString = (value: Date | string) =>
    value instanceof Date ? value.toISOString() : new Date(value).toISOString();

  const eventos =
    values.eventos
      ?.filter(evento => evento.selected)
      .map(evento => {
        let equipe: GerarEscalaEventoEquipePorTemplateDto | GerarEscalaEventoEquipePersonalizadaDto | null;

        if (evento.template.templateBase) {
          equipe = {
            origem: 'porTemplate',
            templateId:
              'id' in evento.template.templateBase
                ? (evento.template.templateBase as { id?: string }).id
                : undefined,
          } as GerarEscalaEventoEquipePorTemplateDto;
        } else {
          equipe = {
            origem: 'personalizada',
            tipo: evento.template.tipo,
            funcoes:
              evento.template.tipo === EscalaTemplateTipoEnum.Funcoes
                ? evento.template.funcoes?.map(funcao => ({
                    id: funcao.funcaoId!,
                    quantidade: funcao.quantidade,
                    experienciaMinima: funcao.experiencia,
                  }))
                : undefined,
            fixos:
              evento.template.tipo === EscalaTemplateTipoEnum.Fixo
                ? evento.template.fixos?.map(fixo => ({
                    voluntarioId: fixo.minVolId,
                    funcaoId: fixo.funcaoId,
                  }))
                : undefined,
          } as GerarEscalaEventoEquipePersonalizadaDto;
        }
        return {
          id: evento.eventoId,
          data: toIsoString(evento.data),
          equipe: equipe,
        } as GerarEscalaEventoDto;
      }) ?? [];

  const participantes =
    values.participantes
      ?.filter(e => e.selected)
      .map(participante => ({
        minVolId: participante.minVolId,
        voluntarioId: participante.voluntarioId,
      })) ?? [];

  return {
    ministerioId,
    criadoPor: usuarioId,
    nome: values.nome,
    dataInicio: toIsoString(values.dataInicio),
    dataTermino: toIsoString(values.dataTermino),
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
      dataInicio: new Date(2025, dataAtual.getMonth() + 1, 1),
      dataTermino: endOfMonth(new Date(2025, dataAtual.getMonth() + 1, 1)),
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

  const { user } = useAuth();

  const handleGenerate = useCallback(
    async (values: EscalaFormData) => {
      try {
        showLoading('Gerando escala...');
        const start = Date.now();
        const payload = mapEscalaFormToDto(ministerioId, user?.id!, values);
        const resultado = await generateEscala(payload);
        const time = Date.now() - start;
        ('');
        setTempoGeracaoEscala?.(time);
        setResultado(resultado);
        nextStep();
      } finally {
        hideLoading();
      }
    },
    [generateEscala]
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
        content: <AssistenteParametrosStep />,
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
            icon: {
              library: 'MaterialIcons',
              name: 'chevron-right',
              size: 20,
              style: { borderWidth: 0, width: 10, lineHeight: 12 },
            },
            iconPosition: 'right',
            onPress: async () => {
              form.clearErrors();

              const values = {
                nome: nomeWatch,
                dataInicio: dataInicioWatch,
                dataTermino: dataTerminoWatch,
              };

              const validation = EscalaSchema.safeParse(values);

              if (!validation.success) {
                validation.error.issues.forEach(err => {
                  form.setError(err.path[0] as keyof EscalaFormData, { message: err.message });
                });
                return;
              }

              const escalasConflitantes = await EscalaRepository.search({
                where: {
                  conditions: [
                    {
                      path: 'nome',
                      operator: Operator.ILIKE,
                      value: { type: ValueType.LITERAL, value: values.nome },
                    },
                    {
                      conditions: [
                        {
                          path: 'dataInicio',
                          operator: Operator.GTE,
                          value: { type: ValueType.LITERAL, value: values.dataInicio.toDateString() },
                        },
                        {
                          path: 'dataInicio',
                          operator: Operator.LTE,
                          value: { type: ValueType.LITERAL, value: values.dataTermino.toDateString() },
                        },
                      ],
                      conjunction: Conjunction.AND,
                    },
                    {
                      conditions: [
                        {
                          path: 'dataTermino',
                          operator: Operator.GTE,
                          value: { type: ValueType.LITERAL, value: values.dataInicio.toDateString() },
                        },
                        {
                          path: 'dataTermino',
                          operator: Operator.LTE,
                          value: { type: ValueType.LITERAL, value: values.dataTermino.toDateString() },
                        },
                      ],
                      conjunction: Conjunction.AND,
                    },
                  ],
                  conjunction: Conjunction.OR,
                },
              });

              if (escalasConflitantes && escalasConflitantes.length > 0) {
                let message = '';

                const escalasWithSameName = escalasConflitantes.filter(e => e.nome === values.nome);
                if (escalasWithSameName.length > 0) {
                  message += `Já existe uma escala com o nome "${values.nome}". `;
                }

                const escalasWithOverlappingDates = escalasConflitantes.filter(e => {
                  console.log('Comparing with escala', strfyObj(e), dataInicioWatch, dataTerminoWatch);
                  return areIntervalsOverlapping(
                    {
                      start: e.dataInicio,
                      end: e.dataTermino,
                    },
                    {
                      start: dataInicioWatch,
                      end: dataTerminoWatch,
                    }
                  );
                });

                console.log('escalasWithOverlappingDates', strfyObj(escalasWithOverlappingDates));

                if (escalasWithOverlappingDates.length > 0) {
                  if (message.length > 0) {
                    message += '\n';
                  }
                  message += `Já existe(m) ${escalasWithOverlappingDates.length} escala(s) com datas que se sobrepõem ao período selecionado.`;
                }

                Toast.show({
                  text1: 'Dados Inválidos',
                  text2: message,
                  type: 'error',
                });
                return;
              }

              nextStep();
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
              form.clearErrors();

              const values = eventosWatch;
              const validation = EscalaEventosArraySchema.safeParse(values);

              if (!validation.success) {
                validation.error.issues.forEach(err => {
                  Toast.show({ text2: `${err.message}!` as string, type: 'error' });
                });
                return;
              }
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
              const validation = EscalaParticipantesArraySchema.safeParse(values);

              if (!validation.success) {
                validation.error.issues.forEach(err => {
                  Toast.show({ text2: `${err.message}!` as string, type: 'error' });
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
            label: 'Reiniciar assistente',
            icon: {
              library: 'MaterialCommunityIcons',
              name: 'arrow-u-left-top',
              size: 16,
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
              size: 16,
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
    <FancyPageView style={[styles.container, { pointerEvents: isGeneratingEscala ? 'none' : 'auto' }]}>
      <FormProvider {...form}>
        <FancySteps config={stepsConfig} index={index} setIndex={setIndex} />
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
