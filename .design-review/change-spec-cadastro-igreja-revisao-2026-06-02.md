# Change Spec — Cadastro de Igreja / etapa Revisão — 2026-06-02
**App**: Artos (Diakonia)
**Intent**: consistência geral
**States reviewed**: Atual (single-state)
**Screenshot type**: device (Android RQCWC04P4VX)

## Changes Applied
### 1. Contraste do texto secundário da faixa de trial (Maior) — APLICADO ✓
- **Element**: faixa de trial, texto "· a partir de R$ 39,90/mês" em `create-igreja-account-tab-pronto.tsx`
- **From**: `color={palette.fonts.inactive}` (#6F6F6F sobre lavanda primary@0.10) → 4.19:1, reprovava WCAG AA
- **To**: `color={palette.fonts.dark}` → >7:1
- **Style property**: FancyText `color`
- **Note**: diferenciação mantida pelo peso (bold no "14 dias grátis")

### 2. Quebra do preço mid-token (Menor) — APLICADO ✓
- **Element**: `precoInicialLabel()` em `domain/utils/billing-plan-catalog.ts`
- **From**: `R$ 39,90/mês` com espaço normal → quebrava "R$" / "39,90"
- **To**: espaço inquebrável (U+00A0) entre "R$" e o valor via `.replace(' ', ' ')`
- **Style property**: conteúdo da string (NBSP)

### 3. Hierarquia dos botões Voltar/Confirmar (Maior) — APLICADO ✓
- **Element**: ações "Voltar" do wizard em `app/(auth)/create-igreja-account.tsx` (passos Contato e Revisão)
- **From**: `contained` (preenchido azul/primary), competindo com Confirmar
- **To**: `type: 'outlined'` — só Confirmar permanece preenchido (verde/confirm)
- **Style property**: FancyStepAction `type` (spread para FancyButton)
- **Note**: aplicado nos dois passos com Voltar para consistência do wizard

## Verificação
- `npx tsc --noEmit`: limpo
- `npx prettier --check`: arquivos alterados em conformidade
- Device re-capture confirmou os 3 itens (screen-20260602-195152.png)

## Convergência
Uma rodada, zero Bloqueador/Maior restante.
