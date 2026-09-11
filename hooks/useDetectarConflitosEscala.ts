import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type ConflitoBuscaDto = {
  voluntarioId: string;
  voluntarioNome: string;
  outrosMinisterios: {
    ministerioId: string;
    ministerioNome: string;
    funcoes: string[];
    dataOcorrencia: Date;
  }[];
};

export type ResponseConflitosMultiMinisteriosDto = {
  temConflito: boolean;
  conflitos: ConflitoBuscaDto[];
};

/**
 * Hook para detectar conflitos de múltiplos ministérios ao publicar escala.
 * Retorna função que chama a API de detecção.
 */
export function useDetectarConflitosEscala() {
  const detectar = useCallback(
    async (escalaId: string): Promise<ResponseConflitosMultiMinisteriosDto> => {
      // Usar a API via fetch direto
      // Backend espera POST com body { acao: 'detectar' }
      const response = await fetch(
        `/escalas/${escalaId}/publicar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            acao: 'detectar',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao detectar conflitos');
      }

      return response.json();
    },
    []
  );

  return { detectar };
}
