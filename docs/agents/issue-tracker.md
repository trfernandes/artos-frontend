# Issue tracker: Notion

Issues, bugs e melhorias deste projeto vivem como linhas na database Notion **Diakonia**,
compartilhada entre `artos-frontend`, `artos-backend` e `diakonia-public-site` (mesmo produto,
tracker único). Use as ferramentas MCP do Notion para todas as operações — nunca GitHub Issues,
nunca arquivos locais.

- **Database**: [Diakonia](https://app.notion.com/p/8017cfcb9ca34c1ea28f8c6462c536d5) (dentro da
  página `DIAKONIA`)
- **Data source ID**: `50b40c4b-23c5-4910-8c50-a024e95d881a` (use como
  `collection://50b40c4b-23c5-4910-8c50-a024e95d881a` em `notion-query-data-sources`)

## Schema

| Propriedade     | Tipo        | Valores                                                                          |
| ---------------- | ----------- | --------------------------------------------------------------------------------- |
| `Nome`            | title       | —                                                                                 |
| `Tipo`            | select      | `Bug`, `Funcionalidade`, `Melhoria`                                              |
| `Prioridade`      | select      | `Alta`, `Média`, `Baixa`                                                         |
| `Status`          | select      | `Novo`, `Em andamento`, `Resolvido`                                              |
| `Triagem`         | select      | `A Triar`, `Aguardando Informação`, `Pronta para Agente`, `Pronta para Humano`, `Não Será Feito` — ver `docs/agents/triage-labels.md` |
| `Plataforma`      | select      | `Android`, `iOS`, `Web`, `Backend`, `Site`                                       |
| `Reportado por`   | text        | —                                                                                 |
| `Descrição`       | text        | O que aconteceu, print ou relato                                                 |
| `Notas`           | text        | —                                                                                 |
| `Data`            | date        | —                                                                                 |
| `Anexos`          | file        | —                                                                                 |

**Neste repositório (`artos-frontend`)**: ao criar um item, defina `Plataforma` como `Android`,
`iOS` ou `Web`, conforme a plataforma afetada (não use `Backend` nem `Site` aqui — essas são de
`artos-backend` e `diakonia-public-site`, que compartilham a mesma database).

## Convenções

- **Criar um item**: `notion-create-pages` com `parent.data_source_id` igual ao data source acima
  e `properties` preenchendo pelo menos `Nome`, `Tipo`, `Prioridade`, `Status: Novo`,
  `Triagem: A Triar`, `Plataforma` e `Reportado por`. Coloque o relato detalhado em `Descrição`
  e/ou no corpo da página (conteúdo Markdown).
- **Ler um item**: `notion-fetch` com a URL ou o ID da página do item.
- **Listar itens**: `notion-query-data-sources` em modo SQL contra
  `collection://50b40c4b-23c5-4910-8c50-a024e95d881a`, filtrando por `Plataforma` (para escopar
  ao repo), `Status`, `Triagem` etc. Exemplo:
  ```sql
  SELECT * FROM "collection://50b40c4b-23c5-4910-8c50-a024e95d881a"
  WHERE "Plataforma" IN ('Android', 'iOS', 'Web') AND "Status" != 'Resolvido'
  ```
- **Atualizar um item** (status, triagem, prioridade, etc.): `notion-update-page` com o `page_id`
  e as `properties` alteradas.
- **Comentar em um item**: `notion-create-comment` com o `page_id` (ou `discussion_id` para
  responder numa thread existente).
- **Buscar itens por texto livre**: `notion-search` com `data_source_url` apontando pro data
  source acima, quando uma busca semântica for mais útil que uma query SQL exata.

## PRs como superfície de triagem

**Não.** PRs no GitHub não alimentam nem são lidos por este tracker. Toda a triagem acontece na
database Notion.

## Quando uma skill disser "publish to the issue tracker"

Criar um item na database Diakonia (`notion-create-pages`), com `Plataforma` apropriada a este
repo.

## Quando uma skill disser "fetch the relevant ticket"

Rodar `notion-fetch` na URL/ID da página do item.

## Wayfinding (mapa e tickets filhos)

A database Diakonia não tem uma relação nativa de pai/filho, então `/wayfinder` usa hierarquia de
páginas do Notion em vez de uma propriedade de relação:

- **Mapa**: uma página comum do Notion (não uma linha da database), criada com `notion-create-pages`
  fora da database, contendo o corpo Notes / Decisions-so-far / Fog.
- **Ticket filho**: uma linha da database Diakonia criada como página-filha do mapa
  (`notion-create-pages` com `parent` = ID da página do mapa). Já que a database em si não aceita
  páginas-filhas soltas, prefira registrar `Part of: <link do mapa>` no campo `Notas` do ticket
  como o vínculo canônico.
- **Bloqueio**: sem suporte nativo — registrar `Bloqueado por: <link>` em `Notas` do ticket
  bloqueado. Um ticket é considerado desbloqueado quando todos os links em `Notas` apontam para
  itens com `Status: Resolvido`.
- **Fronteira (frontier)**: listar os tickets filhos do mapa via `notion-query-data-sources`
  filtrando por `Status != 'Resolvido'`, descartar os que tenham um bloqueio aberto em `Notas`;
  o primeiro na ordem de criação vence.
- **Claim**: `notion-update-page` no ticket, adicionando "Claimed by: <dev>" em `Notas`.
- **Resolver**: `notion-create-comment` com a resposta, depois `notion-update-page` setando
  `Status: Resolvido`, depois um ponteiro de contexto anexado às Decisions-so-far do mapa.
