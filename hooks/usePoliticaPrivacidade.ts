import { useQuery } from '@tanstack/react-query';
import { PoliticaPrivacidadeRepository } from '../domain/services/PoliticaPrivacidadeRepository';

export function usePoliticaPrivacidade() {
  return useQuery({
    queryKey: ['politica-privacidade'],
    queryFn: () => PoliticaPrivacidadeRepository.obter(),
    staleTime: 1000 * 60 * 60,
  });
}
