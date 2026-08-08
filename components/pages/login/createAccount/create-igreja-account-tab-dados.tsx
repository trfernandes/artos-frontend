import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { LoginCreateIgrejaFormData } from '../../../../domain/schemas/loginCreateIgrejaSchema';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledSearchSelect from '../../../forms/ControlledSearchSelect';
import { UF_LIST } from '../../../../domain/utils/uf-list';
import { getCidadesPorUf } from '../../../../domain/utils/cidades-list';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { IgrejaRepository } from '../../../../domain/services/IgrejaRepository';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';
import { usePallete } from '../../../../hooks/usePallete';

// Contexto para compartilhar o estado de verificação do código
type CodigoCheckContextType = {
  isCheckingCode: boolean;
  setIsCheckingCode: (value: boolean) => void;
};

const CodigoCheckContext = createContext<CodigoCheckContextType | null>(null);

export const useCodigoCheck = () => {
  const context = useContext(CodigoCheckContext);
  if (!context) {
    return { isCheckingCode: false, setIsCheckingCode: (_value: boolean) => {} };
  }
  return context;
};

export const CodigoCheckProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  return (
    <CodigoCheckContext.Provider value={{ isCheckingCode, setIsCheckingCode }}>
      {children}
    </CodigoCheckContext.Provider>
  );
};

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
  const palette = usePallete();
  const { control, watch, setValue, clearErrors, setError } =
    useFormContext<LoginCreateIgrejaFormData>();
  const nome = watch('nome');
  const codigo = watch('codigo');
  const uf = watch('uf');

  const [isDebouncing, setIsDebouncing] = useState(false);
  const { isCheckingCode, setIsCheckingCode } = useCodigoCheck();
  const [codigoStatus, setCodigoStatus] = useState<'available' | 'unavailable' | null>(null);
  const [sugestao, setSugestao] = useState<string | null>(null);

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
          setSugestao(null);
        } else {
          setCodigoStatus('unavailable');
          setSugestao(result.sugestao || null);
          setError('codigo', {
            message: result.sugestao
              ? `Código já em uso. Sugestão: ${result.sugestao}`
              : 'Código já em uso',
          });
        }
      } catch (error) {
        console.log('Erro ao verificar código:', error);
        // Em caso de erro (401, etc), não mostra status
        setCodigoStatus(null);
        setSugestao(null);
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
      return <ActivityIndicator size='small' color={palette.primary} style={{ marginRight: 10 }} />;
    }
    if (codigoStatus === 'available') {
      return (
        <DefaultIcons.Custom
          library='Feather'
          name='check-circle'
          size={18}
          color={palette.confirm}
          style={{ marginRight: 10 }}
        />
      );
    }
    if (codigoStatus === 'unavailable') {
      return (
        <DefaultIcons.Custom
          library='Feather'
          name='x-circle'
          size={18}
          color={palette.error}
          style={{ marginRight: 10 }}
        />
      );
    }
    return null;
  };

  const aplicarSugestao = () => {
    if (sugestao) {
      setValue('codigo', sugestao);
      clearErrors('codigo');
      setCodigoStatus(null);
      setSugestao(null);
      lastCheckedCodigo.current = null; // Força nova verificação
    }
  };

  // Lista de cidades baseada na UF selecionada (async)
  const [cidadesList, setCidadesList] = useState<DropDownItemProps<string>[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);

  useEffect(() => {
    if (!uf) {
      setCidadesList([]);
      return;
    }

    setIsLoadingCidades(true);
    getCidadesPorUf(uf)
      .then((cidades) => {
        setCidadesList(cidades);
      })
      .catch((error) => {
        console.error('Erro ao carregar cidades:', error);
        setCidadesList([]);
      })
      .finally(() => {
        setIsLoadingCidades(false);
      });
  }, [uf]);

  // Limpa a cidade quando a UF muda
  useEffect(() => {
    if (uf) {
      const cidade = watch('cidade');
      if (cidade) {
        // Verifica se a cidade atual pertence à nova UF
        const cidadeExiste = cidadesList.some((c) => c.value === cidade);
        if (!cidadeExiste) {
          setValue('cidade', '');
        }
      }
    }
  }, [uf, cidadesList, setValue, watch]);

  return (
    <View style={styles.container}>
      <ControlledTextInput
        control={control}
        name='nome'
        label='Qual o nome da sua igreja?'
        labelProps={{ style: { color: palette.fonts.dark } }}
        inputProps={{ onBlur: handleNomeBlur }}
        rightContainer={
          isDebouncing ? (
            <ActivityIndicator size='small' color={palette.primary} style={{ marginRight: 10 }} />
          ) : null
        }
      />
      <ControlledTextInput
        control={control}
        name='codigo'
        label='Código de Identificação'
        labelProps={{ style: { color: palette.fonts.dark } }}
        inputProps={{ onBlur: handleCodigoBlur }}
        rightContainer={renderCodigoRightContainer()}
      />
      {codigoStatus === 'available' && (
        <FancyText
          size='extraSmall'
          type='semiBold'
          color={palette.confirm}
          style={styles.statusText}
        >
          ✓ Código disponível
        </FancyText>
      )}
      {codigoStatus === 'unavailable' && sugestao && (
        <TouchableOpacity onPress={aplicarSugestao} style={styles.sugestaoContainer}>
          <DefaultIcons.Custom library='Feather' name='info' size={12} color={palette.primary} />
          <FancyText
            size='extraSmall'
            type='medium'
            color={palette.primary}
            style={styles.sugestaoText}
          >
            Usar sugestão: {sugestao}
          </FancyText>
        </TouchableOpacity>
      )}
      <ControlledSearchSelect
        control={control}
        name='uf'
        label='Estado'
        labelProps={{ style: { color: palette.fonts.dark } }}
        listItems={UF_LIST}
        placeholder='Selecione o estado'
        searchPlaceholder='Buscar estado...'
      />
      <ControlledSearchSelect
        control={control}
        name='cidade'
        label='Cidade'
        labelProps={{ style: { color: palette.fonts.dark } }}
        listItems={cidadesList}
        placeholder={isLoadingCidades ? 'Carregando cidades...' : 'Selecione a cidade'}
        searchPlaceholder='Buscar cidade...'
        disabled={!uf || isLoadingCidades}
        isLoading={isLoadingCidades}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
  },
  statusText: {
    marginTop: -3,
  },
  sugestaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -5,
    paddingVertical: 2,
  },
  sugestaoText: {
    textDecorationLine: 'underline',
  },
});
