import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancyButton from '../../../../buttons/FancyButton';
import DefaultIcons from '../../../../FancyIcons';
import { ColorUtils } from '../../../../../utils/color_utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import { useEscalaTemplatesCrud } from '../../../../../useEscalaTemplatesCrud';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { usePallete } from '../../../../../hooks/usePallete';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import {
  DynamicQuery,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../../domain/utils/query_utils';

export interface AdicionarItemManualModalProps {
  visible: boolean;
  onClose: () => void;
  ministerioId: string;
  dataInicio: Date;
  dataTermino: Date;
  itensAtuais?: ResponseEscalaItemDto[];
  onConfirm: (data: AdicionarItemManualConfirmDialog) => Promise<void>;
}

export interface AdicionarItemManualAtribuicao {
  funcaoId: string;
  voluntarioId: string;
}

export interface AdicionarItemManualConfirmDialog {
  eventoId: string;
  dataOcorrencia: string;
  atribuicoes: AdicionarItemManualAtribuicao[];
}

const AdicionarItemManualFuncaoSchema = z.object({
  funcaoId: z.string().min(1, 'Campo Obrigatório'),
  voluntarioId: z.string().min(1, 'Campo Obrigatório'),
});

type AdicionarItemManualFuncaoFormData = z.infer<typeof AdicionarItemManualFuncaoSchema>;

type EventoOcorrenciaOption = {
  id: string;
  chave: string;
  dataOcorrencia: Date;
};

type EventoGroupOption = {
  eventoId: string;
  nome: string;
  cor: string;
  ocorrencias: EventoOcorrenciaOption[];
};

type TemplateRow = {
  key: string;
  funcaoId: string;
  funcaoNome: string;
};

type FreeAssignment = {
  id: string;
  funcaoId: string;
  funcaoNome: string;
  voluntarioId: string;
};

function getPersonColor(palette: ReturnType<typeof usePallete>, seed: string): string {
  const options = palette.team;
  return options[seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % options.length];
}

function VoluntarioPillPicker({
  value,
  onChange,
  listItems,
  disabled,
  isLoading,
  nomeById,
  label,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  listItems: DropDownItemProps<string>[];
  disabled?: boolean;
  isLoading?: boolean;
  nomeById: Map<string, string>;
  label?: string;
}) {
  const palette = usePallete();
  const nome = value ? nomeById.get(value) : undefined;

  const personColor = useMemo(
    () => (value ? getPersonColor(palette, value) : undefined),
    [palette, value],
  );

  const initials = useMemo(() => {
    if (!nome) return '';
    const parts = nome.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }, [nome]);

  const searchListItems = useMemo<DropDownItemProps<string>[]>(
    () => listItems.map((item) => ({ title: item.title, value: item.value, subtitle: item.subtitle })),
    [listItems],
  );

  return (
    <FancySearchSelect<string>
      label={label}
      placeholder='Escolher voluntário...'
      value={value ?? undefined}
      onChange={(v) => onChange((Array.isArray(v) ? v[0] : v) ?? null)}
      listItems={searchListItems}
      isLoading={isLoading}
      disabled={disabled}
      title='Selecionar voluntário'
      searchPlaceholder='Buscar voluntário...'
      emptyMessage='Nenhum voluntário disponível'
      leadingColor={personColor}
      leadingAvatarText={initials || undefined}
    />
  );
}

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
    defaultValues: { funcaoId: '', voluntarioId: '' },
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

  const templatesParams = useMemo<DynamicQuery>(
    () => ({
      where: {
        conditions: [
          {
            path: 'ministerioId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
        ],
      },
      relations: ['funcoes.opcoes.funcao'],
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    }),
    [ministerioId],
  );

  const { data: templatesList = [], isLoading: isLoadingTemplates } = useEscalaTemplatesCrud({
    autoFetch: true,
    initialParams: templatesParams,
  });

  const templatesElegiveis = useMemo(
    () => (templatesList ?? []).filter((t) => (t.funcoes ?? []).some((f) => (f.opcoes ?? []).length > 0)),
    [templatesList],
  );

  const templatesDropDownList = useMemo(
    () => templatesElegiveis.map((t) => ({ title: t.nome, value: t.id ?? '' })),
    [templatesElegiveis],
  );

  const [usarTemplate, setUsarTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateSlots, setTemplateSlots] = useState<Record<string, (string | null)[]>>({});
  const [freeAssignments, setFreeAssignments] = useState<FreeAssignment[]>([]);
  const templateDefaultAppliedRef = useRef(false);

  const selectedTemplate = useMemo(
    () => templatesElegiveis.find((t) => t.id === selectedTemplateId) ?? null,
    [templatesElegiveis, selectedTemplateId],
  );

  const templateRows = useMemo<TemplateRow[]>(() => {
    if (!selectedTemplate) return [];
    return (selectedTemplate.funcoes ?? [])
      .filter((f) => (f.opcoes ?? []).length > 0)
      .map((f) => ({
        key: f.id,
        funcaoId: f.opcoes[0].funcaoId,
        funcaoNome: f.opcoes[0].funcao?.nome ?? 'Função',
      }));
  }, [selectedTemplate]);

  useEffect(() => {
    setTemplateSlots(Object.fromEntries(templateRows.map((r) => [r.key, [null]])));
  }, [templateRows]);

  useEffect(() => {
    if (!visible) {
      templateDefaultAppliedRef.current = false;
      return;
    }
    if (isLoadingTemplates || templateDefaultAppliedRef.current) return;
    templateDefaultAppliedRef.current = true;
    if (templatesElegiveis.length > 0) {
      setUsarTemplate(true);
      setSelectedTemplateId(templatesElegiveis[0].id ?? null);
    } else {
      setUsarTemplate(false);
      setSelectedTemplateId(null);
    }
  }, [visible, isLoadingTemplates, templatesElegiveis]);

  const voluntarioNomeById = useMemo(() => {
    const map = new Map<string, string>();
    (ministerioVoluntariosList ?? []).forEach((mv) => {
      if (mv.id) map.set(mv.id, mv.voluntario?.nome ?? '');
    });
    return map;
  }, [ministerioVoluntariosList]);

  const getVoluntariosListForFuncao = useCallback(
    (funcaoId: string, excludeIds: Set<string>): DropDownItemProps<string>[] => {
      const jaAtribuidos = new Set(
        (itensAtuais ?? [])
          .filter((item) => item.eventoId === selectedEventoId && item.voluntarioId)
          .map((item) => item.voluntarioId),
      );

      return (ministerioVoluntariosList ?? [])
        .filter((mv) => !funcaoId || mv.funcoes?.some((f) => f.funcao?.id === funcaoId))
        .filter((mv) => !!mv.id && !jaAtribuidos.has(mv.id) && !excludeIds.has(mv.id))
        .map((mv) => ({
          title: mv.voluntario?.nome ?? '',
          subtitle: mv.funcoes
            ?.map((f) => f.funcao?.nome)
            .filter(Boolean)
            .join(', '),
          value: mv.id ?? '',
        }));
    },
    [ministerioVoluntariosList, itensAtuais, selectedEventoId],
  );

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
    const ocorrenciasNaEscala = new Set(
      (itensAtuais ?? []).map((item) => `${item.eventoId}|${item.dataOcorrencia}`),
    );
    const grupos = new Map<string, EventoGroupOption>();
    const seenOcorrenciaIds = new Set<string>();

    for (const ocorrencia of rawOcorrenciasRef.current) {
      if (ocorrencia?.cancelada) continue;
      if (!ocorrencia.id) continue;
      const dataOcorrenciaIso = format(
        DateUtilsApi.dateTimeFromApi(ocorrencia.dataOcorrencia),
        'yyyy-MM-dd',
      );
      if (ocorrenciasNaEscala.has(`${ocorrencia.eventoId}|${dataOcorrenciaIso}`)) continue;
      const ocorrenciaKey = `${ocorrencia.id}|${dataOcorrenciaIso}`;
      if (seenOcorrenciaIds.has(ocorrenciaKey)) continue;
      seenOcorrenciaIds.add(ocorrenciaKey);

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
        chave: ocorrenciaKey,
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
      resetFuncaoForm({ funcaoId: '', voluntarioId: '' });
      setUsarTemplate(false);
      setSelectedTemplateId(null);
      setTemplateSlots({});
      setFreeAssignments([]);
    }
  }, [visible, resetFuncaoForm]);

  const selectedGrupo = useMemo(
    () => eventoGroups.find((g) => g.eventoId === selectedEventoId) ?? null,
    [eventoGroups, selectedEventoId],
  );

  const selectedOcorrencia = useMemo(
    () => selectedGrupo?.ocorrencias.find((o) => o.chave === selectedOcorrenciaId) ?? null,
    [selectedGrupo, selectedOcorrenciaId],
  );

  const eventoOptions = useMemo(
    () => eventoGroups.map((g) => ({ title: g.nome, value: g.eventoId })),
    [eventoGroups],
  );

  const dataOptions = useMemo(
    () =>
      (selectedGrupo?.ocorrencias ?? []).map((ocorrencia) => ({
        title: format(ocorrencia.dataOcorrencia, "EEEE, dd 'de' MMMM", { locale: ptBR }),
        value: ocorrencia.chave,
      })),
    [selectedGrupo],
  );

  const handleSelectEvento = (eventoId: string | null) => {
    setSelectedEventoId(eventoId);
    const grupo = eventoGroups.find((g) => g.eventoId === eventoId) ?? null;
    setSelectedOcorrenciaId(grupo?.ocorrencias.length === 1 ? grupo.ocorrencias[0].chave : null);
    setFreeAssignments([]);
    setTemplateSlots(Object.fromEntries(templateRows.map((r) => [r.key, [null]])));
    resetFuncaoForm({ funcaoId: '', voluntarioId: '' });
  };

  const handleAddAtribuicaoLivre = handleSubmit((values) => {
    const funcaoNome = funcoes.find((f) => f.id === values.funcaoId)?.nome ?? '';
    setFreeAssignments((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        funcaoId: values.funcaoId,
        funcaoNome,
        voluntarioId: values.voluntarioId,
      },
    ]);
    resetFuncaoForm({ funcaoId: '', voluntarioId: '' });
  });

  const assignments = useMemo<AdicionarItemManualAtribuicao[]>(() => {
    if (usarTemplate && selectedTemplate) {
      const list: AdicionarItemManualAtribuicao[] = [];
      for (const row of templateRows) {
        for (const voluntarioId of templateSlots[row.key] ?? []) {
          if (voluntarioId) list.push({ funcaoId: row.funcaoId, voluntarioId });
        }
      }
      return list;
    }
    return freeAssignments.map((a) => ({ funcaoId: a.funcaoId, voluntarioId: a.voluntarioId }));
  }, [usarTemplate, selectedTemplate, templateRows, templateSlots, freeAssignments]);

  const handleFinalConfirm = async () => {
    if (!selectedOcorrencia || assignments.length === 0) return;
    try {
      setIsSubmitting(true);
      await onConfirm({
        eventoId: selectedOcorrencia.id,
        dataOcorrencia: format(selectedOcorrencia.dataOcorrencia, 'yyyy-MM-dd'),
        atribuicoes: assignments,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy =
    isLoadingEventos || isLoadingFuncoes || isLoadingMinisterioVoluntarios || isLoadingTemplates;

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
            label={assignments.length > 0 ? `Adicionar (${assignments.length})` : 'Adicionar'}
            onPress={() => void handleFinalConfirm()}
            isLoading={isSubmitting}
            loadingText='Adicionando...'
            disabled={isBusy || !selectedOcorrencia || assignments.length === 0}
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
          <View style={{ gap: 16 }}>
            {eventoOptions.length === 0 ? (
              <FancyText size='small' color={palette.fonts.inactive}>
                Nenhum evento disponível no período.
              </FancyText>
            ) : (
              <View style={{ gap: 12 }}>
                <FancySearchSelect<string>
                  label='Evento'
                  placeholder='Buscar evento...'
                  searchPlaceholder='Buscar evento...'
                  value={selectedEventoId ?? undefined}
                  onChange={(v) => handleSelectEvento((Array.isArray(v) ? v[0] : v) ?? null)}
                  listItems={eventoOptions}
                  disabled={isSubmitting}
                  leadingColor={selectedGrupo?.cor}
                  selectedSubtitle={
                    selectedGrupo
                      ? `${selectedGrupo.ocorrencias.length} ${selectedGrupo.ocorrencias.length === 1 ? 'data disponível' : 'datas disponíveis'} no período`
                      : undefined
                  }
                />
                {selectedEventoId && (
                  <FancySearchSelect<string>
                    label='Data'
                    placeholder='Selecionar data...'
                    searchPlaceholder='Buscar data...'
                    value={selectedOcorrenciaId ?? undefined}
                    onChange={(v) => setSelectedOcorrenciaId((Array.isArray(v) ? v[0] : v) ?? null)}
                    listItems={dataOptions}
                    disabled={isSubmitting}
                    icon={{ library: 'Feather', name: 'calendar' }}
                  />
                )}
              </View>
            )}

            {selectedOcorrencia && (
              <View style={{ gap: 14 }}>
                <View style={[styles.dateDivider, { backgroundColor: palette.borderCard }]} />

                {templatesElegiveis.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      disabled={isSubmitting}
                      onPress={() => {
                        setUsarTemplate(true);
                        if (!selectedTemplateId) setSelectedTemplateId(templatesElegiveis[0].id ?? null);
                      }}
                      style={[
                        styles.modeCard,
                        {
                          borderColor: usarTemplate ? palette.primary : palette.borderCard,
                          backgroundColor: usarTemplate
                            ? ColorUtils.withAlpha(palette.primary, 0.08)
                            : palette.backgroundColor,
                        },
                      ]}
                    >
                      <FancyText type='bold' size='small' color={palette.fonts.dark}>
                        Com template
                      </FancyText>
                      <FancyText size='extraSmall' color={palette.fonts.inactive}>
                        Já vem com as funções da equipe padrão
                      </FancyText>
                    </Pressable>
                    <Pressable
                      disabled={isSubmitting}
                      onPress={() => setUsarTemplate(false)}
                      style={[
                        styles.modeCard,
                        {
                          borderColor: !usarTemplate ? palette.primary : palette.borderCard,
                          backgroundColor: !usarTemplate
                            ? ColorUtils.withAlpha(palette.primary, 0.08)
                            : palette.backgroundColor,
                        },
                      ]}
                    >
                      <FancyText type='bold' size='small' color={palette.fonts.dark}>
                        Manual
                      </FancyText>
                      <FancyText size='extraSmall' color={palette.fonts.inactive}>
                        Você escolhe função por função
                      </FancyText>
                    </Pressable>
                  </View>
                )}

                {usarTemplate && templatesElegiveis.length >= 2 && (
                  <FancySearchSelect<string>
                    label='Template'
                    placeholder='Selecionar template...'
                    value={selectedTemplateId ?? undefined}
                    onChange={(v) => setSelectedTemplateId((Array.isArray(v) ? v[0] : v) ?? null)}
                    listItems={templatesDropDownList}
                    disabled={isSubmitting}
                  />
                )}

                {usarTemplate && selectedTemplate ? (
                  <View style={{ gap: 16 }}>
                    {templateRows.map((row) => {
                      const slots = templateSlots[row.key] ?? [null];
                      const usedIds = new Set(slots.filter((v): v is string => !!v));
                      const lastSlotFilled = !!slots[slots.length - 1];
                      return (
                        <View key={row.key} style={{ gap: 8 }}>
                          <FancyText type='semiBold' size='small' color={palette.fonts.dark}>
                            {row.funcaoNome}
                          </FancyText>
                          {slots.map((slotValue, index) => (
                            <View key={index} style={styles.slotRow}>
                              <View style={{ flex: 1 }}>
                                <VoluntarioPillPicker
                                  value={slotValue}
                                  disabled={isSubmitting}
                                  isLoading={isLoadingMinisterioVoluntarios}
                                  nomeById={voluntarioNomeById}
                                  listItems={getVoluntariosListForFuncao(
                                    row.funcaoId,
                                    new Set(
                                      Array.from(usedIds).filter((id) => id !== slotValue),
                                    ),
                                  )}
                                  onChange={(value) => {
                                    setTemplateSlots((prev) => {
                                      const current = [...(prev[row.key] ?? [null])];
                                      current[index] = value;
                                      return { ...prev, [row.key]: current };
                                    });
                                  }}
                                />
                              </View>
                              {index > 0 && (
                                <Pressable
                                  disabled={isSubmitting}
                                  onPress={() =>
                                    setTemplateSlots((prev) => {
                                      const current = [...(prev[row.key] ?? [])];
                                      current.splice(index, 1);
                                      return { ...prev, [row.key]: current };
                                    })
                                  }
                                  style={styles.removeSlotButton}
                                >
                                  <DefaultIcons.Custom
                                    library='Feather'
                                    name='x'
                                    size={16}
                                    color={palette.fonts.inactive}
                                  />
                                </Pressable>
                              )}
                            </View>
                          ))}
                          {lastSlotFilled && (
                            <Pressable
                              disabled={isSubmitting}
                              onPress={() =>
                                setTemplateSlots((prev) => ({
                                  ...prev,
                                  [row.key]: [...(prev[row.key] ?? []), null],
                                }))
                              }
                            >
                              <FancyText type='semiBold' size='extraSmall' color={palette.primary}>
                                + Adicionar mais uma pessoa
                              </FancyText>
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    <ControlledSearchSelect
                      control={control}
                      name='funcaoId'
                      label='Função'
                      placeholder='Buscar função...'
                      listItems={funcoesSearchList}
                      isLoading={isLoadingFuncoes}
                      disabled={isSubmitting || isLoadingFuncoes}
                    />
                    <VoluntarioPillPicker
                      label='Voluntário'
                      value={watch('voluntarioId') || null}
                      disabled={isSubmitting}
                      isLoading={isLoadingMinisterioVoluntarios}
                      nomeById={voluntarioNomeById}
                      listItems={getVoluntariosListForFuncao(
                        selectedFuncao,
                        new Set(
                          freeAssignments
                            .filter((a) => a.funcaoId === selectedFuncao)
                            .map((a) => a.voluntarioId),
                        ),
                      )}
                      onChange={(value) => setValue('voluntarioId', value ?? '')}
                    />
                    <Pressable
                      onPress={() => void handleAddAtribuicaoLivre()}
                      disabled={isSubmitting}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <FancyText type='semiBold' size='small' color={palette.primary}>
                        + Adicionar atribuição
                      </FancyText>
                    </Pressable>

                    {freeAssignments.length > 0 && (
                      <View style={{ gap: 8 }}>
                        {freeAssignments.map((a) => (
                          <View key={a.id} style={styles.assignmentRow}>
                            <View style={{ flex: 1 }}>
                              <FancyText type='semiBold' size='small' color={palette.fonts.dark}>
                                {a.funcaoNome}
                              </FancyText>
                              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                                {voluntarioNomeById.get(a.voluntarioId) ?? ''}
                              </FancyText>
                            </View>
                            <Pressable
                              disabled={isSubmitting}
                              onPress={() =>
                                setFreeAssignments((prev) => prev.filter((x) => x.id !== a.id))
                              }
                              style={styles.removeSlotButton}
                            >
                              <DefaultIcons.Custom
                                library='Feather'
                                name='x'
                                size={16}
                                color={palette.fonts.inactive}
                              />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
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
  dateDivider: {
    height: 1,
  },
  modeCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeSlotButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
});
