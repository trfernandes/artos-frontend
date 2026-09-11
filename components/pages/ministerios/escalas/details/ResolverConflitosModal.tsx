import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyText from '../../../../FancyText';
import FancyVerticalSpacer from '../../../../FancyVerticalSpacer';
import FancyButton from '../../../../buttons/FancyButton';
type Acao = 'trocar_voluntario' | 'deixar_vago' | 'perguntar_voluntario';

type Props = {
  visible: boolean;
  conflitos: any;
  onResolverConflitoSimples: (acao: Acao, conflito: any) => Promise<void>;
  onPublicarSemResolucao: () => Promise<void>;
  onClose: () => void;
};

export default function ResolverConflitosModal({
  visible,
  conflitos,
  onResolverConflitoSimples,
  onPublicarSemResolucao,
  onClose,
}: Props) {
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<Acao | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResolveAction = async (acao: Acao) => {
    if (!selectedConflict) return;

    try {
      setIsLoading(true);
      setSelectedAction(acao);
      await onResolverConflitoSimples(acao, selectedConflict);
      setSelectedConflict(null);
      setSelectedAction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishAnyway = async () => {
    try {
      setIsLoading(true);
      await onPublicarSemResolucao();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!conflitos?.temConflito) {
    return null;
  }

  const primeiroConflito = selectedConflict || conflitos.conflitos[0];
  const restantesCount = conflitos.conflitos.length - 1;

  return (
    <FancyBottomSheetModal
      visible={visible}
      title="Conflito de Escalas"
      onClose={onClose}
      closeDisabled={isLoading}
    >
      <View style={styles.container}>
        <FancyText style={styles.subtitle}>
          {primeiroConflito.voluntarioNome} já está escalado em outro ministério nesta ocorrência.
        </FancyText>

        <FancyVerticalSpacer height={16} />

        <FancyText style={styles.label}>O que você deseja fazer?</FancyText>

        <FancyVerticalSpacer height={12} />

        <FancyButton
          label="Trocar por outro voluntário"
          type="outlined"
          onPress={() => handleResolveAction('trocar_voluntario')}
          disabled={isLoading}
        />

        <FancyVerticalSpacer height={8} />

        <FancyButton
          label="Deixar função vazia"
          type="outlined"
          onPress={() => handleResolveAction('deixar_vago')}
          disabled={isLoading}
        />

        <FancyVerticalSpacer height={8} />

        <FancyButton
          label="Perguntar ao voluntário"
          type="outlined"
          onPress={() => handleResolveAction('perguntar_voluntario')}
          disabled={isLoading}
        />

        {restantesCount > 0 && (
          <>
            <FancyVerticalSpacer height={16} />
            <FancyText style={styles.helperText}>
              {restantesCount} mais voluntário(s) em conflito.
            </FancyText>
          </>
        )}

        <FancyVerticalSpacer height={16} />

        <FancyButton
          label="Publicar mesmo assim"
          type="text"
          onPress={handlePublishAnyway}
          disabled={isLoading}
        />
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
