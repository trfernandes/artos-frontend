# Deep links — mapa de rotas Expo Router

Referência pra navegação rápida e precisa no device físico, sem tocar em UI e sem depender de
coordenada de tela. Ver [feedback-deeplink-screencap-visual-check.md] (memória) pro método completo.

## Comando base

```bash
MSYS_NO_PATHCONV=1 adb -s <device> shell am start -a android.intent.action.VIEW -d "diakonia://<rota>?param=valor"
sleep 1.5
adb -s <device> exec-out screencap -p > print.png
```

Scheme confirmado em `app.json`: `diakonia`. App precisa estar aberto e logado (deep link não
troca activity se app já em foreground — só troca a rota interna via Linking listener).

## Mapa de rotas

`ministerioId` é o param mais recorrente — quase toda tela `ministerios/*` depende dele. Não tem
valor fixo documentável (é UUID do backend, varia por igreja/seed); pegar abrindo `/ministerios`
(lista admin) primeiro e lendo o card certo, ou consultando a lista via UI uma vez por sessão.

| Rota | Params obrigatórios | Params opcionais | Onde conseguir o valor |
|---|---|---|---|
| `/inicio` | — | — | — |
| `/ministerios` (lista, `admin/ministerios/index.tsx`) | — | — | Lista todos ministérios da igreja ativa |
| `/admin/ministerios/edit` | `id` | — | pegar na lista `/ministerios` |
| `/admin/ministerios/add` | — | — | — |
| `/admin/eventos` | — | — | — |
| `/admin/eventos/add` | — | — | — |
| `/admin/eventos/edit` | `id` | — | pegar na lista `/admin/eventos` |
| `/admin/solicitacoes` | — | `tab` (`'convites'` = 2ª aba) | — |
| `/admin/voluntarios` | — | — | — |
| `/admin/voluntarios/details` | `id` | — | pegar na lista `/admin/voluntarios` |
| `/ministerios/escalas` | — | `ministerioId` (sem ele, lista provavelmente vazia) | `ministerioId` |
| `/ministerios/escalas/details` | `ministerioId`, `escalaId` | `viewMode` (`'view'`\|`'edit'`) | `escalaId` — pegar na lista `/ministerios/escalas` |
| `/ministerios/escalas/manual` | `ministerioId` | — | — |
| `/ministerios/escalas/assistant` | `ministerioId` | — | — |
| `/ministerios/escalas/insights` | `ministerioId`, `escalaId` | — | — |
| `/ministerios/escalas/substituicoes` | `ministerioId` (tem fallback `''`, não crasha) | — | — |
| `/ministerios/integrantes` | `ministerioId` | — | — |
| `/ministerios/integrantes/add` | `ministerioId` | — | — |
| `/ministerios/integrantes/edit` | `ministerioId`, `ministerioVoluntarioId` | — | `ministerioVoluntarioId` — pegar na lista `/ministerios/integrantes` |
| `/ministerios/indisponibilidades` | — | `ministerioId` (filtra) | — |
| `/ministerios/acessos` | `ministerioId` | — | — |
| `/ministerios/funcoes` | — | `ministerioId` (necessário pra query funcionar) | — |
| `/ministerios/configuracoes` | não usa param de rota | — | usa ministério ativo do contexto |
| `/ministerios/agenda` | `ministerioId` | — | — |
| `/ministerios/agenda/details` | `dataOcorrencia`, `ministerioId` | `id` ou `eventoId` (um dos dois) | pegar na lista `/ministerios/agenda` |
| `/ministerios/agenda/setlist/[itemId]` | `itemId`, `eventoId`, `ministerioId`, `dataOcorrencia` | `modo` (`'lider'`\|`'responsavel'`\|`'leitura'`) | pegar em `/ministerios/agenda/details` |
| `/ministerios/louvor/repertorio` | — | `ministerioId` | — |
| `/ministerios/louvor/repertorio/add` | — | `ministerioId` | — |
| `/ministerios/louvor/repertorio/edit` | `ministerioId`, `id` (sem `id` = modo criação) | `readOnly` (`'1'`) | `id` — pegar na lista de repertório |
| `/ministerios/templates_equipe` | `ministerioId` | — | — |
| `/ministerios/templates_equipe/add` | `ministerioId` | — | — |
| `/ministerios/templates_equipe/edit` | `ministerioId`, `templateId` | — | pegar na lista |
| `/ministerios/solicitacoes` | — | `ministerioId` | — |
| `/pessoal/escalas` | — | `selectedDate`, `dataOcorrencia`, `dataEvento`, `month`, `dataReferencia`, `escalaId` (todos ISO/string) | — |
| `/pessoal/escalas/evento` | `evento` (JSON stringificado do evento inteiro), `dataOcorrencia` | `horarioEnsaio`, `ministerioNome`, `ministerioId`, `responsavelSetlistVoluntarioId`, `responsavelSetlistNome` | **Inviável montar à mão** — `evento` é JSON grande. Navegar via UI ou capturar `router.push` real. |
| `/pessoal/escalas/setlist/[itemId]` | `itemId`, `eventoId`, `ministerioId`, `dataOcorrencia` | `modo` | pegar navegando por uma escala pessoal com setlist |
| `/pessoal/escalas/substituicoes` | não usa param de rota | — | — |
| `/pessoal/indisponibilidade` | não usa param de rota | — | usa contexto (igreja/user) |
| `/pessoal/perfil` | não usa param de rota | — | — |
| `/pessoal/perfil/edit` | não usa param de rota | — | — |
| `/configuracoes` | — | `tab` | — |
| `/ajuda` | não usa param de rota | — | — |
| `/notifications` | não usa param de rota | — | — |
| `/notification-detail` | `notification` (JSON stringificado) | — | **Inviável montar à mão** — mesmo caso de `evento`. Ver `NotificationsList.tsx` pro `router.push` real se precisar. |
| `/join-church` | não usa param de rota | — | input manual de código na tela |
| `/join-church/requests` | não usa param de rota | — | — |

## Casos sem solução via deep link manual

`pessoal/escalas/evento` e `notification-detail` recebem objeto inteiro serializado em JSON como
param — grande demais e impraticável de montar via `adb shell am start`. Pra essas duas, navegar
pela UI mesmo (tap na lista) é mais rápido que tentar deep link.

## Nota de implementação (Android)

Se o app já está em foreground na mesma activity, `adb shell am start ... diakonia://rota` pode
retornar `Warning: Activity not started, intent has been delivered to currently running top-most
instance` — isso é normal (`singleTask`/`singleTop`), o Linking listener do Expo Router processa o
novo path mesmo assim. Validado nesta sessão: `/configuracoes`, `/admin/ministerios` responderam
certo mesmo com esse warning. Uma exceção observada: `diakonia:///ministerios` (sem `admin/`) não
trocou de tela quando a activity já estava aberta em outra rota — usar sempre o path completo e
confirmado da tabela acima, não path "adivinhado".
