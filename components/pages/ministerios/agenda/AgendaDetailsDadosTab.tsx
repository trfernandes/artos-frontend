import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FancyContainer from '../../../FancyContainer';
import FancyBottomSheetSelect from '../../../fields/FancyBottomSheetSelect';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancyChips from '../../../FancyChips';
import FancyLoading from '../../../FancyLoading';
import FancyText from '../../../FancyText';
import FancyTextInput from '../../../fields/FancyTextInput';
import DefaultIcons from '../../../FancyIcons';
import EventoInfoCard from '../../common/EventoInfoCard';
import ModernTimePickerSheet from '../../../time_picker/ModernTimePickerSheet';
import ModernDatePickerField from '../../../datepicker/ModernDatePickerField';
import ModernTimePickerField from '../../../time_picker/ModernTimePickerField';
import { FancyAlert } from '../../../modal/FancyAlert';
import { useEscalaTemplatesCrud } from '../../../../useEscalaTemplatesCrud';
import {
  Conjunction,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../domain/utils/query_utils';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { DefaultIconsNames } from '../../../../constants/icons';
import { ResponseEventoDto } from '../../../../domain/dtos/Evento/evento.response';
import { ResponseEventoOcorrenciaDto } from '../../../../domain/dtos/Evento/evento-ocorrencia.response.dto';
import { EscalaTemplateTipoLabel } from '../../../../domain/enums/EscalaTemplate/escala-template-tipo.enum';
import { useEventoTemplatePadrao } from '../../../../hooks/useEventoTemplatePadrao';
import { useEventoEnsaio } from '../../../../hooks/useEventoEnsaio';
import { useEventoOcorrenciaDados } from '../../../../hooks/useEventoOcorrenciaDados';
import { useEventoOcorrenciaCancelamento } from '../../../../hooks/useEventoOcorrenciaCancelamento';
import { useEventoSetlistResponsavel } from '../../../../hooks/useEventoSetlistResponsavel';
import { TemplatePadraoOrigemEnum } from '../../../../domain/enums/Evento/template-padrao-origem.enum';
import { TemplatePadraoEscopoEnum } from '../../../../domain/enums/Evento/template-padrao-escopo.enum';
import { MinisterioTipoEnum } from '../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { getApiErrorMessage } from '../../../../domain/api/api-error';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLoading } from '../../../../contexts/LoadingContext';
import { useEscalaItensCrud } from '../../../../hooks/useEscalaItensCrud';
import DateUtils, { DateUtilsApi } from '../../../../utils/date_utils';
import { canManageEventoOcorrencia } from '../../../../utils/ministerio_permissoes';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import { ColorUtils } from '../../../../utils/color_utils';

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

type DadosOcorrenciaDraft = {
  dataInicio: Date;
  dataTermino: Date | null;
  local: string;
};

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

function getMinutesOfDay(value: HourMinute): number {
  return value.hour * 60 + value.minute;
}

function normalizeSelectValue(value?: string | null) {
  return value ?? '';
}

function withTimeFromDate(datePart: Date, timeSource: Date): Date {
  return new Date(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
    timeSource.getHours(),
    timeSource.getMinutes(),
    0,
    0,
  );
}

function withHourMinute(datePart: Date, time: HourMinute): Date {
  return new Date(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
    time.hour,
    time.minute,
    0,
    0,
  );
}

function formatOccurrenceDateLabel(date: Date): string {
  const label = format(date, "EEE, d 'de' MMM", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function serializeDadosOcorrencia(value: DadosOcorrenciaDraft): string {
  return `${value.dataInicio.getTime()}|${value.dataTermino ? value.dataTermino.getTime() : ''}|${value.local}`;
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
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeader}>
        <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
          {label}
        </FancyText>
        {dirty ? (
          <FancyChips
            label='Alterado'
            size='small'
            color={palette.primary}
            style={styles.dirtyChip}
            labelProps={{ size: 'extraSmall' }}
          />
        ) : null}
      </View>

      <View style={styles.sectionEditorField}>{editor}</View>

      {origin ? (
        <View
          style={[
            styles.originBadge,
            { backgroundColor: ColorUtils.withAlpha(palette.borderCard, 0.18) },
          ]}
        >
          <View
            style={[
              styles.originBadgeIcon,
              { backgroundColor: ColorUtils.withAlpha(palette.borderCard, 0.22) },
            ]}
          >
            <DefaultIcons.Custom
              {...DefaultIconsNames.info}
              size={11}
              color={palette.fonts.inactive}
            />
          </View>
          <FancyText
            size='extraSmall'
            type='medium'
            color={palette.fonts.dark}
            style={styles.originBadgeText}
          >
            {origin}
          </FancyText>
        </View>
      ) : null}
    </View>
  );
}

function OcorrenciaDadosEditorSheet({
  visible,
  value,
  hasTermino,
  showRestoreDefault,
  onClose,
  onConfirm,
  onRestoreDefault,
}: {
  visible: boolean;
  value: DadosOcorrenciaDraft;
  hasTermino: boolean;
  showRestoreDefault: boolean;
  onClose: () => void;
  onConfirm: (value: DadosOcorrenciaDraft) => void;
  onRestoreDefault: () => void;
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const [draft, setDraft] = useState<DadosOcorrenciaDraft>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const footer = (
    <View style={styles.editorFooterButtons}>
      <FancyButton
        label='Cancelar'
        type='outlined'
        onPress={onClose}
        containerStyle={styles.editorFooterButton}
      />
      <FancyButton
        label='Confirmar'
        onPress={() => onConfirm(draft)}
        containerStyle={styles.editorFooterButton}
      />
    </View>
  );

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Data, horário e local'
      footer={footer}
    >
      <View style={styles.editorContainer}>
        <View style={styles.editorField}>
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            Data
          </FancyText>
          <ModernDatePickerField
            value={draft.dataInicio}
            onChange={(date) =>
              setDraft((prev) => ({
                ...prev,
                dataInicio: withTimeFromDate(date, prev.dataInicio),
                dataTermino: prev.dataTermino ? withTimeFromDate(date, prev.dataTermino) : null,
              }))
            }
          />
        </View>

        <View style={styles.editorField}>
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            Horário de início
          </FancyText>
          <ModernTimePickerField
            value={{ hour: draft.dataInicio.getHours(), minute: draft.dataInicio.getMinutes() }}
            onChange={(time) =>
              setDraft((prev) => ({ ...prev, dataInicio: withHourMinute(prev.dataInicio, time) }))
            }
          />
        </View>

        {hasTermino && draft.dataTermino ? (
          <View style={styles.editorField}>
            <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
              Horário de término
            </FancyText>
            <ModernTimePickerField
              value={{
                hour: draft.dataTermino.getHours(),
                minute: draft.dataTermino.getMinutes(),
              }}
              onChange={(time) =>
                setDraft((prev) => ({
                  ...prev,
                  dataTermino: prev.dataTermino ? withHourMinute(prev.dataTermino, time) : null,
                }))
              }
            />
          </View>
        ) : null}

        <View style={styles.editorField}>
          <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
            Local
          </FancyText>
          <FancyTextInput
            value={draft.local}
            placeholder='Local da ocorrência'
            inputProps={{
              onChangeText: (text) => setDraft((prev) => ({ ...prev, local: text })),
            }}
          />
        </View>

        {showRestoreDefault ? (
          <Pressable onPress={onRestoreDefault} style={styles.restoreDefaultButton}>
            <FancyText size='small' type='semiBold' color={palette.primary}>
              Restaurar padrão do evento
            </FancyText>
          </Pressable>
        ) : null}
      </View>
    </FancyBottomSheetModal>
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
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { igrejaAtiva } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const canManageOccurrence = canManageEventoOcorrencia(igrejaAtiva, props.ministerioId);
  const isLouvorMinisterio = useMemo(
    () =>
      igrejaAtiva?.ministerios?.some(
        (ministerio) =>
          ministerio.id === props.ministerioId && ministerio.tipo === MinisterioTipoEnum.Louvor,
      ) ?? false,
    [igrejaAtiva?.ministerios, props.ministerioId],
  );
  // Mesmo dado por trás dos dois rótulos — Ministério de Louvor vê "Ensaio", os demais veem
  // "Chegada" (ver CONTEXT.md "Horário de Ensaio/Chegada").
  const ensaioChegadaLabel = isLouvorMinisterio ? 'ensaio' : 'chegada';
  const EnsaioChegadaLabel = isLouvorMinisterio ? 'Ensaio' : 'Chegada';
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

  const { salvarTemplatePadrao, removerTemplatePadrao, isSavingTemplatePadrao } =
    useEventoTemplatePadrao();
  const { salvarEnsaio, removerEnsaio, isSavingEnsaio } = useEventoEnsaio();
  const { salvarDadosOcorrencia, removerDadosOcorrencia, isSavingDadosOcorrencia } =
    useEventoOcorrenciaDados();
  const { cancelarOcorrencia, restaurarOcorrencia, isMutatingCancelamento } =
    useEventoOcorrenciaCancelamento();
  const { salvarResponsavelSetlist, removerResponsavelSetlist, isSavingResponsavelSetlist } =
    useEventoSetlistResponsavel();
  const escalaSearchParams = useMemo(
    () => ({
      where: {
        conjunction: Conjunction.AND,
        conditions: [
          {
            path: 'evento.id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: props.ocorrencia?.eventoId || props.evento.id,
            },
          },
          {
            path: 'dataOcorrencia',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: DateUtilsApi.dateOnlyToApi(props.dataOcorrenciaDate),
            },
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
    () =>
      props.ocorrencia?.templatePadraoId ??
      props.evento.templatePadraoId ??
      props.evento.templatePadrao?.id ??
      '',
    [
      props.evento.templatePadrao?.id,
      props.evento.templatePadraoId,
      props.ocorrencia?.templatePadraoId,
    ],
  );

  const resolvedEnsaio = useMemo(
    () =>
      parseTimeToHourMinute(props.ocorrencia?.horarioEnsaio ?? props.evento.horarioEnsaioPadrao),
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

  const resolvedDadosOcorrencia = useMemo<DadosOcorrenciaDraft>(() => {
    const dataInicio = props.ocorrencia?.dataInicio
      ? new Date(props.ocorrencia.dataInicio)
      : new Date(props.dataOcorrenciaDate);
    const dataTermino = props.ocorrencia?.dataTermino
      ? new Date(props.ocorrencia.dataTermino)
      : null;
    const local = props.ocorrencia?.local ?? props.evento.local ?? '';
    return { dataInicio, dataTermino, local };
  }, [
    props.dataOcorrenciaDate,
    props.evento.local,
    props.ocorrencia?.dataInicio,
    props.ocorrencia?.dataTermino,
    props.ocorrencia?.local,
  ]);

  const resolvedTemplateName = useMemo(() => {
    const resolvedTemplate =
      props.ocorrencia?.templatePadrao?.nome ??
      props.evento.templatePadrao?.nome ??
      templates.find((template) => template.id === resolvedTemplateId)?.nome;

    return resolvedTemplate ?? 'Nenhum template definido';
  }, [
    props.evento.templatePadrao?.nome,
    props.ocorrencia?.templatePadrao?.nome,
    resolvedTemplateId,
    templates,
  ]);

  const [templateId, setTemplateId] = useState<string>(resolvedTemplateId);
  const [ensaioTime, setEnsaioTime] = useState<HourMinute | undefined>(resolvedEnsaio);
  const [responsavelSetlistId, setResponsavelSetlistId] = useState<string>(
    resolvedResponsavelSetlistId,
  );
  const [dadosOcorrencia, setDadosOcorrencia] =
    useState<DadosOcorrenciaDraft>(resolvedDadosOcorrencia);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isDadosSheetVisible, setIsDadosSheetVisible] = useState(false);

  const previousResolvedTemplateIdRef = useRef(resolvedTemplateId);
  const previousResolvedEnsaioRef = useRef(serializeHourMinute(resolvedEnsaio));
  const previousResolvedResponsavelRef = useRef(resolvedResponsavelSetlistId);
  const previousResolvedDadosRef = useRef(serializeDadosOcorrencia(resolvedDadosOcorrencia));

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

  useEffect(() => {
    const nextResolvedDados = serializeDadosOcorrencia(resolvedDadosOcorrencia);
    setDadosOcorrencia((current) => {
      const previousResolvedDados = previousResolvedDadosRef.current;
      const hasLocalEdits = serializeDadosOcorrencia(current) !== previousResolvedDados;
      previousResolvedDadosRef.current = nextResolvedDados;
      return hasLocalEdits ? current : resolvedDadosOcorrencia;
    });
  }, [resolvedDadosOcorrencia]);

  const templateDirty = templateId !== resolvedTemplateId;
  const ensaioDirty = serializeHourMinute(ensaioTime) !== serializeHourMinute(resolvedEnsaio);
  const responsavelSetlistDirty =
    isLouvorMinisterio && responsavelSetlistId !== resolvedResponsavelSetlistId;
  const dadosDirty =
    serializeDadosOcorrencia(dadosOcorrencia) !== serializeDadosOcorrencia(resolvedDadosOcorrencia);
  const hasUnsavedChanges =
    canManageOccurrence && (templateDirty || ensaioDirty || responsavelSetlistDirty || dadosDirty);
  const pendingChangesCount =
    Number(templateDirty) +
    Number(ensaioDirty) +
    Number(responsavelSetlistDirty) +
    Number(dadosDirty);
  const isMutating =
    isSavingAll ||
    isSavingTemplatePadrao ||
    isSavingEnsaio ||
    isSavingResponsavelSetlist ||
    isSavingDadosOcorrencia ||
    isMutatingCancelamento;
  const currentEnsaioDisplay = useMemo(() => {
    if (ensaioTime) return formatHourMinuteToTime(ensaioTime);
    return resolvedEnsaioDisplay;
  }, [ensaioTime, resolvedEnsaioDisplay]);
  const defaultSuggestedEnsaio = useMemo<HourMinute>(() => {
    const occurrenceDate = new Date(props.dataOcorrenciaDate);
    occurrenceDate.setMinutes(occurrenceDate.getMinutes() - 30);
    return {
      hour: occurrenceDate.getHours(),
      minute: occurrenceDate.getMinutes(),
    };
  }, [props.dataOcorrenciaDate]);
  const occurrenceTimeLabel = useMemo(
    () =>
      `${String(props.dataOcorrenciaDate.getHours()).padStart(2, '0')}:${String(props.dataOcorrenciaDate.getMinutes()).padStart(2, '0')}`,
    [props.dataOcorrenciaDate],
  );

  const validateEnsaioTime = useCallback(
    (candidate?: HourMinute, showToast = true) => {
      if (!candidate) return true;

      const eventMinutes =
        props.dataOcorrenciaDate.getHours() * 60 + props.dataOcorrenciaDate.getMinutes();
      const candidateMinutes = getMinutesOfDay(candidate);
      const isValid = candidateMinutes <= eventMinutes - 30;

      if (!isValid && showToast) {
        FancyAlert.alert(
          'Horário inválido',
          `O ${ensaioChegadaLabel} precisa começar ao menos 30 min antes da ocorrência às ${occurrenceTimeLabel}.`,
        );
      }

      return isValid;
    },
    [ensaioChegadaLabel, occurrenceTimeLabel, props.dataOcorrenciaDate],
  );

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
    return (
      ResponsavelSetlistOrigemLabel[origem as keyof typeof ResponsavelSetlistOrigemLabel] || null
    );
  }, [props.ocorrencia?.responsavelSetlistOrigem]);

  const origemDadosLabel = useMemo(() => {
    const origem = props.ocorrencia?.dadosOcorrenciaOrigem;
    if (!origem) return null;
    return TemplatePadraoOrigemLabel[origem as keyof typeof TemplatePadraoOrigemLabel] || null;
  }, [props.ocorrencia?.dadosOcorrenciaOrigem]);

  const hasTermino = dadosOcorrencia.dataTermino !== null;

  const dadosDisplayLabel = useMemo(() => {
    const dateLabel = formatOccurrenceDateLabel(dadosOcorrencia.dataInicio);
    const startTime = DateUtils.formatHour(
      dadosOcorrencia.dataInicio.getHours(),
      dadosOcorrencia.dataInicio.getMinutes(),
    );
    if (dadosOcorrencia.dataTermino) {
      const endTime = DateUtils.formatHour(
        dadosOcorrencia.dataTermino.getHours(),
        dadosOcorrencia.dataTermino.getMinutes(),
      );
      return `${dateLabel} · ${startTime} – ${endTime}`;
    }
    return `${dateLabel} · ${startTime}`;
  }, [dadosOcorrencia]);

  const showRestoreDefault =
    canManageOccurrence &&
    props.ocorrencia?.dadosOcorrenciaOrigem === TemplatePadraoOrigemEnum.OCORRENCIA;

  const resolvedResponsavelSetlistName = useMemo(() => {
    if (props.ocorrencia?.responsavelSetlistVoluntario?.nome) {
      return props.ocorrencia.responsavelSetlistVoluntario.nome;
    }

    const selectedOption = escalaItens.find(
      (item) => item.voluntario?.voluntario?.id === resolvedResponsavelSetlistId,
    );

    return selectedOption?.voluntario?.voluntario?.nome ?? 'Não definido';
  }, [
    escalaItens,
    props.ocorrencia?.responsavelSetlistVoluntario?.nome,
    resolvedResponsavelSetlistId,
  ]);

  const voluntariosEscaladosOptions = useMemo<DropDownItemProps<string>[]>(() => {
    const unique = escalaItens
      .filter((item) => item.voluntario?.voluntario?.id)
      .map((item) => ({
        title: item.voluntario?.voluntario?.nome || 'Voluntário',
        subtitle: item.funcao?.nome || '',
        value: item.voluntario?.voluntario?.id || '',
      }))
      .filter(
        (item, index, array) =>
          item.value && array.findIndex((entry) => entry.value === item.value) === index,
      )
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));

    return [{ title: 'Nenhum', value: '' }, ...unique];
  }, [escalaItens]);

  const getTemplateDefaultResponsavelId = useCallback(
    (nextTemplateId: string) => {
      if (!nextTemplateId) return '';
      const selectedTemplate = templates.find((template) => template.id === nextTemplateId);
      if (!selectedTemplate) return '';
      const explicitResponsavelId = selectedTemplate.respSetListVoluntarios?.id;
      const explicitResponsavelEscalado = escalaItens.some(
        (item) => item.voluntario?.voluntario?.id === explicitResponsavelId,
      );
      if (explicitResponsavelId && explicitResponsavelEscalado) {
        return explicitResponsavelId;
      }
      const funcaoId = selectedTemplate.respSetListFuncoes?.id;
      if (!funcaoId) return '';
      return (
        escalaItens.find((item) => item.funcao?.id === funcaoId && item.voluntario?.voluntario?.id)
          ?.voluntario?.voluntario?.id || ''
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
    setDadosOcorrencia(resolvedDadosOcorrencia);
  }, [resolvedDadosOcorrencia, resolvedEnsaio, resolvedResponsavelSetlistId, resolvedTemplateId]);

  useEffect(() => {
    props.onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, props]);

  const promptConsolidatedScope = useCallback(
    (fieldLabels: string[]): Promise<ScopePromptResult> => {
      return new Promise((resolve) => {
        const joined =
          fieldLabels.length === 1
            ? fieldLabels[0]
            : fieldLabels.slice(0, -1).join(', ') + ' e ' + fieldLabels[fieldLabels.length - 1];
        FancyAlert.alert(
          'Onde aplicar as alterações?',
          `Você alterou: ${joined}. Deseja salvar só nesta data ou em todas as ocorrências a partir daqui?`,
          [
            { text: 'Cancelar', style: 'destructive', onPress: () => resolve('cancel') },
            {
              text: 'Apenas nesta data',
              onPress: () => resolve(TemplatePadraoEscopoEnum.OCORRENCIA),
            },
            {
              text: 'Em todas a partir daqui',
              onPress: () => resolve(TemplatePadraoEscopoEnum.SERIE),
            },
          ],
        );
      });
    },
    [],
  );

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
    [
      props.dataOcorrenciaIso,
      props.evento.id,
      props.ocorrencia?.eventoId,
      removerTemplatePadrao,
      salvarTemplatePadrao,
      templateId,
    ],
  );

  const saveEnsaioByScope = useCallback(
    async (escopo: TemplatePadraoEscopoEnum) => {
      const eventoId = props.ocorrencia?.eventoId || props.evento.id;
      if (!eventoId || !ensaioTime) return false;
      if (!validateEnsaioTime(ensaioTime)) return false;

      try {
        const response = await salvarEnsaio({
          eventoId,
          data: {
            ministerioId: props.ministerioId,
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
              ministerioId: props.ministerioId,
              escopo: TemplatePadraoEscopoEnum.OCORRENCIA,
              dataOcorrencia: props.dataOcorrenciaIso,
            },
          });
        }

        return true;
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: `Erro ao salvar horário de ${ensaioChegadaLabel}`,
          text2: getApiErrorMessage(error, `Não foi possível salvar o horário de ${ensaioChegadaLabel}.`),
        });
        return false;
      }
    },
    [
      ensaioChegadaLabel,
      ensaioTime,
      props.dataOcorrenciaIso,
      props.evento.id,
      props.ministerioId,
      props.ocorrencia?.eventoId,
      removerEnsaio,
      salvarEnsaio,
      validateEnsaioTime,
    ],
  );

  const saveResponsavelSetlistByScope = useCallback(
    async (escopo: TemplatePadraoEscopoEnum) => {
      const eventoId = props.ocorrencia?.eventoId || props.evento.id;
      if (!eventoId) return false;

      try {
        await salvarResponsavelSetlist({
          eventoId,
          data: {
            ministerioId: props.ministerioId,
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
    [
      props.dataOcorrenciaIso,
      props.evento.id,
      props.ocorrencia?.eventoId,
      responsavelSetlistId,
      salvarResponsavelSetlist,
    ],
  );

  const saveDadosByScope = useCallback(
    async (escopo: TemplatePadraoEscopoEnum) => {
      const eventoId = props.ocorrencia?.eventoId || props.evento.id;
      if (!eventoId) return false;

      try {
        const response = await salvarDadosOcorrencia({
          eventoId,
          data: {
            dataReferencia: props.dataOcorrenciaIso,
            escopo,
            dataInicio: dadosOcorrencia.dataInicio.toISOString(),
            dataTermino: dadosOcorrencia.dataTermino
              ? dadosOcorrencia.dataTermino.toISOString()
              : undefined,
            local: dadosOcorrencia.local || undefined,
          },
        });

        const shouldRemoveOccurrenceOverride =
          escopo === TemplatePadraoEscopoEnum.SERIE &&
          response?.dadosOcorrenciaOrigem === TemplatePadraoOrigemEnum.OCORRENCIA;

        if (shouldRemoveOccurrenceOverride) {
          await removerDadosOcorrencia({
            eventoId,
            params: {
              escopo: TemplatePadraoEscopoEnum.OCORRENCIA,
              dataReferencia: props.dataOcorrenciaIso,
            },
          });
        }

        return true;
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar data, horário e local',
          text2: getApiErrorMessage(error, 'Não foi possível salvar os dados da ocorrência.'),
        });
        return false;
      }
    },
    [
      dadosOcorrencia,
      props.dataOcorrenciaIso,
      props.evento.id,
      props.ocorrencia?.eventoId,
      removerDadosOcorrencia,
      salvarDadosOcorrencia,
    ],
  );

  const handleRestaurarPadrao = useCallback(async () => {
    const eventoId = props.ocorrencia?.eventoId || props.evento.id;
    if (!eventoId) return;

    showLoading('Restaurando...');
    try {
      await removerDadosOcorrencia({
        eventoId,
        params: {
          escopo: TemplatePadraoEscopoEnum.OCORRENCIA,
          dataReferencia: props.dataOcorrenciaIso,
        },
      });
      await props.onTemplateSaved?.();
      Toast.show({
        type: 'success',
        text1: 'Padrão restaurado',
        text2: 'A ocorrência voltou a usar os dados padrão do evento.',
      });
      setIsDadosSheetVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao restaurar padrão',
        text2: getApiErrorMessage(error, 'Não foi possível restaurar o padrão do evento.'),
      });
    } finally {
      hideLoading();
    }
  }, [hideLoading, props, removerDadosOcorrencia, showLoading]);

  const isCancelada = props.ocorrencia?.cancelada === true;

  const handleCancelarOcorrencia = useCallback(() => {
    const eventoId = props.ocorrencia?.eventoId || props.evento.id;
    FancyAlert.alert(
      'Cancelar esta ocorrência?',
      'A ocorrência continuará aparecendo na agenda marcada como cancelada. Você pode restaurá-la a qualquer momento.',
      [
        { text: 'Voltar', style: 'destructive' },
        {
          text: 'Sim',
          onPress: async () => {
            showLoading('Cancelando...');
            try {
              await cancelarOcorrencia({
                eventoId,
                data: { dataReferencia: props.dataOcorrenciaIso },
              });
              await props.onTemplateSaved?.();
              Toast.show({ type: 'success', text1: 'Ocorrência cancelada' });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erro ao cancelar',
                text2: getApiErrorMessage(error, 'Não foi possível cancelar a ocorrência.'),
              });
            } finally {
              hideLoading();
            }
          },
        },
      ],
    );
  }, [cancelarOcorrencia, hideLoading, props, showLoading]);

  const handleRestaurarOcorrencia = useCallback(async () => {
    const eventoId = props.ocorrencia?.eventoId || props.evento.id;
    showLoading('Restaurando...');
    try {
      await restaurarOcorrencia({
        eventoId,
        params: { dataReferencia: props.dataOcorrenciaIso },
      });
      await props.onTemplateSaved?.();
      Toast.show({ type: 'success', text1: 'Ocorrência restaurada' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao restaurar',
        text2: getApiErrorMessage(error, 'Não foi possível restaurar a ocorrência.'),
      });
    } finally {
      hideLoading();
    }
  }, [hideLoading, props, restaurarOcorrencia, showLoading]);

  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    if (!canManageOccurrence) {
      Toast.show({
        type: 'error',
        text1: 'Permissão insuficiente',
        text2: 'Você não tem permissão para alterar os dados desta ocorrência.',
      });
      return false;
    }

    if (!templateDirty && !ensaioDirty && !responsavelSetlistDirty && !dadosDirty) {
      return true;
    }

    setIsSavingAll(true);

    try {
      // Fase 1: coletar escopos sem loading modal
      let templateScope: TemplatePadraoEscopoEnum | null = null;
      let responsavelScope: TemplatePadraoEscopoEnum | null = null;
      let ensaioScope: TemplatePadraoEscopoEnum | null = null;
      let dadosScope: TemplatePadraoEscopoEnum | null = null;

      const propagableLabels: string[] = [];
      if (templateDirty) propagableLabels.push('template da equipe');
      if (isLouvorMinisterio && responsavelSetlistDirty)
        propagableLabels.push('responsável do setlist');
      if (ensaioDirty) propagableLabels.push(`horário de ${ensaioChegadaLabel}`);

      if (propagableLabels.length > 0) {
        const scope = await promptConsolidatedScope(propagableLabels);
        if (scope === 'cancel') return false;
        if (templateDirty) templateScope = scope;
        if (isLouvorMinisterio && responsavelSetlistDirty) responsavelScope = scope;
        if (ensaioDirty) ensaioScope = scope;
      }

      if (dadosDirty) {
        dadosScope = TemplatePadraoEscopoEnum.OCORRENCIA;
      }

      // Fase 2: executar API com loading modal
      showLoading('Salvando...');
      try {
        let savedAnything = false;

        if (templateScope) {
          const ok = await saveTemplateByScope(templateScope);
          if (!ok) return false;
          savedAnything = true;
        }

        if (responsavelScope) {
          const ok = await saveResponsavelSetlistByScope(responsavelScope);
          if (!ok) return false;
          savedAnything = true;
        }

        if (ensaioScope) {
          const ok = await saveEnsaioByScope(ensaioScope);
          if (!ok) return false;
          savedAnything = true;
        }

        if (dadosScope) {
          const ok = await saveDadosByScope(dadosScope);
          if (!ok) return false;
          savedAnything = true;
        }

        if (savedAnything) {
          await props.onTemplateSaved?.();
          Toast.show({
            type: 'success',
            text1: 'Ocorrência atualizada',
            text2:
              pendingChangesCount > 1
                ? 'As alterações da ocorrência foram salvas.'
                : 'A alteração da ocorrência foi salva.',
          });
        }

        return true;
      } finally {
        hideLoading();
      }
    } finally {
      setIsSavingAll(false);
    }
  }, [
    canManageOccurrence,
    dadosDirty,
    ensaioChegadaLabel,
    ensaioDirty,
    hideLoading,
    isLouvorMinisterio,
    pendingChangesCount,
    promptConsolidatedScope,
    props,
    responsavelSetlistDirty,
    saveDadosByScope,
    saveEnsaioByScope,
    saveResponsavelSetlistByScope,
    saveTemplateByScope,
    showLoading,
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <EventoInfoCard
        dataOcorrencia={props.dataOcorrenciaDate}
        eventoCor={props.evento.cor || palette.primary}
        eventoNome={props.evento.nome}
        descricao={props.evento.descricao}
        local={props.evento.local}
      />

      {(canManageOccurrence || isLouvorMinisterio) && (
        <FancyContainer
          containerStyle={styles.occurrenceContainer}
          headerContainerStyle={styles.occurrenceHeader}
          title='Ocorrência do Evento'
          children={
            <>
              <View style={styles.sectionsContent}>
                <OccurrenceFieldSection
                  label='Data, horário e local'
                  origin={origemDadosLabel}
                  dirty={dadosDirty}
                  editor={
                    <View style={styles.editorGroup}>
                      {canManageOccurrence ? (
                        <Pressable
                          disabled={isMutating}
                          onPress={() => setIsDadosSheetVisible(true)}
                          style={[
                            styles.timePickerTrigger,
                            {
                              backgroundColor: palette.backgroundColor4,
                              borderColor: dadosDirty ? palette.primary : palette.borderCard,
                            },
                            isMutating && styles.timePickerTriggerDisabled,
                          ]}
                        >
                          <View
                            style={[
                              styles.timePickerIconWrap,
                              { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14) },
                            ]}
                          >
                            <DefaultIcons.Custom
                              {...DefaultIconsNames['calendar-day']}
                              size={18}
                              color={palette.primary}
                            />
                          </View>

                          <View style={styles.timePickerContent}>
                            <View style={styles.timePickerTitleRow}>
                              <FancyText
                                size='extraSmall'
                                type='semiBold'
                                color={palette.fonts.inactive}
                              >
                                Data e horário
                              </FancyText>
                            </View>

                            <FancyText size='medium' type='bold' color={palette.fonts.dark}>
                              {dadosDisplayLabel}
                            </FancyText>

                            <FancyText
                              size='extraSmall'
                              type='medium'
                              color={palette.fonts.inactive}
                              style={styles.timePickerHint}
                            >
                              {dadosOcorrencia.local
                                ? `${dadosOcorrencia.local} · toque para editar`
                                : 'Toque para editar'}
                            </FancyText>
                          </View>

                          <View style={styles.timePickerChevronWrap}>
                            <DefaultIcons.Custom
                              {...DefaultIconsNames['chevron-down']}
                              size={16}
                              color={palette.fonts.inactive}
                            />
                          </View>
                        </Pressable>
                      ) : (
                        <FancyText type='medium' size='small' color={palette.fonts.dark}>
                          {dadosDisplayLabel}
                          {dadosOcorrencia.local ? ` · ${dadosOcorrencia.local}` : ''}
                        </FancyText>
                      )}
                    </View>
                  }
                />

                <OccurrenceFieldSection
                  label='Template da equipe'
                  origin={origemTemplateLabel}
                  dirty={templateDirty}
                  editor={
                    <View style={styles.editorGroup}>
                      {canManageOccurrence ? (
                        <FancyBottomSheetSelect
                          containerStyle={styles.editorControl}
                          listItems={templatesList}
                          value={templateId}
                          onChange={setTemplateId}
                          placeholder='Selecione um template'
                          title='Template da equipe'
                          disabled={isMutating}
                        />
                      ) : (
                        <FancyText type='medium' size='small' color={palette.fonts.dark}>
                          {resolvedTemplateName}
                        </FancyText>
                      )}
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
                        {canManageOccurrence ? (
                          <FancyBottomSheetSelect
                            containerStyle={styles.editorControl}
                            listItems={voluntariosEscaladosOptions}
                            value={responsavelSetlistId}
                            onChange={(value) => setResponsavelSetlistId(String(value || ''))}
                            placeholder='Selecione um voluntário'
                            title='Responsável pelo setlist'
                            disabled={isMutating}
                          />
                        ) : (
                          <FancyText type='medium' size='small' color={palette.fonts.dark}>
                            {resolvedResponsavelSetlistName}
                          </FancyText>
                        )}
                      </View>
                    }
                  />
                ) : null}

                <OccurrenceFieldSection
                  label={`Horário de ${EnsaioChegadaLabel}`}
                  origin={origemEnsaioLabel}
                  dirty={ensaioDirty}
                  editor={
                    <View style={styles.editorGroup}>
                      {canManageOccurrence ? (
                        <>
                          <Pressable
                            disabled={isMutating}
                            onPress={() => setIsTimePickerVisible(true)}
                            style={[
                              styles.timePickerTrigger,
                              {
                                backgroundColor: palette.backgroundColor4,
                                borderColor: ensaioDirty ? palette.primary : palette.borderCard,
                              },
                              isMutating && styles.timePickerTriggerDisabled,
                            ]}
                          >
                            <View
                              style={[
                                styles.timePickerIconWrap,
                                { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14) },
                              ]}
                            >
                              <DefaultIcons.Custom
                                {...DefaultIconsNames.time}
                                size={18}
                                color={palette.primary}
                              />
                            </View>

                            <View style={styles.timePickerContent}>
                              <View style={styles.timePickerTitleRow}>
                                <FancyText
                                  size='extraSmall'
                                  type='semiBold'
                                  color={palette.fonts.inactive}
                                >
                                  Horário selecionado
                                </FancyText>
                              </View>

                              <FancyText size='medium' type='bold' color={palette.fonts.dark}>
                                {currentEnsaioDisplay !== 'Não definido'
                                  ? currentEnsaioDisplay
                                  : 'Selecionar horário'}
                              </FancyText>

                              <FancyText
                                size='extraSmall'
                                type='medium'
                                color={palette.fonts.inactive}
                                style={styles.timePickerHint}
                              >
                                Mínimo de 30 min antes da ocorrência.
                              </FancyText>
                            </View>

                            <View style={styles.timePickerChevronWrap}>
                              <DefaultIcons.Custom
                                {...DefaultIconsNames['chevron-down']}
                                size={16}
                                color={palette.fonts.inactive}
                              />
                            </View>
                          </Pressable>

                          <ModernTimePickerSheet
                            visible={isTimePickerVisible}
                            value={ensaioTime ?? defaultSuggestedEnsaio}
                            onClose={() => setIsTimePickerVisible(false)}
                            onConfirm={(time) => {
                              if (!validateEnsaioTime(time)) return;
                              setEnsaioTime(time);
                              setIsTimePickerVisible(false);
                            }}
                            title={`Horário de ${EnsaioChegadaLabel}`}
                          />
                        </>
                      ) : (
                        <FancyText type='medium' size='small' color={palette.fonts.dark}>
                          {resolvedEnsaioDisplay}
                        </FancyText>
                      )}
                    </View>
                  }
                />
              </View>

              {canManageOccurrence ? (
                <View style={[styles.footer, { borderTopColor: palette.borderCard }]}>
                  {hasUnsavedChanges ? (
                    <FancyText
                      size='extraSmall'
                      type='medium'
                      color={palette.fonts.inactive}
                      style={styles.footerStatus}
                    >
                      {`${pendingChangesCount} alteraç${pendingChangesCount > 1 ? 'ões' : 'ão'} pendente${pendingChangesCount > 1 ? 's' : ''}`}
                    </FancyText>
                  ) : null}
                  <FancyButton
                    label='Salvar'
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
              ) : null}
            </>
          }
        />
      )}

      {canManageOccurrence ? (
        <View
          style={[
            styles.dangerZoneCard,
            {
              borderColor: ColorUtils.withAlpha(palette.error, 0.28),
              backgroundColor: ColorUtils.withAlpha(palette.error, 0.04),
            },
          ]}
        >
          {isCancelada ? (
            <>
              <View style={styles.dangerZoneHeader}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='cancel'
                  size={17}
                  color={palette.error}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <FancyText size='small' type='semiBold' color={palette.error}>
                    Ocorrência cancelada
                  </FancyText>
                  {props.ocorrencia?.canceladaEm ? (
                    <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                      {'Cancelada em '}
                      {format(new Date(props.ocorrencia.canceladaEm), "d 'de' MMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </FancyText>
                  ) : null}
                </View>
              </View>
              <FancyButton
                label='Restaurar ocorrência'
                type='outlined'
                containerStyle={styles.dangerZoneButton}
                disabled={isMutating}
                isLoading={isMutatingCancelamento}
                onPress={() => void handleRestaurarOcorrencia()}
              />
            </>
          ) : (
            <>
              <View style={styles.dangerZoneHeader}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='alert-circle-outline'
                  size={17}
                  color={palette.error}
                />
                <FancyText size='small' type='semiBold' color={palette.error}>
                  Atenção
                </FancyText>
              </View>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                Cancele esta ocorrência caso ela não aconteça. Ela continuará visível na agenda
                marcada como cancelada e pode ser restaurada a qualquer momento.
              </FancyText>
              <FancyButton
                label='Cancelar esta ocorrência'
                type='outlined'
                containerStyle={[styles.dangerZoneButton, { borderColor: palette.error }]}
                labelStyle={{ color: palette.error }}
                disabled={isMutating}
                isLoading={isMutatingCancelamento}
                onPress={handleCancelarOcorrencia}
              />
            </>
          )}
        </View>
      ) : null}

      <OcorrenciaDadosEditorSheet
        visible={isDadosSheetVisible}
        value={dadosOcorrencia}
        hasTermino={hasTermino}
        showRestoreDefault={showRestoreDefault}
        onClose={() => setIsDadosSheetVisible(false)}
        onConfirm={(value) => {
          setDadosOcorrencia(value);
          setIsDadosSheetVisible(false);
        }}
        onRestoreDefault={handleRestaurarPadrao}
      />
    </ScrollView>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    containerContent: {
      gap: 15,
      paddingBottom: 24,
    },
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
    originBadge: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: 'rgba(62, 62, 62, 0.05)',
    },
    originBadgeIcon: {
      width: 16,
      height: 16,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(62, 62, 62, 0.06)',
    },
    originBadgeText: {
      lineHeight: 15,
      opacity: 0.78,
    },
    dangerZoneCard: {
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    dangerZoneHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dangerZoneButton: {
      width: '100%',
      height: 42,
    },
    footer: {
      paddingHorizontal: 15,
      paddingTop: 18,
      marginTop: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: palette.borderCard,
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
    timePickerTrigger: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor4,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    timePickerTriggerDirty: {
      borderColor: palette.primary,
    },
    timePickerTriggerDisabled: {
      opacity: 0.72,
    },
    timePickerIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E8F0FF',
    },
    timePickerContent: {
      flex: 1,
      gap: 2,
    },
    timePickerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    timePickerHint: {
      lineHeight: 16,
    },
    timePickerChevronWrap: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editorContainer: {
      gap: 18,
      paddingBottom: 8,
    },
    editorField: {
      gap: 8,
    },
    editorFooterButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    editorFooterButton: {
      flex: 1,
      height: 44,
    },
    restoreDefaultButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
  });
}
