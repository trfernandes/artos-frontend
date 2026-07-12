/**
 * Diretriz 3.1.1 da App Store proíbe links/CTAs de pagamento fora do IAP para
 * conteúdo/serviço digital; a exceção (External Purchase Link Entitlement)
 * não cobre o storefront brasileiro. A política equivalente do Google Play
 * também não cobre o Brasil. Aplicado nas duas plataformas (não só iOS) para
 * manter um único comportamento comercial no app.
 *
 * Status/banners de assinatura podem ser exibidos normalmente — não são
 * "steering" (não direcionam a um pagamento externo). Já qualquer seleção de
 * plano ou checkout precisa sair do app (portal web via navegador do
 * sistema), nunca ser renderizada dentro do app.
 */
export const BILLING_STATUS_VISIBLE = true;
export const BILLING_CHECKOUT_IN_APP_ENABLED = false;

// Apple 3.1.1 / Google Play: toda ação de billing (assinar, trocar plano,
// cancelar) ocorre no site web externo. O app exibe apenas status e bloqueia
// criação quando necessário. Um único botão "Gerenciar assinatura" abre o
// portal via navegador do sistema.
export const BILLING_WEB_ONLY = true;
