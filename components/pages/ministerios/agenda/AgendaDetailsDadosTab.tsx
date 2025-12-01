import { StyleSheet, View } from 'react-native';
import { ptBR } from 'date-fns/locale';
import FancyText from '../../../FancyText';
import { format } from 'date-fns';
import { Evento } from '../../../../domain/models/Evento';
import { FancyTextDisplay } from '../../../fields/FancyTextDisplay';
import FancyContainer from '../../../FancyContainer';
import { generateRecorrenciaDescription, useEventosCrud } from '../../../../hooks/useEventosCrud';
import FancyDropDown from '../../../fields/FancyDropDown';
import FancyButton from '../../../buttons/FancyButton';
import { useEscalaTemplatesCrud } from '../../../../useEscalaTemplatesCrud';
import { Operator, OrderDirection, ValueType } from '../../../../domain/utils/query_utils';
import FancyLoading from '../../../FancyLoading';
import { useCallback, useMemo, useState } from 'react';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { EscalaTemplateTipoLabel } from '../../../../domain/models/EscalaTemplate';
import DefaultIcons from '../../../FancyIcons';
import { DefaultIconsNames } from '../../../../constants/icons';
import Toast from 'react-native-toast-message';
import { strfyObj } from '../../../../utils/text_utils';

export default function AgendaDetailsDadosTab(props: {
  ministerioId: string;
  dataOcorrencia: Date;
  evento: Evento;
}) {
  console.log(strfyObj(props.evento));

  const { data: templates, isLoading: isLoadingTemplates } = useEscalaTemplatesCrud({
    autoFetch: false,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: props.ministerioId,
            },
          },
        ],
      },
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    },
  });

  const templatesList = useMemo<DropDownItemProps<string>[]>(() => {
    const list = [
      ...[{ title: 'Nenhum', subtitle: '', value: '' } as DropDownItemProps<string>],
      ...templates.map(
        t =>
          ({
            title: t.nome,
            subtitle: EscalaTemplateTipoLabel[t.tipo],
            value: t.id,
          } as DropDownItemProps<string>)
      ),
    ];
    return list;
  }, [templates]);

  const dataOcorrenciaExtenso = useCallback(() => {
    const texto = format(props.dataOcorrencia, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    const horaInicio = format(props.evento.dataInicio, 'HH:mm', { locale: ptBR });
    const horaFim = format(props.evento.dataTermino, 'HH:mm', { locale: ptBR });

    const resultado = `${texto}, das ${horaInicio} às ${horaFim}`;
    const formatado = resultado.charAt(0).toUpperCase() + resultado.slice(1);
    return formatado;
  }, [props.evento, props.dataOcorrencia]);

  const { update: updateEventos } = useEventosCrud({ autoFetch: false });

  const [templateId, setTemplateId] = useState<string>(
    props.evento.templatePadrao?.id || props.evento.templatePadrao?.id || ''
  );

  const handleSaveTemplate = useCallback(async () => {
    if (!props.evento.id) return;
    console.log('Salvando template padrão do evento:', templateId);
    await updateEventos({
      id: props.evento.id,
      data: { templatePadraoId: templateId } as Evento,
    });
    Toast.show({ type: 'success', text1: 'Template padrão do evento atualizado com sucesso!' });
  }, [props.evento.id, updateEventos, templateId]);

  if (isLoadingTemplates) return <FancyLoading />;

  return (
    <View style={styles.container}>
      <FancyContainer
        icon={{ ...DefaultIconsNames['calendar-day'], size: 14 }}
        title={'Evento'}
        content={
          <View style={styles.infoContainer}>
            <View style={{ flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <DefaultIcons.Custom
                  library="MaterialCommunityIcons"
                  name="octagon"
                  size={14}
                  color={props.evento.cor}
                />
                <FancyText size={'large'} type={'bold'}>
                  {props.evento.nome}
                </FancyText>
              </View>

              <FancyText size={'small'} type={'medium'}>
                {dataOcorrenciaExtenso()}
              </FancyText>
            </View>
            <View style={{ gap: 8 }}>
              <FancyTextDisplay
                title="Recorrência:"
                value={
                  props.evento.recorrencia
                    ? generateRecorrenciaDescription(
                        props.evento.recorrencia,
                        props.evento.recorrenciaSemanaDias!,
                        props.evento.recorrenciaACadaMeses!,
                        props.evento.recorrenciaSemanasMes!
                      )
                    : 'Nenhum'
                }
              />
              <FancyTextDisplay title="Descrição:" value={props.evento.descricao ?? ''} />
              <FancyTextDisplay title="Local:" value={props.evento.local ?? ''} />
            </View>
          </View>
        }
      />
      <FancyContainer
        icon={{ name: 'file-document-outline', library: 'MaterialCommunityIcons', size: 14 }}
        title={'Template padrão do evento'}
        content={
          <View
            style={{
              paddingHorizontal: 15,
              flexDirection: 'row',
              paddingVertical: 20,
              gap: 10,
              alignItems: 'center',
            }}
          >
            <FancyDropDown
              containerStyle={{ flex: 1 }}
              listItems={templatesList}
              value={templateId}
              onChange={setTemplateId}
            />
            <FancyButton
              label="Salvar"
              containerStyle={{ width: '25%' }}
              onPress={handleSaveTemplate}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  infoContainer: { gap: 10, paddingHorizontal: 15, paddingVertical: 16 },
});
