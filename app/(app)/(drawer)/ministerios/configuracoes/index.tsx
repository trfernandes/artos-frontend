import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyText from '../../../../../components/FancyText';
import FancyButton from '../../../../../components/buttons/FancyButton';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import FancyVerticalSpacer from '../../../../../components/FancyVerticalSpacer';
import { ControlledImagePicker } from '../../../../../components/forms/ControlledImagePicker';
import { useAuth } from '../../../../../contexts/AuthContext';
import { usePallete } from '../../../../../hooks/usePallete';
import { ResponseLoginMinisterioDto } from '../../../../../domain/dtos/login/login.response';
import {
  MinisterioFotoSchema,
  MinisterioFotoFormData,
} from '../../../../../domain/schemas/ministerioAdminSchema';
import { MinisteriosRepository } from '../../../../../domain/services/MinisteriosRepository';
import { getApiErrorMessage } from '../../../../../domain/api/api-error';
import { sendImageToServer } from '../../../../../utils/image_utils';

export default function MinisterioConfiguracoesIndex() {
  const palette = usePallete();
  const params = useLocalSearchParams<{ ministerioId: string }>();
  const { igrejaAtiva, user, updateUser } = useAuth();
  const ministerio = useMemo(
    () =>
      igrejaAtiva?.ministerios?.find((item) => item.id === params.ministerioId) as
        ResponseLoginMinisterioDto | undefined,
    [igrejaAtiva?.ministerios, params.ministerioId],
  );

  // Tela exclusiva do líder do ministério — admin já edita tudo (incluindo a
  // foto) pela tela cheia em admin/ministerios/edit.
  const isLider = ministerio?.hierarquia?.toString() === '1';

  const { control, handleSubmit, setValue, reset, watch } = useForm<MinisterioFotoFormData>({
    resolver: zodResolver(MinisterioFotoSchema),
    defaultValues: { logoUrl: null, logoThumbUrl: null, logoUpload: null },
  });

  useEffect(() => {
    if (!ministerio) return;
    reset({
      logoUrl: ministerio.logoUrl ?? null,
      logoThumbUrl: ministerio.logoThumbUrl ?? null,
      logoUpload: null,
    });
  }, [ministerio, reset]);

  const logoUpload = watch('logoUpload');
  const canSave = !!logoUpload?.uri;

  const onSubmit = handleSubmit(async (data) => {
    if (!data.logoUpload?.uri || !igrejaAtiva || !ministerio) return;

    try {
      const { imageUrl, imageThumbUrl } = await sendImageToServer('ministerios', data.logoUpload);

      await MinisteriosRepository.update(ministerio.id, {
        igrejaId: igrejaAtiva.id,
        logoUrl: imageUrl,
        logoThumbUrl: imageThumbUrl,
      });

      const novoMinisterio = { ...ministerio, logoUrl: imageUrl, logoThumbUrl: imageThumbUrl };
      const novaIgreja = {
        ...igrejaAtiva,
        ministerios: [
          ...igrejaAtiva.ministerios.filter((m) => m.id !== ministerio.id),
          novoMinisterio,
        ],
      };
      const novasIgrejas = (user?.igrejas || []).map((ig) =>
        ig.id === igrejaAtiva.id ? novaIgreja : ig,
      );
      updateUser({ ...user, igrejas: novasIgrejas });

      setValue('logoUrl', imageUrl);
      setValue('logoThumbUrl', imageThumbUrl);
      setValue('logoUpload', null);
      Toast.show({ type: 'success', text1: 'Foto do ministério atualizada!' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar foto',
        text2: getApiErrorMessage(error, 'Não foi possível salvar a foto do ministério.'),
      });
    }
  });

  if (!isLider) {
    router.back();
    return null;
  }

  return (
    <FancyPageView style={styles.container}>
      <View style={styles.content}>
        <FancyText size='small' color={palette.fonts.inactive} style={styles.helperText}>
          Essa foto aparece no menu lateral e nas telas de {ministerio?.nome ?? 'ministério'} para
          todos os membros.
        </FancyText>
        <View style={styles.pickerWrap}>
          <ControlledImagePicker
            control={control}
            name='logoThumbUrl'
            uploadFieldName='logoUpload'
            setValue={setValue}
          />
        </View>

        <FancyVerticalSpacer />

        <FancyListItemCard
          leading={{ icon: { library: 'MaterialCommunityIcons', name: 'history' }, type: 'icon' }}
          title='Log de auditoria'
          subtitle='Histórico de edições sensíveis feitas neste ministério'
          onPress={() =>
            router.push({
              pathname: '/configuracoes/audit-log',
              params: { ministerioId: ministerio?.id },
            })
          }
        />
      </View>

      <FancyButton
        label='Salvar'
        loadingText='Salvando...'
        icon={{ library: 'MaterialCommunityIcons', name: 'content-save-outline', size: 16 }}
        disabled={!canSave}
        onPress={() => void onSubmit()}
        containerStyle={styles.saveButton}
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  content: { flex: 1, gap: 18, paddingTop: 12, alignItems: 'center' },
  helperText: { textAlign: 'center' },
  pickerWrap: { alignItems: 'center' },
  saveButton: { height: 44 },
});
