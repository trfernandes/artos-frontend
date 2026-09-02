# Triage Labels

As skills falam em termos dos cinco papéis canônicos de triagem. Este arquivo mapeia esses papéis
para os valores reais usados no tracker deste repo (a propriedade `Triagem` da database Notion
**Diakonia** — ver `docs/agents/issue-tracker.md`).

| Papel em mattpocock/skills | Valor de `Triagem` no Notion | Significado                              |
| --------------------------- | ----------------------------- | ----------------------------------------- |
| `needs-triage`               | `A Triar`                     | Precisa ser avaliado                      |
| `needs-info`                 | `Aguardando Informação`       | Esperando mais informação de quem reportou |
| `ready-for-agent`            | `Pronta para Agente`          | Totalmente especificado, pronto pra um agente AFK |
| `ready-for-human`            | `Pronta para Humano`          | Requer implementação humana               |
| `wontfix`                    | `Não Será Feito`              | Não será feito                            |

Quando uma skill mencionar um papel (ex: "aplicar o label de pronto-pra-agente"), use o valor
correspondente de `Triagem` acima, definido via `notion-update-page`.

## Categoria (bug vs. enhancement)

Este tracker não tem uma propriedade própria de categoria. Derive-a do campo `Tipo` já existente
na database:

| `Tipo` (Notion) | Categoria (mattpocock/skills) |
| ---------------- | ------------------------------- |
| `Bug`             | `bug`                           |
| `Funcionalidade`  | `enhancement`                   |
| `Melhoria`        | `enhancement`                   |

Ou seja: `Tipo = Bug` → `bug`; qualquer outro valor de `Tipo` → `enhancement`.
