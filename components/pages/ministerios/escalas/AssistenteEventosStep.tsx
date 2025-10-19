import { StyleSheet, View } from 'react-native';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EscalaEventoFormData, EscalaFormData } from '../../../../domain/schemas/escalaSchema';
import FancyList from '../../../list/FancyList';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { useEventosCrud } from '../../../../hooks/useEventosCrud';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import FancyLoading from '../../../FancyLoading';
import { Pallete } from '../../../../constants/colors';
import EventoFormModal from './EventoFormModal';
import { strfyObj } from '../../../../utils/text_utils';
import { DefaultIconsNames } from '../../../../constants/icons';
import FancyText from '../../../FancyText';
import { useEscalaTemplatesCrud } from '../../../../hooks/useEscalaTemplatesCrud';
import { DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../domain/utils/query_utils';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';

export default function AssistenteEventosStep({
  ministerioId,
  isShouldLoad: isShouldLoadEventos,
}: {
  ministerioId: string;
  isShouldLoad: React.RefObject<boolean>;
}) {
  const form = useFormContext<EscalaFormData>();
  const dataInicio = form.watch('dataInicio');
  const dataTermino = form.watch('dataTermino');

  const { fields, replace, update } = useFieldArray({
    control: form.control,
    name: 'eventos',
    keyName: 'rhfKey',
  });

  const { buscarPorIntervalo, isLoading } = useEventosCrud({ autoFetch: false });

  useEffect(() => {
    let isMounted = true;

    const carregarEventos = async () => {
      if (!dataInicio || !dataTermino) {
        if (isMounted) replace([]);
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
            } as EscalaEventoFormData;
          })
          .filter((item): item is EscalaEventoFormData => Boolean(item));

        replace(mapeados);

        isShouldLoadEventos.current = false;
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        if (isMounted) replace([]);
      }
    };

    if (isShouldLoadEventos.current) carregarEventos();

    return () => {
      isMounted = false;
    };
  }, [isShouldLoadEventos]);

  const [eventoFormProps, setEventoFormProps] = useState<{
    visible: boolean;
    data?: EscalaEventoFormData;
  }>({ visible: false });

  const templatesParams: DynamicQuery = {
    where: {
      conditions: [
        {
          path: 'ministerioId',
          operator: Operator.EQUALS,
          value: { type: ValueType.LITERAL, value: ministerioId },
        },
      ],
    },
    orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
  };

  const { data: templatesList } = useEscalaTemplatesCrud({ autoFetch: true, initialParams: templatesParams });

  const templatesDropDownList = useMemo<DropDownItemProps<string>[]>(() => {
    return [
      { title: '(Personalizado)', value: '' },
      ...templatesList.map(
        t =>
          ({
            title: t.nome,
            value: t.id,
          } as DropDownItemProps<string>)
      ),
    ];
  }, [templatesList]);

  if (isLoading) return <FancyLoading />;

  return (
    <View style={styles.container}>
      <FancyText size={'extraSmall'} type="semiBold">
        Selecione os 'eventos' que farão parte da escala:
      </FancyText>
      <FancyList
        containerStyle={{ flex: 1 }}
        data={fields}
        extraData={fields}
        refreshing={isLoading}
        renderItem={({ item, index }) => {
          const accentColor = item.cor ?? Pallete.primary;
          const dataValor = item.data instanceof Date ? item.data : new Date(item.data as unknown as string);
          const dataFormatada = Number.isNaN(dataValor.getTime()) ? 'Data indisponivel' : format(dataValor, 'dd/MM/yyyy - HH:mm');

          return (
            <FancyCard.CheckBox
              key={item.eventoId}
              title={item.nome}
              subtitle={dataFormatada}
              additionalData1={'Configuração da: funções'}
              value={!!item.selected}
              checkboxColor={accentColor}
              onChangeValue={() => {
                const nextSelected = !fields[index].selected;
                update(index, { ...fields[index], selected: nextSelected });
                form.trigger('eventos').catch(() => {});
              }}
              actionButtons={[
                { icon: { ...DefaultIconsNames.edit, size: 16 }, onPress: () => setEventoFormProps({ visible: true, data: item }) },
              ]}
            />
          );
        }}
      />
      {eventoFormProps.visible && (
        <EventoFormModal
          data={eventoFormProps.data}
          templateSelectionList={templatesDropDownList}
          templateList={templatesList}
          modalProps={{
            onClose: () => setEventoFormProps({ visible: false, data: undefined }),
            onConfirm: data => {
              data && console.log(strfyObj(data));
              setEventoFormProps({ visible: false, data: undefined });
            },
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, paddingHorizontal: 20, flex: 1 },
});
