import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import FancyBasePage from '../../../../../components/pages/base/FancyBasePage';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../../../../components/forms/ControlledTextInput';
import ControlledToggle from '../../../../../components/forms/ControlledFancyToggle';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useEffect, useRef, useState } from 'react';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { DefaultIconsNames } from '../../../../../constants/icons';
import ControlledDateInput from '../../../../../components/forms/ControlledDateInput';
import FancyLoading from '../../../../../components/FancyLoading';
import { ControlledImagePicker } from '../../../../../components/forms/ControlledImagePicker';
import FancyFormScrollView from '../../../../../components/FancyFormScrollView';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { updateProfileSchema } from '../../../../../domain/schemas/voluntarioSchema';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { SexoEnum, SexoEnumLabel } from '../../../../../domain/enums/common/sexo-enum';
import { sendImageToServer } from '../../../../../utils/image_utils';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { useKeyboardState } from 'react-native-keyboard-controller';

export default function EditProfilePage() {
  const { user, updateUser, igrejaAtiva } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  const cacheBusterRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      sexo: SexoEnum.Masculino,
      fotoUrl: null,
      fotoThumbUrl: null,
      fotoUpload: null,
    },
  });

  const {
    data: voluntarioData,
    update: updateVoluntario,
    isLoadingMutation,
    isLoading,
  } = useVoluntariosCrud({
    autoFetch: true,
    igrejaId: igrejaAtiva?.id,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'id',
            operator: Operator.EQUALS,
            value: { value: user?.user?.id!, type: ValueType.LITERAL },
          },
        ],
      },
    },
  });

  useEffect(() => {
    const voluntario = voluntarioData?.[0];
    if (!voluntario) return;

    form.reset({
      fotoUrl: voluntario.fotoUrl ?? null,
      fotoThumbUrl: voluntario.fotoThumbUrl ?? null,
      fotoUpload: null,
      nome: voluntario.nome ?? '',
      email: voluntario.email ?? '',
      dataNascimento: voluntario.dataNascimento
        ? DateUtilsApi.dateOnlyFromApi(voluntario.dataNascimento)
        : undefined,
      endereco: voluntario.endereco ?? '',
      telefone: voluntario.telefone ?? '',
      status: voluntario.status,
      sexo: voluntario.sexo,
    });
  }, [voluntarioData]);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;
    if (!user?.user?.id) return;

    setIsSubmitting(true);
    showLoading('Salvando...');

    try {
      // 3 estados da foto: upload novo, remoção (limpou sem subir outra) ou
      // inalterada. `undefined` = não mexer no campo; `null` = remover no backend.
      const hasNewUpload = !!data.fotoUpload?.uri;
      const photoRemoved = !hasNewUpload && !data.fotoThumbUrl;

      let fotoUrlToSend: string | null | undefined;
      let fotoThumbUrlToSend: string | null | undefined;
      let fotoUrlPreview: string | undefined;
      let fotoThumbPreview: string | undefined;

      if (hasNewUpload) {
        const { imageThumbUrl, imageUrl } = await sendImageToServer(
          'voluntarios',
          data.fotoUpload!,
        );

        fotoUrlToSend = imageUrl;
        fotoThumbUrlToSend = imageThumbUrl;

        cacheBusterRef.current = Date.now();
        const suffix = `v=${cacheBusterRef.current}`;
        fotoUrlPreview = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}${suffix}`;
        fotoThumbPreview = `${imageThumbUrl}${imageThumbUrl.includes('?') ? '&' : '?'}${suffix}`;
      } else if (photoRemoved) {
        fotoUrlToSend = null;
        fotoThumbUrlToSend = null;
      }

      const formData = {
        nome: data.nome,
        dataNascimento: data.dataNascimento
          ? DateUtilsApi.dateOnlyToApi(data.dataNascimento)
          : undefined,
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        sexo: data.sexo,
        ...(fotoUrlToSend !== undefined ? { fotoUrl: fotoUrlToSend } : null),
        ...(fotoThumbUrlToSend !== undefined ? { fotoThumbUrl: fotoThumbUrlToSend } : null),
      };

      await updateVoluntario?.({
        id: user.user.id,
        data: formData,
      });

      await updateUser({
        user: {
          ...user.user,
          nome: data.nome,
          fotoThumbUrl: photoRemoved
            ? null
            : (fotoThumbPreview ?? fotoThumbUrlToSend ?? user.user.fotoThumbUrl),
          fotoUrl: photoRemoved ? null : (fotoUrlPreview ?? fotoUrlToSend ?? user.user.fotoUrl),
        },
      });
    } finally {
      hideLoading();
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  });

  if (isLoading) return <FancyLoading />;

  const isSaving = isSubmitting || isLoadingMutation;

  const saveButton = (
    <FancyButton
      label='Salvar'
      disabled={isSaving}
      icon={{ ...DefaultIconsNames.save, size: 16 }}
      onPress={handleSubmit}
      containerStyle={{ marginBottom: 15 }}
    />
  );

  return (
    <FancyBasePage showFab={false} showSearchBar={false}>
      <View style={{ flex: 1 }} pointerEvents={isSaving ? 'none' : 'auto'}>
        <FancyFormScrollView
          fill
          keyboardDismissMode='none'
          contentContainerStyle={{ flexGrow: 1, gap: 15, paddingHorizontal: 15, paddingBottom: 10 }}
        >
          <ControlledImagePicker
            control={form.control}
            name='fotoThumbUrl'
            uploadFieldName='fotoUpload'
            setValue={form.setValue as any}
          />

          <ControlledTextInput name='nome' control={form.control} label='Nome' />
          <ControlledTextInput name='email' control={form.control} label='E-mail' disabled />
          <ControlledDateInput
            name='dataNascimento'
            control={form.control}
            label='Data de Nascimento'
            calendarProps={{ minimumDate: new Date(1900, 0, 1), maximumDate: new Date() }}
          />
          <ControlledTextInput name='endereco' control={form.control} label='Endereço' />
          <ControlledTextInput name='telefone' control={form.control} label='Telefone' />

          <ControlledToggle
            name='sexo'
            control={form.control}
            label='Sexo'
            option1={{ title: SexoEnumLabel[SexoEnum.Masculino], value: SexoEnum.Masculino }}
            option2={{ title: SexoEnumLabel[SexoEnum.Feminino], value: SexoEnum.Feminino }}
          />

          {keyboardVisible && (
            <>
              <View style={{ flex: 1 }} />
              {saveButton}
            </>
          )}
        </FancyFormScrollView>

        {!keyboardVisible && <View style={{ paddingHorizontal: 15 }}>{saveButton}</View>}
      </View>
    </FancyBasePage>
  );
}
