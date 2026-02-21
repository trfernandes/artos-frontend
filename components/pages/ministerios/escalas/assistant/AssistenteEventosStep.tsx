import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  EscalaEventoFormData,
  EscalaEventoTemplateFixoFormData,
  EscalaEventoTemplateFormData,
  EscalaEventoTemplateFuncaoFormData,
  EscalaFormData,
} from '../../../../../domain/schemas/escalaSchema';
import FancyList from '../../../../list/FancyList';
import { FancyCard } from '../../../../cards/Horizontal/FancyCard';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventoFormModal from './EventoFormModal';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyText from '../../../../FancyText';
import FancyChips from '../../../../FancyChips';
import FancyLoading from '../../../../FancyLoading';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import DefaultIcons from '../../../../FancyIcons';
import { EscalaTemplateTipoEnum } from '../../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';

export default function AssistenteEventosStep() {
  const palette = usePallete();
  const { ministerioId, isShouldLoadEvents, setShouldLoadEvents } = useAssistenteEscala();
  const form = useFormContext<EscalaFormData>();

  const dataInicio = form.watch('dataInicio');
  const dataTermino = form.watch('dataTermino');

  const eventosArray = useFieldArray({
    control: form.control,
    name: 'eventos',
    keyName: 'rhfKey',
  });

  const { buscarPorIntervalo } = useEventosCrud({ autoFetch: false });

  const [isLoadingEventos, setIsLoadingEventos] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const carregarEventos = async () => {
      if (!dataInicio || !dataTermino) {
        if (isMounted) eventosArray.replace([]);
        if (isMounted) setIsLoadingEventos(false);
        return;
      }

      try {
        if (isMounted) setIsLoadingEventos(true);
        const resultado = await buscarPorIntervalo({ dataInicio, dataTermino });

        if (!isMounted) return;

        const mapeados = (resultado ?? [])
          .map((ocorrencia) => {
            if (!ocorrencia) return null;

            const horario = ocorrencia.evento
              ? `${format(DateUtilsApi.dateTimeFromApi(ocorrencia.evento?.dataInicio), 'HH:mm')} - ${
                  ocorrencia.evento?.dataTermino
                    ? format(DateUtilsApi.dateTimeFromApi(ocorrencia.evento.dataTermino), 'HH:mm')
                    : 'Indefinido'
                }`
              : '';

            return {
              eventoId: ocorrencia.id,
              nome: ocorrencia.nome ?? 'Evento sem nome',
              local: ocorrencia.local ?? '',
              cor: ocorrencia.cor,
              dataOcorrencia: DateUtilsApi.dateTimeFromApi(ocorrencia.dataOcorrencia),
              horario: horario,
              selected: true,
              template: {
                tipo: ocorrencia.templatePadrao?.tipo
                  ? ocorrencia.templatePadrao?.tipo!
                  : EscalaTemplateTipoEnum.Funcoes,
                templateBase: {
                  id: ocorrencia.templatePadrao?.id,
                  nome: ocorrencia.templatePadrao?.nome,
                },
                fixos: ocorrencia.templatePadrao?.voluntarios?.map(
                  (v) =>
                    ({
                      funcaoId: v.funcao?.id,
                      minVolId: v.voluntario?.id || v.voluntarioId,
                    }) as EscalaEventoTemplateFixoFormData,
                ),
                funcoes: ocorrencia.templatePadrao?.funcoes?.map(
                  (f) =>
                    ({
                      funcaoId: f.funcao?.id,
                      experiencia: f.experiencia,
                      quantidade: f.quantidade,
                    }) as EscalaEventoTemplateFuncaoFormData,
                ),
              },
            } as EscalaEventoFormData;
          })
          .filter((item): item is EscalaEventoFormData => Boolean(item));

        eventosArray.replace(mapeados);

        setShouldLoadEvents(false);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        if (isMounted) eventosArray.replace([]);
      } finally {
        if (isMounted) setIsLoadingEventos(false);
      }
    };

    if (isShouldLoadEvents) carregarEventos();

    return () => {
      isMounted = false;
    };
  }, [isShouldLoadEvents]);

  const [eventoFormProps, setEventoFormProps] = useState<{
    visible: boolean;
    data?: EscalaEventoFormData;
    index?: number;
  }>({ visible: false });

  const handleSaveTemplate = useCallback(
    (data: EscalaEventoTemplateFormData) => {
      if (eventoFormProps.index !== undefined) {
        const evento = eventosArray.fields[eventoFormProps.index];

        if (evento) {
          eventosArray.update(eventoFormProps.index, {
            ...evento,
            template: data,
          });
          setEventoFormProps({ visible: false, data: undefined, index: undefined });
        }
      }
    },
    [eventosArray, eventoFormProps.index, eventoFormProps.data?.eventoId],
  );

  const markAll = form.watch('markEventsAll');

  const executeMarkAll = useCallback(
    (mark: boolean) => {
      eventosArray.replace(
        eventosArray.fields.map((evento) => ({
          ...evento,
          selected: mark,
        })),
      );
    },
    [markAll, eventosArray.fields],
  );

  return (
    <View style={styles.container}>
      <View style={{ gap: 12 }}>
        <FancyText size={'extraSmall'} type='semiBold'>
          Selecione os 'eventos' que farão parte da escala:
        </FancyText>

        <TouchableOpacity
          style={{ flexDirection: 'row', gap: 5 }}
          onPress={() => {
            form.setValue('markEventsAll', !markAll);
            executeMarkAll(!markAll);
          }}
        >
          <DefaultIcons.Custom
            library='Octicons'
            name={markAll ? 'circle' : 'check-circle'}
            size={15}
            color={palette.primary}
          />
          <FancyText size={'small'} type='semiBold' style={{ color: palette.primary }}>
            {!markAll ? 'Marcar todos' : 'Desmarcar todos'}
          </FancyText>
        </TouchableOpacity>
      </View>

      {isLoadingEventos ? (
        <View style={styles.loadingContainer}>
          <FancyLoading />
        </View>
      ) : (
        <FancyList
          keyExtractor={({ eventoId, dataOcorrencia: data }) => eventoId + data}
          containerStyle={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          data={eventosArray.fields}
          extraData={eventosArray.fields}
          // refreshing={isLoading}
          renderItem={({ item, index }) => {
            const accentColor = item.cor ?? palette.primary;
            const dataFormatada = format(item.dataOcorrencia, 'EEEE, dd/MM/yyyy', { locale: ptBR });
            const horarioFormatado = item.horario || 'não informado';
            const hasTemplateBase = Boolean(
              item.template?.templateBase &&
              'id' in item.template.templateBase &&
              item.template.templateBase.id,
            );
            const hasEquipePersonalizada =
              (item.template?.fixos?.length ?? 0) > 0 || (item.template?.funcoes?.length ?? 0) > 0;
            const eventoSemTemplate = !hasTemplateBase && !hasEquipePersonalizada;

            const estruturaEquipe = hasTemplateBase
              ? `${'nome' in item.template.templateBase ? item.template.templateBase.nome : ''}`
              : hasEquipePersonalizada
                ? 'Personalizada'
                : 'Nenhuma';
            return (
              <FancyCard.CheckBox
                key={item.eventoId}
                title={item.nome}
                subtitle={
                  <View style={styles.eventInfoContainer}>
                    <View style={styles.eventInfoRow}>
                      <View style={styles.eventInfoIcon}>
                        <DefaultIcons.Custom library='MaterialIcons' name='event' size={14} color={palette.primary} />
                      </View>
                      <FancyText size='extraSmall' type='medium' color={palette.fonts.dark} numberOfLines={1}>
                        {dataFormatada}
                      </FancyText>
                    </View>
                    <View style={styles.eventInfoRow}>
                      <View style={styles.eventInfoIcon}>
                        <DefaultIcons.Custom library='MaterialIcons' name='access-time' size={14} color={palette.primary} />
                      </View>
                      <FancyText size='extraSmall' type='medium' color={palette.fonts.dark} numberOfLines={1}>
                        {horarioFormatado}
                      </FancyText>
                    </View>
                    <View style={styles.eventInfoRow}>
                      <View style={styles.eventInfoIcon}>
                        <DefaultIcons.Custom library='MaterialIcons' name='group' size={14} color={palette.primary} />
                      </View>
                      <FancyText size='extraSmall' type='medium' color={palette.fonts.dark} numberOfLines={1} style={{ flexShrink: 1 }}>
                        {estruturaEquipe}
                      </FancyText>
                    </View>
                  </View>
                }
                additionalData1={
                  eventoSemTemplate ? (
                    <View style={{ marginTop: 3 }}>
                      <FancyChips
                        size='small'
                        label='Sem template definido'
                        color={palette.warning}
                        icon={{ library: 'MaterialCommunityIcons', name: 'alert-circle-outline' }}
                      />
                    </View>
                  ) : undefined
                }
                value={!!item.selected}
                checkboxColor={accentColor}
                onChangeValue={() => {
                  const nextSelected = !eventosArray.fields[index].selected;
                  eventosArray.update(index, {
                    ...eventosArray.fields[index],
                    selected: nextSelected,
                  });
                  form.trigger('eventos').catch(() => {});
                }}
                actionButtons={[
                  {
                    icon: { ...DefaultIconsNames.edit, size: 16 },
                    onPress: () => {
                      setEventoFormProps({ visible: true, data: item, index });
                    },
                  },
                ]}
              />
            );
          }}
        />
      )}
      {eventoFormProps.visible && (
        <EventoFormModal
          data={eventoFormProps.data}
          modalProps={{
            onButton1Press: () => setEventoFormProps({ visible: false, data: undefined }),
            onButton2Press: (data) => {
              if (!data) return;
              handleSaveTemplate(data);
            },
          }}
          ministerioId={ministerioId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, flex: 1 },
  eventInfoContainer: {
    gap: 3,
    marginTop: 2,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventInfoIcon: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
