import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import {
  Conjunction,
  DynamicQuery,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../../domain/utils/query_utils';
import { StyleSheet, View } from 'react-native';
import { Pallete } from '../../../../../constants/colors';
import VoluntarioDetailsHeader from './VoluntarioDetailsHeader';
import FancyModal, { FancyModalProps } from '../../../../modal/FancyModal';
import FancyText from '../../../../FancyText';
import FancySeparator from '../../../../FancySeparator';
import { FancyTextDisplay } from '../../../../fields/FancyTextDisplay';
import { addMonths, format, startOfToday } from 'date-fns';
import { EscalaTemplateExperienciaLabel } from '../../../../../domain/models/EscalaTemplate';
import { useEffect, useMemo, useState } from 'react';
import { EscalaResultadosRepository } from '../../../../../domain/services/EscalaResultadosRepository';
import { useLoading } from '../../../../../contexts/LoadingContext';
import FancySection from '../../../../FancySection';

export default function VoluntarioDetailsModal({
  ministerioVoluntarioId,
  voluntarioId,
  onClose,
  ...props
}: {
  ministerioVoluntarioId: string;
  voluntarioId: string;
  onClose?: () => void;
} & FancyModalProps) {
  const initialParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioVoluntarioId },
          },
          {
            path: 'voluntario.indisponibilidades.data',
            operator: Operator.GTE,
            value: { type: ValueType.LITERAL, value: startOfToday().toISOString() },
          },
          {
            path: 'voluntario.indisponibilidades.data',
            operator: Operator.LTE,
            value: { type: ValueType.LITERAL, value: addMonths(new Date(), 2).toISOString() },
          },
        ],
        conjunction: Conjunction.AND,
      },
      relations: ['voluntario', 'voluntario.indisponibilidades', 'funcoes', 'funcoes.funcao'],
    }),
    [ministerioVoluntarioId]
  );

  const { data: voluntarioData, isLoading: isLoadingVoluntario } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams,
  });

  // 🟦 Habilidades (funções)
  const habilidadesContent = useMemo(() => {
    return (
      voluntarioData?.[0]?.funcoes?.map(item => (
        <FancyTextDisplay
          key={item.id}
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title={`${item.funcao?.nome} -`}
          value={EscalaTemplateExperienciaLabel[item.experiencia]}
        />
      )) ?? []
    );
  }, [voluntarioData]);

  // 🟪 Indisponibilidades futuras
  const indisponibilidadesContent = useMemo(() => {
    return (
      voluntarioData?.[0]?.voluntario?.indisponibilidades
        ?.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .map(item => (
          <FancyTextDisplay
            key={item.id}
            titleStyle={{ size: 'extraSmall' }}
            valueStyle={{ size: 'extraSmall' }}
            title={`${format(item.data, 'dd/MM/yyyy')} -`}
            value={item.motivo}
          />
        )) ?? []
    );
  }, [voluntarioData]);

  // 🩵 Última escala
  const [ultimaEscala, setUltimaEscala] = useState<any | null>(null);
  const [isLoadingUltimaEscala, setLoadingUltimaEscala] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingUltimaEscala(true);
      try {
        const result = (
          await EscalaResultadosRepository.search({
            where: {
              conditions: [
                {
                  path: 'voluntario.id',
                  operator: Operator.EQUALS,
                  value: { type: ValueType.LITERAL, value: voluntarioId },
                },
                {
                  path: 'dataOcorrencia',
                  operator: Operator.LT,
                  value: { type: ValueType.LITERAL, value: startOfToday().toISOString() },
                },
              ],
              conjunction: Conjunction.AND,
            },
            orderBy: [{ path: 'dataOcorrencia', direction: OrderDirection.DESC }],
            limit: 1,
            relations: ['escala', 'evento', 'voluntario', 'funcao'],
          })
        )?.[0];

        setUltimaEscala(result ?? null);
      } finally {
        setLoadingUltimaEscala(false);
      }
    })();
  }, [voluntarioId]);

  const ultimaEscalaContent = useMemo(() => {
    if (!ultimaEscala) {
      return (
        <FancyText size="extraSmall" type="mediumItalic">
          Nenhuma escala encontrada!
        </FancyText>
      );
    }

    return (
      <>
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title="Evento:"
          value={ultimaEscala.evento?.nome ?? '-'}
        />
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title="Data/Hora:"
          value={format(new Date(ultimaEscala.dataOcorrencia), 'dd/MM/yyyy HH:mm')}
        />
        <FancyTextDisplay
          titleStyle={{ size: 'extraSmall' }}
          valueStyle={{ size: 'extraSmall' }}
          title="Função:"
          value={ultimaEscala.funcao?.nome ?? '-'}
        />
      </>
    );
  }, [ultimaEscala]);

  // 💚 Próximas escalas
  const [proximasEscalas, setProximasEscalas] = useState<any[]>([]);
  const [isLoadingProximas, setLoadingProximas] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingProximas(true);
      try {
        const results = await EscalaResultadosRepository.search({
          where: {
            conditions: [
              {
                path: 'voluntario.id',
                operator: Operator.EQUALS,
                value: { type: ValueType.LITERAL, value: voluntarioId },
              },
              {
                path: 'dataOcorrencia',
                operator: Operator.GTE,
                value: { type: ValueType.LITERAL, value: startOfToday().toISOString() },
              },
              {
                path: 'dataOcorrencia',
                operator: Operator.LTE,
                value: { type: ValueType.LITERAL, value: addMonths(new Date(), 2).toISOString() },
              },
            ],
            conjunction: Conjunction.AND,
          },
          orderBy: [{ path: 'dataOcorrencia', direction: OrderDirection.ASC }],
          relations: ['escala', 'evento', 'voluntario', 'funcao'],
        });

        setProximasEscalas(results ?? []);
      } finally {
        setLoadingProximas(false);
      }
    })();
  }, [voluntarioId]);

  const proximasEscalasContent = useMemo(() => {
    if (isLoadingProximas)
      return (
        <FancyText size="extraSmall" type="mediumItalic">
          Carregando próximas escalas...
        </FancyText>
      );

    if (!proximasEscalas.length)
      return (
        <FancyText size="extraSmall" type="mediumItalic">
          Nenhuma escala encontrada!
        </FancyText>
      );

    return proximasEscalas.map(proxima => (
      <FancyTextDisplay
        key={proxima.id}
        titleStyle={{ size: 'extraSmall' }}
        valueStyle={{ size: 'extraSmall' }}
        title={format(new Date(proxima.dataOcorrencia), 'dd/MM/yyyy HH:mm')}
        value={proxima.evento?.nome ?? '-'}
      />
    ));
  }, [isLoadingProximas, proximasEscalas]);

  const { hideLoading } = useLoading();

  if (isLoadingVoluntario || isLoadingProximas || isLoadingUltimaEscala) {
    return;
  } else {
    hideLoading();
  }

  // 🧱 Renderização principal
  return (
    <FancyModal
      {...props}
      containerStyle={{ padding: 0 }}
      center={
        voluntarioData?.length > 0 && (
          <View style={{ width: '100%' }}>
            <VoluntarioDetailsHeader
              voluntarioInfo={voluntarioData[0].voluntario!}
              onClose={onClose}
            />
            <View
              style={{
                padding: 20,
                paddingBottom: 30,
                gap: 15,
                backgroundColor: 'white',
                borderRadius: 10,
                marginTop: -6,
              }}
            >
              {/* Última Escala */}
              <FancySection
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'calendar',
                  size: 24,
                  color: '#4A90E2',
                }}
                title="Última Escala"
              >
                <View style={{ gap: 4 }}>{ultimaEscalaContent}</View>
              </FancySection>

              {/* Habilidades */}

              <FancySeparator />
              <FancySection
                icon={{
                  library: 'Entypo',
                  name: 'modern-mic',
                  size: 23,
                  color: '#8E7AEF',
                }}
                title="Habilidades"
              >
                <View style={{ gap: 5 }}>{habilidadesContent}</View>
              </FancySection>

              {/* Indisponibilidades */}
              <FancySeparator />
              <FancySection
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'cancel',
                  size: 26,
                  color: '#D36AC2',
                }}
                title="Indisponibilidades Futuras"
              >
                <View style={{ gap: 5 }}>{indisponibilidadesContent}</View>
              </FancySection>

              {/* Próximas escalas */}
              <FancySeparator />
              <FancySection
                icon={{
                  library: 'MaterialCommunityIcons',
                  name: 'calendar-arrow-right',
                  size: 25,
                  color: '#5AC8B0',
                }}
                title="Próximas Escalas"
              >
                <View style={{ gap: 4 }}>{proximasEscalasContent}</View>
              </FancySection>
            </View>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Pallete.border,
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    elevation: 0.4,
    gap: 20,
  },
});
