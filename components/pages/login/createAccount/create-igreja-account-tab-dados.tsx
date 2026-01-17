import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { LoginCreateIgrejaFormData } from '../../../../domain/schemas/loginCreateIgrejaSchema';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledDropDown from '../../../forms/ControlledDropDown';
import { UF_LIST } from '../../../../domain/utils/uf-list';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pallete } from '../../../../constants/colors';
import { IgrejaRepository } from '../../../../domain/services/IgrejaRepository';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';

/**
 * Gera um slug a partir do nome da igreja
 * Ex: "Igreja Batista Central" -> "igreja-batista-central"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
    .slice(0, 32); // Limita a 32 caracteres
}

export default function CreateIgrejaAccountTabDados() {
  const { control, watch, setValue, clearErrors, setError } = useFormContext<LoginCreateIgrejaFormData>();
  const nome = watch('nome');
  const codigo = watch('codigo');

  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codigoStatus, setCodigoStatus] = useState<'available' | 'unavailable' | null>(null);

  const debounceNomeRef = useRef<NodeJS.Timeout | null>(null);
  const debounceCodigoRef = useRef<NodeJS.Timeout | null>(null);
  const lastGeneratedFromNome = useRef<string | null>(null);
  const lastCheckedCodigo = useRef<string | null>(null);

  /**
   * Gera código a partir do nome (apenas localmente, sem verificar na API)
   * A verificação de disponibilidade será feita no momento do submit
   */
  const gerarCodigoLocal = useCallback(
    (nomeIgreja: string) => {
      const slugCodigo = slugify(nomeIgreja);
      if (!slugCodigo || slugCodigo.length < 3) return;

      setValue('codigo', slugCodigo);
      clearErrors('codigo');
      lastGeneratedFromNome.current = nomeIgreja;
    },
    [setValue, clearErrors],
  );

  // Debounce para gerar código quando o nome muda
  useEffect(() => {
    if (debounceNomeRef.current) {
      clearTimeout(debounceNomeRef.current);
    }

    if (!nome || nome.trim().length < 3) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    debounceNomeRef.current = setTimeout(() => {
      gerarCodigoLocal(nome.trim());
      setIsDebouncing(false);
    }, 2000);

    return () => {
      if (debounceNomeRef.current) {
        clearTimeout(debounceNomeRef.current);
      }
    };
  }, [nome, gerarCodigoLocal]);

  const handleNomeBlur = useCallback(() => {
    // Cancela o debounce e executa imediatamente ao sair do campo
    if (debounceNomeRef.current) {
      clearTimeout(debounceNomeRef.current);
    }
    setIsDebouncing(false);

    if (!nome || nome.trim().length < 3 || lastGeneratedFromNome.current === nome) {
      return;
    }

    gerarCodigoLocal(nome.trim());
  }, [nome, gerarCodigoLocal]);

  /**
   * Verifica se o código está disponível na API
   */
  const verificarCodigoNaApi = useCallback(
    async (codigoParaVerificar: string) => {
      try {
        setIsCheckingCode(true);
        clearErrors('codigo');

        const result = await IgrejaRepository.verificarCodigoDisponivelPublico(codigoParaVerificar);
        lastCheckedCodigo.current = codigoParaVerificar;

        if (result.disponivel) {
          setCodigoStatus('available');
        } else {
          setCodigoStatus('unavailable');
          setError('codigo', {
            message: result.sugestao ? `Código já em uso. Sugestão: ${result.sugestao}` : 'Código já em uso',
          });
        }
      } catch (error) {
        console.log('Erro ao verificar código:', error);
        // Em caso de erro (401, etc), não mostra status
        setCodigoStatus(null);
      } finally {
        setIsCheckingCode(false);
      }
    },
    [clearErrors, setError],
  );

  // Debounce para verificar código quando digitado manualmente
  useEffect(() => {
    if (debounceCodigoRef.current) {
      clearTimeout(debounceCodigoRef.current);
    }

    // Não verifica se está vazio ou muito curto
    if (!codigo || codigo.trim().length < 3) {
      setCodigoStatus(null);
      return;
    }

    // Não verifica se já foi verificado
    if (lastCheckedCodigo.current === codigo.trim()) {
      return;
    }

    setIsCheckingCode(true);
    debounceCodigoRef.current = setTimeout(() => {
      verificarCodigoNaApi(codigo.trim());
    }, 2000);

    return () => {
      if (debounceCodigoRef.current) {
        clearTimeout(debounceCodigoRef.current);
      }
    };
  }, [codigo, verificarCodigoNaApi]);

  const handleCodigoBlur = useCallback(() => {
    // Cancela o debounce e executa imediatamente ao sair do campo
    if (debounceCodigoRef.current) {
      clearTimeout(debounceCodigoRef.current);
    }

    if (!codigo || codigo.trim().length < 3 || lastCheckedCodigo.current === codigo.trim()) {
      setIsCheckingCode(false);
      return;
    }

    verificarCodigoNaApi(codigo.trim());
  }, [codigo, verificarCodigoNaApi]);

  const renderCodigoRightContainer = () => {
    if (isCheckingCode) {
      return <ActivityIndicator size='small' color={Pallete.primary} style={{ marginRight: 10 }} />;
    }
    if (codigoStatus === 'available') {
      return <DefaultIcons.Custom library='Feather' name='check-circle' size={18} color={Pallete.confirm} style={{ marginRight: 10 }} />;
    }
    if (codigoStatus === 'unavailable') {
      return <DefaultIcons.Custom library='Feather' name='x-circle' size={18} color={Pallete.error} style={{ marginRight: 10 }} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ControlledTextInput
        control={control}
        name='nome'
        label='Qual o nome da sua igreja?'
        inputProps={{ onBlur: handleNomeBlur }}
        rightContainer={isDebouncing ? <ActivityIndicator size='small' color={Pallete.primary} style={{ marginRight: 10 }} /> : null}
      />
      <ControlledTextInput
        control={control}
        name='codigo'
        label='Código de Identificação'
        inputProps={{ onBlur: handleCodigoBlur }}
        rightContainer={renderCodigoRightContainer()}
      />
      {codigoStatus === 'available' && (
        <FancyText size='extraSmall' type='semiBold' color={Pallete.confirm} style={styles.statusText}>
          ✓ Código disponível
        </FancyText>
      )}
      <View style={styles.row}>
        <View style={styles.cidadeContainer}>
          <ControlledTextInput control={control} name='cidade' label='Cidade' />
        </View>
        <View style={styles.ufContainer}>
          <ControlledDropDown control={control} name='uf' label='UF' listItems={UF_LIST} placeholder='UF' />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cidadeContainer: {
    flex: 1,
  },
  ufContainer: {
    width: 100,
  },
  statusText: {
    marginTop: -3,
  },
});
