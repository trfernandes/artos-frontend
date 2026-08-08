import { useEffect, useMemo, useState } from 'react';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import FancyTabs, { TabItem } from '../../../../tabs/FancyTabs';
import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { DefaultIconsNames } from '../../../../../constants/icons';
import EventoInfoTab, { EventoInfoTabProps } from './EventoInfoTab';
import FancyLoading from '../../../../FancyLoading';
import { ResponseEventoDto } from '../../../../../domain/dtos/Evento/evento.response';

export interface EventoDetailsProps {
  eventoId: string;
  data: EventoInfoTabProps;
}

export default function EventoDetails({
  eventoId,
  data,
  ...props
}: EventoDetailsProps & FancyModalDialogProps<any>) {
  const initialParams = useMemo<DynamicQuery>(() => {
    return {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: eventoId },
          },
        ],
      },
    };
  }, [eventoId]);

  const { data: eventosList, isLoading: isLoadingEventos } = useEventosCrud({
    autoFetch: true,
    initialParams,
  });

  const [eventoData, setEventoData] = useState<ResponseEventoDto>();

  useEffect(() => {
    if (eventosList?.length > 0) setEventoData(eventosList?.[0]);
    else setEventoData(undefined);
  }, [eventosList]);

  const TAB_CONFIG: TabItem[] = [
    {
      title: 'Informações',
      icon: { ...DefaultIconsNames.info, size: 14, style: { borderWidth: 0, marginTop: -0.5 } },
      content: <EventoInfoTab {...data} />,
    },
    {
      title: 'Setlist',
      icon: {
        library: 'Fontisto',
        name: 'play-list',
        size: 10,
        style: { borderWidth: 0, marginTop: -1.5 },
      },
    },
  ];

  return (
    <FancyModalDialog
      {...props}
      showCloseButton
      button2={{ visible: false }}
      button1={{ visible: false }}
      title='Detalhes do Evento'
      containerStyle={{ height: '80%' }}
      centerContainerStyle={{ flex: 1, borderWidth: 0 }}
    >
      {isLoadingEventos ? <FancyLoading /> : <FancyTabs items={TAB_CONFIG} variant='compact' />}
    </FancyModalDialog>
  );
}
