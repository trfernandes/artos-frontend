# App Design Context — Artos (Diakonia)

**Last updated**: 2026-06-02 · **Sessions**: 1
**Platform**: React Native / Expo (Android device RQCWC04P4VX)

> Tokens canônicos vêm de `usePallete()` / `constants/colors`. Nunca hex hardcoded.
> Regras tagueadas: `[confirmed]` (passou por gate A) · `[inferred]` (só extraído, não validado).

## Design Tokens (extraídos — constants/colors)
| Token | Light | Confidence |
|---|---|---|
| `primary` | `#3B82F6` | [confirmed] |
| `backgroundColor2` (surface) | `#F2F2F7` | [confirmed] |
| `fonts.inactive` (muted) | `#6F6F6F` | [confirmed] |
| `confirm` (sucesso) | verde `#208020`-ish | [inferred] |
| Base unit vertical | 4px (múltiplos de 2/4) | [inferred] |

## Confirmed Design Rules
- `[confirmed]` **Texto sobre fundo colorido translúcido usa `fonts.dark`, não `fonts.inactive`.**
  `fonts.inactive` (#6F6F6F) passa AA (4.50:1) só sobre superfície neutra; sobre `primary@0.10` cai para 4.19:1 e reprova AA. Diferenciar por peso (bold), não por cor clara. (origem: faixa de trial, etapa Revisão do cadastro de igreja)
- `[confirmed]` **Em par de ações navegação, só a ação de avanço é preenchida.** "Voltar"/secundária = `type='outlined'`; primária = `contained`. Dois `contained` competem no squint test. Aplica-se ao chrome do `FancySteps` (todos os passos do wizard). (origem: wizard cadastro de igreja)
- `[confirmed]` **Valores monetários não quebram entre linhas.** Usar NBSP (U+00A0) dentro do preço ("R$ 39,90/mês" como bloco). (origem: `precoInicialLabel()`)
- `[inferred]` Card de conteúdo: `backgroundColor2` + `shadows[100]` + `borderRadius: 12`; zonas internas separadas por borda `withAlpha(fonts.dark, 0.08)`. (origem: card de resumo da Revisão)

## Confirmed Exceptions
_(nenhuma ainda)_

## Rejected Suggestion Categories
_(nenhuma ainda)_

## Design Debt Backlog
_(vazio)_

## Screen Hierarchy
- **Cadastro de Igreja (wizard)** → passos: Igreja → Contato → **Revisão** (tela revisada). Rota deslogada `(auth)/create-igreja-account`.

## Screens Reviewed Log
- 2026-06-02 — Cadastro de Igreja / etapa Revisão — 3 findings, todos A, convergiu em 1 rodada.
