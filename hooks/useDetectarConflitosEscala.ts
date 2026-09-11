import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface ConflitoBusca {
  voluntarioId: string;
  voluntarioNome: string;
  outrosMinisterios: {
    ministerioId: string;
    ministerioNome: string;
    funcoes: string[];
    dataOcorrencia: string;
  }[];
}

export interface ResponseConflitosMultiMinisterios {
  temConflito: boolean;
  conflitos: ConflitoBusca[];
}

/**
 * Hook para detectar conflitos de voluntários em múltiplos ministérios
 * ao abrir uma escala em rascunho.
 */
export function useDetectarConflitosEscala(escalaId: string | undefined) {
  return useQuery<ResponseConflitosMultiMinisterios>({
    queryKey: ['escala-conflitos', escalaId],
    queryFn: async () => {
      if (!escalaId) throw new Error('escalaId é obrigatório');

      const response = await apiClient.post(`/escalas/${escalaId}/publicar`, {
        acao: 'detectar',
      });

      return response.data;
    },
    enabled: !!escalaId,
    staleTime: 0, // Revalida sempre ao focar tela
  });
}
