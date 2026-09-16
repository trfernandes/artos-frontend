import { useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyText from '../../../../FancyText';
import FancyVerticalSpacer from '../../../../FancyVerticalSpacer';
import FancyButton from '../../../../buttons/FancyButton';
import ControlledFancyToggle from '../../../../forms/ControlledFancyToggle';
import ControlledBottomSheetSelect from '../../../../forms/ControlledBottomSheetSelect';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../../constants/colors';
import { useAuth } from '../../../../../contexts/AuthContext';
import { EscalaItensRepository } from '../../../../../domain/services/EscalaItensRepository';
import { DateUtilsApi } from '../../../../../utils/date_utils';

const schema = z.object({
  quemTroca: z.boolean(),
  dataOferecidaEmTroca: z.string().optional(),
});

export type FormData = z.infer<typeof schema>;

export type AceitarConviteModalPageProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dataOferecidaEmTroca?: string) => void | Promise<void>;
  isSubmitting: boolean;
};

export default function AceitarConviteModalPage({
  visible,
  onClose,
  onConfirm,
  isSubmitting,
}: AceitarConviteModalPageProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { user, igrejaAtiva } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quemTroca: false, dataOferecidaEmTroca: undefined },
  });

  const quemTroca = form.watch('quemTroca');
  const voluntarioId = user?.user?.id;
  const igrejaId = igrejaAtiva?.id;

  const escalasFuturasQuery = useQuery({
    queryKey: ['escala-itens', 'voluntario-futuras', voluntarioId, igrejaId],
    queryFn: () =>
      EscalaItensRepository.getByVoluntarioId(voluntarioId!, {
        igrejaId: igrejaId!,
        dataInicio: format(new Date(), 'yyyy-MM-dd'),
      }),
    enabled: visible && quemTroca && !!voluntarioId && !!igrejaId,
  });

  const listItems = useMemo(() => {
    const itens = escalasFuturasQuery.data ?? [];
    const vistos = new Set<string>();
    return itens
      .map((item) => {
        const data = DateUtilsApi.dateOnlyFromApi(item.dataOcorrencia as string);
        const dataKey = format(data, 'yyyy-MM-dd');
        return { data, dataKey, item };
      })
      .filter(({ dataKey }) => {
        if (vistos.has(dataKey)) return false;
        vistos.add(dataKey);
        return true;
      })
      .map(({ data, dataKey, item }) => ({
        title: format(data, "EEE, dd 'de' MMM", { locale: ptBR }),
        subtitle: [item.evento?.nome, item.funcao?.nome].filter(Boolean).join(' · '),
        value: dataKey,
      }));
  }, [escalasFuturasQuery.data]);

  const handleClose = () => {
    form.reset({ quemTroca: false, dataOferecidaEmTroca: undefined });
    onClose();
  };

  const handleConfirm = form.handleSubmit(async (values) => {
    await onConfirm(values.quemTroca ? values.dataOferecidaEmTroca : undefined);
    form.reset({ quemTroca: false, dataOferecidaEmTroca: undefined });
  });

  const semEscalasFuturas = quemTroca && !escalasFuturasQuery.isLoading && listItems.length === 0;
  const podeConfirmar = !quemTroca || (!!form.watch('dataOferecidaEmTroca') && !semEscalasFuturas);

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={handleClose}
      title='Aceitar convite'
      closeDisabled={isSubmitting}
      footer={
        <View style={styles.buttons}>
          <FancyButton
            label='Cancelar'
            type='outlined'
            onPress={handleClose}
            disabled={isSubmitting}
            containerStyle={styles.btnFlex}
          />
          <FancyButton
            label='Confirmar aceite'
            type='contained'
            onPress={() => void handleConfirm()}
            disabled={isSubmitting || !podeConfirmar}
            isLoading={isSubmitting}
            loadingText='Confirmando...'
            containerStyle={styles.btnFlex}
          />
        </View>
      }
    >
      <FancyText size='small' type='medium' style={styles.explainer}>
        Você vai cobrir essa escala. Se quiser, pode pedir que cubram a sua em troca — buscamos
        automaticamente alguém do ministério pra isso, você não precisa escolher quem.
      </FancyText>

      <ControlledFancyToggle
        control={form.control}
        name='quemTroca'
        option1={{ title: 'Aceitar sem condição', value: false }}
        option2={{ title: 'Quero troca', value: true }}
        disabled={isSubmitting}
      />

      {quemTroca ? (
        <>
          <FancyVerticalSpacer height={4} />
          {escalasFuturasQuery.isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size='large' />
            </View>
          ) : semEscalasFuturas ? (
            <FancyText size='small' type='medium' color={palette.error}>
              Você não tem escalações futuras — não dá pra oferecer troca agora.
            </FancyText>
          ) : (
            <ControlledBottomSheetSelect
              control={form.control}
              name='dataOferecidaEmTroca'
              label='Cubram minha escala em'
              placeholder='Escolher data...'
              listItems={listItems}
              disabled={isSubmitting}
            />
          )}
        </>
      ) : null}
    </FancyBottomSheetModal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    explainer: {
      opacity: 0.8,
    },
    loadingBox: {
      alignItems: 'center',
      paddingVertical: 32,
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
