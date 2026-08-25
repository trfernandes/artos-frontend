import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyButton from '../../../../buttons/FancyButton';
import DefaultIcons from '../../../../FancyIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';

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

const AdicionarItemManualFuncaoSchema = z.object({
  funcaoId: z.string().min(1, 'Campo Obrigatório'),
  voluntarioId: z.string().nullish(),
});

type AdicionarItemManualFuncaoFormData = z.infer<typeof AdicionarItemManualFuncaoSchema>;

type EventoOcorrenciaOption = {
  id: string;
  dataOcorrencia: Date;
};

type EventoGroupOption = {
  eventoId: string;
  nome: string;
  cor: string;
  ocorrencias: EventoOcorrenciaOption[];
};

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

  const funcaoForm = useForm<AdicionarItemManualFuncaoFormData>({
    resolver: zodResolver(AdicionarItemManualFuncaoSchema),
    defaultValues: { funcaoId: '', voluntarioId: null },
  });
  const { control, handleSubmit, watch, setValue, reset: resetFuncaoForm } = funcaoForm;
  const selectedFuncao = watch('funcaoId');

  const { buscarPorIntervalo } = useEventosCrud({ autoFetch: false });
  const [isLoadingEventos, setIsLoadingEventos] = useState(false);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);
  const [selectedOcorrenciaId, setSelectedOcorrenciaId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: funcoes, isLoading: isLoadingFuncoes } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
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
        .filter((item) => item.eventoId === selectedEventoId && item.voluntarioId)
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
  }, [ministerioVoluntariosList, selectedFuncao, selectedEventoId, itensAtuais]);

  type RawOcorrencia = Awaited<ReturnType<typeof buscarPorIntervalo>>[number];
  const rawOcorrenciasRef = useRef<RawOcorrencia[]>([]);
  const fetchedKeyRef = useRef<string>('');

  useEffect(() => {
    if (!visible) return;

    const key = `${dataInicio.toISOString()}|${dataTermino.toISOString()}`;
    if (fetchedKeyRef.current === key) return;

    let isMounted = true;
    (async () => {
      try {
        setIsLoadingEventos(true);
        const resultado = await buscarPorIntervalo({ dataInicio, dataTermino });
        if (!isMounted) return;
        rawOcorrenciasRef.current = resultado ?? [];
        fetchedKeyRef.current = key;
      } finally {
        if (isMounted) setIsLoadingEventos(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [visible, dataInicio, dataTermino]);

  const eventoGroups = useMemo<EventoGroupOption[]>(() => {
    const jaNaEscala = new Set((itensAtuais ?? []).map((item) => item.eventoId));
    const grupos = new Map<string, EventoGroupOption>();
    const seenOcorrenciaIds = new Set<string>();

    for (const ocorrencia of rawOcorrenciasRef.current) {
      if (ocorrencia?.cancelada) continue;
      if (!ocorrencia.id || jaNaEscala.has(ocorrencia.eventoId)) continue;
      if (seenOcorrenciaIds.has(ocorrencia.id)) continue;
      seenOcorrenciaIds.add(ocorrencia.id);

      const chave = ocorrencia.eventoId;
      let grupo = grupos.get(chave);
      if (!grupo) {
        grupo = {
          eventoId: chave,
          nome: ocorrencia.nome ?? 'Evento sem nome',
          cor: ocorrencia.cor,
          ocorrencias: [],
        };
        grupos.set(chave, grupo);
      }
      grupo.ocorrencias.push({
        id: ocorrencia.id,
        dataOcorrencia: DateUtilsApi.dateTimeFromApi(ocorrencia.dataOcorrencia),
      });
    }

    for (const grupo of grupos.values()) {
      grupo.ocorrencias.sort((a, b) => a.dataOcorrencia.getTime() - b.dataOcorrencia.getTime());
    }

    return Array.from(grupos.values());
  }, [isLoadingEventos, itensAtuais]);

  useEffect(() => {
    if (!visible) {
      setSelectedEventoId(null);
      setSelectedOcorrenciaId(null);
      resetFuncaoForm({ funcaoId: '', voluntarioId: null });
    }
  }, [visible, resetFuncaoForm]);

  const selectedGrupo = useMemo(
    () => eventoGroups.find((g) => g.eventoId === selectedEventoId) ?? null,
    [eventoGroups, selectedEventoId],
  );

  const selectedOcorrencia = useMemo(
    () => selectedGrupo?.ocorrencias.find((o) => o.id === selectedOcorrenciaId) ?? null,
    [selectedGrupo, selectedOcorrenciaId],
  );

  const handleSelectEvento = (grupo: EventoGroupOption) => {
    setSelectedEventoId(grupo.eventoId);
    setSelectedOcorrenciaId(grupo.ocorrencias.length === 1 ? grupo.ocorrencias[0].id : null);
    setValue('voluntarioId', null);
  };

  const handleConfirm = handleSubmit(async (values: AdicionarItemManualFuncaoFormData) => {
    if (!selectedOcorrencia) return;

    try {
      setIsSubmitting(true);
      await onConfirm({
        eventoId: selectedOcorrencia.id,
        dataOcorrencia: format(selectedOcorrencia.dataOcorrencia, 'yyyy-MM-dd'),
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
      title='Selecionar Evento'
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
            disabled={isBusy || !selectedOcorrencia}
            containerStyle={{ flex: 1 }}
          />
        </View>
      }
    >
      <View style={[styles.container, { pointerEvents: isBusy ? 'none' : 'auto' }]}>
        {isLoadingEventos && !isSubmitting ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size='large' color={palette.primary} />
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {eventoGroups.length === 0 && (
              <FancyText size='small' color={palette.fonts.inactive}>
                Nenhum evento disponível no período.
              </FancyText>
            )}

            <View style={{ gap: 10 }}>
              {eventoGroups.map((grupo) => {
                const isSelected = grupo.eventoId === selectedEventoId;
                const showDatePicker = isSelected;
                return (
                  <Pressable
                    key={grupo.eventoId}
                    onPress={() => handleSelectEvento(grupo)}
                    disabled={isSubmitting}
                    style={[
                      styles.eventoCard,
                      isSelected
                        ? {
                            borderColor: palette.primary,
                            backgroundColor: ColorUtils.withAlpha(palette.primary, 0.06),
                          }
                        : {
                            borderColor: 'transparent',
                            backgroundColor: palette.backgroundColor2,
                            ...palette.shadows[100],
                          },
                    ]}
                  >
                    <View style={styles.eventoCardRow}>
                      <View
                        style={[
                          styles.eventoIcon,
                          { backgroundColor: ColorUtils.withAlpha(grupo.cor, 0.16) },
                        ]}
                      >
                        <DefaultIcons.Custom
                          library='MaterialCommunityIcons'
                          name='calendar-outline'
                          size={20}
                          color={grupo.cor}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <FancyText type='semiBold' size='small' color={palette.fonts.dark}>
                          {grupo.nome}
                        </FancyText>
                        <FancyText size='extraSmall' color={palette.fonts.inactive}>
                          {grupo.ocorrencias.length}{' '}
                          {grupo.ocorrencias.length === 1 ? 'data no período' : 'datas no período'}
                        </FancyText>
                      </View>
                      {isSelected && selectedOcorrenciaId && (
                        <DefaultIcons.Custom
                          library='MaterialCommunityIcons'
                          name='check-circle'
                          size={22}
                          color={palette.primary}
                        />
                      )}
                    </View>

                    {showDatePicker && (
                      <>
                        <View
                          style={[styles.dateDivider, { backgroundColor: palette.borderCard }]}
                        />
                        <FancyText size='extraSmall' color={palette.fonts.inactive}>
                          Escolha a data:
                        </FancyText>
                        <View style={styles.chipRow}>
                          {grupo.ocorrencias.map((ocorrencia) => {
                            const isChipSelected = ocorrencia.id === selectedOcorrenciaId;
                            return (
                              <Pressable
                                key={ocorrencia.id}
                                onPress={() => setSelectedOcorrenciaId(ocorrencia.id)}
                                disabled={isSubmitting}
                                style={[
                                  styles.chip,
                                  {
                                    backgroundColor: isChipSelected
                                      ? palette.primary
                                      : palette.backgroundColor,
                                    borderColor: isChipSelected
                                      ? palette.primary
                                      : palette.borderCard,
                                  },
                                ]}
                              >
                                <FancyText
                                  type='semiBold'
                                  size='extraSmall'
                                  color={isChipSelected ? palette.fonts.light : palette.fonts.dark}
                                >
                                  {format(ocorrencia.dataOcorrencia, 'EEE, dd MMM', {
                                    locale: ptBR,
                                  })}
                                </FancyText>
                              </Pressable>
                            );
                          })}
                        </View>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {selectedOcorrencia && (
              <View style={{ gap: 14 }}>
                <View style={[styles.dateDivider, { backgroundColor: palette.borderCard }]} />
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
                <ControlledSearchSelect
                  control={control}
                  name='voluntarioId'
                  label='Voluntário (opcional)'
                  placeholder='Buscar voluntário...'
                  listItems={voluntariosSearchList}
                  isLoading={isLoadingMinisterioVoluntarios}
                  disabled={isSubmitting || isLoadingMinisterioVoluntarios}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingTop: 0, paddingBottom: 10 },
  loadingCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  eventoCard: {
    flexDirection: 'column',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    minHeight: 44,
  },
  eventoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDivider: {
    height: 1,
    marginHorizontal: -12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 36,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
