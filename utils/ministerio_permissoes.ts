import {
  ResponseLoginIgrejaDto,
  ResponseLoginMinisterioDto,
} from '../domain/dtos/login/login.response';
import { IgrejaVoluntarioRoleEnum } from '../domain/enums/Igreja/voluntario-role.enum';
import { MinisterioTipoEnum } from '../domain/enums/Ministerio/ministerio-tipo.enum';
import { VoluntarioHierarquiaEnum } from '../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  RecursoPermissaoEnum,
  TipoPermissaoEnum,
} from '../domain/enums/MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.enum';

export function getMinisterioLoginAccess(
  igrejaAtiva: ResponseLoginIgrejaDto | null | undefined,
  ministerioId?: string | null,
): ResponseLoginMinisterioDto | undefined {
  if (!igrejaAtiva || !ministerioId) return undefined;
  return igrejaAtiva.ministerios?.find((ministerio) => ministerio.id === ministerioId);
}

// `tipo` chega numérico (2) do login em alguns fluxos e string ('2') em outros — normaliza antes de comparar.
export function ministerioEhLouvor(
  ministerio: ResponseLoginMinisterioDto | null | undefined,
): boolean {
  return String(ministerio?.tipo ?? '') === String(MinisterioTipoEnum.Louvor);
}

export function hasMinisterioPermission(
  ministerio: ResponseLoginMinisterioDto | null | undefined,
  recurso: RecursoPermissaoEnum,
  permissao: TipoPermissaoEnum,
) {
  if (!ministerio) return false;
  if (String(ministerio.hierarquia) === VoluntarioHierarquiaEnum.Lider) return true;

  return (
    ministerio.permissoes?.some(
      (row) =>
        row.recurso === recurso &&
        Array.isArray(row.permissoes) &&
        row.permissoes.includes(permissao),
    ) ?? false
  );
}

export function canManageEventoOcorrencia(
  igrejaAtiva: ResponseLoginIgrejaDto | null | undefined,
  ministerioId?: string | null,
) {
  if (!igrejaAtiva) return false;
  if (igrejaAtiva.role === IgrejaVoluntarioRoleEnum.ADMIN) return true;

  const ministerio = getMinisterioLoginAccess(igrejaAtiva, ministerioId);
  if (!ministerio) return false;

  return (
    String(ministerio.hierarquia) === VoluntarioHierarquiaEnum.Lider ||
    hasMinisterioPermission(
      ministerio,
      RecursoPermissaoEnum.AgendaEventos,
      TipoPermissaoEnum.AlterarOcorrencia,
    ) ||
    hasMinisterioPermission(ministerio, RecursoPermissaoEnum.Escalas, TipoPermissaoEnum.Alterar)
  );
}
