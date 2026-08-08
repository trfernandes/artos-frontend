# App Design Context — Artos (Diakonia)

**Last updated**: 2026-06-09 · **Sessions**: 2 **Platform**: React Native / Expo (Android device
RQCWC04P4VX)

> Tokens canônicos vêm de `usePallete()` / `constants/colors`. Nunca hex hardcoded. Regras
> tagueadas: `[confirmed]` (passou por gate A) · `[inferred]` (só extraído, não validado).

## Design Tokens (extraídos — constants/colors)

| Token                        | Light                  | Confidence  |
| ---------------------------- | ---------------------- | ----------- |
| `primary`                    | `#3B82F6`              | [confirmed] |
| `backgroundColor2` (surface) | `#F2F2F7`              | [confirmed] |
| `fonts.inactive` (muted)     | `#6F6F6F`              | [confirmed] |
| `confirm` (sucesso)          | verde `#208020`-ish    | [inferred]  |
| Base unit vertical           | 4px (múltiplos de 2/4) | [inferred]  |

## Confirmed Design Rules

- `[confirmed]` **Texto sobre fundo colorido translúcido usa `fonts.dark`, não `fonts.inactive`.**
  `fonts.inactive` (#6F6F6F) passa AA (4.50:1) só sobre superfície neutra; sobre `primary@0.10` cai
  para 4.19:1 e reprova AA. Diferenciar por peso (bold), não por cor clara. (origem: faixa de trial,
  etapa Revisão do cadastro de igreja)
- `[confirmed]` **Em par de ações navegação, só a ação de avanço é preenchida.** "Voltar"/secundária
  = `type='outlined'` (anel visível, fundo transparente); avanço = preenchido (`contained`/`light`
  com fill tonal e `borderColor: 'transparent'` — sem anel). Dois preenchidos competem no squint
  test. Aplica-se ao chrome do `FancySteps` (wizard) **e ao pager prev/next do navegador de
  eventos** (rodapé da tela de detalhes da escala). (origem: wizard cadastro de igreja; navegador de
  eventos da escala)
- `[confirmed]` **Botões-ícone de navegação soltos miram ≥44pt.** `size={{ w: 44, h: 44 }}`, mesmo
  que o fill tonal faça parecer maior — percepção visual não é hitbox. **Exceção:** dentro de card
  denso, alinham à altura do action button do card (30px) — ver regra abaixo. (origem: navegador de
  eventos da escala)
- `[confirmed]` **Contador de paginação usa formato "atual / total", sem flanco de min/max.**
  `3 / 13`, não `1 ‹ 3 › 13`. O "1" constante à esquerda é ruído sem informação; números soltos sem
  rótulo competem por interpretação. (origem: navegador de eventos da escala)
- `[confirmed]` **Navegador de itens (pager) full-width usa dots, sem rótulo numérico.** Botões
  prev/next ancorados nas pontas (`justifyContent: 'space-between'`); miolo `flex: 1` com fileira de
  dots centralizada (`gap: 5`): ativo 8px na cor de acento sólida, demais 6px em
  `withAlpha(acento, 0.25)`. Sem label "atual/total". Janela de no máx. 13 dots centrada no atual;
  acima disso desliza e encolhe os dots das pontas (4px) como dica de "há mais". Acento dinâmico por
  evento (`borderColor`), inline. (origem: navegador de eventos da escala — evoluiu pílula → trilho
  → dots; escolha do usuário)
- `[confirmed]` **Botões-ícone de navegação em rodapé de card seguem a altura do action button do
  card (30px = `size: 'medium'`), não 44pt.** Quando o navegador vive dentro de um card denso,
  alinhar à linguagem dos botões do card vence o piso de 44pt. (origem: navegador de eventos da
  escala — sobrepõe a regra geral de ≥44pt nesse contexto)
- `[confirmed]` **Valores monetários não quebram entre linhas.** Usar NBSP (U+00A0) dentro do preço
  ("R$ 39,90/mês" como bloco). (origem: `precoInicialLabel()`)
- `[inferred]` Card de conteúdo: `backgroundColor2` + `shadows[100]` + `borderRadius: 12`; zonas
  internas separadas por borda `withAlpha(fonts.dark, 0.08)`. (origem: card de resumo da Revisão)

## Confirmed Exceptions

_(nenhuma ainda)_

## Rejected Suggestion Categories

_(nenhuma ainda)_

## Design Debt Backlog

_(vazio)_

## Screen Hierarchy

- **Cadastro de Igreja (wizard)** → passos: Igreja → Contato → **Revisão** (tela revisada). Rota
  deslogada `(auth)/create-igreja-account`.
- **Lista de Escalas** → **Detalhes da Escala** (tela revisada). Acesso preferido pelo usuário:
  **toque no card** (hoje o card não tem onPress; abre via ⋮ → Editar — pendente wire do toque).
  Pager horizontal de eventos; rodapé = navegador prev/next. Rota
  `(drawer)/ministerios/escalas/details`.

## Screens Reviewed Log

- 2026-06-02 — Cadastro de Igreja / etapa Revisão — 3 findings, todos A, convergiu em 1 rodada.
- 2026-06-09 — Detalhes da Escala / navegador de eventos (rodapé) — 5 findings, todos A, convergiu
  em 1 rodada.
