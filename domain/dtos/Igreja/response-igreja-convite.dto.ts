import { IgrejaVoluntarioRoleEnum } from '../../enums/Igreja/voluntario-role.enum';

export type ConviteStatusType = 'ATIVO' | 'EXPIRADO' | 'REVOGADO' | 'ESGOTADO';

export interface ResponseIgrejaConviteDto {
  id: string;
  token: string;
  inviteLink: string;
  igrejaId: string;
  descricao: string | null;
  autoApprove: boolean;
  roleSugerida: IgrejaVoluntarioRoleEnum;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}
