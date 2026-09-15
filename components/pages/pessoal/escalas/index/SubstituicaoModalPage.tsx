import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextArea from '../../../../forms/ControlledTextArea';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import Toast from 'react-native-toast-message';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import FancyText from '../../../../FancyText';
import FancyButton from '../../../../buttons/FancyButton';

const schema = z.object({
  escalaItemId: z.string('Campo obrigatório'),
  motivo: z.string('Campo obrigatório').min(5, 'O motivo deve ter ao menos 5 caracteres'),
});

export type FormData = z.infer<typeof schema>;

export type SubstituicaoModalPageProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: FormData) => void | Promise<void>;
  dadosEscala: ResponseEscalaItemDto;
};

export default function SubstituicaoModalPage({
  visible,
  onClose,
  onConfirm,
  dadosEscala,
}: SubstituicaoModalPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      escalaItemId: dadosEscala.id,
      motivo: undefined,
    },
  });

  const handleConfirm = useCallback(async () => {
    form.handleSubmit(
      async (values) => {
        if (isSubmitting) return;
        try {
          setIsSubmitting(true);
          await onConfirm(values);
        } finally {
          setIsSubmitting(false);
        }
      },
      (errors) => {
        if (__DEV__) {
          console.log('[SubstituicaoModal] Validation errors:', errors);
        }
        Toast.show({
          type: 'error',
          text1: 'Erro de validação',
          text2: 'Verifique os campos do formulário',
        });
      },
    )();
  }, [form.handleSubmit, isSubmitting, onConfirm]);

  const isBusy = isSubmitting;
  const styles = useThemedStyles(createStyles);
  usePallete();

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Solicitar substituição'
      closeDisabled={isBusy}
      footer={
        <View style={styles.buttons}>
          <FancyButton
            label='Voltar'
            type='outlined'
            onPress={onClose}
            disabled={isBusy}
            containerStyle={styles.btnFlex}
          />
          <FancyButton
            label='Enviar solicitação'
            type='contained'
            onPress={() => void handleConfirm()}
            disabled={isBusy}
            isLoading={isSubmitting}
            loadingText='Enviando...'
            containerStyle={styles.btnFlex}
          />
        </View>
      }
    >
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <FancyText size='extraSmall' type='medium' style={styles.infoLabel}>
            Ministério
          </FancyText>
          <FancyText size='small' type='semiBold'>
            {dadosEscala.voluntario?.ministerio?.nome}
          </FancyText>
        </View>
        <View style={styles.infoRow}>
          <FancyText size='extraSmall' type='medium' style={styles.infoLabel}>
            Evento
          </FancyText>
          <FancyText size='small' type='semiBold'>
            {dadosEscala.evento?.nome}
          </FancyText>
        </View>
        <View style={styles.infoRow}>
          <FancyText size='extraSmall' type='medium' style={styles.infoLabel}>
            Data e Hora
          </FancyText>
          <FancyText size='small' type='semiBold'>
            {format(dadosEscala.dataOcorrencia, 'dd/MM/yyyy - HH:mm')}
          </FancyText>
        </View>
        <View style={styles.infoRow}>
          <FancyText size='extraSmall' type='medium' style={styles.infoLabel}>
            Função
          </FancyText>
          <FancyText size='small' type='semiBold'>
            {dadosEscala.funcao?.nome}
          </FancyText>
        </View>
      </View>
      <FancyText size='small' type='medium' style={styles.explainer}>
        Vamos buscar automaticamente alguém do ministério pra assumir essa função — você não precisa
        escolher quem.
      </FancyText>
      <ControlledTextArea
        control={form.control}
        name='motivo'
        label='Qual o motivo da substituição?'
        disabled={isBusy}
        inputProps={{ style: styles.reasonInput }}
      />
    </FancyBottomSheetModal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    infoCard: {
      backgroundColor: palette.backgroundColor,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.borderCard,
      padding: 12,
      gap: 10,
      width: '100%',
      ...palette.shadows[100],
    },
    infoRow: {
      gap: 2,
    },
    infoLabel: {
      opacity: 0.55,
    },
    explainer: {
      opacity: 0.8,
    },
    reasonInput: {
      minHeight: 118,
      textAlignVertical: 'top',
    },
    buttons: {
      flexDirection: 'row',
      gap: 10,
    },
    btnFlex: {
      flex: 1,
    },
  });
}
