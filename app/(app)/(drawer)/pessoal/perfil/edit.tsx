import { useForm } from 'react-hook-form';
import FancyBasePage from '../../../../../components/pages/base/FancyBasePage';
import { updateProfileSchema, useVoluntarios } from '../../../../../hooks/useVoluntarios';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../../../../components/forms/ControlledTextInput';
import ControlledFancyToggle from '../../../../../components/forms/ControlledFancyToggle';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useEffect } from 'react';
import FancyButton from '../../../../../components/buttons/FancyButton';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyVerticalSpacer from '../../../../../components/FancyVerticalSpacer';
import ControlledDateInput from '../../../../../components/forms/ControlledDateInput';
import FancyLoading from '../../../../../components/FancyLoading';
import { ControlledImagePicker } from '../../../../../components/forms/ControlledImagePicker';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();


  const form = useForm({ resolver: zodResolver(updateProfileSchema), defaultValues: { sexo: 'M' } });

  const {
    data: voluntarioData,
    update: updateVoluntario,
    isLoadingMutation,
    isLoading,
  } = useVoluntarios({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [{ path: 'id', operator: Operator.EQUALS, value: { value: user?.id, type: ValueType.LITERAL } }],
      },
    },
  });

  useEffect(() => {
    form.setValue('foto', voluntarioData[0]?.foto || undefined);
    form.setValue('nome', voluntarioData[0]?.nome);
    form.setValue('email', voluntarioData[0]?.email);
    form.setValue('dataNascimento', new Date(voluntarioData[0]?.dataNascimento));
    form.setValue('endereco', voluntarioData[0]?.endereco);
    form.setValue('telefone', voluntarioData[0]?.telefone);
    form.setValue('sexo', voluntarioData[0]?.sexo);
  }, [voluntarioData]);

  const handleSubmit = () =>
    form.handleSubmit(async data => {
      await updateVoluntario({
        id: user?.id,
        data: {
          uploadFoto: data.uploadFoto,
          nome: data.nome,
          dataNascimento: new Date(data.dataNascimento),
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          sexo: data.sexo,
        },
      });

      await updateUser({ ...user, foto: data.foto, nome: data.nome });
    })();

  if (isLoading) {
    return <FancyLoading />;
  }

  return (
    <FancyBasePage showFab={false} showSearchBar={false}>
      <ControlledImagePicker
        control={form.control}
        name="foto"
        setValue={form.setValue as (name: string, value: any) => void}
        uploadFieldName="uploadFoto"
      />
      <ControlledTextInput name="nome" control={form.control} label="Nome" />
      <ControlledTextInput name="email" control={form.control} label="E-mail" disabled />
      <ControlledDateInput name="dataNascimento" control={form.control} label="Data de Nascimento" />
      <ControlledTextInput name="endereco" control={form.control} label="Endereço" />
      <ControlledTextInput name="telefone" control={form.control} label="Telefone" />
      <ControlledFancyToggle
        name="sexo"
        control={form.control}
        label="Sexo"
        option1={{ title: 'Masculino', value: 'M' }}
        option2={{ title: 'Feminino', value: 'F' }}
      />
      <FancyVerticalSpacer height={10} />
      <FancyButton
        label={isLoadingMutation ? 'Salvando...' : 'Salvar'}
        disabled={isLoadingMutation}
        icon={{ ...DefaultIconsNames.save, size: 16 }}
        onPress={handleSubmit}
      />
      
    </FancyBasePage>
  );
}
