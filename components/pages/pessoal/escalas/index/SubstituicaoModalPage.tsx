import { DynamicQuery, Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { DropDownItemProps } from '../../../../fields/FancyDropDownItem';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
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
import { StyleSheet } from 'react-native';
import FancyText from '../../../../FancyText';

const schema = z.object({
  eventoId: z.string(),
  solicitanteId: z.string(),
  substitutoId: z.string('Campo obrigatório'),
  escalaItemId: z.string('Campo obrigatório'),
  motivo: z.string('Campo obrigatório').min(5, 'O motivo deve ter ao menos 5 caracteres'),
});

export type FormData = z.infer<typeof schema>;

export default function SubstituicaoModalPage({
  dadosEscala,
  ...props
}: { dadosEscala: ResponseEscalaItemDto } & FancyModalDialogProps<FormData>) {
  const { user } = useAuth();

  const initialParams: DynamicQuery = {
    where: {
      conditions: [
        {
          path: 'ministerio.id',
          operator: Operator.EQUALS,
          value: {
            type: ValueType.LITERAL,
            value: dadosEscala.voluntario?.ministerio?.id! || dadosEscala.voluntario?.ministerioId!,
          },
        },
        {
          path: 'voluntario.id',
          operator: Operator.NOT_EQUALS,
          value: { type: ValueType.LITERAL, value: user?.user?.id! },
        },
      ],
    },
    relations: ['funcoes', 'voluntario'],
  };

  const { data: possiveisSubstitutos, isLoading } = useMinisterioVoluntariosCrud({
    initialParams,
    autoFetch: true,
  });

  const possiveisSubstitutosList = useMemo<DropDownItemProps<string>[]>(() => {
    return possiveisSubstitutos
      .map(
        (minVoluntario) =>
          ({
            title: minVoluntario.voluntario?.nome,
            left: {
              type: 'image',
              source:
                minVoluntario.voluntario?.fotoThumbUrl || minVoluntario.voluntario?.fotoUrl
                  ? {
                      uri:
                        minVoluntario.voluntario.fotoThumbUrl ||
                        minVoluntario.voluntario.fotoUrl ||
                        '',
                    }
                  : AppImages.emptyProfile,
            },
            value: minVoluntario.id,
          }) as DropDownItemProps<string>,
      )
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }));
  }, [possiveisSubstitutos]);

  const [substitutoSelecionado, setSubstitutoSelecionado] = useState<string | undefined>();
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
          await Promise.resolve(props.onButton2Press?.(values));
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
  }, [form.handleSubmit, isSubmitting, props.onButton2Press]);

  const isBusy = isLoading || isSubmitting;
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <FancyModalDialog<FormData>
      {...props}
      title='Solicitar substituição'
      titleAlign='left'
      centerContainerStyle={styles.content}
      buttonContainerStyle={styles.buttons}
      closeOnBackdropPress={!isBusy}
      button1={{
        disabled: isBusy || undefined,
        textProps: { adjustsFontSizeToFit: false },
      }}
      button2={{
        disabled: isBusy || undefined,
        isLoading: isSubmitting,
        loadingText: 'Enviando...',
        textProps: { adjustsFontSizeToFit: false },
      }}
      onButton2Press={() => void handleConfirm()}
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
        onChange={(value) => setSubstitutoSelecionado(Array.isArray(value) ? value[0] : value)}
        disabled={isBusy}
        isLoading={isLoading}
        searchPlaceholder='Buscar substituto...'
      />
      <ControlledTextArea
        control={form.control}
        name='motivo'
        label='Qual o motivo da substituição?'
        disabled={isBusy}
        inputProps={{ style: styles.reasonInput }}
      />
    </FancyModalDialog>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    content: {
      gap: 12,
    },
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
      gap: 9,
    },
  });
}
