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
import { Pallete } from '../../../../../constants/colors';
import EventoFormModal from './EventoFormModal';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyText from '../../../../FancyText';
import { EscalaTemplateTipoEnum } from '../../../../../domain/models/EscalaTemplate';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { useAssistenteEscala } from '../../../../../contexts/pages/escalas/AssistantContext';
import DefaultIcons from '../../../../FancyIcons';

export default function AssistenteEventosStep() {
  const { ministerioId, isShouldLoadEvents, setShouldLoadEvents } = useAssistenteEscala();
  const form = useFormContext<EscalaFormData>();

  const dataInicio = form.watch('dataInicio');
  const dataTermino = form.watch('dataTermino');

  const eventosArray = useFieldArray({
    control: form.control,
    name: 'eventos',
    keyName: 'rhfKey',
  });

  const { buscarPorIntervalo, isLoading } = useEventosCrud({ autoFetch: false });

  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    let isMounted = true;

    const carregarEventos = async () => {
      console.log('DATAS ===> ', { dataInicio: format(dataInicio, 'yyyy-MM-dd HH:mm:ss'), dataTermino: format(dataTermino, 'yyyy-MM-dd HH:mm:ss') });

      if (!dataInicio || !dataTermino) {
        if (isMounted) eventosArray.replace([]);
        return;
      }

      try {
        const resultado = await buscarPorIntervalo({ dataInicio, dataTermino });
        if (!isMounted) return;

        const mapeados = (resultado ?? [])
          .map(ocorrencia => {
            if (!ocorrencia) return null;

            return {
              eventoId: ocorrencia.id,
              nome: ocorrencia.nome ?? 'Evento sem nome',
              local: ocorrencia.local ?? '',
              cor: ocorrencia.cor,
              data: ocorrencia.dataInicio,
              selected: true,
              template: {
                tipo: ocorrencia.templatePadrao?.tipo ? ocorrencia.templatePadrao?.tipo! : EscalaTemplateTipoEnum.Funcoes,
                templateBase: {
                  id: ocorrencia.templatePadrao?.id,
                  nome: ocorrencia.templatePadrao?.nome,
                },
                fixos: ocorrencia.templatePadrao?.voluntarios?.map(
                  v =>
                    ({
                      funcaoId: v.funcao?.id,
                      minVolId: v.voluntario?.id || v.voluntarioId,
                    } as EscalaEventoTemplateFixoFormData)
                ),
                funcoes: ocorrencia.templatePadrao?.funcoes?.map(
                  f =>
                    ({
                      funcaoId: f.funcao?.id,
                      experiencia: f.experiencia,
                      quantidade: f.quantidade,
                    } as EscalaEventoTemplateFuncaoFormData)
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
        hideLoading();
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
  }>({ visible: false });

  const handleSaveTemplate = useCallback(
    (data: EscalaEventoTemplateFormData) => {
      const evento = eventosArray.fields.find(e => e.eventoId === eventoFormProps.data?.eventoId);
      const eventoIndex = eventosArray.fields.findIndex(e => e.eventoId === eventoFormProps.data?.eventoId);

      if (evento) {
        eventosArray.update(eventoIndex, {
          ...evento,
          template: data,
        });

        setEventoFormProps({ visible: false, data: undefined });
      }
    },
    [form, eventosArray]
  );

  const markAll = form.watch('markEventsAll');

  const executeMarkAll = useCallback(
    (mark: boolean) => {
      eventosArray.replace(
        eventosArray.fields.map(evento => ({
          ...evento,
          selected: mark,
        }))
      );
    },
    [markAll, eventosArray.fields]
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <FancyText size={'extraSmall'} type="semiBold">
          Selecione os 'eventos' que farão parte da escala:
        </FancyText>

        <TouchableOpacity
          style={{ flexDirection: 'row', gap: 5 }}
          onPress={() => {
            form.setValue('markEventsAll', !markAll);
            executeMarkAll(!markAll);
          }}
        >
          <DefaultIcons.Custom library="Octicons" name={markAll ? 'circle' : 'check-circle'} size={15} color={Pallete.primary} />
          <FancyText size={'small'} type="semiBold" style={{ color: Pallete.primary }}>
            {!markAll ? 'Marcar todos' : 'Desmarcar todos'}
          </FancyText>
        </TouchableOpacity>
      </View>

      <FancyList
        keyExtractor={({ eventoId, data }) => eventoId + data}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        data={eventosArray.fields}
        extraData={eventosArray.fields}
        refreshing={isLoading}
        renderItem={({ item, index }) => {
          const accentColor = item.cor ?? Pallete.primary;
          const dataValor = item.data instanceof Date ? item.data : new Date(item.data as unknown as string);
          const dataFormatada = Number.isNaN(dataValor.getTime()) ? 'Data indisponivel' : format(dataValor, 'dd/MM/yyyy - HH:mm');
          const estruturaEquipe = item.template.templateBase.id
            ? `Template - ${item.template.templateBase.nome}`
            : (item.template.fixos && item.template.fixos?.length > 0) || (item.template.funcoes && item.template.funcoes?.length > 0)
            ? 'Personalizada'
            : 'Nenhuma';
          return (
            <FancyCard.CheckBox
              key={item.eventoId}
              title={item.nome}
              subtitle={dataFormatada}
              additionalData1={
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    gap: 5,
                    alignItems: 'flex-start',
                    flexShrink: 1,
                    marginRight: 5,
                  }}
                >
                  <FancyText size={'extraSmall'} type="medium" style={{ opacity: 0.9 }}>
                    Equipe:
                  </FancyText>
                  <FancyText size={'extraSmall'} type="bold" style={{ opacity: 0.7, marginRight: 0, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
                    {estruturaEquipe}
                  </FancyText>
                </View>
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
                    setEventoFormProps({ visible: true, data: item });
                  },
                },
              ]}
            />
          );
        }}
      />
      {eventoFormProps.visible && (
        <EventoFormModal
          data={eventoFormProps.data}
          modalProps={{
            onButton1Press: () => setEventoFormProps({ visible: false, data: undefined }),
            onButton2Press: data => {
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
});
