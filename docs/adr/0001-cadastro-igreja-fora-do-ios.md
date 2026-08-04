# Cadastro de igreja (organização pagante) indisponível no build iOS

A Apple rejeitou a submissão sob Guideline 3.1.1, considerando o fluxo de "Cadastrar minha igreja"
(criação de conta de organização vinculada a assinatura cobrada via Asaas, fora do IAP) como acesso
a mecanismo externo de pagamento. Decidimos remover esse fluxo inteiramente do build iOS — as rotas
`create-igreja-account` e `igreja-cadastro-aguardando-email` não são registradas no `Stack` de
`(auth)/_layout.tsx` quando `Platform.OS === 'ios'`, e os pontos de entrada (`create-account.tsx`,
`admin-discovery.tsx`) ficam escondidos na mesma condição — não apenas desabilitados, para não
reacender a mesma objeção numa próxima revisão.

Alternativas descartadas: usar Apple IAP para a assinatura (IAP não suporta PIX/boleto, meio de
pagamento predominante da base); construir uma página de auto-cadastro no site
(`diakonia-public-site`) antes de resubmeter (adiava o envio à loja).

Cadastro de voluntário (entrada via código/convite numa igreja já existente, sem criar entidade
pagante) não é afetado — Apple não restringe isso.

## Consequências

Até existir um caminho de cadastro fora do app (web ou Android), uma igreja nova não consegue se
auto-cadastrar a partir de um iPhone. O app iOS só serve quem já tem conta ou recebeu convite/código
de uma igreja existente.

## Resolução

Página `diakonia-public-site/public/cadastro-igreja/` cobre o caminho fora do app: formulário web
chama a mesma API pública (`igreja-cadastro-solicitacoes`) já usada pelo app, sem mudança de
backend. App iOS não referencia essa página (nenhum link/CTA dentro do app) — Apple 3.1.1 também
proíbe "botões, links externos ou outras chamadas para ação" apontando pra fora, então até um link
discreto reacenderia a objeção. Descoberta da página fica só fora do app (site institucional, busca
orgânica, indicação).
