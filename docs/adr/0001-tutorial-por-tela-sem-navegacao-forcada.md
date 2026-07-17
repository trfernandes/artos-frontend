# ADR 0001 — Tutorial interativo: tours por tela, sem navegação forçada

## Status
Aceito

## Contexto

O design original da ART-13 (documentado em sessão anterior) previa um tutorial com **trilhas
encadeadas por role** (ADMIN, LIDER, VOLUNTARIO), abertas automaticamente no primeiro login,
navegando de verdade entre várias telas do app (ex: trilha de Escalas: lista → detalhes → gerar
com assistente → personalizar escala gerada).

Ao planejar a arquitetura técnica dessa feature, esse modelo foi revisto: tours forçados no
primeiro login e que empurram o usuário por múltiplas telas tendem a ter alta taxa de dispensa —
padrão observado em produtos SaaS (ex: Figma usa overlays contextuais por feature, não um tour
upfront encadeado). Fonte: [Appcues — Product tour UI patterns](https://www.appcues.com/blog/product-tours-ui-patterns).

## Decisão

O tutorial passa a ser um conjunto de **tours independentes, um por tela física**, com gatilho
opt-in:

- Cada tour é confinado a uma única tela — não há orquestração de navegação entre telas durante
  o tour.
- O gatilho é um banner dispensável, mostrado apenas na primeira visita de cada tela ("Quer
  conhecer essa tela? Iniciar Tutorial / Agora não").
- Depois da primeira visita, o tour só reabre por um ícone de ajuda no menu de opções da tela.
- O estado global fica restrito a um catálogo magro de tours registrados + status visto/pulado
  (consultado pelo menu de tours), sem lógica de orquestração.

## Consequências

- **Positivo**: escopo técnico mais simples (sem orquestração de navegação cross-screen), alinhado
  a práticas de mercado, menor risco de o usuário abandonar o tutorial por sentir-se forçado.
- **Positivo**: telas físicas compartilhadas entre roles (ex: `ministerios/escalas/*` para ADMIN e
  LIDER) reaproveitam o mesmo conteúdo de tour, sem duplicação de autoria.
- **Negativo/trade-off**: perde-se a narrativa guiada ponta-a-ponta do design original — o usuário
  não é apresentado a um fluxo completo de uma vez, só descobre tours ao visitar cada tela.
- **Impacto operacional**: as 9 subtarefas da ART-13 no Linear (ART-14 a ART-22) foram reescritas
  para refletir essa arquitetura antes do início da implementação.
