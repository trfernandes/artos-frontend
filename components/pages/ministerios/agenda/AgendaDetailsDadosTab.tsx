import { StyleSheet, View } from 'react-native';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { EventoModel } from '../../../../domain/models/Evento';
import FancyContainer from '../../../FancyContainer';
import { useEventosCrud } from '../../../../hooks/useEventosCrud';
import FancyDropDown from '../../../fields/FancyDropDown';
import FancyButton from '../../../buttons/FancyButton';
import { useEscalaTemplatesCrud } from '../../../../useEscalaTemplatesCrud';
import { Operator, OrderDirection, ValueType } from '../../../../domain/utils/query_utils';
import FancyLoading from '../../../FancyLoading';
import { useCallback, useMemo, useState } from 'react';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { EscalaTemplateTipoLabel } from '../../../../domain/models/EscalaTemplate';
import Toast from 'react-native-toast-message';
import EventoInfoCard from '../../common/EventoInfoCard';
import { Pallete } from '../../../../constants/colors';

export default function AgendaDetailsDadosTab(props: { ministerioId: string; dataOcorrencia: Date; evento: EventoModel }) {
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
    const horaFim = props.evento.dataTermino && format(props.evento.dataTermino, 'HH:mm', { locale: ptBR });

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
    await updateEventos({
      id: props.evento.id,
      data: { templatePadraoId: templateId } as EventoModel,
    });
    Toast.show({ type: 'success', text1: 'Template padrão do evento atualizado com sucesso!' });
  }, [props.evento.id, updateEventos, templateId]);

  if (isLoadingTemplates) return <FancyLoading />;

  return (
    <View style={styles.container}>
      <EventoInfoCard
        dataOcorrencia={props.dataOcorrencia}
        eventoCor={props.evento.cor || Pallete.primary}
        eventoNome={props.evento.nome}
        descricao={props.evento.descricao}
        local={props.evento.local}
      />
      <FancyContainer
        title={'Parâmetros do Evento'}
        content={
          <View
            style={{
              paddingHorizontal: 22,
              flexDirection: 'row',
              // borderWidth: 1,
              gap: 10,
              alignItems: 'center',
            }}
          >
            <FancyDropDown
              label="Template padrão"
              containerStyle={{ flex: 1 }}
              listItems={templatesList}
              value={templateId}
              onChange={setTemplateId}
            />
            <FancyButton
              label="Salvar"
              containerStyle={{ alignSelf: 'flex-end', width: '25%' }}
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
