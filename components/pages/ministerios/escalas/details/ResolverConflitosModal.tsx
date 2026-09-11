import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import FancyText from '../../../../FancyText';
import FancyVerticalSpacer from '../../../../FancyVerticalSpacer';
import FancyButton from '../../../../buttons/FancyButton';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import FancyChips from '../../../../FancyChips';
import { usePallete } from '../../../../../hooks/usePallete';
import { useVoluntariosDoMinisterioCrud } from '../../../../../hooks/useVoluntariosDoMinisterioCrud';
import {
  ConflitoMultiMinisteriosType,
  ResponseConflitosMultiMinisteriosDto,
} from '../../../../../domain/dtos/Escala/escala-conflito.dto';

type Acao = 'trocar_voluntario' | 'deixar_vago' | 'perguntar_voluntario';

type ResolverExtra = {
  voluntarioSubstitutoId?: string;
  ministerioBId?: string;
};

type Props = {
  visible: boolean;
  conflitos: ResponseConflitosMultiMinisteriosDto | null;
  ministerioId: string;
  onResolverConflitoSimples: (
    acao: Acao,
    conflito: ConflitoMultiMinisteriosType,
    extra?: ResolverExtra,
  ) => Promise<void>;
  onClose: () => void;
};

export default function ResolverConflitosModal({
  visible,
  conflitos,
  ministerioId,
  onResolverConflitoSimples,
  onClose,
}: Props) {
  const palette = usePallete();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAction, setExpandedAction] = useState<Acao | null>(null);
  const [selectedSubstitutoId, setSelectedSubstitutoId] = useState<string | null>(null);
  const [selectedMinisterioBId, setSelectedMinisterioBId] = useState<string | null>(null);

  const { ministerioVoluntariosDropDownList, isLoadingMinisterioVoluntarios } =
    useVoluntariosDoMinisterioCrud(ministerioId);

  const conflito: ConflitoMultiMinisteriosType | undefined = conflitos?.conflitos?.[0];
  const restantesCount = conflitos?.conflitos ? conflitos.conflitos.length - 1 : 0;

  const substitutosDropDownList = useMemo(
    () => ministerioVoluntariosDropDownList.filter((v) => v.value !== conflito?.voluntarioId),
    [ministerioVoluntariosDropDownList, conflito?.voluntarioId],
  );

  const outrosMinisterios = conflito?.outrosMinisterios ?? [];
  const precisaEscolherMinisterio = outrosMinisterios.length > 1 && !selectedMinisterioBId;

  useEffect(() => {
    setExpandedAction(null);
    setSelectedSubstitutoId(null);
    setSelectedMinisterioBId(
      outrosMinisterios.length === 1 ? outrosMinisterios[0].ministerioId : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conflito?.escalaItemId]);

  if (!conflitos?.temConflito || !conflito) {
    return null;
  }

  const toggleExpanded = (acao: Acao) => {
    setExpandedAction((prev) => (prev === acao ? null : acao));
  };

  const handleDeixarVago = async () => {
    try {
      setIsLoading(true);
      await onResolverConflitoSimples('deixar_vago', conflito);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmarTroca = async () => {
    if (!selectedSubstitutoId) return;
    try {
      setIsLoading(true);
      await onResolverConflitoSimples('trocar_voluntario', conflito, {
        voluntarioSubstitutoId: selectedSubstitutoId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmarPergunta = async () => {
    try {
      setIsLoading(true);
      await onResolverConflitoSimples('perguntar_voluntario', conflito, {
        ministerioBId: selectedMinisterioBId ?? undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      title='Conflito de Escalas'
      onClose={onClose}
      closeDisabled={isLoading}
    >
      <View style={styles.container}>
        <FancyText style={styles.subtitle}>
          {conflito.voluntarioNome} já está escalado em outro ministério nesta ocorrência.
        </FancyText>

        <FancyVerticalSpacer height={16} />

        <FancyText style={styles.label}>O que você deseja fazer?</FancyText>

        <FancyVerticalSpacer height={12} />

        <FancyButton
          label='Trocar por outro voluntário'
          type={expandedAction === 'trocar_voluntario' ? 'contained' : 'outlined'}
          onPress={() => toggleExpanded('trocar_voluntario')}
          disabled={isLoading}
        />

        {expandedAction === 'trocar_voluntario' && (
          <View style={styles.panel}>
            <FancySearchSelect
              label='Substituto'
              placeholder='Buscar voluntário...'
              value={selectedSubstitutoId}
              onChange={(value) =>
                setSelectedSubstitutoId(Array.isArray(value) ? (value[0] ?? null) : value)
              }
              listItems={substitutosDropDownList}
              isLoading={isLoadingMinisterioVoluntarios}
              disabled={isLoading}
            />
            <FancyVerticalSpacer height={8} />
            <FancyButton
              label='Confirmar troca'
              type='contained'
              onPress={handleConfirmarTroca}
              disabled={isLoading || !selectedSubstitutoId}
              isLoading={isLoading}
            />
          </View>
        )}

        <FancyVerticalSpacer height={8} />

        <FancyButton
          label='Deixar função vazia'
          type='outlined'
          onPress={handleDeixarVago}
          disabled={isLoading}
        />

        <FancyVerticalSpacer height={8} />

        <FancyButton
          label='Perguntar ao voluntário'
          type={expandedAction === 'perguntar_voluntario' ? 'contained' : 'outlined'}
          onPress={() => toggleExpanded('perguntar_voluntario')}
          disabled={isLoading}
        />

        {expandedAction === 'perguntar_voluntario' && (
          <View style={styles.panel}>
            <FancyText size='extraSmall' color={palette.fonts.inactive}>
              Conflito com:
            </FancyText>
            <FancyVerticalSpacer height={6} />
            <View style={styles.chipRow}>
              {outrosMinisterios.map((m) => (
                <FancyChips
                  key={m.ministerioId}
                  label={m.ministerioNome}
                  color={palette.primary}
                  outlined={selectedMinisterioBId !== m.ministerioId}
                  onPress={() => setSelectedMinisterioBId(m.ministerioId)}
                />
              ))}
            </View>
            <FancyVerticalSpacer height={8} />
            <FancyButton
              label='Confirmar pergunta'
              type='contained'
              onPress={handleConfirmarPergunta}
              disabled={isLoading || precisaEscolherMinisterio}
              isLoading={isLoading}
            />
          </View>
        )}

        {restantesCount > 0 && (
          <>
            <FancyVerticalSpacer height={16} />
            <FancyText style={styles.helperText}>
              {restantesCount} mais voluntário(s) em conflito.
            </FancyText>
          </>
        )}
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
  panel: {
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
