# Variant B — Header Tonal + Corpo Limpo

## Direction

Replaced the side strip with a full-width tonal header band tinted at ~10% of the status color. The
header carries icon + status label on the left and the date on the right. The body is clean and
breathes, with a clear hierarchy: event title → function → trade row (mini-cards) → motivo →
cancellation → actions.

## What changed

- Removed lateral 5px strip; card layout is now stacked (header + body) instead of horizontal.
- Status communicated atmospherically via tonal header (10% alpha) and an icon (`schedule` /
  `check-circle` / `cancel`) — no more separate status chip.
- Status colors mapped to palette tokens (`warning`, `confirm`, `error`, `fonts.inactive`) via
  `ColorUtils.withAlpha`. Zero hex/rgb hardcoded.
- Trade row promoted to its own bordered mini-panel with 36x36 avatars and a vertically centered
  arrow between Solicitante and Substituto.
- Event title is now `medium` size semiBold, full-width, top of body.
- Footer actions use `FancyButton` (was `TouchableOpacity`). Pessoal pendente: two full-width
  buttons (Recusar outlined / Aprovar contained). Ministério não-cancelada: one full-width "Cancelar
  substituição" outlined button.
- Touch targets >= 44px (`minHeight: 44`).
- Card `borderRadius: 14` retained; `overflow: 'hidden'` clips the header band.
- Extracted shared `SubstituicaoCardBase.tsx` so both cards share the visual shell and only differ
  by footer.

## Pros

- Quieter, more modern look — closer to Linear/Notion notification cards.
- Status reading is atmospheric (color wash) and explicit (icon + label) at the same time.
- Body has more room for the event name and trade row, which are the information users actually scan
  for.
- Single source of truth via `SubstituicaoCardBase`.
- Dark-mode safe — palette tokens, no hardcoded colors.

## Cons

- Header band adds vertical height vs. the previous compact horizontal layout.
- 10% alpha tint can feel subtle on some statuses (Cancelada uses inactive grey, which is
  intentionally muted).
- Lost the at-a-glance "color edge" cue that scrolling lists benefited from.

## Best for

Lists where users dwell briefly on each card to read the event/trade context, not for ultra-dense
feeds. Ideal when status diversity is moderate (4 states) and the date is a primary scanning anchor.

## Files modified

- `components/pages/common/SubstituicaoCardBase.tsx` (new — shared shell)
- `components/pages/pessoal/escalas/substituicoes/SubstituicaoRecebidaCard.tsx`
- `components/pages/ministerios/escalas/substituicoes/SubstituicaoMinisterioCard.tsx`
