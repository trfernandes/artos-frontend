import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import Toast from 'react-native-toast-message';
import FancyPageView from '../../../../components/containers/FancyPageView';
import FancyText from '../../../../components/FancyText';
import FancyVerticalSpacer from '../../../../components/FancyVerticalSpacer';
import FancyButton from '../../../../components/buttons/FancyButton';
import ControlledTextArea from '../../../../components/forms/ControlledTextArea';
import { usePallete } from '../../../../hooks/usePallete';
import { useMinisteriosDrawer } from '../../../../hooks/useMinisteriosDrawer';
import { SuporteApi } from '../../../../domain/api/SuporteApi';
import {
  SuporteTipoEnum,
  SuporteTipoEnumLabel,
} from '../../../../domain/enums/Suporte/suporte-tipo.enum';

const schema = z.object({
  texto: z.string('Campo obrigatório').min(10, 'Escreva pelo menos 10 caracteres'),
});

export default function AjudaSuporteFormPage() {
  const { tipo } = useLocalSearchParams<{ tipo: SuporteTipoEnum }>();
  const palette = usePallete();
  const { igrejaAtiva } = useMinisteriosDrawer();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { texto: '' },
  });

  const handleEnviar = () => {
    void form.handleSubmit(
      async ({ texto }) => {
        if (isSubmitting || !igrejaAtiva?.id) return;
        try {
          setIsSubmitting(true);
          await SuporteApi.create({ tipo, texto, igrejaId: igrejaAtiva.id });
          Toast.show({
            type: 'success',
            text1: 'Mensagem enviada',
            text2: 'A gente responde por e-mail em até 2 dias úteis.',
          });
          router.back();
        } catch {
          Toast.show({
            type: 'error',
            text1: 'Não deu pra enviar',
            text2: 'Verifique sua internet e tente de novo.',
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      (errors) => {
        Toast.show({
          type: 'error',
          text1: 'Erro de validação',
          text2: errors.texto?.message ?? 'Verifique os campos do formulário',
        });
      },
    )();
  };

  return (
    <FancyPageView style={styles.container}>
      <FancyText size='small' type='medium' color={palette.fonts.inactive}>
        Assunto: {SuporteTipoEnumLabel[tipo]}
      </FancyText>
      <FancyVerticalSpacer height={4} />

      <FancyText size='small' type='semiBold'>
        Conte com detalhes o que aconteceu
      </FancyText>
      <FancyVerticalSpacer height={8} />

      <ControlledTextArea
        control={form.control}
        name='texto'
        placeholder='Escreva sua mensagem...'
        disabled={isSubmitting}
        inputProps={{ style: styles.textarea }}
      />

      <FancyVerticalSpacer height={6} />
      <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
        A resposta vem por e-mail — não é um chat dentro do app.
      </FancyText>

      <View style={styles.spacer} />

      <FancyButton
        label='Enviar mensagem'
        type='contained'
        onPress={handleEnviar}
        disabled={isSubmitting}
        isLoading={isSubmitting}
        loadingText='Enviando...'
      />
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, paddingTop: 5, flex: 1 },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  spacer: { flex: 1 },
});
