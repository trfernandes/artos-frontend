import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { uploadToCloudinaryUnsigned } from '../../../../services/cloudinary_upload';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../../../config/cloudinary';
import FancyPageView from '../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../components/tabs/FancyTabs';
import FancySegmentedTabs from '../../../../components/tabs/FancySegmentedTabs';
import FancyListItemCard from '../../../../components/cards/FancyListItemCard';
import FancyChips from '../../../../components/FancyChips';
import FancyScrollView from '../../../../components/FancyScrollView';
import { DefaultIconsNames } from '../../../../constants/icons';
import { useMemo, useState, useEffect, ReactNode } from 'react';
import { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIgrejaConfiguracoes } from '../../../../hooks/useIgrejaConfiguracoes';
import { useAuth } from '../../../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  dadosSchema,
  faturamentoSchema,
  notificacoesSchema,
  DadosFormData,
  FaturamentoFormData,
  NotificacoesFormData,
} from '../../../../domain/schemas/igreja-configuracoes.schema';
import ControlledTextInput from '../../../../components/forms/ControlledTextInput';
import ControlledSearchSelect from '../../../../components/forms/ControlledSearchSelect';
import ControlledMaskedTextInput from '../../../../components/forms/ControlledMaskedTextInput';
import FancyButton from '../../../../components/buttons/FancyButton';
import { ThemePalette } from '../../../../constants/colors';
import DefaultIcons, { IconLibrary } from '../../../../components/FancyIcons';
import FancyText from '../../../../components/FancyText';
import FancyCheckbox from '../../../../components/FancyCheckbox';
import FancyPillToggle from '../../../../components/FancyPillToggle';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import {
  ControlledImagePicker,
  FormImageFile,
} from '../../../../components/forms/ControlledImagePicker';
import { usePallete } from '../../../../hooks/usePallete';
import { useLoading } from '../../../../contexts/LoadingContext';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { useAppTheme } from '../../../../hooks/useAppTheme';
import { ColorUtils } from '../../../../utils/color_utils';
import { UF_LIST } from '../../../../domain/utils/uf-list';
import { getCidadesComCodigoPorUf, getCidadesPorUf } from '../../../../domain/utils/cidades-list';
import { DropDownItemProps } from '../../../../components/fields/FancyDropDownItem';
import { useIgrejaAssinatura } from '../../../../hooks/useIgrejaAssinatura';
import { NotificacoesApi } from '../../../../domain/api/NotificacoesApi';
import BillingStatusPanel from '../../../../components/billing/BillingStatusPanel';
import {
  BILLING_PLAN_OPTIONS,
  BillingCycleCode,
  resolveBillingPlanName,
} from '../../../../domain/utils/billing-plan-catalog';
import { ResponseIgrejaAssinaturaDto } from '../../../../domain/dtos/Igreja/response-igreja-assinatura.dto';
import { resolveBillingPrimaryActionLabel } from '../../../../domain/utils/billing-notice';
import FancyBottomSheetModal from '../../../../components/modal/FancyBottomSheetModal';
import { FancyAlert } from '../../../../components/modal/FancyAlert';
import FancyVerticalSpacer from '../../../../components/FancyVerticalSpacer';

const REMINDER_OPTIONS = [
  { title: '1 semana antes', shortLabel: '1 sem', value: 168 },
  { title: '72 horas antes', shortLabel: '72h', value: 72 },
  { title: '48 horas antes', shortLabel: '48h', value: 48 },
  { title: '24 horas antes', shortLabel: '24h', value: 24 },
  { title: '12 horas antes', shortLabel: '12h', value: 12 },
  { title: '3 horas antes', shortLabel: '3h', value: 3 },
  { title: '2 horas antes', shortLabel: '2h', value: 2 },
  { title: '1 hora antes', shortLabel: '1h', value: 1 },
] as const;

const DEFAULT_REMINDER_HOURS = [24, 2, 1];
type DataSectionKey = 'general' | 'address' | 'billing';

const normalizeOptionalValue = (value?: string | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeComparableValue = (value?: string | null) => (value ?? '').trim().toLowerCase();

const isFaturamentoCompleto = (faturamento?: Partial<FaturamentoFormData> | null) =>
  Boolean(
    faturamento?.cnpj &&
    faturamento?.telefoneCobranca &&
    faturamento?.cep &&
    faturamento?.rua &&
    faturamento?.numero &&
    faturamento?.bairro &&
    faturamento?.cidade &&
    faturamento?.cidadeIbge &&
    faturamento?.uf,
  );

const isEnderecoCobrancaIgualAoDaIgreja = (
  endereco?: Partial<{
    cep: string | null;
    rua: string | null;
    numero: string | null;
    bairro: string | null;
    complemento: string | null;
    cidade: string | null;
    uf: string | null;
  }> | null,
  faturamento?: Partial<{
    cnpj: string | null;
    telefoneCobranca: string | null;
    emailCobranca: string | null;
    cep: string | null;
    rua: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    cidadeIbge: string | null;
    uf: string | null;
    complemento: string | null;
  }> | null,
) =>
  Boolean(
    endereco &&
    faturamento &&
    normalizeComparableValue(endereco.cep) === normalizeComparableValue(faturamento.cep) &&
    normalizeComparableValue(endereco.rua) === normalizeComparableValue(faturamento.rua) &&
    normalizeComparableValue(endereco.numero) === normalizeComparableValue(faturamento.numero) &&
    normalizeComparableValue(endereco.bairro) === normalizeComparableValue(faturamento.bairro) &&
    normalizeComparableValue(endereco.complemento) ===
      normalizeComparableValue(faturamento.complemento) &&
    normalizeComparableValue(endereco.cidade) === normalizeComparableValue(faturamento.cidade) &&
    normalizeComparableValue(endereco.uf) === normalizeComparableValue(faturamento.uf),
  );

type SectionStatus = 'neutral' | 'complete' | 'incomplete' | 'error';

const getSectionStatus = (p: {
  valid: boolean; // preenchido E sem erro de validação
  complete: boolean; // campos obrigatórios não-vazios
  hasInteraction: boolean; // já mexeu (dirty), mas ainda não tentou salvar
  attemptedSave: boolean;
}): SectionStatus => {
  if (p.attemptedSave && !p.valid) return 'error';
  if (p.valid) return 'complete';
  if (p.hasInteraction) return 'incomplete';
  return 'neutral';
};

type SectionStatusPillData = { label: string; color: string; background: string };

type SectionVisuals = {
  badgeBackground: string;
  iconLibrary: IconLibrary;
  iconName: string;
  iconColor: string;
  pill: SectionStatusPillData | null;
};

const getStatusVisuals = (
  status: SectionStatus,
  palette: ReturnType<typeof usePallete>,
  defaultIcon: { library: IconLibrary; name: string },
  accent: string,
): SectionVisuals => {
  // O ícone usa SEMPRE a cor de identidade da seção (accent) — exceto em erro,
  // onde o vermelho prevalece como sinal de alerta. O estado (Completo/Incompleto)
  // vive apenas no chip, para o card não ficar monocromático.
  const accentBadge: Pick<
    SectionVisuals,
    'badgeBackground' | 'iconLibrary' | 'iconName' | 'iconColor'
  > = {
    badgeBackground: ColorUtils.withAlpha(accent, 0.12),
    iconLibrary: defaultIcon.library,
    iconName: defaultIcon.name,
    iconColor: accent,
  };

  switch (status) {
    case 'error':
      return {
        badgeBackground: ColorUtils.withAlpha(palette.error, 0.12),
        iconLibrary: 'MaterialIcons',
        iconName: 'error-outline',
        iconColor: palette.error,
        pill: {
          label: 'Revisar',
          color: palette.error,
          background: ColorUtils.withAlpha(palette.error, 0.14),
        },
      };
    case 'complete':
      return {
        ...accentBadge,
        pill: {
          label: 'Completo',
          color: palette.confirm,
          background: ColorUtils.withAlpha(palette.confirm, 0.12),
        },
      };
    case 'incomplete':
      return {
        ...accentBadge,
        pill: {
          label: 'Incompleto',
          color: palette.warning,
          background: ColorUtils.withAlpha(palette.warning, 0.14),
        },
      };
    default:
      return {
        ...accentBadge,
        pill: null,
      };
  }
};

const SectionCard = ({
  visuals,
  title,
  summary,
  summaryNumberOfLines = 1,
  status,
  highlighted,
  expanded,
  onToggle,
  styles,
  palette,
  children,
}: {
  visuals: SectionVisuals;
  title: string;
  summary: string;
  summaryNumberOfLines?: number;
  status: SectionStatus;
  highlighted?: boolean;
  expanded: boolean;
  onToggle: () => void;
  styles: ReturnType<typeof createStyles>;
  palette: ThemePalette;
  children: ReactNode;
}) => {
  const { isDark } = useAppTheme();
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;
  return (
    <View
      style={[
        styles.flatSection,
        highlighted && styles.flatSectionHighlighted,
        {
          backgroundColor: cardBg,
          borderColor:
            status === 'error' ? palette.error : ColorUtils.withAlpha(palette.borderCard, 0.45),
          borderWidth: status === 'error' ? 1.5 : 0.5,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        accessibilityRole='button'
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}. ${expanded ? 'Recolher' : 'Expandir'} seção`}
        style={styles.flatSectionHeader}
      >
        <View style={[styles.flatSectionIconBadge, { backgroundColor: visuals.badgeBackground }]}>
          <DefaultIcons.Custom
            library={visuals.iconLibrary}
            name={visuals.iconName}
            size={20}
            color={visuals.iconColor}
          />
        </View>
        <View style={styles.flatSectionHeaderText}>
          <FancyText type='semiBold' size='small'>
            {title}
          </FancyText>
          <FancyText
            size='extraSmall'
            color={palette.fonts.inactive}
            numberOfLines={summaryNumberOfLines}
          >
            {summary}
          </FancyText>
        </View>
        {visuals.pill ? (
          <FancyChips
            label={visuals.pill.label}
            color={visuals.pill.color}
            backgroundColor={visuals.pill.background}
            size='small'
            dot
          />
        ) : null}
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={palette.icons.inactive}
        />
      </TouchableOpacity>
      {expanded ? <View style={styles.flatSectionContent}>{children}</View> : null}
    </View>
  );
};

type PlanSummary = {
  badgeLabel: string;
  badgeColor: string;
  badgeBackground: string;
  statusLabel: string;
  statusIcon: { library: IconLibrary; name: string };
};

const getPlanSummary = (
  assinatura: ResponseIgrejaAssinaturaDto | undefined,
  palette: ThemePalette,
): PlanSummary => {
  if (!assinatura) {
    return {
      badgeLabel: '—',
      badgeColor: palette.fonts.inactive,
      badgeBackground: ColorUtils.withAlpha(palette.fonts.inactive, 0.12),
      statusLabel: '—',
      statusIcon: { library: 'MaterialCommunityIcons', name: 'help-circle-outline' },
    };
  }

  if (assinatura.status === 'trial') {
    const accent = palette.plans.avaliacao;
    return {
      badgeLabel: 'Avaliação',
      badgeColor: accent.text,
      badgeBackground: ColorUtils.withAlpha(accent.accent, 0.12),
      statusLabel: 'Em avaliação',
      statusIcon: { library: 'MaterialCommunityIcons', name: 'clock-outline' },
    };
  }

  if (assinatura.status === 'overdue') {
    return {
      badgeLabel: 'Pagamento pendente',
      badgeColor: palette.warning,
      badgeBackground: ColorUtils.withAlpha(palette.warning, 0.14),
      statusLabel: 'Pendente',
      statusIcon: { library: 'MaterialCommunityIcons', name: 'alert-circle-outline' },
    };
  }

  if (assinatura.status === 'cancelled' || assinatura.status === 'expired') {
    const label = assinatura.status === 'cancelled' ? 'Cancelada' : 'Expirada';
    return {
      badgeLabel: label,
      badgeColor: palette.error,
      badgeBackground: ColorUtils.withAlpha(palette.error, 0.12),
      statusLabel: label,
      statusIcon: { library: 'MaterialCommunityIcons', name: 'close-circle-outline' },
    };
  }

  const planAccent =
    assinatura.plan === 'starter' ||
    assinatura.plan === 'essencial' ||
    assinatura.plan === 'crescimento'
      ? palette.plans[assinatura.plan]
      : { accent: palette.primary, text: palette.primary };

  return {
    badgeLabel: resolveBillingPlanName(assinatura.plan),
    badgeColor: planAccent.text,
    badgeBackground: ColorUtils.withAlpha(planAccent.accent, 0.12),
    statusLabel: 'Ativa',
    statusIcon: { library: 'MaterialCommunityIcons', name: 'check-decagram-outline' },
  };
};

const HeroStatCard = ({
  icon,
  label,
  value,
  accent,
  valueColor,
  ratio,
  styles,
  palette,
}: {
  icon: { library: IconLibrary; name: string };
  label: string;
  value: string;
  accent?: string;
  valueColor?: string;
  ratio?: number;
  styles: ReturnType<typeof createStyles>;
  palette: ThemePalette;
}) => {
  const { isDark } = useAppTheme();
  const cardBg = isDark ? palette.backgroundColor2 : palette.backgroundColor;
  const accentColor = accent ?? palette.primary;
  return (
    <View style={[styles.heroStatCard, { backgroundColor: cardBg }]}>
      <View style={styles.heroStatTop}>
        <DefaultIcons.Custom
          library={icon.library}
          name={icon.name}
          size={14}
          color={accentColor}
        />
        <FancyText size='extraSmall' color={palette.fonts.inactive} numberOfLines={1}>
          {label}
        </FancyText>
      </View>
      <FancyText
        type='semiBold'
        size='medium'
        color={valueColor ?? palette.fonts.dark}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </FancyText>
      {typeof ratio === 'number' ? (
        <View
          style={[
            styles.heroStatTrack,
            { backgroundColor: ColorUtils.withAlpha(accentColor, 0.14) },
          ]}
        >
          <View
            style={[
              styles.heroStatFill,
              {
                backgroundColor: accentColor,
                width: `${Math.max(Math.min(ratio, 1) * 100, 6)}%`,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
};

const ReminderChip = ({
  label,
  selected,
  onPress,
  styles,
  palette,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  palette: ThemePalette;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    accessibilityRole='button'
    accessibilityState={{ selected }}
    style={[
      styles.reminderChip,
      selected
        ? { backgroundColor: palette.primary, borderColor: palette.primary }
        : {
            backgroundColor: palette.backgroundColor4,
            borderColor: ColorUtils.withAlpha(palette.borderCard, 0.7),
          },
    ]}
  >
    {selected ? (
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='check'
        size={14}
        color={palette.fonts.light}
      />
    ) : null}
    <FancyText
      type={selected ? 'semiBold' : 'medium'}
      size='small'
      color={selected ? palette.fonts.light : palette.fonts.dark}
    >
      {label}
    </FancyText>
  </TouchableOpacity>
);

export default function ConfiguracoesPage() {
  const { igrejaAtiva, user, updateUser } = useAuth();
  const palette = usePallete();
  const { showLoading } = useLoading();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const igrejaId = igrejaAtiva?.id;
  const { tab, openPlans } = useLocalSearchParams<{ tab?: string; openPlans?: string }>();
  const {
    data: assinatura,
    isLoading: isLoadingAssinatura,
    refetch: refetchAssinatura,
    iniciarCheckout,
    retomarCheckout,
    cancelarAssinatura,
    cancelarTrocaDePlano,
    isAbrindoCheckout,
    isCancelandoAssinatura,
    isCancelandoTrocaDePlano,
  } = useIgrejaAssinatura({ igrejaId });

  // Não executar o hook se não houver igreja ativa
  const { data, isLoading, updateDados, updateNotificacoes, isUpdating } = useIgrejaConfiguracoes({
    igrejaId: igrejaId || '',
    onUpdateDadosSuccess: async (updatedData) => {
      // Atualizar a igreja no contexto de autenticação
      if (user?.igrejas && igrejaAtiva) {
        const igrejasAtualizadas = user.igrejas.map((igreja) =>
          igreja.id === igrejaAtiva.id
            ? {
                ...igreja,
                nome: updatedData.nome,
                logoUrl: updatedData.logoUrl,
                logoThumbUrl: updatedData.logoThumbUrl,
                // Preservar os ministérios da igreja atual
                ministerios: igreja.ministerios,
              }
            : igreja,
        );

        await updateUser({ igrejas: igrejasAtualizadas });
      }
    },
  });

  // State para controlar upload de imagem
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Forms
  const dadosForm = useForm<DadosFormData>({
    resolver: zodResolver(dadosSchema),
    defaultValues: data
      ? {
          nome: data.nome,
          endereco: {
            cep: data.endereco?.cep || '',
            rua: data.endereco?.rua || '',
            numero: data.endereco?.numero || '',
            bairro: data.endereco?.bairro || '',
            complemento: data.endereco?.complemento || '',
            cidade: data.endereco?.cidade || '',
            uf: data.endereco?.uf || '',
          },
          telefone: data.telefone || '',
          email: data.email || '',
          logoUrl: data.logoUrl,
        }
      : undefined,
  });

  const faturamentoForm = useForm<FaturamentoFormData>({
    resolver: zodResolver(faturamentoSchema),
    defaultValues: data
      ? {
          cnpj: data.faturamento?.cnpj || '',
          telefoneCobranca: data.faturamento?.telefoneCobranca || '',
          emailCobranca: data.faturamento?.emailCobranca || '',
          cep: data.faturamento?.cep || '',
          rua: data.faturamento?.rua || '',
          numero: data.faturamento?.numero || '',
          bairro: data.faturamento?.bairro || '',
          cidade: data.faturamento?.cidade || '',
          cidadeIbge: data.faturamento?.cidadeIbge || '',
          uf: data.faturamento?.uf || '',
          complemento: data.faturamento?.complemento || '',
        }
      : undefined,
  });

  const notificacoesForm = useForm<NotificacoesFormData>({
    resolver: zodResolver(notificacoesSchema),
    defaultValues: {
      notificacoesHabilitadas: false,
      lembretesHoras: DEFAULT_REMINDER_HOURS,
      canaisPush: true,
      canaisWhatsapp: false,
    },
  });
  const selectedReminderHours = notificacoesForm.watch('lembretesHoras');
  const notificacoesHabilitadas = notificacoesForm.watch('notificacoesHabilitadas');
  const [billingCycle, setBillingCycle] = useState<BillingCycleCode>('MONTHLY');
  const [billingPlansModalVisible, setBillingPlansModalVisible] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(tab === 'plano' ? 3 : 0);
  const [hasAttemptedDadosSave, setHasAttemptedDadosSave] = useState(false);
  const [highlightedAccordionSection, setHighlightedAccordionSection] =
    useState<DataSectionKey | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<DataSectionKey, boolean>>({
    general: false,
    address: false,
    billing: false,
  });
  const toggleSection = useCallback((key: DataSectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  const [useChurchAddressForBilling, setUseChurchAddressForBilling] = useState(false);

  const ufSelecionada = dadosForm.watch('endereco.uf');
  const enderecoValues = dadosForm.watch('endereco');
  const nomeValue = dadosForm.watch('nome');
  const telefoneValue = dadosForm.watch('telefone');
  const emailValue = dadosForm.watch('email');
  const ufFaturamentoSelecionada = faturamentoForm.watch('uf');
  const [cidadesList, setCidadesList] = useState<DropDownItemProps<string>[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [cidadesError, setCidadesError] = useState<string | null>(null);
  const [billingCitiesList, setBillingCitiesList] = useState<DropDownItemProps<string>[]>([]);
  const [isLoadingBillingCities, setIsLoadingBillingCities] = useState(false);
  const [billingCitiesError, setBillingCitiesError] = useState<string | null>(null);
  const [isSendingTestPush, setIsSendingTestPush] = useState(false);
  const faturamentoValues = faturamentoForm.watch();
  const billingProfileComplete = useMemo(
    () => isFaturamentoCompleto(faturamentoValues),
    [faturamentoValues],
  );
  const dadosDirtyFields = dadosForm.formState.dirtyFields;
  const dadosErrors = dadosForm.formState.errors;
  const faturamentoDirtyFields = faturamentoForm.formState.dirtyFields;
  const faturamentoErrors = faturamentoForm.formState.errors;
  const hasUnsavedDadosChanges =
    dadosForm.formState.isDirty || faturamentoForm.formState.isDirty || isUploadingImage;
  const generalSectionComplete = Boolean(
    nomeValue?.trim() && telefoneValue?.trim() && emailValue?.trim(),
  );
  const addressSectionComplete = Boolean(
    enderecoValues?.cep?.trim() &&
    enderecoValues?.rua?.trim() &&
    enderecoValues?.numero?.trim() &&
    enderecoValues?.bairro?.trim() &&
    enderecoValues?.cidade?.trim() &&
    enderecoValues?.uf?.trim(),
  );
  // hasInteraction = só dirty (não inclui tentativa de salvar — esse é o gatilho de "erro")
  const generalSectionHasInteraction = Boolean(
    dadosDirtyFields.nome || dadosDirtyFields.telefone || dadosDirtyFields.email,
  );
  const addressSectionHasInteraction = Boolean(
    dadosDirtyFields.endereco?.cep ||
    dadosDirtyFields.endereco?.rua ||
    dadosDirtyFields.endereco?.numero ||
    dadosDirtyFields.endereco?.bairro ||
    dadosDirtyFields.endereco?.complemento ||
    dadosDirtyFields.endereco?.cidade ||
    dadosDirtyFields.endereco?.uf,
  );
  const billingSectionHasInteraction = Boolean(
    faturamentoDirtyFields.cnpj ||
    faturamentoDirtyFields.telefoneCobranca ||
    faturamentoDirtyFields.emailCobranca ||
    faturamentoDirtyFields.cep ||
    faturamentoDirtyFields.rua ||
    faturamentoDirtyFields.numero ||
    faturamentoDirtyFields.bairro ||
    faturamentoDirtyFields.complemento ||
    faturamentoDirtyFields.cidade ||
    faturamentoDirtyFields.cidadeIbge ||
    faturamentoDirtyFields.uf,
  );
  const generalSectionHasError = Boolean(
    dadosErrors.nome || dadosErrors.telefone || dadosErrors.email,
  );
  const addressSectionHasError = Boolean(
    dadosErrors.endereco?.cep ||
    dadosErrors.endereco?.rua ||
    dadosErrors.endereco?.numero ||
    dadosErrors.endereco?.bairro ||
    dadosErrors.endereco?.complemento ||
    dadosErrors.endereco?.cidade ||
    dadosErrors.endereco?.uf,
  );
  const billingSectionHasError = Object.keys(faturamentoErrors).length > 0;
  const generalSectionStatus = getSectionStatus({
    valid: Boolean(nomeValue?.trim()) && !generalSectionHasError,
    complete: generalSectionComplete,
    hasInteraction: generalSectionHasInteraction,
    attemptedSave: hasAttemptedDadosSave,
  });
  const addressSectionStatus = getSectionStatus({
    valid: addressSectionComplete && !addressSectionHasError,
    complete: addressSectionComplete,
    hasInteraction: addressSectionHasInteraction,
    attemptedSave: hasAttemptedDadosSave,
  });
  const billingSectionStatus = getSectionStatus({
    valid: billingProfileComplete && !billingSectionHasError,
    complete: billingProfileComplete,
    hasInteraction: billingSectionHasInteraction,
    attemptedSave: hasAttemptedDadosSave,
  });
  const generalSectionVisuals = getStatusVisuals(
    generalSectionStatus,
    palette,
    { library: 'MaterialCommunityIcons', name: 'information-outline' },
    palette.primary,
  );
  const addressSectionVisuals = getStatusVisuals(
    addressSectionStatus,
    palette,
    { library: 'MaterialCommunityIcons', name: 'map-marker-outline' },
    palette.terciary,
  );
  const billingSectionVisuals = getStatusVisuals(
    billingSectionStatus,
    palette,
    { library: 'MaterialCommunityIcons', name: 'credit-card-outline' },
    palette.secondary,
  );
  const billingAddressSummary = useMemo(() => {
    const parts = [
      faturamentoForm.getValues('rua'),
      faturamentoForm.getValues('numero'),
      faturamentoForm.getValues('bairro'),
      faturamentoForm.getValues('complemento'),
      faturamentoForm.getValues('cidade'),
      faturamentoForm.getValues('uf'),
      faturamentoForm.getValues('cep'),
    ].filter((value) => typeof value === 'string' && value.trim().length > 0);

    return parts.join(', ');
  }, [faturamentoValues, faturamentoForm]);

  useFocusEffect(
    useCallback(() => {
      if (!igrejaId) return undefined;

      void refetchAssinatura();

      const intervalId = setInterval(() => {
        void refetchAssinatura();
      }, 30000);

      return () => clearInterval(intervalId);
    }, [igrejaId, refetchAssinatura]),
  );
  const generalSectionSummary = useMemo(() => {
    const fallback = 'Nome, telefone e email da igreja';
    const values = [telefoneValue, emailValue].filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

    if (nomeValue?.trim()) {
      return values.length > 0 ? `${nomeValue.trim()} · ${values.join(' · ')}` : nomeValue.trim();
    }

    return values.length > 0 ? values.join(' · ') : fallback;
  }, [emailValue, nomeValue, telefoneValue]);
  const addressSectionSummary = useMemo(() => {
    const parts = [
      enderecoValues?.rua,
      enderecoValues?.numero,
      enderecoValues?.bairro,
      enderecoValues?.cidade,
      enderecoValues?.uf,
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    return parts.length > 0 ? parts.join(', ') : 'CEP, rua, número, bairro, estado e cidade';
  }, [enderecoValues]);
  const billingSectionSummary = useMemo(() => {
    if (!billingProfileComplete) {
      return 'Complete os dados para liberar a assinatura';
    }

    if (useChurchAddressForBilling) {
      return billingAddressSummary || 'Usando o endereço principal da igreja';
    }

    return billingAddressSummary || 'Perfil pronto para checkout';
  }, [billingAddressSummary, billingProfileComplete, useChurchAddressForBilling]);
  const canResumePendingCheckout = Boolean(
    assinatura?.checkoutUrl && assinatura.status !== 'cancelled',
  );
  const hasPendingPlanChange = Boolean(assinatura?.hasPendingPlanChange);
  const hasExceededPlanCapacity = Boolean(
    assinatura &&
    (assinatura.currentVolunteers > assinatura.maxVolunteers ||
      assinatura.currentMinistries > assinatura.maxMinistries),
  );
  const canCancelCurrentSubscription = Boolean(
    assinatura?.canManageBilling &&
    assinatura?.status &&
    ['active', 'overdue'].includes(assinatura.status),
  );
  const billingPrimaryLabel = resolveBillingPrimaryActionLabel(assinatura);
  const recommendedUpgradePlan = useMemo(() => {
    if (!hasExceededPlanCapacity || !assinatura) return null;

    return (
      BILLING_PLAN_OPTIONS.find(
        (option) =>
          option.maxVolunteers >= assinatura.currentVolunteers &&
          option.maxMinistries >= assinatura.currentMinistries,
      ) ?? BILLING_PLAN_OPTIONS[BILLING_PLAN_OPTIONS.length - 1]
    );
  }, [assinatura, hasExceededPlanCapacity]);
  const handlePrimaryBillingAction = () => {
    if (canResumePendingCheckout && assinatura?.checkoutUrl) {
      retomarCheckout(assinatura.checkoutUrl);
      return;
    }

    openBillingPlansModal();
  };
  const reminderLabel = useMemo(() => {
    const values = [...(selectedReminderHours ?? [])].sort((a, b) => b - a);
    if (values.length === 0) return 'Nenhum lembrete selecionado';

    return values
      .map((value) => {
        if (value === 168) return '1 semana';
        if (value === 1) return '1 hora';
        return `${value} horas`;
      })
      .join(', ');
  }, [selectedReminderHours]);

  const highlightAccordionSection = (section: DataSectionKey) => {
    setHighlightedAccordionSection(section);
  };

  const syncBillingAddressWithChurch = (markDirty: boolean) => {
    const endereco = dadosForm.getValues('endereco');
    const cidadeSelecionada = billingCitiesList.find(
      (cidade) => cidade.title === (endereco?.cidade ?? ''),
    );

    faturamentoForm.setValue('cep', endereco?.cep || '', { shouldDirty: markDirty });
    faturamentoForm.setValue('rua', endereco?.rua || '', { shouldDirty: markDirty });
    faturamentoForm.setValue('numero', endereco?.numero || '', { shouldDirty: markDirty });
    faturamentoForm.setValue('bairro', endereco?.bairro || '', { shouldDirty: markDirty });
    faturamentoForm.setValue('complemento', endereco?.complemento || '', {
      shouldDirty: markDirty,
    });
    faturamentoForm.setValue('uf', endereco?.uf || '', { shouldDirty: markDirty });
    faturamentoForm.setValue('cidade', endereco?.cidade || '', { shouldDirty: markDirty });
    faturamentoForm.setValue('cidadeIbge', cidadeSelecionada?.value || '', {
      shouldDirty: markDirty,
      shouldValidate: true,
    });
  };

  const loadChurchCities = async (uf: string) => {
    if (!uf) return;
    setIsLoadingCidades(true);
    setCidadesError(null);
    try {
      const cidades = await getCidadesPorUf(uf);
      setCidadesList(cidades);
    } catch {
      setCidadesList([]);
      setCidadesError('Não foi possível carregar as cidades agora.');
    } finally {
      setIsLoadingCidades(false);
    }
  };

  const loadBillingCities = async (uf: string) => {
    if (!uf) return;
    setIsLoadingBillingCities(true);
    setBillingCitiesError(null);
    try {
      const cidades = await getCidadesComCodigoPorUf(uf);
      setBillingCitiesList(cidades);
      if (cidades.length === 0) {
        setBillingCitiesError('Não foi possível carregar as cidades agora.');
      }
    } catch {
      setBillingCitiesList([]);
      setBillingCitiesError('Não foi possível carregar as cidades agora.');
    } finally {
      setIsLoadingBillingCities(false);
    }
  };
  useEffect(() => {
    if (assinatura?.cycle === 'MONTHLY' || assinatura?.cycle === 'YEARLY') {
      setBillingCycle(assinatura.cycle);
    }
  }, [assinatura?.cycle]);

  useEffect(() => {
    if (tab === 'plano') {
      setActiveTabIndex(3);
    }
  }, [tab]);

  const handleCancelarAssinatura = () => {
    if (!igrejaId) return;

    FancyAlert.alert(
      'Cancelar assinatura',
      'A igreja mantém acesso até o fim do período já pago. Deseja continuar?',
      [
        { text: 'Voltar', style: 'default' },
        { text: 'Sim', style: 'destructive', onPress: () => cancelarAssinatura() },
      ],
    );
  };

  const handleCancelarTrocaDePlano = () => {
    if (!igrejaId) return;

    FancyAlert.alert(
      'Cancelar troca de plano',
      'O pagamento pendente será descartado e sua assinatura anterior será restaurada. Deseja continuar?',
      [
        { text: 'Voltar', style: 'default' },
        { text: 'Sim', style: 'destructive', onPress: () => cancelarTrocaDePlano() },
      ],
    );
  };

  const openBillingPlansModal = () => {
    if (!billingProfileComplete) {
      setActiveTabIndex(0);
      highlightAccordionSection('billing');
      FancyAlert.alert(
        'Cobrança incompleta',
        'Preencha os dados de cobrança da igreja antes de assinar.',
        [{ text: 'Ok', style: 'default' }],
      );
      return;
    }
    setBillingPlansModalVisible(true);
  };

  useEffect(() => {
    if (tab === 'plano' && openPlans === '1' && activeTabIndex === 3) {
      if (!billingProfileComplete) {
        setActiveTabIndex(0);
        highlightAccordionSection('billing');
        return;
      }
      setBillingPlansModalVisible(true);
    }
  }, [activeTabIndex, openPlans, tab, billingProfileComplete]);
  const closeBillingPlansModal = () => setBillingPlansModalVisible(false);

  const toggleReminderHour = (hour: number) => {
    const current = notificacoesForm.getValues('lembretesHoras') ?? [];
    const next = current.includes(hour)
      ? current.filter((value) => value !== hour)
      : [...current, hour].sort((a, b) => b - a);

    notificacoesForm.setValue('lembretesHoras', next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (!ufSelecionada) {
      setCidadesList([]);
      setCidadesError(null);
      dadosForm.setValue('endereco.cidade', '');
      return;
    }

    loadChurchCities(ufSelecionada);
  }, [ufSelecionada, dadosForm]);

  useEffect(() => {
    if (!ufFaturamentoSelecionada) {
      setBillingCitiesList([]);
      setBillingCitiesError(null);
      faturamentoForm.setValue('cidadeIbge', '');
      faturamentoForm.setValue('cidade', '');
      return;
    }

    loadBillingCities(ufFaturamentoSelecionada);
  }, [ufFaturamentoSelecionada, faturamentoForm]);

  useEffect(() => {
    const cidadeAtual = dadosForm.getValues('endereco.cidade');
    if (!cidadeAtual) return;
    const cidadeExiste = cidadesList.some((cidade) => cidade.value === cidadeAtual);
    if (!cidadeExiste) {
      dadosForm.setValue('endereco.cidade', '');
    }
  }, [cidadesList, dadosForm]);

  useEffect(() => {
    const cidadeAtual = faturamentoForm.getValues('cidadeIbge');
    if (!cidadeAtual) return;
    const cidadeSelecionada = billingCitiesList.find((cidade) => cidade.value === cidadeAtual);

    if (!cidadeSelecionada) {
      faturamentoForm.setValue('cidadeIbge', '');
      faturamentoForm.setValue('cidade', '');
      return;
    }

    if (faturamentoForm.getValues('cidade') !== cidadeSelecionada.title) {
      faturamentoForm.setValue('cidade', cidadeSelecionada.title);
    }
  }, [billingCitiesList, faturamentoForm]);

  useEffect(() => {
    if (!useChurchAddressForBilling) return;
    syncBillingAddressWithChurch(false);
  }, [useChurchAddressForBilling, enderecoValues, billingCitiesList]);

  useEffect(() => {
    if (!highlightedAccordionSection) return;

    // Garante que a seção destacada (erro de validação / atalho de cobrança)
    // esteja aberta para o usuário ver o conteúdo realçado.
    const section = highlightedAccordionSection;
    setExpandedSections((prev) => (prev[section] ? prev : { ...prev, [section]: true }));

    const timeout = setTimeout(() => {
      setHighlightedAccordionSection(null);
    }, 2200);

    return () => clearTimeout(timeout);
  }, [highlightedAccordionSection]);

  // Atualizar forms quando data carregar
  useEffect(() => {
    if (data) {
      console.log(
        '🔄 useEffect - Dados recebidos para reset do form:',
        JSON.stringify(
          {
            telefone: data.telefone,
            email: data.email,
            nome: data.nome,
          },
          null,
          2,
        ),
      );

      dadosForm.reset({
        nome: data.nome || '',
        endereco: {
          cep: data.endereco?.cep || '',
          rua: data.endereco?.rua || '',
          numero: data.endereco?.numero || '',
          bairro: data.endereco?.bairro || '',
          complemento: data.endereco?.complemento || '',
          cidade: data.endereco?.cidade || '',
          uf: data.endereco?.uf || '',
        },
        telefone: data.telefone || '',
        email: data.email || '',
        logoUrl: data.logoUrl || '',
      });

      faturamentoForm.reset({
        cnpj: data.faturamento?.cnpj || '',
        telefoneCobranca: data.faturamento?.telefoneCobranca || '',
        emailCobranca: data.faturamento?.emailCobranca || '',
        cep: data.faturamento?.cep || '',
        rua: data.faturamento?.rua || '',
        numero: data.faturamento?.numero || '',
        bairro: data.faturamento?.bairro || '',
        cidade: data.faturamento?.cidade || '',
        cidadeIbge: data.faturamento?.cidadeIbge || '',
        uf: data.faturamento?.uf || '',
        complemento: data.faturamento?.complemento || '',
      });
      setUseChurchAddressForBilling(
        isEnderecoCobrancaIgualAoDaIgreja(data.endereco, data.faturamento),
      );

      // Suporte para ambas estruturas: configuracoes.notificacoes ou notificacoes diretamente
      const notificacoes = data.configuracoes?.notificacoes || data.notificacoes;
      if (notificacoes) {
        const lembretesHoras = notificacoes.lembretesHoras?.length
          ? [...notificacoes.lembretesHoras].sort((a, b) => b - a)
          : notificacoes.antecedenciaHoras
            ? [notificacoes.antecedenciaHoras]
            : DEFAULT_REMINDER_HOURS;

        notificacoesForm.reset({
          notificacoesHabilitadas:
            notificacoes.habilitadas ?? notificacoes.notificacoesHabilitadas ?? false,
          lembretesHoras,
          canaisPush: notificacoes.canais?.push ?? notificacoes.canaisPush ?? true,
          canaisWhatsapp: notificacoes.canais?.whatsapp ?? notificacoes.canaisWhatsapp ?? false,
        });
      }
    }
  }, [data, faturamentoForm]);

  // Handlers
  const handleSalvarDados = async () => {
    const dadosValid = await dadosForm.trigger();
    setHasAttemptedDadosSave(true);
    if (!dadosValid) {
      const dataErrors = dadosForm.formState.errors;
      const hasAddressErrors = Boolean(
        dataErrors.endereco?.cep ||
        dataErrors.endereco?.rua ||
        dataErrors.endereco?.numero ||
        dataErrors.endereco?.bairro ||
        dataErrors.endereco?.complemento ||
        dataErrors.endereco?.cidade ||
        dataErrors.endereco?.uf,
      );
      highlightAccordionSection(hasAddressErrors ? 'address' : 'general');
      Toast.show({
        type: 'error',
        text1: 'Revise os dados',
        text2: 'Há campos obrigatórios ou inválidos. Confira a seção destacada.',
      });
      return;
    }

    const faturamentoValido = await faturamentoForm.trigger();
    if (!faturamentoValido) {
      highlightAccordionSection('billing');
      Toast.show({
        type: 'error',
        text1: 'Revise os dados',
        text2: 'Há campos obrigatórios ou inválidos. Confira a seção destacada.',
      });
      return;
    }

    const formData = dadosForm.getValues();
    const billingData = faturamentoForm.getValues();
    const logoFile = dadosForm.getValues('logoFile' as any) as FormImageFile | null | undefined;

    let finalLogoUrl = formData.logoUrl;

    if (logoFile?.uri) {
      setIsUploadingImage(true);
      try {
        const result = await uploadToCloudinaryUnsigned(logoFile, {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          folder: 'artos/igrejas',
        });
        finalLogoUrl = result.secureUrl;
      } catch (error) {
        console.error('Erro ao fazer upload da logo:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível fazer upload da imagem',
        });
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    try {
      await updateDados({
        igrejaId: igrejaId!,
        dto: {
          ...formData,
          telefone: normalizeOptionalValue(formData.telefone),
          email: normalizeOptionalValue(formData.email),
          logoUrl: finalLogoUrl ?? undefined,
          faturamento: {
            ...billingData,
            emailCobranca: normalizeOptionalValue(billingData.emailCobranca),
            complemento: normalizeOptionalValue(billingData.complemento),
          },
        },
      });
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleSalvarNotificacoes = notificacoesForm.handleSubmit((formData) => {
    const lembretesHoras = [...formData.lembretesHoras].sort((a, b) => b - a);
    updateNotificacoes({
      igrejaId: igrejaId!,
      dto: {
        notificacoesHabilitadas: formData.notificacoesHabilitadas,
        antecedenciaHoras: lembretesHoras[0],
        lembretesHoras,
        canaisPush: formData.canaisPush,
        canaisWhatsapp: formData.canaisWhatsapp,
      },
    });
  });

  const handleEnviarTestePush = async () => {
    setIsSendingTestPush(true);
    try {
      await NotificacoesApi.enviarTestePush();
      Toast.show({ type: 'success', text1: 'Notificação de teste enviada!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao enviar notificação de teste' });
    } finally {
      setIsSendingTestPush(false);
    }
  };

  const handleCopiarCodigo = async () => {
    if (data?.codigo) {
      await Clipboard.setStringAsync(data.codigo);
      // Android já mostra feedback nativo ao copiar
      if (Platform.OS !== 'android') {
        Toast.show({
          type: 'success',
          text1: 'Código copiado!',
          text2: 'O código foi copiado para a área de transferência',
        });
      }
    }
  };

  const handleAbrirConfiguracaoFaturamento = () => {
    closeBillingPlansModal();
    setActiveTabIndex(0);
    highlightAccordionSection('billing');
  };

  const handleIniciarCheckout = (plan: (typeof BILLING_PLAN_OPTIONS)[number]['codigo']) => {
    if (!billingProfileComplete) {
      closeBillingPlansModal();
      setActiveTabIndex(0);
      highlightAccordionSection('billing');
      FancyAlert.alert(
        'Cobrança incompleta',
        'Complete os dados de cobrança da igreja antes de iniciar a assinatura.',
        [{ text: 'Ok', style: 'default' }],
      );
      return;
    }

    const isChangingPlan = ['active', 'trial', 'overdue'].includes(assinatura?.status ?? '');
    const dto = { churchId: igrejaId!, plan, cycle: billingCycle, changePlan: isChangingPlan };
    closeBillingPlansModal();
    // Aguarda o Modal do bottom sheet fechar antes de abrir o Modal de loading —
    // dois Modals nativas simultâneos no Android causam conflito silencioso.
    setTimeout(() => {
      showLoading(isChangingPlan ? 'Trocando de plano...' : 'Preparando pagamento...');
      iniciarCheckout(dto);
    }, 350);
  };

  const handleToggleUseChurchAddress = (nextValue: boolean) => {
    setUseChurchAddressForBilling(nextValue);
    if (nextValue) {
      syncBillingAddressWithChurch(true);
      highlightAccordionSection('billing');
    }
  };

  // Verificar se há igreja ativa
  if (!igrejaId) {
    return (
      <FancyPageView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FancyText>Nenhuma igreja selecionada</FancyText>
        </View>
      </FancyPageView>
    );
  }

  if (isLoading) {
    return (
      <FancyPageView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={palette.primary} />
        </View>
      </FancyPageView>
    );
  }

  if (!data) {
    return (
      <FancyPageView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FancyText>Erro ao carregar configurações</FancyText>
        </View>
      </FancyPageView>
    );
  }

  // Tabs - criado após validação de data
  const TAB_DATA: TabItem[] = [
    {
      title: 'Dados',
      icon: { ...DefaultIconsNames.info, size: 16 },
      content: (
        <View style={styles.dataTabLayout}>
          <FancyScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.dataScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode='none'
            enableOnAndroid={true}
            extraScrollHeight={100}
            keyboardShouldPersistTaps='handled'
            fill
          >
            <View style={styles.dataSectionsStack}>
              <SectionCard
                visuals={generalSectionVisuals}
                status={generalSectionStatus}
                title='Geral'
                summary={generalSectionSummary}
                expanded={expandedSections.general}
                onToggle={() => toggleSection('general')}
                styles={styles}
                palette={palette}
              >
                <View style={styles.avatarContainer}>
                  <ControlledImagePicker
                    control={dadosForm.control}
                    name='logoUrl'
                    setValue={dadosForm.setValue}
                    uploadFieldName={'logoFile' as any}
                    size={100}
                    buttonSize={33}
                  />
                </View>

                <ControlledTextInput
                  control={dadosForm.control}
                  name='nome'
                  label='Nome da Igreja'
                />

                <ControlledMaskedTextInput
                  control={dadosForm.control}
                  name='telefone'
                  label='Telefone'
                  maskType='phone'
                />

                <ControlledTextInput
                  control={dadosForm.control}
                  name='email'
                  label='Email'
                  keyboardType='email-address'
                />

                <FancyListItemCard
                  leading={{
                    icon: { library: 'MaterialCommunityIcons', name: 'qrcode' },
                    type: 'icon',
                  }}
                  title={data?.codigo || '---'}
                  titleProps={{ size: 'small', style: styles.codigoTexto }}
                  subtitle='Compartilhe este código para convidar pessoas'
                  onPress={handleCopiarCodigo}
                  trailing={
                    <View style={styles.codigoCopyTrailing}>
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name='content-copy'
                        size={16}
                        color={palette.primary}
                      />
                      <FancyText type='medium' size='extraSmall' color={palette.primary}>
                        Copiar
                      </FancyText>
                    </View>
                  }
                />
              </SectionCard>
              <SectionCard
                visuals={addressSectionVisuals}
                status={addressSectionStatus}
                title='Endereço'
                summary={addressSectionSummary}
                expanded={expandedSections.address}
                onToggle={() => toggleSection('address')}
                styles={styles}
                palette={palette}
              >
                <ControlledMaskedTextInput
                  control={dadosForm.control}
                  name='endereco.cep'
                  label='CEP'
                  maskType='cep'
                />

                <ControlledTextInput control={dadosForm.control} name='endereco.rua' label='Rua' />

                <ControlledTextInput
                  control={dadosForm.control}
                  name='endereco.numero'
                  label='Número'
                  keyboardType='numeric'
                />

                <ControlledTextInput
                  control={dadosForm.control}
                  name='endereco.bairro'
                  label='Bairro'
                />

                <ControlledTextInput
                  control={dadosForm.control}
                  name='endereco.complemento'
                  label='Complemento'
                />

                <ControlledSearchSelect
                  control={dadosForm.control}
                  name='endereco.uf'
                  label='Estado'
                  listItems={UF_LIST}
                  placeholder='Selecione o estado'
                  searchPlaceholder='Buscar estado...'
                />

                <ControlledSearchSelect
                  control={dadosForm.control}
                  name='endereco.cidade'
                  label='Cidade'
                  listItems={cidadesList}
                  placeholder={isLoadingCidades ? 'Carregando cidades...' : 'Selecione a cidade'}
                  searchPlaceholder='Buscar cidade...'
                  disabled={!ufSelecionada}
                  isLoading={isLoadingCidades}
                  loadingMessage='Carregando cidades...'
                  errorMessage={cidadesError}
                  onRetry={() => {
                    if (ufSelecionada) {
                      loadChurchCities(ufSelecionada);
                    }
                  }}
                />
              </SectionCard>
              <SectionCard
                visuals={billingSectionVisuals}
                status={billingSectionStatus}
                title='Cobrança'
                summary={billingSectionSummary}
                summaryNumberOfLines={2}
                highlighted={highlightedAccordionSection === 'billing'}
                expanded={expandedSections.billing}
                onToggle={() => toggleSection('billing')}
                styles={styles}
                palette={palette}
              >
                <ControlledMaskedTextInput
                  control={faturamentoForm.control}
                  name='cnpj'
                  label='CNPJ'
                  maskType='cnpj'
                />

                <ControlledMaskedTextInput
                  control={faturamentoForm.control}
                  name='telefoneCobranca'
                  label='Telefone'
                  maskType='phone'
                />

                <ControlledTextInput
                  control={faturamentoForm.control}
                  name='emailCobranca'
                  label='Email'
                  keyboardType='email-address'
                />

                <TouchableOpacity
                  style={[
                    styles.sameAddressRow,
                    {
                      backgroundColor: useChurchAddressForBilling
                        ? ColorUtils.withAlpha(palette.primary, 0.08)
                        : palette.backgroundColor,
                      borderColor: useChurchAddressForBilling
                        ? ColorUtils.withAlpha(palette.primary, 0.22)
                        : palette.borderCard,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleToggleUseChurchAddress(!useChurchAddressForBilling)}
                >
                  <View pointerEvents='none'>
                    <FancyCheckbox value={useChurchAddressForBilling} />
                  </View>
                  <View style={styles.sameAddressText}>
                    <FancyText type='semiBold' size='small'>
                      Usar o mesmo endereço da igreja
                    </FancyText>
                    <FancyText size='extraSmall' color={palette.fonts.inactive}>
                      Reaproveita o endereço principal já cadastrado.
                    </FancyText>
                  </View>
                </TouchableOpacity>

                {useChurchAddressForBilling ? (
                  <FancyListItemCard
                    leading={{
                      icon: { library: 'MaterialCommunityIcons', name: 'map-marker-outline' },
                      type: 'icon',
                    }}
                    title='Endereço em uso'
                    subtitle={
                      billingAddressSummary || 'Preencha o endereço da igreja para reutilizar aqui.'
                    }
                  />
                ) : (
                  <>
                    <ControlledMaskedTextInput
                      control={faturamentoForm.control}
                      name='cep'
                      label='CEP'
                      maskType='cep'
                    />

                    <ControlledTextInput control={faturamentoForm.control} name='rua' label='Rua' />

                    <ControlledTextInput
                      control={faturamentoForm.control}
                      name='numero'
                      label='Número'
                      keyboardType='numeric'
                    />

                    <ControlledTextInput
                      control={faturamentoForm.control}
                      name='bairro'
                      label='Bairro'
                    />

                    <ControlledTextInput
                      control={faturamentoForm.control}
                      name='complemento'
                      label='Complemento'
                    />

                    <ControlledSearchSelect
                      control={faturamentoForm.control}
                      name='uf'
                      label='Estado'
                      listItems={UF_LIST}
                      placeholder='Selecione o estado'
                      searchPlaceholder='Buscar estado...'
                    />

                    <ControlledSearchSelect
                      control={faturamentoForm.control}
                      name='cidadeIbge'
                      label='Cidade'
                      listItems={billingCitiesList}
                      placeholder={
                        isLoadingBillingCities ? 'Carregando cidades...' : 'Selecione a cidade'
                      }
                      searchPlaceholder='Buscar cidade...'
                      disabled={!ufFaturamentoSelecionada}
                      isLoading={isLoadingBillingCities}
                      loadingMessage='Carregando cidades...'
                      errorMessage={billingCitiesError}
                      onRetry={() => {
                        if (ufFaturamentoSelecionada) {
                          loadBillingCities(ufFaturamentoSelecionada);
                        }
                      }}
                      onChange={(cidadeId) => {
                        const cidadeSelecionada = billingCitiesList.find(
                          (cidade) => cidade.value === cidadeId,
                        );
                        faturamentoForm.setValue('cidade', cidadeSelecionada?.title ?? '', {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                    />
                  </>
                )}
              </SectionCard>
            </View>
          </FancyScrollView>
          <View
            style={[
              styles.dataFooter,
              {
                paddingBottom: 10,
              },
            ]}
          >
            <FancyButton
              label='Salvar alterações'
              icon={{ library: 'MaterialCommunityIcons', name: 'content-save', size: 14 }}
              onPress={handleSalvarDados}
              disabled={!hasUnsavedDadosChanges || isUpdating || isUploadingImage}
              isLoading={isUpdating || isUploadingImage}
              containerStyle={styles.dataSaveButton}
              labelProps={{ size: 'small' }}
            />
          </View>
        </View>
      ),
    },
    {
      title: 'Notificações',
      icon: { library: 'MaterialCommunityIcons', name: 'bell', size: 16 },
      content: (
        <View style={styles.tabWrapper}>
          <FancyScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={100}
            fill
          >
            <View style={styles.sectionEyebrow}>
              <View style={[styles.sectionEyebrowTick, { backgroundColor: palette.primary }]} />
              <FancyText
                type='semiBold'
                size={10}
                color={palette.primary}
                style={styles.sectionEyebrowText}
              >
                LEMBRETES AUTOMÁTICOS
              </FancyText>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                notificacoesForm.setValue('notificacoesHabilitadas', !notificacoesHabilitadas, {
                  shouldDirty: true,
                })
              }
              style={styles.toggleRow}
            >
              <View style={{ flex: 1, gap: 1 }}>
                <FancyText size='small' type='semiBold' color={palette.fonts.dark}>
                  Enviar lembretes automáticos
                </FancyText>
                <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                  Notifica voluntários sobre escalas futuras
                </FancyText>
              </View>
              <View pointerEvents='none'>
                <FancyPillToggle value={!!notificacoesHabilitadas} />
              </View>
            </TouchableOpacity>

            <View style={styles.remindersContainer}>
              <View style={styles.remindersHeader}>
                <View style={styles.sectionEyebrow}>
                  <View style={[styles.sectionEyebrowTick, { backgroundColor: palette.primary }]} />
                  <FancyText
                    type='semiBold'
                    size={10}
                    color={palette.primary}
                    style={styles.sectionEyebrowText}
                  >
                    HORÁRIOS DOS LEMBRETES
                  </FancyText>
                </View>
              </View>

              <FancyText type='normal' size='extraSmall' style={styles.remindersHelp}>
                Escolha um ou mais horários. Recomendado: 24h, 2h e 1h antes.
              </FancyText>

              <View style={styles.remindersList}>
                {REMINDER_OPTIONS.map((option) => (
                  <ReminderChip
                    key={option.value}
                    label={option.shortLabel}
                    selected={selectedReminderHours?.includes(option.value) ?? false}
                    onPress={() => toggleReminderHour(option.value)}
                    styles={styles}
                    palette={palette}
                  />
                ))}
              </View>

              {!!notificacoesForm.formState.errors.lembretesHoras?.message && (
                <FancyText type='normal' size='extraSmall' style={styles.errorText}>
                  {notificacoesForm.formState.errors.lembretesHoras.message}
                </FancyText>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <FancyButton
                label='Salvar'
                icon={{ ...DefaultIconsNames.save, size: 16 }}
                onPress={handleSalvarNotificacoes}
                disabled={isUpdating}
                isLoading={isUpdating}
              />
              <FancyButton
                label='Enviar notificação de teste'
                icon={{ library: 'Ionicons', name: 'notifications-outline', size: 16 }}
                type='outlined'
                onPress={handleEnviarTestePush}
                disabled={isSendingTestPush}
                isLoading={isSendingTestPush}
              />
            </View>
          </FancyScrollView>
        </View>
      ),
    },
    {
      title: 'Assinatura',
      icon: { library: 'MaterialCommunityIcons', name: 'credit-card', size: 16 },
      content: (
        <FancyScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.assinaturaContainer,
            { paddingBottom: Math.max(insets.bottom + 24, 36) },
          ]}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={100}
          fill
        >
          {!billingProfileComplete ? (
            <View
              style={[
                styles.billingMissingCard,
                {
                  backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
                  borderColor: ColorUtils.withAlpha(palette.primary, 0.18),
                },
              ]}
            >
              <FancyText type='semiBold' size='small'>
                Falta concluir o faturamento da igreja
              </FancyText>
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                Preencha CNPJ, telefone e endereço de cobrança na aba Dados antes de assinar.
              </FancyText>
              <FancyButton
                label='Completar faturamento'
                type='outlined'
                onPress={handleAbrirConfiguracaoFaturamento}
              />
            </View>
          ) : null}

          {assinatura ? (
            <BillingStatusPanel
              compact
              assinatura={assinatura}
              onPrimaryPress={handlePrimaryBillingAction}
              primaryLabel={billingPrimaryLabel}
              onSecondaryPress={
                hasPendingPlanChange
                  ? handleCancelarTrocaDePlano
                  : canCancelCurrentSubscription
                    ? handleCancelarAssinatura
                    : undefined
              }
              secondaryLabel={hasPendingPlanChange ? 'Cancelar troca de plano' : undefined}
              isSecondaryLoading={
                hasPendingPlanChange ? isCancelandoTrocaDePlano : isCancelandoAssinatura
              }
            />
          ) : (
            <View style={styles.billingLoadingCard}>
              <ActivityIndicator size='small' color={palette.primary} />
            </View>
          )}

          <FancyBottomSheetModal
            visible={billingPlansModalVisible}
            onClose={closeBillingPlansModal}
            title='Opções de Planos'
          >
            <View style={styles.planSheetIntro}>
              <FancyText size='small' color={palette.fonts.inactive}>
                Escolha o plano da igreja e siga para o pagamento quando quiser concluir.
              </FancyText>
            </View>

            <View style={styles.billingPeriodRow}>
              <FancySegmentedTabs
                value={billingCycle}
                onChange={setBillingCycle}
                options={[
                  { title: 'Mensal', value: 'MONTHLY' },
                  { title: 'Anual', value: 'YEARLY' },
                ]}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate='fast'
              snapToInterval={264}
              snapToAlignment='start'
              contentContainerStyle={styles.planList}
            >
              {BILLING_PLAN_OPTIONS.map((plan) => {
                const matchesCurrentSelection =
                  assinatura?.plan === plan.codigo && assinatura?.cycle === billingCycle;
                const isCurrent =
                  matchesCurrentSelection &&
                  ['active', 'trial', 'overdue'].includes(assinatura?.status ?? '');
                const isPending =
                  !!assinatura?.checkoutUrl &&
                  assinatura.status !== 'cancelled' &&
                  assinatura.plan === plan.codigo &&
                  assinatura.cycle === billingCycle;
                const isIncompatible = Boolean(
                  assinatura &&
                  (plan.maxVolunteers < assinatura.currentVolunteers ||
                    plan.maxMinistries < assinatura.currentMinistries),
                );
                const switchLocked = isIncompatible;
                const incompatibilityReason = !isIncompatible || !assinatura
                  ? null
                  : plan.maxVolunteers < assinatura.currentVolunteers
                    ? `Suporta até ${plan.maxVolunteers} voluntários (você tem ${assinatura.currentVolunteers})`
                    : `Suporta até ${plan.maxMinistries} ministérios (você tem ${assinatura.currentMinistries})`;
                const isRecommended = plan.codigo === 'essencial';
                const isUpgradeRecommendation =
                  hasExceededPlanCapacity && recommendedUpgradePlan?.codigo === plan.codigo;
                const priceLabel = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
                const [priceValue, priceSuffix] = priceLabel.split('/');
                const planAccent =
                  plan.codigo === 'starter'
                    ? palette.primary
                    : plan.codigo === 'essencial'
                      ? palette.secondary
                      : palette.terciary;
                const planIconName =
                  plan.codigo === 'starter'
                    ? 'rocket-launch-outline'
                    : plan.codigo === 'essencial'
                      ? 'star-outline'
                      : 'trending-up';
                const planBadge = isCurrent
                  ? { label: 'Atual', color: planAccent }
                  : isPending
                    ? { label: 'Pendente', color: palette.warning }
                    : isUpgradeRecommendation
                      ? { label: 'Recomendado', color: planAccent }
                      : switchLocked
                        ? { label: 'Incompatível', color: palette.fonts.inactive }
                        : isRecommended && plan.highlight
                          ? { label: plan.highlight, color: planAccent }
                          : null;
                const hasActivePlan = ['active', 'overdue'].includes(assinatura?.status ?? '');
                const isTrial = assinatura?.status === 'trial';
                const planButtonLabel =
                  isCurrent || switchLocked
                    ? null
                    : isPending
                      ? 'Continuar'
                      : isTrial
                        ? 'Escolher plano'
                        : hasActivePlan
                          ? 'Trocar plano'
                          : 'Assinar';
                const isHighlighted = (isRecommended || isUpgradeRecommendation) && !isCurrent;
                const planFeatures: string[] =
                  plan.codigo === 'starter'
                    ? [
                        `${plan.maxVolunteers} voluntários`,
                        `${plan.maxMinistries} ministérios`,
                        'Escalas e agenda',
                        'Repertório e funções',
                      ]
                    : plan.codigo === 'essencial'
                      ? [
                          `${plan.maxVolunteers} voluntários`,
                          `${plan.maxMinistries} ministérios`,
                          'Tudo do Starter',
                          'Suporte prioritário',
                        ]
                      : [
                          `${plan.maxVolunteers} voluntários`,
                          `${plan.maxMinistries} ministérios`,
                          'Tudo do Essencial',
                          'Suporte prioritário',
                        ];

                return (
                  <View
                    key={plan.codigo}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: isHighlighted
                          ? ColorUtils.withAlpha(planAccent, 0.06)
                          : palette.backgroundColor,
                        borderColor: isCurrent
                          ? planAccent
                          : isHighlighted && planBadge
                            ? planAccent
                            : isHighlighted
                              ? ColorUtils.withAlpha(planAccent, 0.5)
                              : ColorUtils.withAlpha(palette.borderCard, 0.45),
                        borderWidth: isCurrent || isHighlighted ? 1.5 : 0.5,
                      },
                      switchLocked && { opacity: 0.45 },
                    ]}
                  >
                    {/* Faixa "Mais escolhido" — só para plano destacado */}
                    {planBadge && isHighlighted ? (
                      <View style={[styles.planBanner, { backgroundColor: planAccent }]}>
                        <FancyText type='semiBold' size='extraSmall' color={palette.fonts.light}>
                          {planBadge.label}
                        </FancyText>
                      </View>
                    ) : null}

                    <View style={styles.planCardContent}>
                    {/* Cabeçalho: ícone + nome + badge (não-highlighted) */}
                    <View style={styles.planCardHeader}>
                      <View
                        style={[
                          styles.planCardIcon,
                          { backgroundColor: ColorUtils.withAlpha(planAccent, 0.12) },
                        ]}
                      >
                        <DefaultIcons.Custom
                          library='MaterialCommunityIcons'
                          name={planIconName}
                          size={18}
                          color={planAccent}
                        />
                      </View>
                      <FancyText type='semiBold' size='small' color={isHighlighted ? planAccent : palette.fonts.dark} style={{ flex: 1 }} numberOfLines={1}>
                        {plan.nome}
                      </FancyText>
                      {planBadge && !isHighlighted ? (
                        <FancyChips
                          label={planBadge.label}
                          color={planBadge.color}
                          backgroundColor={ColorUtils.withAlpha(planBadge.color, 0.12)}
                          size='small'
                          dot
                        />
                      ) : null}
                    </View>

                    {/* Preço em destaque — Text nesting garante inline em Android */}
                    {Platform.OS !== 'ios' ? (
                      <View style={styles.planPriceBlock}>
                        <FancyText type='bold' size={22} color={isHighlighted ? planAccent : palette.fonts.dark}>
                          {priceValue}
                          {priceSuffix ? (
                            <FancyText type='normal' size='small' color={palette.fonts.inactive}>
                              {' '}/{priceSuffix}
                            </FancyText>
                          ) : null}
                        </FancyText>
                        <FancyText type='normal' size='extraSmall' color={palette.fonts.inactive}>
                          cobrado {billingCycle === 'YEARLY' ? 'anualmente' : 'mensalmente'}
                        </FancyText>
                      </View>
                    ) : null}

                    {/* Lista de features com check */}
                    <View style={styles.planFeatureList}>
                      {planFeatures.map((feature) => (
                        <View key={feature} style={styles.planFeatureRow}>
                          <DefaultIcons.Custom
                            library='MaterialCommunityIcons'
                            name='check-circle-outline'
                            size={15}
                            color={planAccent}
                          />
                          <FancyText size='extraSmall' color={palette.fonts.dark}>
                            {feature}
                          </FancyText>
                        </View>
                      ))}
                    </View>

                    {/* CTA */}
                    {planButtonLabel ? (
                      <FancyButton
                        label={planButtonLabel}
                        type={isPending ? 'outlined' : 'contained'}
                        labelProps={{ size: 'extraSmall' }}
                        disabled={
                          isLoadingAssinatura ||
                          isAbrindoCheckout ||
                          !!(isPending && !assinatura?.checkoutUrl)
                        }
                        onPress={() => handleIniciarCheckout(plan.codigo)}
                        icon={{
                          library: 'MaterialCommunityIcons',
                          name: isPending ? 'credit-card-outline' : 'credit-card-check-outline',
                          size: 16,
                          color: isPending ? planAccent : palette.fonts.light,
                        }}
                        containerStyle={[
                          styles.planCardCta,
                          isPending
                            ? { borderColor: planAccent, backgroundColor: 'transparent' }
                            : { backgroundColor: planAccent, borderColor: planAccent },
                        ]}
                        labelStyle={{ color: isPending ? planAccent : palette.fonts.light }}
                      />
                    ) : isIncompatible && incompatibilityReason ? (
                      <View style={styles.planIncompatibleLabel}>
                        <DefaultIcons.Custom
                          library='MaterialCommunityIcons'
                          name='information-outline'
                          size={13}
                          color={palette.fonts.inactive}
                        />
                        <FancyText size='extraSmall' color={palette.fonts.inactive} style={{ flex: 1 }}>
                          {incompatibilityReason}
                        </FancyText>
                      </View>
                    ) : null}
                    </View>{/* planCardContent */}
                  </View>
                );
              })}
            </ScrollView>
          </FancyBottomSheetModal>
        </FancyScrollView>
      ),
    },
  ];

  const planSummary = getPlanSummary(assinatura, palette);

  return (
    <FancyPageView style={styles.container}>
      <View style={styles.heroSection}>
        <FancyListItemCard
          leading={
            data?.logoUrl
              ? { type: 'image', source: { uri: data.logoUrl }, size: 46 }
              : { type: 'icon', icon: { library: 'MaterialCommunityIcons', name: 'church' } }
          }
          title={data?.nome || 'Minha igreja'}
          subtitle={data?.codigo ? `Código ${data.codigo}` : undefined}
          trailing={
            <View style={[styles.heroPlanBadge, { backgroundColor: planSummary.badgeBackground }]}>
              <FancyText size='extraSmall' type='semiBold' color={planSummary.badgeColor}>
                {planSummary.badgeLabel}
              </FancyText>
            </View>
          }
        />
        <View style={styles.heroStatsRow}>
          <HeroStatCard
            icon={{ library: 'MaterialCommunityIcons', name: 'account-group-outline' }}
            label='Voluntários'
            value={assinatura ? `${assinatura.currentVolunteers}/${assinatura.maxVolunteers}` : '—'}
            accent={palette.primary}
            ratio={
              assinatura
                ? assinatura.currentVolunteers / Math.max(assinatura.maxVolunteers, 1)
                : undefined
            }
            styles={styles}
            palette={palette}
          />
          <HeroStatCard
            icon={{ library: 'MaterialCommunityIcons', name: 'view-grid-outline' }}
            label='Ministérios'
            value={assinatura ? `${assinatura.currentMinistries}/${assinatura.maxMinistries}` : '—'}
            accent={palette.terciary}
            ratio={
              assinatura
                ? assinatura.currentMinistries / Math.max(assinatura.maxMinistries, 1)
                : undefined
            }
            styles={styles}
            palette={palette}
          />
          <HeroStatCard
            icon={planSummary.statusIcon}
            label='Assinatura'
            value={planSummary.statusLabel}
            accent={planSummary.badgeColor}
            valueColor={planSummary.badgeColor}
            styles={styles}
            palette={palette}
          />
        </View>
      </View>
      <FancyVerticalSpacer height={12} />
      <FancyTabs items={TAB_DATA} initialIndex={activeTabIndex} onTabChange={setActiveTabIndex} />
    </FancyPageView>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    heroSection: {
      paddingHorizontal: 15,
      paddingTop: 12,
      gap: 10,
    },
    heroPlanBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    heroStatsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    heroStatCard: {
      flex: 1,
      backgroundColor: palette.backgroundColor2,
      borderWidth: 0.5,
      borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45),
      borderRadius: 16,
      paddingVertical: 11,
      paddingHorizontal: 11,
      gap: 7,
      alignItems: 'stretch',
      ...palette.shadows[200],
    },
    heroStatTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    heroStatTrack: {
      height: 5,
      borderRadius: 999,
      overflow: 'hidden',
    },
    heroStatFill: {
      height: '100%',
      borderRadius: 999,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabsContainer: {
      flex: 1,
      paddingHorizontal: 15,
    },
    tabContentContainer: {
      flex: 1,
    },
    tabWrapper: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    tabContent: {
      paddingTop: 8,
      paddingBottom: 15,
      gap: 16,
    },
    dataTabLayout: {
      flex: 1,
    },
    dataScrollContent: {
      paddingTop: 8,
      paddingBottom: 12,
    },
    dataSectionsStack: {
      gap: 12,
    },
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
    dataFooter: {
      paddingTop: 10,
      backgroundColor: palette.backgroundColor,
      alignItems: 'stretch',
    },
    dataSaveButton: {
      width: '100%',
      minHeight: 42,
      borderRadius: 16,
      paddingHorizontal: 18,
      ...palette.shadows[100],
    },
    flatSection: {
      borderWidth: 1,
      borderRadius: 18,
      backgroundColor: palette.backgroundColor2,
      overflow: 'hidden',
      ...palette.shadows[200],
    },
    flatSectionHighlighted: {
      shadowColor: palette.primary,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 2,
    },
    flatSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    flatSectionIconBadge: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flatSectionHeaderText: {
      flex: 1,
      minHeight: 46,
      justifyContent: 'center',
      gap: 2,
    },
    flatSectionContent: {
      gap: 14,
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: ColorUtils.withAlpha(palette.borderCard, 0.7),
    },
    buttonContainer: {
      marginTop: 10,
      paddingBottom: 20,
      gap: 10,
    },

    // Avatar / Logo
    avatarContainer: {
      alignItems: 'center',
      marginVertical: 8,
    },

    // Código da Igreja
    codigoTexto: {
      letterSpacing: 1,
      color: palette.primary,
    },
    codigoCopyTrailing: {
      alignItems: 'center',
      gap: 2,
    },
    sameAddressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    sameAddressText: {
      flex: 1,
      gap: 4,
    },

    // Modo de Entrada Cards
    modoCard: {
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.22),
      backgroundColor: palette.backgroundColor4,
      gap: 8,
    },
    modoCardSelected: {
      borderWidth: 2,
      borderColor: palette.primary,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.16),
    },
    modoCardTitle: {
      marginTop: 8,
    },
    modoCardDesc: {
      opacity: 0.7,
      lineHeight: 18,
    },

    // Notificações
    canaisContainer: {
      gap: 12,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 4,
    },
    remindersContainer: {
      gap: 10,
    },
    remindersHeader: {
      gap: 4,
    },
    remindersSummary: {
      opacity: 0.72,
      lineHeight: 18,
    },
    remindersHelp: {
      opacity: 0.72,
      lineHeight: 18,
    },
    remindersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    reminderChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minHeight: 34,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    checkboxesContainer: {
      gap: 12,
    },
    errorText: {
      color: palette.error,
    },

    // Assinatura
    assinaturaContainer: {
      paddingTop: 8,
      paddingBottom: 15,
      gap: 16,
    },
    billingLoadingCard: {
      minHeight: 120,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    billingMissingCard: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      gap: 10,
    },
    planSheetIntro: {
      marginTop: -4,
    },
    billingPeriodRow: {
      flexDirection: 'row',
      gap: 10,
    },
    planList: {
      flexDirection: 'row',
      gap: 10,
      paddingBottom: 4,
    },
    planCard: {
      width: 254,
      borderRadius: 16,
      overflow: 'hidden',
      flex: 1,
    },
    planBanner: {
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    planCardContent: {
      padding: 14,
      gap: 12,
      flex: 1,
    },
    planCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    planCardIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    planPriceBlock: {
      gap: 2,
    },
    planFeatureList: {
      gap: 7,
      flex: 1,
      justifyContent: 'center',
    },
    planFeatureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    planIncompatibleLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 2,
      marginTop: 2,
    },
    planCardCta: {
      marginTop: 2,
      minHeight: 40,
    },
  });
}
