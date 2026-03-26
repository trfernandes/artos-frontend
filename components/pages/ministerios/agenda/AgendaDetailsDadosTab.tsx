import { StyleSheet, View } from 'react-native';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import FancyContainer from '../../../FancyContainer';
import FancyBottomSheetSelect from '../../../fields/FancyBottomSheetSelect';
import FancyButton from '../../../buttons/FancyButton';
import FancyChips from '../../../FancyChips';
import FancyLoading from '../../../FancyLoading';
import FancyText from '../../../FancyText';
import EventoInfoCard from '../../common/EventoInfoCard';
import ModernTimePickerField from '../../../time_picker/ModernTimePickerField';
import { FancyAlert } from '../../../modal/FancyAlert';
import { useEscalaTemplatesCrud } from '../../../../useEscalaTemplatesCrud';
import { Conjunction, Operator, OrderDirection, ValueType } from '../../../../domain/utils/query_utils';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { Pallete } from '../../../../constants/colors';
import { DefaultIconsNames } from '../../../../constants/icons';
import { ResponseEventoDto } from '../../../../domain/dtos/Evento/evento.response';
import { ResponseEventoOcorrenciaDto } from '../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { EscalaTemplateTipoLabel } from '../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { useEventoTemplatePadrao } from '../../../../hooks/useEventoTemplatePadrao';
import { useEventoEnsaio } from '../../../../hooks/useEventoEnsaio';
import { useEventoSetlistResponsavel } from '../../../../hooks/useEventoSetlistResponsavel';
import { TemplatePadraoOrigemEnum } from '../../../../domain/enums/Evento/template-padrao-origem.enum';
import { TemplatePadraoEscopoEnum } from '../../../../domain/enums/Evento/template-padrao-escopo.enum';
import { MinisterioTipoEnum } from '../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { getApiErrorMessage } from '../../../../domain/api/api-error';
import { useAuth } from '../../../../contexts/AuthContext';
import { IgrejaVoluntarioRoleEnum } from '../../../../domain/enums/Igreja/voluntario-role.enum';
import { useEscalaItensCrud } from '../../../../hooks/useEscalaItensCrud';
import { DateUtilsApi } from '../../../../utils/date_utils';

const TemplatePadraoOrigemLabel = {
  EVENTO: 'Padrão do evento',
  SERIE: 'Aplicado nesta série',
  OCORRENCIA: 'Ajuste desta ocorrência',
} as const;

const EnsaioOrigemLabel = {
  EVENTO: 'Padrão do evento',
  SERIE: 'Aplicado nesta série',
  OCORRENCIA: 'Ajuste desta ocorrência',
} as const;

const ResponsavelSetlistOrigemLabel = {
  EVENTO: 'Herdado do template',
  SERIE: 'Aplicado nesta série',
  OCORRENCIA: 'Ajuste desta ocorrência',
} as const;

type HourMinute = { hour: number; minute: number };
type ScopePromptResult = TemplatePadraoEscopoEnum | 'cancel';

export type AgendaDetailsDadosTabActions = {
  saveAllChanges: () => Promise<boolean>;
  discardUnsavedChanges: () => void;
};

function parseTimeToHourMinute(time?: string): HourMinute | undefined {
  if (!time) return undefined;
  const parts = time.split(':');
  if (parts.length < 2) return undefined;
  return { hour: parseInt(parts[0], 10), minute: parseInt(parts[1], 10) };
}

function formatHourMinuteToTime(hm: HourMinute): string {
  return `${String(hm.hour).padStart(2, '0')}:${String(hm.minute).padStart(2, '0')}`;
}

function formatTimeForDisplay(time?: string): string {
  const parsed = parseTimeToHourMinute(time);
  if (!parsed) return 'Não definido';
  return formatHourMinuteToTime(parsed);
}

function serializeHourMinute(value?: HourMinute): string {
  return value ? formatHourMinuteToTime(value) : '';
}

function normalizeSelectValue(value?: string | null) {
  return value ?? '';
}

function OccurrenceFieldSection({
  label,
  origin,
  dirty,
  editor,
}: {
  label: string;
  origin?: string | null;
  dirty: boolean;
  editor: ReactNode;
}) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeader}>
        <FancyText size='extraSmall' type='semiBold' color={Pallete.fonts.inactive}>
          {label}
        </FancyText>
        {dirty ? (
          <FancyChips
            label='Alterado'
            size='small'
            color={Pallete.primary}
            style={styles.dirtyChip}
            labelProps={{ size: 'extraSmall' }}
          />
        ) : null}
      </View>

      {origin ? (
        <View style={styles.sectionSummary}>
          <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive}>
            {origin}
          </FancyText>
        </View>
      ) : null}

      <View style={styles.sectionEditorField}>{editor}</View>
    </View>
  );
}

export default function AgendaDetailsDadosTab(props: {
  ministerioId: string;
  dataOcorrenciaIso: string;
  dataOcorrenciaDate: Date;
  evento: ResponseEventoDto;
  ocorrencia?: ResponseEventoOcorrenciaDto;
  onTemplateSaved?: () => Promise<void> | void;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
  onRegisterActions?: (actions: AgendaDetailsDadosTabActions) => void;
}) {
  const { igrejaAtiva } = useAuth();
  const canUpdateTemplate = igrejaAtiva?.role !== IgrejaVoluntarioRoleEnum.VOLUNTARIO;
  const isLouvorMinisterio = useMemo(
    () => igrejaAtiva?.ministerios?.some((ministerio) => ministerio.id === props.ministerioId && ministerio.tipo === MinisterioTipoEnum.Louvor) ?? false,
    [igrejaAtiva?.ministerios, props.ministerioId],
  );
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
      ...([{ title: 'Nenhum', subtitle: '', value: '' }] as DropDownItemProps<string>[]),
      ...templates.map(
        (t) =>
          ({
            title: t.nome,
            subtitle: EscalaTemplateTipoLabel[t.tipo],
            value: t.id,
          }) as DropDownItemProps<string>,
      ),
    ];
    return list;
  }, [templates]);

  const { salvarTemplatePadrao, removerTemplatePadrao, isSavingTemplatePadrao } = useEventoTemplatePadrao();
  const { salvarEnsaio, removerEnsaio, isSavingEnsaio } = useEventoEnsaio();
  const { salvarResponsavelSetlist, removerResponsavelSetlist, isSavingResponsavelSetlist } = useEventoSetlistResponsavel();
  const escalaSearchParams = useMemo(
    () => ({
      where: {
        conjunction: Conjunction.AND,
        conditions: [
          {
            path: 'evento.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: props.ocorrencia?.eventoId || props.evento.id },
          },
          {
            path: 'dataOcorrencia',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: DateUtilsApi.dateOnlyToApi(props.dataOcorrenciaDate) },
          },
        ],
      },
      relations: ['voluntario', 'voluntario.voluntario', 'funcao'],
      orderBy: [{ path: 'funcao.nome', direction: OrderDirection.ASC }],
    }),
    [props.dataOcorrenciaDate, props.evento.id, props.ocorrencia?.eventoId],
  );
  const { data: escalaItens = [] } = useEscalaItensCrud({
    autoFetch: true,
    initialParams: escalaSearchParams,
    includeFotos: true,
    muteMessages: true,
  });

  const resolvedTemplateId = useMemo(
    () => props.ocorrencia?.templatePadraoId ?? props.evento.templatePadraoId ?? props.evento.templatePadrao?.id ?? '',
    [props.evento.templatePadrao?.id, props.evento.templatePadraoId, props.ocorrencia?.templatePadraoId],
  );

  const resolvedEnsaio = useMemo(
    () => parseTimeToHourMinute(props.ocorrencia?.horarioEnsaio ?? props.evento.horarioEnsaioPadrao),
    [props.evento.horarioEnsaioPadrao, props.ocorrencia?.horarioEnsaio],
  );

  const resolvedEnsaioDisplay = useMemo(
    () => formatTimeForDisplay(props.ocorrencia?.horarioEnsaio ?? props.evento.horarioEnsaioPadrao),
    [props.evento.horarioEnsaioPadrao, props.ocorrencia?.horarioEnsaio],
  );
  const resolvedResponsavelSetlistId = useMemo(
    () => normalizeSelectValue(props.ocorrencia?.responsavelSetlistVoluntarioId),
    [props.ocorrencia?.responsavelSetlistVoluntarioId],
  );

  const resolvedTemplateName = useMemo(() => {
    const resolvedTemplate =
      props.ocorrencia?.templatePadrao?.nome ??
      props.evento.templatePadrao?.nome ??
      templates.find((template) => template.id === resolvedTemplateId)?.nome;

    return resolvedTemplate ?? 'Nenhum template definido';
  }, [props.evento.templatePadrao?.nome, props.ocorrencia?.templatePadrao?.nome, resolvedTemplateId, templates]);

  const [templateId, setTemplateId] = useState<string>(resolvedTemplateId);
  const [ensaioTime, setEnsaioTime] = useState<HourMinute | undefined>(resolvedEnsaio);
  const [responsavelSetlistId, setResponsavelSetlistId] = useState<string>(resolvedResponsavelSetlistId);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const previousResolvedTemplateIdRef = useRef(resolvedTemplateId);
  const previousResolvedEnsaioRef = useRef(serializeHourMinute(resolvedEnsaio));
  const previousResolvedResponsavelRef = useRef(resolvedResponsavelSetlistId);

  useEffect(() => {
    setTemplateId((currentTemplateId) => {
      const previousResolvedTemplateId = previousResolvedTemplateIdRef.current;
      const hasLocalEdits = currentTemplateId !== previousResolvedTemplateId;
      previousResolvedTemplateIdRef.current = resolvedTemplateId;
      return hasLocalEdits ? currentTemplateId : resolvedTemplateId;
    });
  }, [resolvedTemplateId]);

  useEffect(() => {
    const nextResolvedEnsaio = serializeHourMinute(resolvedEnsaio);
    setEnsaioTime((currentEnsaioTime) => {
      const previousResolvedEnsaio = previousResolvedEnsaioRef.current;
      const hasLocalEdits = serializeHourMinute(currentEnsaioTime) !== previousResolvedEnsaio;
      previousResolvedEnsaioRef.current = nextResolvedEnsaio;
      return hasLocalEdits ? currentEnsaioTime : resolvedEnsaio;
    });
  }, [resolvedEnsaio]);

  useEffect(() => {
    setResponsavelSetlistId((currentValue) => {
      const previousResolved = previousResolvedResponsavelRef.current;
      const hasLocalEdits = currentValue !== previousResolved;
      previousResolvedResponsavelRef.current = resolvedResponsavelSetlistId;
      return hasLocalEdits ? currentValue : resolvedResponsavelSetlistId;
    });
  }, [resolvedResponsavelSetlistId]);

  const templateDirty = templateId !== resolvedTemplateId;
  const ensaioDirty = serializeHourMinute(ensaioTime) !== serializeHourMinute(resolvedEnsaio);
  const responsavelSetlistDirty = isLouvorMinisterio && responsavelSetlistId !== resolvedResponsavelSetlistId;
  const hasUnsavedChanges = canUpdateTemplate && (templateDirty || ensaioDirty || responsavelSetlistDirty);
  const pendingChangesCount = Number(templateDirty) + Number(ensaioDirty) + Number(responsavelSetlistDirty);
  const isMutating = isSavingAll || isSavingTemplatePadrao || isSavingEnsaio || isSavingResponsavelSetlist;

  const origemEnsaioLabel = useMemo(() => {
    const origem =
      props.ocorrencia?.horarioEnsaioOrigem ??
      (props.evento.horarioEnsaioPadrao ? TemplatePadraoOrigemEnum.EVENTO : undefined);
    if (!origem) return null;
    return EnsaioOrigemLabel[origem as keyof typeof EnsaioOrigemLabel] || null;
  }, [props.evento.horarioEnsaioPadrao, props.ocorrencia?.horarioEnsaioOrigem]);

  const origemTemplateLabel = useMemo(() => {
    const origem = props.ocorrencia?.templatePadraoOrigem ?? props.evento.templatePadraoOrigem;
    if (!origem) return null;
    return TemplatePadraoOrigemLabel[origem as keyof typeof TemplatePadraoOrigemLabel] || null;
  }, [props.evento.templatePadraoOrigem, props.ocorrencia?.templatePadraoOrigem]);

  const origemResponsavelSetlistLabel = useMemo(() => {
    const origem = props.ocorrencia?.responsavelSetlistOrigem;
    if (!origem) return null;
    return ResponsavelSetlistOrigemLabel[origem as keyof typeof ResponsavelSetlistOrigemLabel] || null;
  }, [props.ocorrencia?.responsavelSetlistOrigem]);

  const voluntariosEscaladosOptions = useMemo<DropDownItemProps<string>[]>(
    () => [
      { title: 'Nenhum', value: '' },
      ...escalaItens
        .filter((item) => item.voluntario?.voluntario?.id)
        .map((item) => ({
          title: item.voluntario?.voluntario?.nome || 'Voluntário',
          subtitle: item.funcao?.nome || '',
          value: item.voluntario?.voluntario?.id || '',
        }))
        .filter((item, index, array) => item.value && array.findIndex((entry) => entry.value === item.value) === index),
    ],
    [escalaItens],
  );

  const getTemplateDefaultResponsavelId = useCallback(
    (nextTemplateId: string) => {
      if (!nextTemplateId) return '';
      const selectedTemplate = templates.find((template) => template.id === nextTemplateId);
      if (!selectedTemplate) return '';
      if (selectedTemplate.respSetListVoluntarios?.id) {
        return selectedTemplate.respSetListVoluntarios.id;
      }
      const funcaoId = selectedTemplate.respSetListFuncoes?.id;
      if (!funcaoId) return '';
      return (
        escalaItens.find((item) => item.funcao?.id === funcaoId && item.voluntario?.voluntario?.id)?.voluntario?.voluntario?.id || ''
      );
    },
    [escalaItens, templates],
  );

  useEffect(() => {
    if (!templateDirty) return;
    setResponsavelSetlistId((currentValue) => {
      const defaultResponsavel = getTemplateDefaultResponsavelId(templateId);
      return currentValue === resolvedResponsavelSetlistId ? defaultResponsavel : currentValue;
    });
  }, [getTemplateDefaultResponsavelId, resolvedResponsavelSetlistId, templateDirty, templateId]);

  const discardUnsavedChanges = useCallback(() => {
    setTemplateId(resolvedTemplateId);
    setEnsaioTime(resolvedEnsaio);
    setResponsavelSetlistId(resolvedResponsavelSetlistId);
  }, [resolvedEnsaio, resolvedResponsavelSetlistId, resolvedTemplateId]);

  useEffect(() => {
    props.onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, props]);

  const promptScope = useCallback((fieldLabel: string): Promise<ScopePromptResult> => {
    return new Promise((resolve) => {
      FancyAlert.alert(
        `Como deseja aplicar ${fieldLabel.toLowerCase()}?`,
        'Você pode aplicar só nesta data ou para esta e as próximas ocorrências.',
        [
          { text: 'Cancelar', style: 'destructive', onPress: () => resolve('cancel') },
          { text: 'Apenas nesta data', onPress: () => resolve(TemplatePadraoEscopoEnum.OCORRENCIA) },
          { text: 'Em todas a partir daqui', onPress: () => resolve(TemplatePadraoEscopoEnum.SERIE) },
        ],
      );
    });
  }, []);

  const saveTemplateByScope = useCallback(
    async (escopo: TemplatePadraoEscopoEnum) => {
      const eventoId = props.ocorrencia?.eventoId || props.evento.id;
      if (!eventoId) return false;

      const payload = {
        dataOcorrencia: props.dataOcorrenciaIso,
        escopo,
        templatePadraoId: templateId || null,
      };

      try {
        const response = await salvarTemplatePadrao({
          eventoId,
          data: payload,
        });

        const shouldRemoveOccurrenceOverride =
          escopo === TemplatePadraoEscopoEnum.SERIE &&
          response?.templatePadraoOrigem === TemplatePadraoOrigemEnum.OCORRENCIA;

        if (shouldRemoveOccurrenceOverride) {
          await removerTemplatePadrao({
            eventoId,
            params: {
              escopo: TemplatePadraoEscopoEnum.OCORRENCIA,
              dataOcorrencia: props.dataOcorrenciaIso,
            },
          });
        }

        return true;
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar template padrão',
          text2: getApiErrorMessage(error, 'Não foi possível salvar o template padrão.'),
        });
        return false;
      }
    },
    [props.dataOcorrenciaIso, props.evento.id, props.ocorrencia?.eventoId, removerTemplatePadrao, salvarTemplatePadrao, templateId],
  );

  const saveEnsaioByScope = useCallback(
    async (escopo: TemplatePadraoEscopoEnum) => {
      const eventoId = props.ocorrencia?.eventoId || props.evento.id;
      if (!eventoId || !ensaioTime) return false;

      try {
        const response = await salvarEnsaio({
          eventoId,
          data: {
            dataOcorrencia: props.dataOcorrenciaIso,
            escopo,
            horarioEnsaio: formatHourMinuteToTime(ensaioTime),
          },
        });

        const shouldRemoveOccurrenceOverride =
          escopo === TemplatePadraoEscopoEnum.SERIE &&
          response?.horarioEnsaioOrigem === TemplatePadraoOrigemEnum.OCORRENCIA;

        if (shouldRemoveOccurrenceOverride) {
          await removerEnsaio({
            eventoId,
            params: {
              escopo: TemplatePadraoEscopoEnum.OCORRENCIA,
              dataOcorrencia: props.dataOcorrenciaIso,
            },
          });
        }

        return true;
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar horário de ensaio',
          text2: getApiErrorMessage(error, 'Não foi possível salvar o horário de ensaio.'),
        });
        return false;
      }
    },
    [ensaioTime, props.dataOcorrenciaIso, props.evento.id, props.ocorrencia?.eventoId, removerEnsaio, salvarEnsaio],
  );

  const saveResponsavelSetlistByScope = useCallback(
    async (escopo: TemplatePadraoEscopoEnum) => {
      const eventoId = props.ocorrencia?.eventoId || props.evento.id;
      if (!eventoId) return false;

      try {
        await salvarResponsavelSetlist({
          eventoId,
          data: {
            dataOcorrencia: props.dataOcorrenciaIso,
            escopo,
            responsavelVoluntarioId: responsavelSetlistId || null,
          },
        });
        return true;
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar responsável do setlist',
          text2: getApiErrorMessage(error, 'Não foi possível salvar o responsável do setlist.'),
        });
        return false;
      }
    },
    [props.dataOcorrenciaIso, props.evento.id, props.ocorrencia?.eventoId, responsavelSetlistId, salvarResponsavelSetlist],
  );

  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    if (!canUpdateTemplate) {
      Toast.show({
        type: 'error',
        text1: 'Permissão insuficiente',
        text2: 'Somente líderes e administradores podem alterar os dados da ocorrência.',
      });
      return false;
    }

    if (!templateDirty && !ensaioDirty && !responsavelSetlistDirty) {
      return true;
    }

    setIsSavingAll(true);
    let savedAnything = false;

    try {
      if (templateDirty) {
        const templateScope = await promptScope('este template da equipe');
        if (templateScope === 'cancel') {
          if (savedAnything) {
            await props.onTemplateSaved?.();
          }
          return false;
        }

        const templateSaved = await saveTemplateByScope(templateScope);
        if (!templateSaved) {
          if (savedAnything) {
            await props.onTemplateSaved?.();
          }
          return false;
        }

        savedAnything = true;
      }

      if (isLouvorMinisterio && responsavelSetlistDirty) {
        const responsavelScope = await promptScope('este responsável do setlist');
        if (responsavelScope === 'cancel') {
          if (savedAnything) {
            await props.onTemplateSaved?.();
          }
          return false;
        }

        const responsavelSaved = await saveResponsavelSetlistByScope(responsavelScope);
        if (!responsavelSaved) {
          if (savedAnything) {
            await props.onTemplateSaved?.();
          }
          return false;
        }

        savedAnything = true;
      }

      if (ensaioDirty) {
        const ensaioScope = await promptScope('este horário de ensaio');
        if (ensaioScope === 'cancel') {
          if (savedAnything) {
            await props.onTemplateSaved?.();
            Toast.show({
              type: 'info',
              text1: 'Alterações parcialmente salvas',
              text2: 'O que já foi confirmado foi salvo. As demais alterações continuam pendentes.',
            });
          }
          return false;
        }

        const ensaioSaved = await saveEnsaioByScope(ensaioScope);
        if (!ensaioSaved) {
          if (savedAnything) {
            await props.onTemplateSaved?.();
          }
          return false;
        }

        savedAnything = true;
      }

      if (savedAnything) {
        await props.onTemplateSaved?.();
        Toast.show({
          type: 'success',
          text1: 'Ocorrência atualizada',
          text2: pendingChangesCount > 1 ? 'As alterações da ocorrência foram salvas.' : 'A alteração da ocorrência foi salva.',
        });
      }

      return true;
    } finally {
      setIsSavingAll(false);
    }
  }, [
    canUpdateTemplate,
    ensaioDirty,
    pendingChangesCount,
    promptScope,
    props,
    isLouvorMinisterio,
    responsavelSetlistDirty,
    saveEnsaioByScope,
    saveResponsavelSetlistByScope,
    saveTemplateByScope,
    templateDirty,
  ]);

  useEffect(() => {
    props.onRegisterActions?.({
      saveAllChanges,
      discardUnsavedChanges,
    });
  }, [discardUnsavedChanges, props, saveAllChanges]);

  if (isLoadingTemplates) return <FancyLoading />;

  return (
    <View style={styles.container}>
      <EventoInfoCard
        dataOcorrencia={props.dataOcorrenciaDate}
        eventoCor={props.evento.cor || Pallete.primary}
        eventoNome={props.evento.nome}
        descricao={props.evento.descricao}
        local={props.evento.local}
        horarioEnsaio={!canUpdateTemplate && resolvedEnsaioDisplay !== 'Não definido' ? resolvedEnsaioDisplay : undefined}
      />

      {canUpdateTemplate && (
        <FancyContainer
          containerStyle={styles.occurrenceContainer}
          headerContainerStyle={styles.occurrenceHeader}
          title='Ocorrência do Evento'
          children={
            <>
              <View style={styles.sectionsContent}>
                <OccurrenceFieldSection
                  label='Template da equipe'
                  origin={origemTemplateLabel}
                  dirty={templateDirty}
                  editor={
                    <View style={styles.editorGroup}>
                      <FancyBottomSheetSelect
                        containerStyle={styles.editorControl}
                        listItems={templatesList}
                        value={templateId}
                        onChange={setTemplateId}
                        placeholder='Selecione um template'
                        title='Template da equipe'
                        disabled={isMutating}
                      />
                    </View>
                  }
                />

                {isLouvorMinisterio ? (
                  <OccurrenceFieldSection
                    label='Responsável pelo setlist'
                    origin={origemResponsavelSetlistLabel}
                    dirty={responsavelSetlistDirty}
                    editor={
                      <View style={styles.editorGroup}>
                        <FancyBottomSheetSelect
                          containerStyle={styles.editorControl}
                          listItems={voluntariosEscaladosOptions}
                          value={responsavelSetlistId}
                          onChange={(value) => setResponsavelSetlistId(String(value || ''))}
                          placeholder='Selecione um voluntário'
                          title='Responsável pelo setlist'
                          disabled={isMutating}
                        />
                      </View>
                    }
                  />
                ) : null}

                <OccurrenceFieldSection
                  label='Horário de ensaio'
                  origin={origemEnsaioLabel}
                  dirty={ensaioDirty}
                  editor={
                    <View style={styles.editorGroup}>
                      <ModernTimePickerField
                        containerStyle={styles.editorControl}
                        value={ensaioTime}
                        onChange={setEnsaioTime}
                        disabled={isMutating}
                        panelProps={{
                          buttonStyle: styles.timePickerButton,
                          textStyle: styles.timePickerButtonText,
                        }}
                        sheetProps={{ title: 'Horário de ensaio' }}
                      />
                    </View>
                  }
                />
              </View>
              <View style={styles.footer}>
                {hasUnsavedChanges ? (
                  <FancyText size='extraSmall' type='medium' color={Pallete.fonts.inactive} style={styles.footerStatus}>
                    {`${pendingChangesCount} alteração${pendingChangesCount > 1 ? 'ões' : ''} pendente${pendingChangesCount > 1 ? 's' : ''}`}
                  </FancyText>
                ) : null}
                <FancyButton
                  label='Salvar alterações'
                  type='contained'
                  icon={{ ...DefaultIconsNames.save, size: 14 }}
                  containerStyle={styles.saveAllButton}
                  disabled={!hasUnsavedChanges || isMutating}
                  isLoading={isMutating}
                  loadingText='Salvando...'
                  onPress={() => {
                    void saveAllChanges();
                  }}
                />
              </View>
            </>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  occurrenceContainer: {
    paddingBottom: 18,
  },
  occurrenceHeader: {
    paddingBottom: 8,
  },
  sectionsContent: {
    paddingHorizontal: 15,
    paddingTop: 4,
  },
  sectionBlock: {
    width: '100%',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionSummary: {
    marginTop: 6,
  },
  sectionEditorField: {
    marginTop: 12,
  },
  editorGroup: {
    width: '100%',
  },
  editorControl: {
    width: '100%',
  },
  dirtyChip: {
    paddingVertical: 1,
    paddingHorizontal: 8,
    borderWidth: 1,
    minHeight: 0,
  },
  footer: {
    paddingHorizontal: 15,
    paddingTop: 18,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Pallete.borderCard,
  },
  footerStatus: {
    marginBottom: 8,
  },
  saveAllButton: {
    width: '100%',
    height: 44,
    marginTop: 4,
  },
  timePickerButton: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  timePickerButtonText: {
    textAlign: 'left',
  },
});
