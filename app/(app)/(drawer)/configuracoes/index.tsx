import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
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
  modoEntradaSchema,
  notificacoesSchema,
  DadosFormData,
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
import { getCidadesPorUf } from '../../../../domain/utils/cidades-list';
import { DropDownItemProps } from '../../../../components/fields/FancyDropDownItem';
import { useIgrejaAssinatura } from '../../../../hooks/useIgrejaAssinatura';
import BillingStatusPanel from '../../../../components/billing/BillingStatusPanel';
import {
  BILLING_PLAN_OPTIONS,
  BillingCycleCode,
} from '../../../../domain/utils/billing-plan-catalog';
import FancyModalDialog from '../../../../components/modal/FancyModalDialog';

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
  const [cidadesList, setCidadesList] = useState<DropDownItemProps<string>[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);
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
  const initialTabIndex = tab === 'plano' ? 3 : 0;

  useEffect(() => {
    if (assinatura?.cycle === 'MONTHLY' || assinatura?.cycle === 'YEARLY') {
      setBillingCycle(assinatura.cycle);
    }
  }, [assinatura?.cycle]);

  const handleCancelarAssinatura = () => {
    if (!igrejaId) return;

    Alert.alert(
      'Cancelar assinatura',
      'A igreja mantém acesso até o fim do período já pago. Deseja continuar?',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Cancelar assinatura', style: 'destructive', onPress: () => cancelarAssinatura() },
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
    const cidadeAtual = dadosForm.getValues('endereco.cidade');
    if (!cidadeAtual) return;
    const cidadeExiste = cidadesList.some((cidade) => cidade.value === cidadeAtual);
    if (!cidadeExiste) {
      dadosForm.setValue('endereco.cidade', '');
    }
  }, [cidadesList, dadosForm]);

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
  }, [data]);

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
          logoUrl: finalLogoUrl ?? undefined,
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
          {assinatura ? (
            <BillingStatusPanel assinatura={assinatura} />
          ) : (
            <View style={styles.billingLoadingCard}>
              <ActivityIndicator size='small' color={palette.primary} />
            </View>
          )}

          <View style={styles.billingInfoCard}>
            <FancyText type='semiBold' size='small'>
              Gestão da assinatura
            </FancyText>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              {assinatura?.checkoutUrl
                ? 'Existe um pagamento pendente. Você pode retomar a cobrança ou revisar as outras faixas.'
                : 'Revise o plano atual da igreja e abra as opções quando quiser ajustar a assinatura.'}
            </FancyText>
          </View>

          {assinatura?.canManageBilling ? (
            <View style={styles.billingActionsRow}>
              <FancyButton
                label={assinatura?.checkoutUrl ? 'Retomar pagamento' : 'Ver opções de assinatura'}
                onPress={openBillingPlansModal}
                containerStyle={styles.billingActionButton}
                accessibilityLabel='Abrir opções de assinatura'
              />
              <FancyButton
                label='Cancelar'
                type='outlined'
                onPress={handleCancelarAssinatura}
                disabled={isCancelandoAssinatura}
                isLoading={isCancelandoAssinatura}
                containerStyle={styles.billingActionButton}
              />
            </View>
          ) : null}

          <FancyModalDialog
            title='Opções de assinatura'
            showCloseButton
            onButton1Press={closeBillingPlansModal}
            button1={{ label: 'Fechar' }}
            button2={{ visible: false }}
            closeOnBackdropPress
            titleAlign='left'
            modalProps={{
              visible: billingPlansModalVisible,
            }}
            centerContainerStyle={styles.billingModalContent}
          >
            <View style={styles.billingModalHeader}>
              <FancyText type='semiBold' size='small'>
                Escolha a faixa da igreja
              </FancyText>
              <FancyText size='extraSmall' color={palette.fonts.inactive}>
                O pagamento continua no navegador e o status volta sincronizado depois da confirmação.
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
                const priceLabel =
                  billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

                return (
                  <View
                    key={plan.codigo}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: palette.backgroundColor4,
                        borderColor:
                          isCurrent || isPending
                            ? ColorUtils.withAlpha(palette.primary, 0.26)
                            : palette.borderCard,
                      },
                    ]}
                  >
                    <View style={styles.planHeader}>
                      <View style={styles.planHeaderText}>
                        <FancyText type='semiBold' size='small'>
                          {plan.nome}
                        </FancyText>
                        <FancyText size='extraSmall' color={palette.fonts.inactive}>
                          {plan.descricao}
                        </FancyText>
                      </View>
                      {Platform.OS !== 'ios' ? (
                        <View style={styles.planPriceBlock}>
                          {plan.highlight ? (
                            <FancyText size='extraSmall' type='semiBold' color={palette.primary}>
                              {plan.highlight}
                            </FancyText>
                          ) : null}
                          <FancyText type='bold' size='small'>
                            {priceLabel}
                          </FancyText>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.planFeatureList}>
                      <FancyText size='extraSmall' color={palette.fonts.inactive}>
                        Até {plan.maxVolunteers} voluntários ativos
                      </FancyText>
                      <FancyText size='extraSmall' color={palette.fonts.inactive}>
                        Até {plan.maxMinistries} ministérios ativos
                      </FancyText>
                    </View>

                    {isCurrent ? (
                      <FancyText size='extraSmall' type='semiBold' color={palette.primary}>
                        Faixa atual
                      </FancyText>
                    ) : isPending ? (
                      <FancyText size='extraSmall' type='semiBold' color={palette.primary}>
                        Pagamento pendente para esta faixa
                      </FancyText>
                    ) : null}

                    <FancyButton
                      label={
                        isCurrent
                          ? 'Faixa atual'
                          : isPending
                            ? 'Continuar pagamento'
                            : switchLocked
                              ? 'Troca disponível em breve'
                              : 'Escolher esta faixa'
                      }
                      type={isCurrent || isPending ? 'outlined' : 'contained'}
                      disabled={
                        isCurrent ||
                        switchLocked ||
                        isLoadingAssinatura ||
                        isAbrindoCheckout ||
                        !!(isPending && !assinatura?.checkoutUrl)
                      }
                      onPress={() => {
                        iniciarCheckout({
                          churchId: igrejaId!,
                          plan: plan.codigo,
                          cycle: billingCycle,
                        });
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </FancyModalDialog>
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
        initialIndex={initialTabIndex}
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
    billingInfoCard: {
      borderWidth: 1,
      borderColor: palette.borderCard,
      backgroundColor: palette.backgroundColor4,
      borderRadius: 18,
      padding: 16,
      gap: 6,
    },
    billingModalContent: {
      gap: 16,
    },
    billingModalHeader: {
      gap: 6,
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
      gap: 2,
    },
    planFeatureList: {
      gap: 4,
    },
    billingActionsRow: {
      flexDirection: 'row',
      gap: 12,
      paddingBottom: 20,
    },
    billingActionButton: {
      flex: 1,
    },
    billingActions: {
      paddingBottom: 20,
    },
  });
}
