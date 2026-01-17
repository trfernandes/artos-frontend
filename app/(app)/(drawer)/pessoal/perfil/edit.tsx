import { useForm } from 'react-hook-form';
import FancyBasePage from '../../../../../components/pages/base/FancyBasePage';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../../../../components/forms/ControlledTextInput';
import ControlledToggle from '../../../../../components/forms/ControlledFancyToggle';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useEffect } from 'react';
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
import { VoluntarioStatusEnum } from '../../../../../domain/enums/Voluntario/voluntario-status.enum';
import { router } from 'expo-router';
import { sendImageToServer } from '../../../../../utils/image_utils';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();

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
            value: { value: user?.id!, type: ValueType.LITERAL },
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

  const handleSubmit = () =>
    form.handleSubmit(async (data) => {
      let fotoUrlToSend: string | null | undefined = undefined;
      let fotoThumbUrlToSend: string | null | undefined = undefined;

      if (data.fotoUpload?.uri) {
        const { imageThumbUrl, imageUrl } = await sendImageToServer('voluntarios', data.fotoUpload);

        fotoUrlToSend = imageUrl;
        fotoThumbUrlToSend = imageThumbUrl;

        form.setValue('fotoUrl', fotoUrlToSend);
        form.setValue('fotoThumbUrl', fotoThumbUrlToSend);
        form.setValue('fotoUpload', null);
      } else {
        fotoUrlToSend = null;
        fotoThumbUrlToSend = null;
      }

      const formData = {
        nome: data.nome,
        dataNascimento: data.dataNascimento ? DateUtilsApi.dateOnlyToApi(data.dataNascimento) : undefined,
        status: VoluntarioStatusEnum.Inativo,
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        sexo: data.sexo,
        ...(fotoUrlToSend !== undefined ? { fotoUrl: fotoUrlToSend } : null),
        ...(fotoThumbUrlToSend !== undefined ? { fotoThumbUrl: fotoThumbUrlToSend } : null),
      };

      await updateVoluntario({
        id: user?.id!,
        data: formData,
      });


      await updateUser({
        ...user,
        nome: data.nome,
        fotoThumbUrl: fotoThumbUrlToSend ?? undefined,
        fotoUrl: fotoUrlToSend ?? undefined,
      });

      router.back();
    })();

  if (isLoading) return <FancyLoading />;

  return (
    <FancyBasePage showFab={false} showSearchBar={false}>
      <FancyScrollView contentContainerStyle={{ gap: 15, paddingHorizontal: 15 }}>
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
        label={isLoadingMutation ? 'Salvando...' : 'Salvar'}
        disabled={isLoadingMutation}
        icon={{ ...DefaultIconsNames.save, size: 16 }}
        onPress={handleSubmit}
        containerStyle={{ marginHorizontal: 15 }}
      />
    </FancyBasePage>
  );
}
