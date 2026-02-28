import FancyModalDialog, { FancyModalDialogProps } from '../../../../modal/FancyModalDialog';
import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import { format } from 'date-fns';
import { useState } from 'react';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';

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
          dataOcorrencia: dataOcorrencia.toISOString().split('T')[0],
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
      <FancyGroup variant='accentedSummary'>
        <View style={{ gap: 2 }}>
          <FancyText size='small' type='bold'>
            Evento:
          </FancyText>
          <View style={{ flexDirection: 'column', gap: 2 }}>
            <FancyText size={'small'} type='bold'>
              {eventoNome}
            </FancyText>
            <FancyText size={'extraSmall'} type='medium'>
              {`${format(dataOcorrencia, 'dd/MM/yyyy')} - ${format(dataInicio!, 'HH:mm')} à ${format(dataTermino!, 'HH:mm')}`}
            </FancyText>
          </View>
        </View>
      </FancyGroup>

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
