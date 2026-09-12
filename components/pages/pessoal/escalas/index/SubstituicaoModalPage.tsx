import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import {
  EscalaSubstituicoesApi,
  CandidatoSubstituicaoStatusDto,
} from '../../../../../domain/api/EscalaSubstituicoesApi';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledSearchSelect from '../../../../forms/ControlledSearchSelect';
import ControlledTextArea from '../../../../forms/ControlledTextArea';
import { useAuth } from '../../../../../contexts/AuthContext';
import { ResponseEscalaItemDto } from '../../../../../domain/dtos/Escala/escala-item.response';
import { AppImages } from '../../../../../assets/app_images';
import Toast from 'react-native-toast-message';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import FancyText from '../../../../FancyText';
import FancyButton from '../../../../buttons/FancyButton';

const schema = z.object({
  eventoId: z.string(),
  solicitanteId: z.string(),
  substitutoId: z.string('Campo obrigatório'),
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
  const palette = usePallete();
  const [candidatos, setCandidatos] = useState<CandidatoSubstituicaoStatusDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let cancelado = false;

    async function carregarCandidatos() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const result = await EscalaSubstituicoesApi.candidatosStatus(dadosEscala.id);
        if (!cancelado) setCandidatos(result);
      } catch {
        if (!cancelado) setLoadError('Não foi possível carregar os candidatos.');
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }

    carregarCandidatos();
    return () => {
      cancelado = true;
    };
  }, [visible, dadosEscala.id]);

  const possiveisSubstitutosList = useMemo<DropDownItemProps<string>[]>(() => {
    return candidatos
      .map(
        (candidato) =>
          ({
            title: candidato.nome,
            left: {
              type: 'image',
              source:
                candidato.fotoThumbUrl || candidato.fotoUrl
                  ? { uri: candidato.fotoThumbUrl || candidato.fotoUrl || '' }
                  : AppImages.emptyProfile,
            },
            tags: [
              {
                label: candidato.temFuncao ? 'Possui função' : 'Sem função',
                color: candidato.temFuncao ? palette.confirm : palette.error,
              },
              {
                label: candidato.temDisponibilidade ? 'Disponível' : 'Indisponível',
                color: candidato.temDisponibilidade ? palette.confirm : palette.warning,
              },
            ],
            value: candidato.ministerioVoluntarioId,
          }) as DropDownItemProps<string>,
      )
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
  }, [candidatos, palette]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      escalaItemId: dadosEscala.id,
      eventoId: dadosEscala.evento?.id,
      solicitanteId: dadosEscala.voluntario?.id,
      motivo: undefined,
      substitutoId: undefined,
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

  const isBusy = isLoading || isSubmitting;
  const styles = useThemedStyles(createStyles);

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
      <ControlledSearchSelect
        control={form.control}
        name='substitutoId'
        label={'Quem será seu substituto?'}
        listItems={possiveisSubstitutosList}
        disabled={isBusy}
        isLoading={isLoading}
        errorMessage={loadError}
        searchPlaceholder='Buscar substituto...'
      />
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
