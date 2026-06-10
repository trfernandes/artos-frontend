# Change Spec — Navegador de eventos (rodapé · Detalhes da Escala) — 2026-06-09
**App**: Artos (Diakonia)
**Intent**: refinar o navegador de eventos que tem no rodapé
**States reviewed**: atual (single-state, evento "Culto de Domingo", índice 3/13)
**Screenshot type**: device (emulador Android-5554)
**Arquivo**: `components/pages/ministerios/escalas/details/EscalaEventoPage.tsx`
**Status**: ✅ aplicado e verificado no emulador · `tsc --noEmit` EXIT=0

## Changes Applied
### 1. Touch target acessível (Maior)
- **Element**: botões-ícone prev/next do rodapé
- **From**: `size={{ w: 38, h: 38 }}`, ícone 22
- **To**: `size={{ w: 44, h: 44 }}`, ícone 24
- **Style property**: `size`, `icon.size`

### 2. Contador "atual / total" (Maior)
- **Element**: texto de paginação
- **From**: `1 ‹ 3 › 13` (FancyText "1" literal + FancyText total separados)
- **To**: `‹ 3 / 13 ›` — `{currentIndex + 1} / {total}` num único FancyText; "1" e total flanco removidos
- **Note**: o "1" era hardcoded constante, sem informação

### 3. Assimetria do par de navegação (Maior · Lens 7 [confirmed])
- **Element**: botões prev (voltar) e next (avançar)
- **From**: ambos `type='light'` (fill tonal simétrico)
- **To**: prev = `type='outlined'` (fundo transparente, anel de acento); next = `type='light'` (fill tonal, `borderColor: 'transparent'`)
- **Style property**: `type`, `containerStyle.borderColor`, `containerStyle.backgroundColor`

### 4. Borda fantasma resolvida (Menor)
- **Element**: anel dos botões
- **From**: `borderColor: withAlpha(acento, isFirst ? 0.15 : 0.35)` (estado 0.15 quase invisível, parecia artefato)
- **To**: absorvido no item 3 — preenchido sem borda; outlined com anel visível `withAlpha(acento, isFirst ? 0.2 : 0.5)`

### 5. Pílula tonal no índice atual (Menor)
- **Element**: contador central
- **From**: FancyText solto (`pagerCurrentText`: minWidth 20, textAlign center)
- **To**: `View pagerCurrentPill` (minWidth 44, paddingH 12 / paddingV 5, borderRadius 999) com `backgroundColor: withAlpha(borderColor, 0.1)` inline
- **Style property**: novo style `pagerCurrentPill`; bg inline (acento dinâmico por evento)

## Held → Design Debt Backlog
_(nenhum — cap de 5 não estourou)_

## Auto-noted Detalhe
- O rótulo "13" antigo parecia tocável por ficar colado ao botão; resolvido por tabela ao virar parte da pílula `3 / 13` não-interativa.
