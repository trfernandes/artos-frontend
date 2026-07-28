import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyButton from '../../../../buttons/FancyButton';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import FancyGroup from '../../../../list/FancyGroup';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';

export interface AdicionarItemManualModalProps {
  visible: boolean;
  onClose: () => void;
  ministerioId: string;
  dataInicio: Date;
  dataTermino: Date;
  itensAtuais?: ResponseEscalaItemDto[];
  onConfirm: (data: AdicionarItemManualConfirmDialog) => Promise<void>;
}

export interface AdicionarItemManualConfirmDialog {
  eventoId: string;
  dataOcorrencia: string;
  funcaoId: string;
  voluntarioId?: string;
}

const AdicionarItemManualSchema = z.object({
  eventoId: z.string().min(1, 'Campo Obrigatório'),
  funcaoId: z.string().min(1, 'Campo Obrigatório'),
  voluntarioId: z.string().nullish(),
});

type AdicionarItemManualFormData = z.infer<typeof AdicionarItemManualSchema>;

export default function AdicionarItemManualModal({
  visible,
  onClose,
  ministerioId,
  dataInicio,
  dataTermino,
  itensAtuais,
  onConfirm,
}: AdicionarItemManualModalProps) {
  const palette = usePallete();

  const form = useForm({
    resolver: zodResolver(AdicionarItemManualSchema),
    defaultValues: { eventoId: '', funcaoId: '', voluntarioId: null },
  });
  const { control, handleSubmit, watch, setValue, reset, formState } = form;
  const selectedEvento = watch('eventoId');
  const selectedFuncao = watch('funcaoId');

  const { buscarPorIntervalo } = useEventosCrud({ autoFetch: false });
  const [isLoadingEventos, setIsLoadingEventos] = useState(false);
  const [eventosList, setEventosList] = useState<
    { title: string; subtitle?: string; value: string; dataOcorrencia: Date }[]
  >([]);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    (async () => {
      try {
        setIsLoadingEventos(true);
        const resultado = await buscarPorIntervalo({ dataInicio, dataTermino });
        if (!isMounted) return;

        const mapeados = (resultado ?? [])
          .filter((ocorrencia) => !ocorrencia?.cancelada)
          .map((ocorrencia) => {
            const dataOcorrencia = DateUtilsApi.dateTimeFromApi(ocorrencia.dataOcorrencia);
            return {
              title: ocorrencia.nome ?? 'Evento sem nome',
              subtitle: format(dataOcorrencia, 'dd/MM/yyyy'),
              value: ocorrencia.id!,
              dataOcorrencia,
            };
          });

        setEventosList(mapeados);
      } finally {
        if (isMounted) setIsLoadingEventos(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [visible, dataInicio, dataTermino]);

  const { data: funcoes, isLoading: isLoadingFuncoes } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: 'EQUALS' as any,
            value: { type: 'LITERAL' as any, value: ministerioId },
          },
        ],
      },
    },
  });
  const funcoesSearchList = funcoes.map((f) => ({ title: f.nome, value: f.id! }));

  const { ministerioVoluntariosList, isLoadingMinisterioVoluntarios } =
    useVoluntariosDoMinisterioCrud(ministerioId);

  const voluntariosSearchList = useMemo(() => {
    if (!ministerioVoluntariosList) return [];

    const jaAtribuidos = new Set(
      (itensAtuais ?? [])
        .filter((item) => item.eventoId === selectedEvento && item.voluntarioId)
        .map((item) => item.voluntarioId),
    );

    return ministerioVoluntariosList
      .filter((mv) => !selectedFuncao || mv.funcoes?.some((f) => f.funcao?.id === selectedFuncao))
      .filter((mv) => !jaAtribuidos.has(mv.id))
      .map((mv) => ({
        title: mv.voluntario?.nome ?? '',
        subtitle: mv.funcoes
          ?.map((f) => f.funcao?.nome)
          .filter(Boolean)
          .join(', '),
        value: mv.id ?? '',
      }));
  }, [ministerioVoluntariosList, selectedFuncao, selectedEvento, itensAtuais]);

  useEffect(() => {
    if (!visible) {
      reset({ eventoId: '', funcaoId: '', voluntarioId: null });
    }
  }, [visible, reset]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = handleSubmit(async (values: AdicionarItemManualFormData) => {
    const evento = eventosList.find((e) => e.value === values.eventoId);
    if (!evento) return;

    try {
      setIsSubmitting(true);
      await onConfirm({
        eventoId: values.eventoId,
        dataOcorrencia: format(evento.dataOcorrencia, 'yyyy-MM-dd'),
        funcaoId: values.funcaoId,
        voluntarioId: values.voluntarioId ?? undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const isBusy = isLoadingEventos || isLoadingFuncoes || isLoadingMinisterioVoluntarios;

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Adicionar Item à Escala'
      closeDisabled={isSubmitting}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <FancyButton
            type='outlined'
            label='Cancelar'
            onPress={onClose}
            disabled={isSubmitting}
            containerStyle={{ flex: 1 }}
          />
          <FancyButton
            type='contained'
            label='Adicionar'
            onPress={() => void handleConfirm()}
            isLoading={isSubmitting}
            loadingText='Adicionando...'
            disabled={isBusy}
            containerStyle={{ flex: 1 }}
          />
        </View>
      }
    >
      <View style={[styles.container, { pointerEvents: isBusy ? 'none' : 'auto' }]}>
        <FancyGroup contentContainerStyle={{ gap: 15 }}>
          <View style={{ gap: 8 }}>
            <View style={styles.sectionEyebrow}>
              <View style={[styles.sectionEyebrowTick, { backgroundColor: palette.primary }]} />
              <FancyText
                type='semiBold'
                size={10}
                color={palette.primary}
                style={styles.sectionEyebrowText}
              >
                SELECIONAR EVENTO
              </FancyText>
            </View>
            <ControlledSearchSelect
              control={control}
              name='eventoId'
              label='Evento'
              placeholder='Buscar evento...'
              listItems={eventosList}
              isLoading={isLoadingEventos}
              disabled={isSubmitting || isLoadingEventos}
              onChange={() => setValue('voluntarioId', null)}
            />
          </View>

          <View style={{ gap: 8 }}>
            <View style={styles.sectionEyebrow}>
              <View style={[styles.sectionEyebrowTick, { backgroundColor: palette.primary }]} />
              <FancyText
                type='semiBold'
                size={10}
                color={palette.primary}
                style={styles.sectionEyebrowText}
              >
                SELECIONAR FUNÇÃO
              </FancyText>
            </View>
            <ControlledSearchSelect
              control={control}
              name='funcaoId'
              label='Função'
              placeholder='Buscar função...'
              listItems={funcoesSearchList}
              isLoading={isLoadingFuncoes}
              disabled={isSubmitting || isLoadingFuncoes}
              onChange={() => setValue('voluntarioId', null)}
            />
          </View>

          <View style={{ gap: 8 }}>
            <View style={styles.sectionEyebrow}>
              <View style={[styles.sectionEyebrowTick, { backgroundColor: palette.primary }]} />
              <FancyText
                type='semiBold'
                size={10}
                color={palette.primary}
                style={styles.sectionEyebrowText}
              >
                SELECIONAR VOLUNTÁRIO (OPCIONAL)
              </FancyText>
            </View>
            <ControlledSearchSelect
              control={control}
              name='voluntarioId'
              label='Voluntário'
              placeholder='Buscar voluntário...'
              listItems={voluntariosSearchList}
              isLoading={isLoadingMinisterioVoluntarios}
              disabled={isSubmitting || isLoadingMinisterioVoluntarios}
            />
          </View>
        </FancyGroup>
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingTop: 0, paddingBottom: 10 },
  sectionEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionEyebrowTick: {
    width: 3,
    height: 11,
    borderRadius: 2,
  },
  sectionEyebrowText: {
    letterSpacing: 0.8,
  },
});
