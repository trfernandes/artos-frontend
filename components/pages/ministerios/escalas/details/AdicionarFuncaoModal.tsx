import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import { format } from 'date-fns';
import { useState } from 'react';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import DefaultIcons from '../../../../FancyIcons';
import { ColorUtils } from '../../../../../utils/color_utils';
import { usePallete } from '../../../../../hooks/usePallete';

export interface AdicionarFuncaoModalProps {
  ministerioId: string;
  eventoNome: string;
  eventoId: string;
  dataOcorrencia: Date;
  dataInicio: Date;
  dataTermino: Date;
}

export interface AdicionarFuncaoConfirmDialog {
  funcaoId: string;
  eventoId: string;
  dataOcorrencia: string;
}

export default function AdicionarFuncaoModal({ ministerioId, eventoNome, eventoId, dataOcorrencia, dataInicio, dataTermino, ...props }: AdicionarFuncaoModalProps & FancyModalDialogProps<any>) {
  const palette = usePallete();
  const { data: funcoes, isLoading: isLoadingFuncoes } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: 'EQUALS' as any,
            value: { type: 'LITERAL' as any, value: ministerioId },
          },
        ],
      },
    },
  });

  const funcoesSearchList = funcoes.map((f) => ({
    title: f.nome,
    value: f.id!,
  }));

  const [selectedFuncao, setSelectedFuncao] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (): boolean => {
    if (selectedFuncao) {
      setErrors({});
      return true;
    }

    setErrors({ funcao: 'Campo Obrigatório' });
    return false;
  };

  const handleConfirm = async () => {
    if (handleSubmit()) {
      try {
        setIsSubmitting(true);
        await props.onButton2Press?.({
          funcaoId: selectedFuncao!,
          eventoId: eventoId,
          dataOcorrencia: format(dataOcorrencia, 'yyyy-MM-dd'),
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <FancyModalDialog<AdicionarFuncaoConfirmDialog>
      {...props}
      title='Adicionar Função ao Evento'
      centerContainerStyle={styles.container}
      onButton2Press={handleConfirm}
      button1={{ disabled: isSubmitting }}
      button2={{ isLoading: isSubmitting, loadingText: 'Adicionando...' }}
      containerStyle={{
        pointerEvents: isLoadingFuncoes ? 'none' : 'auto',
      }}
    >
      <View style={{
        backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: ColorUtils.withAlpha(palette.primary, 0.25),
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
      }}>
        <FancyText type='semiBold' size='small'>{eventoNome}</FancyText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <DefaultIcons.Custom library='MaterialIcons' name='event' size={12} color={palette.primary} />
          <FancyText size='extraSmall' type='medium'>
            {`${format(dataOcorrencia, 'dd/MM/yyyy')} - ${format(dataInicio!, 'HH:mm')} à ${format(dataTermino!, 'HH:mm')}`}
          </FancyText>
        </View>
      </View>

      <FancyGroup title='Selecionar Função:' contentContainerStyle={{ gap: 15 }}>
        <View style={{ flexDirection: 'column', gap: 5 }}>
          <FancySearchSelect
            label='Função'
            placeholder='Buscar função...'
            value={selectedFuncao}
            onChange={(value) => {
              setSelectedFuncao(Array.isArray(value) ? value[0] || null : value);
              setErrors((prev) => {
                const { funcao, ...rest } = prev;
                return rest;
              });
            }}
            listItems={funcoesSearchList}
            isLoading={isLoadingFuncoes}
            disabled={isSubmitting || isLoadingFuncoes}
          />
          {errors && <FancyErrorText message={errors['funcao']} />}
        </View>
      </FancyGroup>
    </FancyModalDialog>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingTop: 0, paddingBottom: 10 },
});
