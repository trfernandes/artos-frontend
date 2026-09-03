# Tokens Diakonia — pra colar no prompt do Claude Design

> Não é sync automático (app é React Native/Expo, sem build web). Cole este resumo no prompt
> quando pedir uma tela lá, pra manter a direção visual próxima do app real.

## Contexto do produto

App B2B mobile de gestão de escala voluntária pra igrejas. Público: líder/pastor não-técnico.
Tom: direto, sem gradiente decorativo, sem enfeite. Ilustrações (quando houver): flat, sem
personagens, focando na interface/dado, não em pessoas.

## Cor (light mode)

```
primary    #3B82F6  (azul — identidade do app, CTA principal)
secondary  #8E44AD  (roxo — ações informacionais/insights)
terciary   #F67E3B  (laranja — CTA de vendas/onboarding)
warning    #F5A623  (âmbar — atenção/pendência/config, NUNCA estado positivo)
error      #C0392B  (vermelho — destrutivo)
confirm    #228B22  (verde — sucesso/estado positivo)

fonts.dark      #3E3E3E  (texto principal)
fonts.light     #FFFFFF  (texto sobre cor sólida)
fonts.inactive  #6F6F6F  (texto secundário)
fonts.inactive2 #C7C7CC  (texto desabilitado — evitar como cor de ação)
fonts.link      #1565C5

border      #CBE0FE
borderCard  #A9CCFC
backgroundColor   #FFFFFF (fundo de tela)
backgroundColor4  #F7FAFF (tint neutro claro — usar em vez de cinza)
```

**Nunca cinza puro em card/item** (`#F2F2F7`/`#F6F6F6` são proibidos como fundo de card) — usar
tint de cor (`primary`/`secondary` clareado ~96%) ou `backgroundColor4` (azulado bem sutil).

## Cor (dark mode)

```
backgroundColor   #121212
backgroundColor4  #171A20 (tint neutro escuro)
fonts.dark        #F2F2F7
fonts.inactive    #A9A9B2
border            #1E3A5F
```

Demais cores de ação (primary/secondary/warning/error/confirm) mantêm o mesmo hex nos dois temas,
exceto `error` (`#E74C3C` no dark).

## Tipografia

Família: **Montserrat** (Regular/Medium/SemiBold/Bold + itálicos). Escala fixa em px (baseline
390px width, ~13px = corpo):

```
extraSmall 11   small 12   medium 13 (corpo padrão)   mediumLarge 14
largeMedium 15  semiLarge 16   large 17   largePlus 18
title 20   titleLarge 22   extraLarge 25   display 28   displayLarge 40
```

Título de card de detalhe/entidade: `bold`, 13px (`medium`). Eyebrow/label de seção: `semiBold`,
10-11px, uppercase, cor com alpha reduzido.

## Sombra

Só 3 níveis, nunca `box-shadow` livre:

```
100  offset 1,1  opacity 0.10  radius 1
200  offset 2,2  opacity 0.20  radius 2
300  offset 3,3  opacity 0.20  radius 3
```

## Regras de composição

- Sem gradiente exceto: header de drawer, dashboard, auth (linear `#3B82F6 → #234C90`), onda do
  funil de vendas.
- Botão primário: `primary` sólido preenchido, `borderRadius` alto (pill-like). Secundário:
  outline. Terciário: texto/link, sem fundo.
- Card padrão: `borderRadius: 16-24`, borda fina tintada, sombra nível 100-200, fundo tint de cor
  (nunca cinza).
- Ações destrutivas: `error` sólido, texto/ícone branco.
- Estado vazio: ícone + label + helperText de ação (nunca área em branco sem instrução).
- Touch target mínimo 44px.
