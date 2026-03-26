import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { IgrejaMinisteriosRepository } from '../domain/services/IgrejaMinisteriosRepository';
import { ResponseLoginIgrejaDto, ResponseLoginMinisterioDto } from '../domain/dtos/login/login.response';
import { IgrejaVoluntarioRoleEnum } from '../domain/enums/Igreja/voluntario-role.enum';
import { VoluntarioHierarquiaEnum } from '../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { useMemo } from 'react';
import { RecursoPermissaoEnum, TipoPermissaoEnum } from '../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';

const fullPermissions = [
  { recurso: RecursoPermissaoEnum.AgendaEventos, permissoes: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.AlterarOcorrencia] },
  { recurso: RecursoPermissaoEnum.Escalas, permissoes: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Gerar, TipoPermissaoEnum.Alterar, TipoPermissaoEnum.Publicar] },
  { recurso: RecursoPermissaoEnum.Integrantes, permissoes: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Gerenciar] },
  { recurso: RecursoPermissaoEnum.FuncoesTemplates, permissoes: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Gerenciar] },
  { recurso: RecursoPermissaoEnum.RepertorioSetlist, permissoes: [TipoPermissaoEnum.Visualizar, TipoPermissaoEnum.Gerenciar] },
];

/**
 * Hook que retorna a igreja ativa com ministérios carregados.
 * Para usuários admin/owner, busca os ministérios da API quando o backend não retorna.
 */
export function useMinisteriosDrawer() {
  const { igrejaAtiva } = useAuth();

  // Verifica se o usuário é admin/owner
  const roleUpper = igrejaAtiva?.role?.toString().toUpperCase();
  const isAdmin = roleUpper === IgrejaVoluntarioRoleEnum.ADMIN || roleUpper === 'OWNER';

  // Verifica se precisa buscar ministérios (admin com lista vazia)
  const shouldFetchMinisterios = isAdmin && !!igrejaAtiva?.id && (!igrejaAtiva.ministerios || igrejaAtiva.ministerios.length === 0);

  // Busca ministérios da API se necessário
  const { data: ministeriosFetched, isLoading, isFetching } = useQuery({
    queryKey: ['ministerios-drawer', igrejaAtiva?.id, isAdmin],
    queryFn: async () => {
      if (!igrejaAtiva?.id) return [];

      const ministerios = await IgrejaMinisteriosRepository.listarMinisterios(igrejaAtiva.id);

      // Mapeia para o formato ResponseLoginMinisterioDto
      const mapped: ResponseLoginMinisterioDto[] = ministerios.map((m) => ({
        id: m.id,
        nome: m.nome,
        tipo: m.tipo,
        logoUrl: m.logoUrl || null,
        logoThumbUrl: m.logoThumbUrl || null,
        // Admin tem acesso de líder a todos os ministérios
        hierarquia: VoluntarioHierarquiaEnum.Lider,
        permissoes: fullPermissions,
        isDelegado: false,
      }));

      return mapped;
    },
    enabled: shouldFetchMinisterios,
    staleTime: 0, // Sempre buscar dados frescos ao trocar de igreja
    gcTime: 0, // Não manter cache quando a igreja mudar
  });

  // Retorna a igreja ativa com os ministérios (da API se necessário)
  const igrejaAtivaComMinisterios: ResponseLoginIgrejaDto | null = useMemo(() => {
    if (!igrejaAtiva) return null;

    // Se não é admin ou já tem ministérios, retorna como está
    if (!shouldFetchMinisterios) {
      return igrejaAtiva;
    }

    // Se é admin e buscou ministérios, retorna com os ministérios da API
    if (ministeriosFetched && ministeriosFetched.length > 0) {
      return {
        ...igrejaAtiva,
        ministerios: ministeriosFetched,
      };
    }

    return igrejaAtiva;
  }, [igrejaAtiva, shouldFetchMinisterios, ministeriosFetched]);

  return {
    igrejaAtiva: igrejaAtivaComMinisterios,
    isLoading: shouldFetchMinisterios && (isLoading || isFetching),
    isAdmin,
  };
}
