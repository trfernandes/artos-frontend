import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { CadastroIgrejaRepository } from '../domain/services/CadastroIgrejaRepository';
import {
    CadastroIgrejaStorageDto,
    StatusCadastroResponseDto,
} from '../domain/dtos/Igreja/cadastro-igreja.dto';
import { IgrejaCadastroSolicitacaoStatusEnum } from '../domain/enums/Igreja/cadastro-solicitacao-status.enum';

const COOLDOWN_SEGUNDOS = 60;
const POLLING_INTERVAL_MS = 15000; // 15 segundos
const POLLING_MAX_DURATION_MS = 120000; // 2 minutos

export type UseCadastroIgrejaEmailOptions = {
  onConfirmado?: () => void;
  enablePolling?: boolean;
};

export function useCadastroIgrejaEmail({
  onConfirmado,
  enablePolling = false,
}: UseCadastroIgrejaEmailOptions = {}) {
  const queryClient = useQueryClient();

  // Dados do cadastro carregados do storage
  const [dadosCadastro, setDadosCadastro] = useState<CadastroIgrejaStorageDto | null>(null);
  const [loadingDados, setLoadingDados] = useState(true);

  // Cooldown para reenviar email
  const [cooldownRestante, setCooldownRestante] = useState(0);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling control
  const pollingStartTimeRef = useRef<number | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega dados do storage ao montar
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dados = await CadastroIgrejaRepository.obterDadosCadastro();
        setDadosCadastro(dados);
      } catch (error) {
        console.log('Erro ao carregar dados do cadastro:', error);
      } finally {
        setLoadingDados(false);
      }
    };
    carregarDados();
  }, []);

  // Query para status
  const statusQuery = useQuery<StatusCadastroResponseDto | null>({
    queryKey: ['cadastro-igreja-status', dadosCadastro?.cadastroId],
    queryFn: async () => {
      if (!dadosCadastro) return null;
      return CadastroIgrejaRepository.obterStatus(
        dadosCadastro.cadastroId,
        dadosCadastro.cadastroSecret,
      );
    },
    enabled: !!dadosCadastro,
    staleTime: 10000,
  });

  // Verifica se foi confirmado
  useEffect(() => {
    if (statusQuery.data?.statusSolicitacao === IgrejaCadastroSolicitacaoStatusEnum.CONCLUIDO) {
      pararPolling();
      onConfirmado?.();
    }
  }, [statusQuery.data?.statusSolicitacao, onConfirmado]);

  // Polling automático (opcional)
  useEffect(() => {
    if (!enablePolling || !dadosCadastro) return;

    pollingStartTimeRef.current = Date.now();

    pollingIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (pollingStartTimeRef.current || 0);

      if (elapsed >= POLLING_MAX_DURATION_MS) {
        pararPolling();
        return;
      }

      statusQuery.refetch();
    }, POLLING_INTERVAL_MS);

    return () => pararPolling();
  }, [enablePolling, dadosCadastro]);

  const pararPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRestante <= 0) {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
      return;
    }

    cooldownIntervalRef.current = setInterval(() => {
      setCooldownRestante((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldownRestante]);

  // Mutation para reenviar email
  const reenviarEmailMutation = useMutation({
    mutationFn: async () => {
      if (!dadosCadastro) throw new Error('Dados do cadastro não encontrados');
      return CadastroIgrejaRepository.reenviarEmail(
        dadosCadastro.cadastroId,
        dadosCadastro.cadastroSecret,
      );
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'E-mail reenviado!',
        text2: 'Verifique sua caixa de entrada.',
      });
      setCooldownRestante(COOLDOWN_SEGUNDOS);
      queryClient.invalidateQueries({ queryKey: ['cadastro-igreja-status'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao reenviar e-mail. Tente novamente.';
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: message,
      });
    },
  });

  // Mutation para alterar email
  const alterarEmailMutation = useMutation({
    mutationFn: async (novoEmail: string) => {
      if (!dadosCadastro) throw new Error('Dados do cadastro não encontrados');
      return CadastroIgrejaRepository.alterarEmail(
        dadosCadastro.cadastroId,
        dadosCadastro.cadastroSecret,
        { novoEmail },
      );
    },
    onSuccess: async (_, novoEmail) => {
      // Atualiza os dados no storage
      if (dadosCadastro) {
        const novosDados = { ...dadosCadastro, responsavelEmail: novoEmail };
        await CadastroIgrejaRepository.salvarDadosCadastro(novosDados);
        setDadosCadastro(novosDados);
      }

      Toast.show({
        type: 'success',
        text1: 'E-mail alterado!',
        text2: 'Um novo link foi enviado para o novo endereço.',
      });
      setCooldownRestante(COOLDOWN_SEGUNDOS);
      queryClient.invalidateQueries({ queryKey: ['cadastro-igreja-status'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Erro ao alterar e-mail. Tente novamente.';
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: message,
      });
    },
  });

  // Verificar confirmação manualmente
  const verificarConfirmacao = useCallback(async () => {
    const result = await statusQuery.refetch();

    if (result.data?.statusSolicitacao === IgrejaCadastroSolicitacaoStatusEnum.CONCLUIDO) {
      return true;
    }

    Toast.show({
      type: 'info',
      text1: 'Aguardando confirmação',
      text2: 'O e-mail ainda não foi confirmado.',
    });
    return false;
  }, [statusQuery]);

  // Limpar dados do cadastro (após confirmação)
  const limparDadosCadastro = useCallback(async () => {
    await CadastroIgrejaRepository.limparDadosCadastro();
    setDadosCadastro(null);
  }, []);

  return {
    // Dados
    dadosCadastro,
    loadingDados,
    status: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,

    // Ações
    verificarConfirmacao,
    reenviarEmail: reenviarEmailMutation.mutate,
    alterarEmail: alterarEmailMutation.mutate,
    limparDadosCadastro,

    // Estados de loading
    isReenviando: reenviarEmailMutation.isPending,
    isAlterandoEmail: alterarEmailMutation.isPending,
    isVerificando: statusQuery.isFetching,

    // Cooldown
    cooldownRestante,
    cooldownAtivo: cooldownRestante > 0,
  };
}
