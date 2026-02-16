export interface ResponseConvitePreviewDto {
  token: string;
  igrejaNome: string;
  igrejaId: string;
  igrejaLogo?: string | null;
  autoApprove: boolean;
  expiresAt?: string;
}
