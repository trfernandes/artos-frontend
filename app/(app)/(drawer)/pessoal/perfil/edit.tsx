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
import FancyVerticalSpacer from '../../../../../components/FancyVerticalSpacer';
import ControlledDateInput from '../../../../../components/forms/ControlledDateInput';
import FancyLoading from '../../../../../components/FancyLoading';
import { ControlledImagePicker } from '../../../../../components/forms/ControlledImagePicker';
import FancyScrollView from '../../../../../components/FancyScrollView';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { updateProfileSchema } from '../../../../../domain/schemas/voluntarioSchema';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import { SexoEnum, SexoEnumLabel } from '../../../../../domain/enums/common/sexo-enum';
import { router } from 'expo-router';
import { sendImageToServer } from '../../../../../utils/image_utils';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
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
      dataNascimento: voluntario.dataNascimento ? DateUtilsApi.dateOnlyFromApi(voluntario.dataNascimento) : undefined,
      endereco: voluntario.endereco ?? '',
      telefone: voluntario.telefone ?? '',
      status: voluntario.status,
      sexo: voluntario.sexo,
    });
  }, [voluntarioData]);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!user?.user?.id) return;

      let fotoUrlToSend: string | undefined;
      let fotoThumbUrlToSend: string | undefined;
      let fotoUrlPreview: string | undefined;
      let fotoThumbPreview: string | undefined;

      if (data.fotoUpload?.uri) {
        const { imageThumbUrl, imageUrl } = await sendImageToServer('voluntarios', data.fotoUpload);

        fotoUrlToSend = imageUrl;
        fotoThumbUrlToSend = imageThumbUrl;

        cacheBusterRef.current = Date.now();
        const suffix = `v=${cacheBusterRef.current}`;
        fotoUrlPreview = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}${suffix}`;
        fotoThumbPreview = `${imageThumbUrl}${imageThumbUrl.includes('?') ? '&' : '?'}${suffix}`;
      }

      const formData = {
        nome: data.nome,
        dataNascimento: data.dataNascimento ? DateUtilsApi.dateOnlyToApi(data.dataNascimento) : undefined,
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
          fotoThumbUrl: fotoThumbPreview ?? fotoThumbUrlToSend ?? user.user.fotoThumbUrl,
          fotoUrl: fotoUrlPreview ?? fotoUrlToSend ?? user.user.fotoUrl,
        },
      });

      router.back();
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  });

  if (isLoading) return <FancyLoading />;

  const isSaving = isSubmitting || isLoadingMutation;

  return (
    <FancyBasePage showFab={false} showSearchBar={false}>
      <View style={{ flex: 1 }} pointerEvents={isSaving ? 'none' : 'auto'}>
        <FancyScrollView fill contentContainerStyle={{ gap: 15, paddingHorizontal: 15, paddingBottom: 10 }}>
          <ControlledImagePicker control={form.control} name='fotoThumbUrl' uploadFieldName='fotoUpload' setValue={form.setValue as any} />

          <ControlledTextInput name='nome' control={form.control} label='Nome' />
          <ControlledTextInput name='email' control={form.control} label='E-mail' disabled />
          <ControlledDateInput name='dataNascimento' control={form.control} label='Data de Nascimento' />
          <ControlledTextInput name='endereco' control={form.control} label='Endereço' />
          <ControlledTextInput name='telefone' control={form.control} label='Telefone' />

          <ControlledToggle
            name='sexo'
            control={form.control}
            label='Sexo'
            option1={{ title: SexoEnumLabel[SexoEnum.Masculino], value: SexoEnum.Masculino }}
            option2={{ title: SexoEnumLabel[SexoEnum.Feminino], value: SexoEnum.Feminino }}
          />

          <FancyVerticalSpacer height={10} />
        </FancyScrollView>

        <FancyButton
          label='Salvar'
          isLoading={isSaving}
          disabled={isSaving}
          icon={{ ...DefaultIconsNames.save, size: 16 }}
          onPress={handleSubmit}
          containerStyle={{ marginHorizontal: 15, marginBottom: 15 }}
        />
      </View>
    </FancyBasePage>
  );
}
