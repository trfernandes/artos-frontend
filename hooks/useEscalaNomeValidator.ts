import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ResponseEscalaValidarNomeDto } from '../domain/dtos/Escala/escala-validar-nome.response';
import { EscalaRepository } from '../domain/services/EscalaRepository';

const DEFAULT_VALIDATE_RESPONSE: ResponseEscalaValidarNomeDto = {
  exists: false,
  normalizedNome: '',
  conflito: null,
};

export function useEscalaNomeValidator(ministerioId?: string) {
  const { igrejaAtiva } = useAuth();
  const [isCheckingName, setIsCheckingName] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateNome = useCallback(
    async (nome: string): Promise<ResponseEscalaValidarNomeDto> => {
      const normalizedInput = nome?.trim() ?? '';
      if (!normalizedInput || !ministerioId || !igrejaAtiva?.id) {
        return DEFAULT_VALIDATE_RESPONSE;
      }

      setIsCheckingName(true);
      try {
        return await EscalaRepository.validarNome(igrejaAtiva.id, ministerioId, normalizedInput);
      } finally {
        setIsCheckingName(false);
      }
    },
    [igrejaAtiva?.id, ministerioId],
  );

  const validateNomeDebounced = useCallback(
    (nome: string, debounceMs = 400): Promise<ResponseEscalaValidarNomeDto> => {
      const normalizedInput = nome?.trim() ?? '';
      if (!normalizedInput || !ministerioId || !igrejaAtiva?.id) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        return Promise.resolve(DEFAULT_VALIDATE_RESPONSE);
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      return new Promise((resolve, reject) => {
        debounceRef.current = setTimeout(async () => {
          debounceRef.current = null;
          try {
            resolve(await validateNome(normalizedInput));
          } catch (error) {
            reject(error);
          }
        }, debounceMs);
      });
    },
    [igrejaAtiva?.id, ministerioId, validateNome],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    validateNome,
    validateNomeDebounced,
    isCheckingName,
  };
}
