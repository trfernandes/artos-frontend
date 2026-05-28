export interface ResponseConvitePreviewIgrejaDto {
  id: string;
  nome: string;
  logoUrl?: string | null;
  logoThumbUrl?: string | null;
}

export interface ResponseConvitePreviewDto {
  conviteId: string;
  descricao?: string | null;
  igreja: ResponseConvitePreviewIgrejaDto;
  autoApprove: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  usesCount: number;
  jaMembro?: boolean;
  solicitacaoPendente?: boolean;
  solicitacaoId?: string | null;
}
