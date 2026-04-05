import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { uploadToCloudinaryUnsigned } from '../../../../services/cloudinary_upload';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../../../config/cloudinary';
import FancyPageView from '../../../../components/containers/FancyPageView';
import FancyTabs, { TabItem } from '../../../../components/tabs/FancyTabs';
import { DefaultIconsNames } from '../../../../constants/icons';
import { useMemo, useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useIgrejaConfiguracoes } from '../../../../hooks/useIgrejaConfiguracoes';
import { useAuth } from '../../../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  dadosSchema,
  faturamentoSchema,
  modoEntradaSchema,
  notificacoesSchema,
  DadosFormData,
  FaturamentoFormData,
  ModoEntradaFormData,
  NotificacoesFormData,
} from '../../../../domain/schemas/igreja-configuracoes.schema';
import ControlledTextInput from '../../../../components/forms/ControlledTextInput';
import ControlledSearchSelect from '../../../../components/forms/ControlledSearchSelect';
import ControlledMaskedTextInput from '../../../../components/forms/ControlledMaskedTextInput';
import FancyButton from '../../../../components/buttons/FancyButton';
import { ThemePalette } from '../../../../constants/colors';
import DefaultIcons from '../../../../components/FancyIcons';
import FancyText from '../../../../components/FancyText';
import { ModoEntradaEnum } from '../../../../domain/enums/modo-entrada.enum';
import ControlledFancyToggle from '../../../../components/forms/ControlledFancyToggle';
import FancyCheckbox from '../../../../components/FancyCheckbox';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import {
  ControlledImagePicker,
  FormImageFile,
} from '../../../../components/forms/ControlledImagePicker';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../../utils/color_utils';
import { UF_LIST } from '../../../../domain/utils/uf-list';
import {
  getCidadesComCodigoPorUf,
  getCidadesPorUf,
} from '../../../../domain/utils/cidades-list';
import { DropDownItemProps } from '../../../../components/fields/FancyDropDownItem';
import { useIgrejaAssinatura } from '../../../../hooks/useIgrejaAssinatura';
import BillingStatusPanel from '../../../../components/billing/BillingStatusPanel';
import {
  BILLING_PLAN_OPTIONS,
  BillingCycleCode,
} from '../../../../domain/utils/billing-plan-catalog';
import FancyBottomSheetModal from '../../../../components/modal/FancyBottomSheetModal';
import { FancyAlert } from '../../../../components/modal/FancyAlert';

const REMINDER_OPTIONS = [
  { title: '1 semana antes', value: 168, description: 'Ideal para escalas semanais e eventos maiores.' },
  { title: '72 horas antes', value: 72, description: 'Ajuda quem se organiza com alguns dias de antecedência.' },
  { title: '48 horas antes', value: 48, description: 'Lembrete intermediário bastante comum.' },
  { title: '24 horas antes', value: 24, description: 'O padrão mais usado para escalas de igreja.' },
  { title: '12 horas antes', value: 12, description: 'Bom para reforçar no dia anterior.' },
  { title: '3 horas antes', value: 3, description: 'Útil para confirmar deslocamento e preparação.' },
  { title: '2 horas antes', value: 2, description: 'Boa janela para quem precisa sair de casa.' },
  { title: '1 hora antes', value: 1, description: 'Último lembrete antes do compromisso.' },
] as const;

const DEFAULT_REMINDER_HOURS = [24, 2, 1];

const normalizeOptionalValue = (value?: string | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

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

export default function ConfiguracoesPage() {
  const { igrejaAtiva, user, updateUser } = useAuth();
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const igrejaId = igrejaAtiva?.id;
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const {
    data: assinatura,
    isLoading: isLoadingAssinatura,
    iniciarCheckout,
    cancelarAssinatura,
    isAbrindoCheckout,
    isCancelandoAssinatura,
  } = useIgrejaAssinatura({ igrejaId });

  // Não executar o hook se não houver igreja ativa
  const { data, isLoading, updateDados, updateModoEntrada, updateNotificacoes, isUpdating } =
    useIgrejaConfiguracoes({
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

  const modoEntradaForm = useForm<ModoEntradaFormData>({
    resolver: zodResolver(modoEntradaSchema),
    defaultValues: data
      ? {
          modoEntrada: data.modoEntrada,
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
  const [billingCycle, setBillingCycle] = useState<BillingCycleCode>('MONTHLY');
  const [billingPlansModalVisible, setBillingPlansModalVisible] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(tab === 'plano' ? 3 : 0);

  // States para checkboxes
  const [canaisPush, setCanaisPush] = useState(
    data?.configuracoes?.notificacoes?.canais?.push ??
      data?.notificacoes?.canais?.push ??
      data?.notificacoes?.canaisPush ??
      true,
  );
  const [canaisWhatsapp, setCanaisWhatsapp] = useState(
    data?.configuracoes?.notificacoes?.canais?.whatsapp ??
      data?.notificacoes?.canais?.whatsapp ??
      data?.notificacoes?.canaisWhatsapp ??
      false,
  );
  const ufSelecionada = dadosForm.watch('endereco.uf');
  const ufFaturamentoSelecionada = faturamentoForm.watch('uf');
  const [cidadesList, setCidadesList] = useState<DropDownItemProps<string>[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
  const [billingCitiesList, setBillingCitiesList] = useState<DropDownItemProps<string>[]>([]);
  const [isLoadingBillingCities, setIsLoadingBillingCities] = useState(false);
  const faturamentoValues = faturamentoForm.watch();
  const billingProfileComplete = useMemo(
    () => isFaturamentoCompleto(faturamentoValues),
    [faturamentoValues],
  );
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

  const openBillingPlansModal = () => setBillingPlansModalVisible(true);
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
      dadosForm.setValue('endereco.cidade', '');
      return;
    }

    setIsLoadingCidades(true);
    getCidadesPorUf(ufSelecionada)
      .then((cidades) => {
        setCidadesList(cidades);
      })
      .catch(() => {
        setCidadesList([]);
      })
      .finally(() => {
        setIsLoadingCidades(false);
      });
  }, [ufSelecionada, dadosForm]);

  useEffect(() => {
    if (!ufFaturamentoSelecionada) {
      setBillingCitiesList([]);
      faturamentoForm.setValue('cidadeIbge', '');
      faturamentoForm.setValue('cidade', '');
      return;
    }

    setIsLoadingBillingCities(true);
    getCidadesComCodigoPorUf(ufFaturamentoSelecionada)
      .then((cidades) => {
        setBillingCitiesList(cidades);
      })
      .catch(() => {
        setBillingCitiesList([]);
      })
      .finally(() => {
        setIsLoadingBillingCities(false);
      });
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

      modoEntradaForm.reset({
        modoEntrada: data.modoEntrada,
      });

      // Suporte para ambas estruturas: configuracoes.notificacoes ou notificacoes diretamente
      const notificacoes = data.configuracoes?.notificacoes || data.notificacoes;
      if (notificacoes) {
        const lembretesHoras =
          notificacoes.lembretesHoras?.length
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

        setCanaisPush(notificacoes.canais?.push ?? notificacoes.canaisPush ?? true);
        setCanaisWhatsapp(notificacoes.canais?.whatsapp ?? notificacoes.canaisWhatsapp ?? false);
      }
    }
  }, [data, faturamentoForm]);

  // Handlers
  const handleSalvarDados = dadosForm.handleSubmit(async (formData: DadosFormData) => {
    console.log('📤 Dados do form a serem enviados:', JSON.stringify(formData, null, 2));

    // Fazer upload da imagem se houver uma nova
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
        },
      });
    } catch (error) {
      // Erro já tratado pelo hook
    }
  });

  const handleSalvarFaturamento = faturamentoForm.handleSubmit(async (formData) => {
    try {
      await updateDados({
        igrejaId: igrejaId!,
        dto: {
          faturamento: {
            ...formData,
            emailCobranca: normalizeOptionalValue(formData.emailCobranca),
            complemento: normalizeOptionalValue(formData.complemento),
          },
        },
      });
    } catch (error) {
      // Erro já tratado pelo hook
    }
  });

  const handleSalvarModoEntrada = modoEntradaForm.handleSubmit((formData) => {
    updateModoEntrada({
      igrejaId: igrejaId!,
      dto: formData,
    });
  });

  const handleSalvarNotificacoes = notificacoesForm.handleSubmit((formData) => {
    const lembretesHoras = [...formData.lembretesHoras].sort((a, b) => b - a);
    updateNotificacoes({
      igrejaId: igrejaId!,
      dto: {
        notificacoesHabilitadas: formData.notificacoesHabilitadas,
        antecedenciaHoras: lembretesHoras[0],
        lembretesHoras,
        canaisPush,
        canaisWhatsapp,
      },
    });
  });

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
  };

  const handleIniciarCheckout = (plan: (typeof BILLING_PLAN_OPTIONS)[number]['codigo']) => {
    if (!billingProfileComplete) {
      closeBillingPlansModal();
      setActiveTabIndex(0);
      FancyAlert.alert(
        'Dados de faturamento pendentes',
        'Complete os dados de faturamento da igreja antes de iniciar a assinatura.',
        [{ text: 'Ok', style: 'default' }],
      );
      return;
    }

    iniciarCheckout({
      churchId: igrejaId!,
      plan,
      cycle: billingCycle,
    });
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
        <View style={styles.tabWrapper}>
          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={100}
          >
            {/* Avatar / Logo */}
            <View style={styles.avatarContainer}>
              <ControlledImagePicker
                control={dadosForm.control}
                name='logoUrl'
                setValue={dadosForm.setValue}
                uploadFieldName={'logoFile' as any}
              />
            </View>

            {/* Formulário */}
            <ControlledTextInput control={dadosForm.control} name='nome' label='Nome da Igreja' />

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
              disabled={!ufSelecionada || isLoadingCidades}
              isLoading={isLoadingCidades}
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

            <View
              style={[
                styles.billingProfileCard,
                {
                  backgroundColor: palette.backgroundColor4,
                  borderColor: billingProfileComplete
                    ? ColorUtils.withAlpha(palette.confirm, 0.28)
                    : ColorUtils.withAlpha(palette.primary, 0.24),
                },
              ]}
            >
              <View style={styles.billingProfileHeader}>
                <View style={styles.billingProfileHeaderText}>
                  <FancyText type='semiBold' size='small'>
                    Dados de faturamento
                  </FancyText>
                  <FancyText size='extraSmall' color={palette.fonts.inactive}>
                    Esses dados são usados para criar o cliente da igreja no checkout do Asaas.
                  </FancyText>
                </View>
                <View
                  style={[
                    styles.billingProfilePill,
                    {
                      backgroundColor: billingProfileComplete
                        ? ColorUtils.withAlpha(palette.confirm, 0.12)
                        : ColorUtils.withAlpha(palette.primary, 0.12),
                    },
                  ]}
                >
                  <FancyText
                    size='extraSmall'
                    type='semiBold'
                    color={billingProfileComplete ? palette.confirm : palette.primary}
                  >
                    {billingProfileComplete ? 'Completo' : 'Pendente'}
                  </FancyText>
                </View>
              </View>

              <ControlledMaskedTextInput
                control={faturamentoForm.control}
                name='cnpj'
                label='CNPJ'
                maskType='cnpj'
              />

              <ControlledMaskedTextInput
                control={faturamentoForm.control}
                name='telefoneCobranca'
                label='Telefone de cobrança'
                maskType='phone'
              />

              <ControlledTextInput
                control={faturamentoForm.control}
                name='emailCobranca'
                label='Email de cobrança'
                keyboardType='email-address'
              />

              <ControlledMaskedTextInput
                control={faturamentoForm.control}
                name='cep'
                label='CEP de faturamento'
                maskType='cep'
              />

              <ControlledTextInput
                control={faturamentoForm.control}
                name='rua'
                label='Rua de faturamento'
              />

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
                label='Estado de faturamento'
                listItems={UF_LIST}
                placeholder='Selecione o estado'
                searchPlaceholder='Buscar estado...'
              />

              <ControlledSearchSelect
                control={faturamentoForm.control}
                name='cidadeIbge'
                label='Cidade de faturamento'
                listItems={billingCitiesList}
                placeholder={
                  isLoadingBillingCities ? 'Carregando cidades...' : 'Selecione a cidade'
                }
                searchPlaceholder='Buscar cidade...'
                disabled={!ufFaturamentoSelecionada || isLoadingBillingCities}
                isLoading={isLoadingBillingCities}
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

              {!isLoadingBillingCities && ufFaturamentoSelecionada && billingCitiesList.length === 0 ? (
                <FancyText size='extraSmall' color={palette.error}>
                  Não foi possível carregar as cidades com código IBGE. Tente novamente antes de assinar.
                </FancyText>
              ) : null}

              <FancyButton
                label='Salvar faturamento'
                icon={{ library: 'MaterialCommunityIcons', name: 'office-building-cog', size: 14 }}
                onPress={handleSalvarFaturamento}
                disabled={isUpdating}
                isLoading={isUpdating}
              />
            </View>

            {/* Código da Igreja */}
            <View style={styles.codigoCard}>
              <View style={styles.codigoHeader}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='qrcode'
                  size={20}
                  color={palette.primary}
                />
                <FancyText type='medium' size='small' style={styles.codigoTitulo}>
                  Código da Igreja
                </FancyText>
              </View>
              <View style={styles.codigoBody}>
                <FancyText type='bold' size='extraLarge' style={styles.codigoTexto}>
                  {data?.codigo || '---'}
                </FancyText>
                <FancyText type='normal' size='extraSmall' style={styles.codigoDesc}>
                  Compartilhe este código para convidar pessoas
                </FancyText>
              </View>
              <TouchableOpacity style={styles.codigoCopyButton} onPress={handleCopiarCodigo}>
                <DefaultIcons.Custom
                  library='MaterialCommunityIcons'
                  name='content-copy'
                  size={16}
                  color={palette.primary}
                />
                <FancyText type='medium' size='small' style={styles.codigoCopyText}>
                  Copiar Código
                </FancyText>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <FancyButton
                label='Salvar Alterações'
                icon={{ library: 'MaterialCommunityIcons', name: 'content-save', size: 14 }}
                onPress={handleSalvarDados}
                disabled={isUpdating || isUploadingImage}
                isLoading={isUpdating || isUploadingImage}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      ),
    },
    {
      title: 'Acesso',
      icon: { library: 'MaterialCommunityIcons', name: 'shield-account', size: 16 },
      content: (
        <View style={styles.tabWrapper}>
          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={100}
          >
            <TouchableOpacity
              style={[
                styles.modoCard,
                modoEntradaForm.watch('modoEntrada') === ModoEntradaEnum.APENAS_CONVITE && [
                  styles.modoCardSelected,
                  { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.16) },
                ],
              ]}
              onPress={() =>
                modoEntradaForm.setValue('modoEntrada', ModoEntradaEnum.APENAS_CONVITE)
              }
            >
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='account-key'
                size={32}
                color={
                  modoEntradaForm.watch('modoEntrada') === ModoEntradaEnum.APENAS_CONVITE
                    ? palette.primary
                    : palette.fonts.inactive
                }
              />
              <FancyText type='bold' size='medium' style={styles.modoCardTitle}>
                Apenas Convite
              </FancyText>
              <FancyText type='normal' size='small' style={styles.modoCardDesc}>
                Somente pessoas com convite podem entrar na igreja
              </FancyText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modoCard,
                modoEntradaForm.watch('modoEntrada') === ModoEntradaEnum.CODIGO_COM_APROVACAO && [
                  styles.modoCardSelected,
                  { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.16) },
                ],
              ]}
              onPress={() =>
                modoEntradaForm.setValue('modoEntrada', ModoEntradaEnum.CODIGO_COM_APROVACAO)
              }
            >
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='shield-check'
                size={32}
                color={
                  modoEntradaForm.watch('modoEntrada') === ModoEntradaEnum.CODIGO_COM_APROVACAO
                    ? palette.primary
                    : palette.fonts.inactive
                }
              />
              <FancyText type='bold' size='medium' style={styles.modoCardTitle}>
                Código com Aprovação
              </FancyText>
              <FancyText type='normal' size='small' style={styles.modoCardDesc}>
                Qualquer um com código pode solicitar entrada. Um administrador deve aprovar.
              </FancyText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modoCard,
                modoEntradaForm.watch('modoEntrada') === ModoEntradaEnum.CODIGO_LIVRE && [
                  styles.modoCardSelected,
                  { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.16) },
                ],
              ]}
              onPress={() => modoEntradaForm.setValue('modoEntrada', ModoEntradaEnum.CODIGO_LIVRE)}
            >
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='door-open'
                size={32}
                color={
                  modoEntradaForm.watch('modoEntrada') === ModoEntradaEnum.CODIGO_LIVRE
                    ? palette.primary
                    : palette.fonts.inactive
                }
              />
              <FancyText type='bold' size='medium' style={styles.modoCardTitle}>
                Código Livre
              </FancyText>
              <FancyText type='normal' size='small' style={styles.modoCardDesc}>
                Qualquer um com o código entra automaticamente na igreja
              </FancyText>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <FancyButton
                label='Salvar'
                icon={{ library: 'MaterialCommunityIcons', name: 'shield-check', size: 14 }}
                onPress={handleSalvarModoEntrada}
                disabled={isUpdating}
                isLoading={isUpdating}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      ),
    },
    {
      title: 'Notificações',
      icon: { library: 'MaterialCommunityIcons', name: 'bell', size: 16 },
      content: (
        <View style={styles.tabWrapper}>
          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.tabContent}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={100}
          >
            <ControlledFancyToggle
              control={notificacoesForm.control}
              name='notificacoesHabilitadas'
              label='Lembretes automáticos'
              option1={{ title: 'Habilitado', value: true }}
              option2={{ title: 'Desabilitado', value: false }}
            />

            <View style={styles.remindersContainer}>
              <View style={styles.remindersHeader}>
                <FancyText type='medium' size='small' style={styles.canaisLabel}>
                  Horários dos lembretes
                </FancyText>
                <FancyText type='normal' size='extraSmall' style={styles.remindersSummary}>
                  {reminderLabel}
                </FancyText>
              </View>

              <FancyText type='normal' size='extraSmall' style={styles.remindersHelp}>
                Escolha um ou mais horários. Recomendado: 24h, 2h e 1h antes.
              </FancyText>

              <View style={styles.remindersList}>
                {REMINDER_OPTIONS.map((option) => {
                  const selected = selectedReminderHours?.includes(option.value) ?? false;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.reminderOption,
                        selected && styles.reminderOptionSelected,
                        selected && {
                          borderColor: palette.primary,
                          backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
                        },
                      ]}
                      onPress={() => toggleReminderHour(option.value)}
                      activeOpacity={0.85}
                    >
                      <View pointerEvents='none'>
                        <FancyCheckbox value={selected} />
                      </View>
                      <View style={styles.reminderOptionText}>
                        <FancyText type='semiBold' size='small'>
                          {option.title}
                        </FancyText>
                        <FancyText
                          type='normal'
                          size='extraSmall'
                          style={styles.reminderOptionDescription}
                        >
                          {option.description}
                        </FancyText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!!notificacoesForm.formState.errors.lembretesHoras?.message && (
                <FancyText type='normal' size='extraSmall' style={styles.errorText}>
                  {notificacoesForm.formState.errors.lembretesHoras.message}
                </FancyText>
              )}
            </View>

            <View style={styles.canaisContainer}>
              <FancyText type='medium' size='small' style={styles.canaisLabel}>
                Canais de notificação:
              </FancyText>

              <View style={styles.checkboxesContainer}>
                <FancyCheckbox
                  label='Notificações Push'
                  value={canaisPush}
                  onChangeValue={setCanaisPush}
                />
                <FancyCheckbox
                  label='WhatsApp'
                  value={canaisWhatsapp}
                  onChangeValue={setCanaisWhatsapp}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <FancyButton
                label='Salvar'
                icon={{ library: 'MaterialCommunityIcons', name: 'bell-check', size: 14 }}
                onPress={handleSalvarNotificacoes}
                disabled={isUpdating}
                isLoading={isUpdating}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      ),
    },
    {
      title: 'Assinatura',
      icon: { library: 'MaterialCommunityIcons', name: 'credit-card', size: 16 },
      content: (
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.assinaturaContainer}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={100}
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
              assinatura={assinatura}
              onPrimaryPress={openBillingPlansModal}
              primaryLabel={assinatura?.checkoutUrl ? 'Retomar pagamento' : 'Ver planos'}
              onSecondaryPress={assinatura?.canManageBilling ? handleCancelarAssinatura : undefined}
              isSecondaryLoading={isCancelandoAssinatura}
            />
          ) : (
            <View style={styles.billingLoadingCard}>
              <ActivityIndicator size='small' color={palette.primary} />
            </View>
          )}

          <FancyBottomSheetModal
            visible={billingPlansModalVisible}
            onClose={closeBillingPlansModal}
            title='Opções de assinatura'
          >
            <View style={styles.planSheetIntro}>
              <FancyText size='small' color={palette.fonts.inactive}>
                Escolha o plano da igreja e siga para o pagamento quando quiser concluir.
              </FancyText>
            </View>

            <View style={styles.billingPeriodRow}>
              {([
                { code: 'MONTHLY', label: 'Mensal' },
                { code: 'YEARLY', label: 'Anual' },
              ] as const).map((period) => {
                const selected = billingCycle === period.code;
                return (
                  <TouchableOpacity
                    key={period.code}
                    style={[
                      styles.periodButton,
                      {
                        backgroundColor: selected
                          ? ColorUtils.withAlpha(palette.primary, 0.12)
                          : palette.backgroundColor4,
                        borderColor: selected
                          ? ColorUtils.withAlpha(palette.primary, 0.28)
                          : palette.borderCard,
                      },
                    ]}
                    onPress={() => setBillingCycle(period.code)}
                  >
                    <FancyText type={selected ? 'semiBold' : 'normal'} size='small'>
                      {period.label}
                    </FancyText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.planList}>
              {BILLING_PLAN_OPTIONS.map((plan) => {
                const isCurrent =
                  assinatura?.plan === plan.codigo && assinatura?.cycle === billingCycle;
                const isPending =
                  !!assinatura?.checkoutUrl &&
                  assinatura.plan === plan.codigo &&
                  assinatura.cycle === billingCycle;
                const switchLocked = assinatura?.status === 'active' && !isCurrent;
                const isRecommended = plan.codigo === 'essencial';
                const priceLabel =
                  billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
                const [priceValue, priceSuffix] = priceLabel.split('/');
                const planAccent =
                  plan.codigo === 'starter'
                    ? palette.primary
                    : plan.codigo === 'essencial'
                      ? palette.confirm
                      : palette.terciary;
                const buttonContainerStyle = isCurrent || isPending
                  ? {
                      borderColor: planAccent,
                      backgroundColor: 'transparent',
                    }
                  : switchLocked
                    ? {
                        borderColor: ColorUtils.withAlpha(planAccent, 0.28),
                        backgroundColor: 'transparent',
                      }
                    : {
                        backgroundColor: planAccent,
                        borderColor: planAccent,
                      };
                const buttonLabelStyle = {
                  color:
                    isCurrent || isPending
                      ? planAccent
                      : switchLocked
                        ? palette.fonts.inactive
                        : palette.fonts.light,
                };

                return (
                  <View
                    key={plan.codigo}
                    style={[
                      styles.planCard,
                      isRecommended && styles.planCardRecommended,
                      {
                        backgroundColor: palette.backgroundColor,
                        borderColor:
                          isCurrent || isPending
                            ? planAccent
                            : isRecommended
                              ? ColorUtils.withAlpha(planAccent, 0.5)
                              : ColorUtils.withAlpha(planAccent, 0.24),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.planAccentBar,
                        { backgroundColor: ColorUtils.withAlpha(planAccent, 0.92) },
                      ]}
                    />

                    <View style={styles.planHeader}>
                      <View style={styles.planHeaderText}>
                        <FancyText type='semiBold' size='large' color={planAccent}>
                          {plan.nome}
                        </FancyText>
                        <FancyText
                          type='medium'
                          size='small'
                          color={ColorUtils.withAlpha(palette.fonts.dark, 0.82)}
                        >
                          {plan.descricao}
                        </FancyText>
                      </View>
                      {Platform.OS !== 'ios' ? (
                        <View style={styles.planPriceBlock}>
                          {plan.highlight ? (
                            <View
                              style={[
                                styles.planBadge,
                                { backgroundColor: ColorUtils.withAlpha(planAccent, 0.1) },
                              ]}
                            >
                              <FancyText size='small' type='semiBold' color={planAccent}>
                                {plan.highlight}
                              </FancyText>
                            </View>
                          ) : null}
                          <View style={styles.planPriceTextBlock}>
                            <FancyText
                              type='bold'
                              size='extraLarge'
                              color={planAccent}
                              style={styles.planPriceValue}
                            >
                              {priceValue}
                            </FancyText>
                            {priceSuffix ? (
                              <FancyText
                                type='semiBold'
                                size='small'
                                color={ColorUtils.withAlpha(planAccent, 0.9)}
                              >
                                /{priceSuffix}
                              </FancyText>
                            ) : null}
                          </View>
                        </View>
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.planDivider,
                        { backgroundColor: ColorUtils.withAlpha(planAccent, 0.12) },
                      ]}
                    />

                    <View style={styles.planFeatureGrid}>
                      <View style={styles.planFeatureColumn}>
                        <FancyText size='small' color={palette.fonts.dark}>
                          • Até {plan.maxVolunteers} voluntários ativos
                        </FancyText>
                        <FancyText size='small' color={palette.fonts.dark}>
                          • Cobrança {billingCycle === 'YEARLY' ? 'anual' : 'mensal'}
                        </FancyText>
                      </View>
                      <View style={styles.planFeatureColumn}>
                        <FancyText size='small' color={palette.fonts.dark}>
                          • Até {plan.maxMinistries} ministérios ativos
                        </FancyText>
                        <FancyText size='small' color={palette.fonts.dark}>
                          • Ajuste para o ritmo atual da igreja
                        </FancyText>
                      </View>
                    </View>

                    {isCurrent ? (
                      <FancyText size='extraSmall' type='semiBold' color={planAccent}>
                        Plano atual
                      </FancyText>
                    ) : isPending ? (
                      <FancyText size='extraSmall' type='semiBold' color={planAccent}>
                        Pagamento pendente para esta faixa
                      </FancyText>
                    ) : null}

                    <FancyButton
                      label={
                        isCurrent
                          ? 'Plano atual'
                          : isPending
                            ? 'Continuar pagamento'
                            : switchLocked
                              ? 'Indisponível por enquanto'
                              : 'Assinar plano'
                      }
                      type={isCurrent || isPending ? 'outlined' : 'contained'}
                      disabled={
                        isCurrent ||
                        switchLocked ||
                        isLoadingAssinatura ||
                        isAbrindoCheckout ||
                        !!(isPending && !assinatura?.checkoutUrl)
                      }
                      onPress={() => handleIniciarCheckout(plan.codigo)}
                      containerStyle={buttonContainerStyle}
                      labelStyle={buttonLabelStyle}
                    />
                  </View>
                );
              })}
            </View>
          </FancyBottomSheetModal>
        </KeyboardAwareScrollView>
      ),
    },
  ];

  return (
    <FancyPageView style={styles.container}>
      <FancyTabs
        items={TAB_DATA}
        containerStyle={styles.tabsContainer}
        contentContainerStyle={styles.tabContentContainer}
        initialIndex={activeTabIndex}
        onTabChange={setActiveTabIndex}
      />
    </FancyPageView>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
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
      paddingVertical: 15,
      gap: 16,
    },
    buttonContainer: {
      marginTop: 10,
      paddingBottom: 20,
    },

    // Avatar / Logo
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 8,
    },

    // Código da Igreja - Novo Layout
    codigoCard: {
      backgroundColor: palette.backgroundColor2,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: palette.borderCard,
      ...palette.shadows[100],
    },
    codigoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    codigoTitulo: {
      opacity: 0.7,
    },
    codigoBody: {
      alignItems: 'center',
      paddingVertical: 12,
      gap: 4,
    },
    codigoTexto: {
      letterSpacing: 2,
      color: palette.primary,
    },
    codigoDesc: {
      opacity: 0.6,
      textAlign: 'center',
    },
    codigoCopyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14),
      borderRadius: 8,
    },
    codigoCopyText: {
      color: palette.primary,
    },
    billingProfileCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      ...palette.shadows[100],
    },
    billingProfileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    billingProfileHeaderText: {
      flex: 1,
      gap: 4,
    },
    billingProfilePill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
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
      gap: 10,
    },
    reminderOption: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor4,
    },
    reminderOptionSelected: {
      borderWidth: 1.5,
    },
    reminderOptionText: {
      flex: 1,
      gap: 4,
    },
    reminderOptionDescription: {
      opacity: 0.7,
      lineHeight: 18,
    },
    canaisLabel: {
      opacity: 0.7,
    },
    checkboxesContainer: {
      gap: 12,
    },
    errorText: {
      color: palette.error,
    },

    // Assinatura
    assinaturaContainer: {
      paddingVertical: 15,
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
    periodButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette.borderCard,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    planList: {
      gap: 12,
    },
    planCard: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      gap: 12,
      overflow: 'hidden',
      ...palette.shadows[100],
    },
    planCardRecommended: {
      borderWidth: 1.5,
    },
    planAccentBar: {
      height: 6,
      borderRadius: 999,
      marginBottom: 2,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
      alignItems: 'flex-start',
    },
    planHeaderText: {
      flex: 1,
      gap: 4,
    },
    planPriceBlock: {
      alignItems: 'flex-end',
      gap: 8,
    },
    planPriceTextBlock: {
      alignItems: 'flex-end',
      gap: 2,
    },
    planPriceValue: {
      lineHeight: 28,
    },
    planBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    planDivider: {
      height: 1,
      width: '100%',
    },
    planFeatureGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    planFeatureColumn: {
      flex: 1,
      gap: 6,
    },
  });
}
