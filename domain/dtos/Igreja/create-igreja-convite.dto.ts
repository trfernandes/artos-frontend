import { IgrejaVoluntarioRoleEnum } from "../../enums/Igreja/voluntario-role.enum";

export class CreateIgrejaConviteDto {
  roleSugerida?: IgrejaVoluntarioRoleEnum | null;
  autoApprove?: boolean;
  expiresAt?: string | null; // ISO string
  maxUses?: number | null;
}
