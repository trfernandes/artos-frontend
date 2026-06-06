import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import FancyButton from '../../../../buttons/FancyButton';
import { format } from 'date-fns';
import { useState } from 'react';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import DefaultIcons from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';

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
  funcaoId: string;
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

  const handleConfirm = async () => {
    if (!selectedFuncao) {
      setErrors({ funcao: 'Campo Obrigatório' });
      return;
    }

    setErrors({});
    try {
      setIsSubmitting(true);
      await onConfirm({
        funcaoId: selectedFuncao,
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
      <View
        style={{
          backgroundColor: palette.backgroundColor2,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: palette.borderCard,
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 6,
        }}
      >
        <FancyText type='semiBold' size='small'>
          {eventoNome}
        </FancyText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <DefaultIcons.Custom
            library='MaterialIcons'
            name='event'
            size={12}
            color={palette.primary}
          />
          <FancyText size='extraSmall' type='medium'>
            {`${format(dataOcorrencia, 'dd/MM/yyyy')} - ${format(dataInicio, 'HH:mm')} à ${format(dataTermino, 'HH:mm')}`}
          </FancyText>
        </View>
      </View>

      <FancyGroup title='Selecionar Função:' contentContainerStyle={{ gap: 15 }}>
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
      </FancyGroup>
    </FancyBottomSheetModal>
  );
}
