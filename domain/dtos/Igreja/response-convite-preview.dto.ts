import { IgrejaVoluntarioRoleEnum } from '../../enums/Igreja/voluntario-role.enum';

export type ResponseConvitePreviewDto = {
  igrejaId: string;
  igrejaNome: string;
  autoApprove: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  usesCount: number;
  roleSugerida?: IgrejaVoluntarioRoleEnum | null;
};
