import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import FancySegmentedControl from '../../../../fields/FancySegmentedControl';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyButton from '../../../../buttons/FancyButton';
import { format } from 'date-fns';
import { useState } from 'react';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyListItemCard from '../../../../cards/FancyListItemCard';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';

export interface AdicionarFuncaoModalProps {
  visible: boolean;
  onClose: () => void;
  ministerioId: string;
  eventoNome: string;
  eventoId: string;
  dataOcorrencia: Date;
  dataInicio: Date;
  dataTermino: Date;
  onConfirm: (data: AdicionarFuncaoConfirmDialog) => Promise<void>;
}

export interface AdicionarFuncaoConfirmDialog {
  funcaoId?: string;
  nomeFuncaoAvulsa?: string;
  eventoId: string;
  dataOcorrencia: string;
}

export default function AdicionarFuncaoModal({
  visible,
  onClose,
  ministerioId,
  eventoNome,
  eventoId,
  dataOcorrencia,
  dataInicio,
  dataTermino,
  onConfirm,
}: AdicionarFuncaoModalProps) {
  const palette = usePallete();
  const { data: funcoes, isLoading: isLoadingFuncoes } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
        ],
      },
    },
  });

  const funcoesSearchList = funcoes.map((f) => ({
    title: f.nome,
    value: f.id!,
  }));

  const [funcaoNaoCadastrada, setFuncaoNaoCadastrada] = useState(false);
  const [selectedFuncao, setSelectedFuncao] = useState<string | null>(null);
  const [nomeFuncaoAvulsa, setNomeFuncaoAvulsa] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (funcaoNaoCadastrada) {
      if (!nomeFuncaoAvulsa.trim()) {
        setErrors({ nomeFuncaoAvulsa: 'Campo Obrigatório' });
        return;
      }
    } else if (!selectedFuncao) {
      setErrors({ funcao: 'Campo Obrigatório' });
      return;
    }

    setErrors({});
    try {
      setIsSubmitting(true);
      await onConfirm({
        ...(funcaoNaoCadastrada
          ? { nomeFuncaoAvulsa: nomeFuncaoAvulsa.trim() }
          : { funcaoId: selectedFuncao! }),
        eventoId: eventoId,
        dataOcorrencia: format(dataOcorrencia, 'yyyy-MM-dd'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Adicionar Função ao Evento'
      closeDisabled={isSubmitting}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <FancyButton
            type='outlined'
            label='Cancelar'
            onPress={onClose}
            disabled={isSubmitting}
            containerStyle={{ flex: 1 }}
          />
          <FancyButton
            type='contained'
            label='Adicionar'
            onPress={handleConfirm}
            isLoading={isSubmitting}
            loadingText='Adicionando...'
            disabled={isLoadingFuncoes}
            containerStyle={{ flex: 1 }}
          />
        </View>
      }
    >
      <FancyListItemCard
        leading={{
          type: 'date',
          day: String(dataOcorrencia.getDate()).padStart(2, '0'),
          month: dataOcorrencia.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        }}
        title={eventoNome}
        subtitle={`${format(dataOcorrencia, 'dd/MM/yyyy')} - ${format(dataInicio, 'HH:mm')} à ${format(dataTermino, 'HH:mm')}`}
      />

      <FancyGroup contentContainerStyle={{ gap: 15 }}>
        <View style={{ gap: 8 }}>
          <View style={styles.sectionEyebrow}>
            <View style={[styles.sectionEyebrowTick, { backgroundColor: palette.primary }]} />
            <FancyText
              type='semiBold'
              size='extraSmall'
              color={palette.primary}
              style={styles.sectionEyebrowText}
            >
              SELECIONAR FUNÇÃO
            </FancyText>
          </View>
          <View style={{ gap: 14 }}>
            <FancySegmentedControl
              options={[
                { label: 'CADASTRADA', value: 'cadastrada' },
                { label: 'SEM CADASTRO', value: 'avulsa' },
              ]}
              value={funcaoNaoCadastrada ? 'avulsa' : 'cadastrada'}
              onChange={(v) => {
                setFuncaoNaoCadastrada(v === 'avulsa');
                setErrors({});
              }}
              disabled={isSubmitting}
            />

            {funcaoNaoCadastrada ? (
              <View style={{ flexDirection: 'column', gap: 5 }}>
                <FancyTextInput
                  label='Nome'
                  placeholder='Nome da função'
                  value={nomeFuncaoAvulsa}
                  errorMessage={errors['nomeFuncaoAvulsa']}
                  inputProps={{
                    onChangeText: (t) => {
                      setNomeFuncaoAvulsa(t);
                      setErrors((prev) => {
                        const { nomeFuncaoAvulsa: _nomeFuncaoAvulsa, ...rest } = prev;
                        return rest;
                      });
                    },
                  }}
                  disabled={isSubmitting}
                />
              </View>
            ) : (
              <View style={{ gap: 5 }}>
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
                {errors['funcao'] && <FancyErrorText message={errors['funcao']} />}
              </View>
            )}
          </View>
        </View>
      </FancyGroup>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sectionEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionEyebrowTick: {
    width: 3,
    height: 11,
    borderRadius: 2,
  },
  sectionEyebrowText: {
    letterSpacing: 0.8,
  },
});
