# Design System — Diakonia (escopo: quiz-vendas-funcionalidades)

> Escopo deste documento: redesign do carrossel de funcionalidades pós-quiz de vendas
> (`app/(auth)/quiz-vendas-funcionalidades.tsx`). Não cobre `quiz-vendas.tsx` (perguntas) nem
> `quiz-vendas-resultado.tsx` — ambos ficam como estão.

## Objetos do domínio

- Feature (funcionalidade) — item do carrossel: categoria, título, subtítulo, ilustração, cor de
  destaque
- Slide — unidade de navegação do carrossel (5 features + 1 conclusão)
- Ilustração — celular flutuando com UI simplificada da feature na tela, sem personagens
- Progress indicator — barra segmentada mostrando posição no carrossel
- Slide de conclusão — checkmark + copy + CTAs (criar conta / já tenho conta)
- Voluntário / Escala / Ministério / Repertório — objetos de domínio do produto real, referenciados
  pelas 5 features (escala automática, substituição fácil, lembrete automático, disponibilidade,
  repertório)
- Diagnóstico — resultado do quiz (tela anterior), fonte da dor que este carrossel resolve

## Tom e contexto

- Propósito: onboarding de vendas (funil pós-quiz) de app B2B de gestão de escala voluntária pra
  igrejas
- Tom: **calma e resolução** — arco narrativo: quiz + resultado usam paleta quente/urgente (dor,
  tempo perdido), funcionalidades mostra a solução já em ação, sem urgência.
- Público: líder/pastor/responsável de escala de igreja, decisor não-técnico, mobile, sessão curta
  (funil de vendas)
- Plataforma: mobile (Expo/React Native)
- Dimensão dominante: conversa/narrativa (carrossel guiado, não dados/tabela)
- Contexto de uso: mobile em movimento, sessão de poucos minutos dentro do funil de cadastro

## Features finais (5, aprovadas)

| #   | category            | title                        | subtitle                                                                                     |
| --- | ------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | ESCALA AUTOMÁTICA   | A escala se monta sozinha    | Diakonia cruza disponibilidade e função de cada voluntário e monta a escala pra você.        |
| 2   | SEM FURO NA ESCALA  | Substituição sem correria    | Voluntário indisponível? O app avisa o líder e já sugere quem pode entrar no lugar.          |
| 3   | LEMBRETE AUTOMÁTICO | Ninguém esquece a escala     | Notificação automática avisa cada voluntário — acabou o lembrete manual por WhatsApp.        |
| 4   | DISPONIBILIDADE     | Avisar que não pode é rápido | Voluntário marca os dias indisponíveis direto no app, sem precisar avisar ninguém um por um. |
| 5   | REPERTÓRIO          | Repertório sempre à mão      | Músicas, tom e ordem organizados por ministério, prontos pra ensaio.                         |

Decisão anterior tinha só 3 features genéricas ("Tudo num só lugar" era um catch-all fraco); revisão
trocou por 5 funcionalidades reais e específicas do produto, com frases descrevendo a situação
concreta que cada uma resolve.

## Referências

- Interna — `assets/images/quiz-resultado-so-falta-organizar.jpeg` (e demais
  `quiz-resultado-*.jpeg`) — ilustração vetorial flat existente no app, referência de **técnica de
  ilustração** (traço/estilo), usada como base pra um `style_id` custom no Recraft
  (`9e8f9e22-7bf2-444b-a89a-a995e38a790d`).
- As 5 ilustrações finais foram geradas via Recraft reaproveitando esse `style_id`, recoloridas por
  código (identificação precisa de triplas `rgb()` por saturação/matiz, nunca regex largo — risco
  real de recolorir tom de pele quando há personagem na cena) e convertidas de SVG pra PNG (projeto
  não tem `react-native-svg-transformer` configurado, só `react-native-svg` imperativo — `.svg` não
  renderiza via `<Image source={require(...)}>`).

## Decisão — sem personagens nas ilustrações

Pivô em relação à primeira versão (que tinha personagens fazendo as ações, ex: líder no meio da
bagunça de papelada): usuário pediu ilustrações **sem pessoas**, mostrando a própria
interface/celular fazendo a coisa acontecer, não alguém segurando o celular.

- Motivo: foco na solução em si (o app), mais barato e rápido iterar sem precisar manter
  consistência de personagem entre 5 cenas.
- Cada ilustração: celular flutuando sozinho (sem mão, sem rosto), tela mostrando uma UI
  simplificada específica da feature — grid de calendário com checks (feature 1), avatares
  conectados por seta de troca (feature 2), balão de notificação com sino (feature 3), calendário
  com X vermelhos em dias bloqueados + mini-calendário decorativo (feature 4), lista de músicas com
  nota musical (feature 5).
- Feature 4 passou por duas correções: (1) primeira versão usava check verde nos dias (lia como
  "marcar disponível"), trocado por X vermelho cobrindo a célula inteira (lê como
  "bloqueado/indisponível" sem ambiguidade) — vermelho mantido como está (convenção universal de
  bloqueio), não recolorido pro accent da feature; (2) o recolor pro verde da feature acabou pegando
  também o bezel do celular e 3 quadrados decorativos do calendário (mesma tripla `rgb()`
  reaproveitada pelo Recraft em elementos sem relação), deixando a imagem com aspecto "pintado" —
  revertido pro tom de pele padrão (igual às outras 4 imagens) e quadrados neutros, sem accent verde
  na ilustração (só a categoria/texto do slide carrega a cor).

## Direção visual — Cor (revisão 2 — pós-feedback)

- Revisão 1 (blend azul/amarelo/verde a 0.35 sobre a onda da ilustração) foi rejeitada pelo usuário:
  "muito espaço em branco, não gostei dessas cores em baixo sendo que a imagem de cima não tem a
  mesma cor, e não gostei dos tons das cores" — a onda usava accent alternado (azul/amarelo/verde)
  sobre ilustrações que são todas peach/laranja/bege, gerando descompasso visual em todo slide, e o
  blend a 0.35 deixava o tom lavado.
- Onda da ilustração (elemento que fica sobre a própria imagem) passa a usar **cor fixa**
  `Pallete.terciary` (laranja) — combina com o tom peach/laranja das 5 ilustrações, em vez de accent
  variável que nunca batia com a arte.
- Categoria e progress bar (elementos fora da imagem, não precisam bater com a ilustração) continuam
  variando por feature, mas em **cor cheia**, sem blend:
  - Feature 1 (Escala automática) — `Pallete.primary` (azul)
  - Feature 2 (Substituição fácil) — `Pallete.warning` (amarelo)
  - Feature 3 (Lembrete automático) — `Pallete.primary` (azul)
  - Feature 4 (Disponibilidade) — `Pallete.confirm` (verde)
  - Feature 5 (Repertório) — `Pallete.warning` (amarelo)
  - Conclusão — `Pallete.confirm` (verde, "problema resolvido")
- Contraste: cores de accent usadas só em onda/categoria/progress (nunca texto de corpo), que
  continua em `fonts.dark`/`fonts.inactive` — sem risco de AA.

## Direção visual — Cor (revisão 1, histórico — substituída acima)

- Paleta derivava de `ColorUtils.blendOver(Pallete.X, 0.35, Pallete.backgroundColor)` por feature,
  mesma cor usada na onda da ilustração e no progress bar — ver seção acima pra decisão atual.

## Direção visual — Componentes (aprovada)

- **Ilustração** (`QuizIllustrationPlaceholder`, prop `image`) — full-bleed, PNG real (celular + UI
  da feature) no lugar do ícone-em-caixa genérico, onda sólida na base. Aspect ratio ampliado pra
  0.82 (crop leve controlado) pra ilustração ocupar mais espaço vertical — revisão pós-feedback
  "muito espaço em branco". `featureBlock` deixou de centralizar verticalmente com `flexGrow`,
  ancora no topo do scroll.
- **Progress bar** (`QuizSegmentedProgress`) — segmento ativo em cor sólida da feature atual (não
  gradiente).
- **Slide de conclusão** — checkmark com gradiente roxo→azul (mantido, é um elemento único fora do
  ciclo de cor por feature), onda sólida verde (`Pallete.confirm`) na base, CTA mantém
  `Pallete.terciary` (laranja, padrão já aprovado na tela de resultado, fora de escopo mudar).
- **Transição animada** — `Animated` embutido do RN (não Reanimated — ver
  `splash-overlay-reanimated-bug` na memória do projeto, mesmo bug de overlay em New Arch),
  fade+slide leve (opacity 0→1, translateX 12px→0) por slide.

## Direções rejeitadas (histórico)

| Direção                                                       | Por que rejeitada                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3 features genéricas ("Tudo num só lugar" como catch-all)     | Substituído por 5 funcionalidades reais e específicas do produto, com frases concretas                                                                                                                                                                                                              |
| Ilustração com personagem (líder no meio da bagunça, etc.)    | Usuário pivotou pra "sem pessoas" — foco no app em si, mais simples de manter consistente em 5 cenas                                                                                                                                                                                                |
| Onda-gradiente entre cor atual e próxima feature              | Paleta passou a alternar (azul/amarelo/verde) em vez de arco contínuo; gradiente entre cores opostas ficava feio — trocado por cor sólida por slide                                                                                                                                                 |
| Verde (`Pallete.confirm`) explicitamente rejeitado pro accent | Revertido nesta revisão — verde agora é usado (feature 4 e conclusão), pois a paleta deixou de ser um arco linear único                                                                                                                                                                             |
| Feature 4 com check verde nos dias marcados                   | Lia como "marcar disponível" em vez de "indisponível"; trocado por X vermelho (convenção universal de bloqueio)                                                                                                                                                                                     |
| Recolorir tudo via regex largo de faixa de cor                | Regra específica: nunca aplicar regex amplo sem antes listar e inspecionar as triplas `rgb()` candidatas — um regex largo já recolorou pele de personagem sem querer em uma iteração anterior                                                                                                       |
| Feature 4 com bezel do celular + quadrados decorativos verdes | Recolor por tripla `rgb()` exata ainda pegou elementos não-relacionados que coincidentemente usavam a mesma cor original (bezel, quadrados de calendário); revertido pra pele/neutro — regra reforçada: mesmo com substituição literal, checar visualmente o resultado renderizado antes de aceitar |

---

# Design System — EscalaHeader (escopo: card de detalhes da escala)

> Escopo: `EscalaHeader.tsx` + `EscalaStatusBadge.tsx`  
> Revisão: 2026-08-03

## Regras de Design Confirmadas

### Cores — semântica de status

| Status    | Cor                                | Justificativa                                                   |
| --------- | ---------------------------------- | --------------------------------------------------------------- |
| GERADA    | `palette.fonts.inactive` (#6F6F6F) | Estado intermediário/neutro — escala existe mas não está no ar  |
| PUBLICADA | `palette.confirm` (#228B22)        | Estado positivo — escala ativa, semântica de "pronto/concluído" |
| CANCELADA | `palette.fonts.inactive` (#6F6F6F) | Arquivado — mesmo neutro de inativo                             |
| GERANDO   | `palette.secondary`                | Processo em andamento — mantido                                 |
| ERRO      | `palette.error`                    | Destrutivo — mantido                                            |

**Regra geral:** `palette.warning` (âmbar) é reservado para estados de atenção/pendência, nunca para
estados positivos/finalizados.

### Cores — saturação de palette.primary

- `palette.primary` é token de identidade/tempo do app — não de estado de entidade.
- No card EscalaHeader, primary é permitido em: borda-top (identidade do card), eyebrow tick + texto
  (label de tipo), pill de período (dado temporal).
- Proibido usar primary como cor de chip de status do ciclo de vida de uma entidade.

### Hierarquia de informação — origem vs. status

- **Origem** (Manual/Automática) é metadado estático, raramente muda e não guia ação imediata →
  representar como ícone discreto no eyebrow row, mesma cor do eyebrow com
  `ColorUtils.withAlpha(palette.primary, 0.65)`.
- **Status** é dado de ciclo de vida com ação implícita → único chip no title row, cor semântica por
  estado.
- Regra: nunca dois chips de peso visual igual no mesmo row quando os conceitos têm hierarquia
  diferente.

### Vocabulário visual — ícone vs. dot em chips

- `dot` = estado de ciclo de vida de uma entidade (muda com o tempo, guia ação).
- `icon` = atributo estático ou metadado contextual (origem, tipo, categoria).
- Nunca misturar os dois no mesmo row sem essa distinção semântica clara.

## Direção visual — layout (revisão 2, 2026-08-03 — Direção A "Faixa de status")

> Supersede parcialmente as regras acima. Motivo: usuário rejeitou o resultado da revisão 1 no uso
> real ("não to gostando do posicionamento, cores e etc") — passou por novo ciclo
> `trfernandes-atelier-advise` + `-explore` Ramo B, 3 direções geradas em Artifact, usuário aprovou
> Direção A.

### Estrutura — 3 rows (substitui eyebrow row + topRow + metaInlineRow)

- Row 1 (`headlineRow`): título + chip de status (`FancyChips` com `dot`), lado a lado.
- Row 2 (`metaRow`): origem (ícone+texto) · separador · período (ícone+texto) · indicador de
  progresso (`EscalaHealthIndicator compact`) empurrado pra direita (`marginLeft:'auto'`).
- Row 3 (`actionsRow`): ações, ver abaixo.
- Borda superior do card (`borderTopColor`) passa a ser **dinâmica**, usa a cor do status atual
  (reaproveita a tabela de cores já confirmada acima) — antes era sempre `palette.primary` fixo
  independente do status.

### Origem — ícone+texto (supersede regra anterior de ícone-only)

- Regra anterior ("Hierarquia de informação — origem vs. status") dizia origem = ícone discreto
  sozinho, alpha 0.65, sem texto.
- Usuário confirmou nesta rodada que essa regra causava o problema real "origem pouco visível" —
  origem agora é **ícone (12px) + texto** (`Manual`/`Automática`), cor `palette.fonts.inactive` (sem
  alpha reduzido), no `metaRow`.
- Ícone: `lightning-bolt` (Automática) / `pencil-outline` (Manual), `MaterialCommunityIcons`.

### Ações — grupo visível + kebab overflow

- Problema confirmado: botões de ação genéricos demais quando há 2-5 ações simultâneas soltas em
  row.
- Regra nova (corrigida — primeira implementação só mostrava `publish`, divergia do mockup
  aprovado): ação primária (`variant:'primary'`, ex. Recalcular) + **até 2 ações neutras**
  (`variant:'neutral'`, ordem de chegada no array — ex. Publicar, Insights) ficam visíveis direto na
  `actionsRow`. Ação `danger` (excluir) e qualquer neutra além das 2 primeiras entram em kebab
  (`OverflowActionsMenu`, `FancyPopup`, ícone `dots-vertical`).
- Cores de ação (tint por categoria: `secondary`=insights, `warning`=parametrização,
  `error`=destrutivo) mantidas inalteradas dentro do menu — regra de "cores semânticas em ações" do
  `CLAUDE.md` do frontend não foi tocada, só a exposição (visível vs. dentro do menu) mudou.
- Ícones dos itens de `actions` (Header.tsx) unificados pra `MaterialCommunityIcons` em todos (antes
  misturava com `MaterialIcons` — `tune`, `rocket-launch`, `delete-outline` — peso visual/traço
  diferente do resto, achado durante validação visual desta rodada).

## Log de telas revisadas

| Tela                                                                   | Data       | Findings                                                                                                                                   | Resultado                                                          |
| ---------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| EscalaHeader — chips origem/status                                     | 2026-08-03 | F1 (primary 4×), F2 (PUBLICADA=warning), F3 (chip origem=peso igual), F4 (vocabulário duplo)                                               | Todos aprovados e implementados                                    |
| EscalaHeader — Direção A (empilhamento/cores/origem/ações/espaçamento) | 2026-08-03 | Empilhamento em 4 blocos, cor de borda fixa sem hierarquia, origem pouco visível, botões de ação genéricos, ícones de biblioteca misturada | Todos aprovados e implementados; validado via ADB no device físico |

## Audit Log

### Audit — 2026-08-03 (EscalaHeader.tsx + Header.tsx, Direção A)

#### Critérios de originalidade

- [1] Troca de logo: ✅ — chip de status, origem e kebab levam dados reais do ciclo de vida da
  escala (Gerada/Publicada/Manual/Automática), não genérico.
- [2] Industry scan: ✅ — kebab reaproveita `FancyPopup` no mesmo padrão já usado em
  `EscaladoMenuPopup.tsx`, consistência interna em vez de padrão externo copiado.
- [3] Tells de IA: ✅ nenhum — sem gradiente decorativo (fora dos 3 tokens permitidos), sombra única
  (`shadows[200]`), ícones agora unificados em `MaterialCommunityIcons` (mistura com `MaterialIcons`
  corrigida nesta rodada).
- [4] Especificidade do domínio: ✅ — estrutura carrega status/origem/período/progresso específicos
  de escala de voluntariado, não serviria pra outro domínio sem alteração de dados exibidos.
- [5] Decisão vs default: ✅ — borda-top dinâmica por status, grouping de ações (visível vs. kebab)
  e origem ícone+texto são decisões registradas com motivo (ver seções acima), não primeiro valor.
- [6] Riqueza gráfica: ⚠️ — reaproveita `EscalaHealthIndicator` (donut) já existente; nenhum
  gráfico/ilustração novo introduzido. Aceitável pro escopo (correção visual, não tela nova), mas
  registrado como não-ganho nessa frente.

#### Contraste

- `fonts.dark` (#3E3E3E) sobre `backgroundColor` (#FFFFFF), título: 10.70:1 — ✅ AA/AAA
- `fonts.inactive` (#6F6F6F) sobre `backgroundColor` (#FFFFFF), meta row/GERADA/CANCELADA: 5.02:1 —
  ✅ AA (AAA falha, não exigido)
- `error` (#C0392B) sobre branco, chip ERRO: 5.44:1 — ✅ AA
- `confirm` (#228B22) sobre o fundo real do chip (`FancyChips` pinta o texto na própria
  `resolvedColor`, fundo é `withAlpha(color, 0.12)` — não branco sólido), chip PUBLICADA: **3.80:1
  (light) / 3.39:1 (dark) — ❌ falha AA texto normal** (precisa 4.5:1; chip usa `size='small'`,
  abaixo do limiar de "texto grande"). Cor é regra `[confirmed]` de sessão anterior (não a Direção A
  desta rodada), mas a falha é real e mensurável nos dois temas — registrado como débito, não
  bloqueio desta entrega (não é regressão introduzida agora).
- Dark mode: `fonts.dark`/`fonts.inactive` sobre `#121212` — 16.79:1 e 8.03:1, ✅ ambos.

#### Consistência interna

- Zero hex hardcoded — todas as cores via `usePallete()`/`ColorUtils.withAlpha` (checado em
  `EscalaHeader.tsx` e `Header.tsx`).
- `borderRadius:18`, `shadows[200]`, `borderCard` batem com o padrão de card já usado no resto do
  app (inalterados nesta revisão).
- Ícones de ação agora consistentes (`MaterialCommunityIcons` em todos) — divergência de biblioteca
  encontrada e corrigida durante a validação visual desta rodada.
- `npx tsc --noEmit`: zero erros.

#### Débito de design

- Cor `confirm` (#228B22, status PUBLICADA) falha WCAG AA como texto normal em ambos os temas
  (3.80:1 light / 3.39:1 dark, medido contra o fundo real do chip) — herdado de decisão
  `[confirmed]` de sessão anterior, não desta rodada. Fix futuro: escurecer levemente o verde de
  `confirm` (ou introduzir uma variante mais escura só pro texto do chip, mantendo `confirm` puro
  pros demais usos) — decisão de cor que precisa aprovação do usuário antes de mudar uma regra
  `[confirmed]`.

## Critério de conclusão

- Tipografia: não redefinida — app já tem escala fixa via `FancyText`.
- Cor, componentes, ilustrações: aprovados camada por camada (ver seções acima), incluindo as duas
  correções de feature 4 pós-review do usuário.
- Bug encontrado e corrigido na validação: `activeGradient` da progress bar recebia `undefined` no
  slide de conclusão, caindo no azul default do componente em vez do verde calculado
  (`stepColors[5]`); corrigido pra sempre passar `[accentColor, accentColor]`.
- `npx tsc --noEmit`: zero erros após wiring das 5 imagens + cores + fix da progress bar.
- Validação visual no device físico (RQCWC04P4VX, ADB screencap): 6 telas do carrossel conferidas (5
  features + conclusão) em light e dark mode — ok em ambos.

---

# Design System — Indisponibilidades por Ministério (escopo: correção visual)

> Escopo: `app/(app)/(drawer)/ministerios/indisponibilidades/index.tsx` +
> `components/list/FancyListEmpty.tsx` (nova prop `variant`).
> Revisão: 2026-08-05

## Regras de Design Confirmadas

- `FancyListEmpty` ganhou `variant?: 'default' | 'compact'` — `compact` renderiza ícone+label em
  row, alinhado à esquerda, sem `flex:1`/centralização. Motivo: componente tem 32 usos no app, a
  maioria empty-state de tela cheia; mudar o default quebraria essas telas. Usar `compact` sempre
  que o empty-state for de uma **seção inline** dentro de uma tela com mais conteúdo (não a tela
  inteira vazia).
- Ação "Nova regra" saiu do `FancyFab` flutuante (canto inferior direito, sem vínculo visual com
  nenhuma seção) e virou `FancyButton type='text'` dentro do header da seção "Regras deste
  ministério" — a ação só afeta essa seção (confirmado no código: `criarRegra` chama
  `useRegrasIndisponibilidadeMinisterioCrud`, nunca cria bloqueio pessoal), então o controle agora
  fica fisicamente onde a ação se aplica.
- **[confirmed 2026-08-05]** Agrupamento de seção dentro de tela usa card:
  `backgroundColor: palette.backgroundColor2`, `borderWidth: 0.5`,
  `borderColor: ColorUtils.withAlpha(palette.borderCard, 0.45)`, `borderRadius: 16`,
  `padding: 15`, `...palette.shadows[200]`. Confirmado em `configuracoes/index.tsx:1723-1734`
  (`heroStatCard`). Primeira tentativa (mesma rodada) saiu com `borderWidth: 1` e sem sombra —
  corrigido após o usuário apontar que o card não batia com o design system; a sombra é obrigatória
  no padrão de card do app (checklist do `CLAUDE.md`: "sombra via `Pallete.shadows`, nunca
  `elevation` direto"). Tela Indisponibilidades não aplicava nada disso — os 3 blocos
  (calendário+legenda, bloqueios pessoais, regras deste ministério) eram `View` soltas sem
  background/border/sombra, só separadas por `FancyVerticalSpacer`. Fix: cada bloco vira um card
  nesse padrão; legenda entra dentro do card do calendário (hoje solta, lida como bloco próprio em
  vez de explicação do gráfico acima dela).

## Direção visual — Componentes (aprovada)

- Empty-states das seções "Bloqueios pessoais" e "Regras deste ministério": `variant='compact'`,
  ícone 20px (default do compact), sem `icon.size` manual.
- FAB flutuante removido desta tela; `TutorialTarget id='indisponibilidade-regras-fab'` migrado pro
  botão inline (mesmo id, tour não precisou mudar de step).

## Audit — 2026-08-05 (index.tsx + FancyListEmpty.tsx)

### Critérios de originalidade

- [1] Troca de logo: N/A — correção estrutural inline, não introduz identidade visual nova.
- [2] Industry scan: N/A — mesmo motivo.
- [3] Tells de IA: ✅ nenhum — sem gradiente, ícones já usados no resto do app
  (`MaterialCommunityIcons`), sem sombra nova.
- [4] Especificidade do domínio: ✅ — labels e ícones seguem específicos do domínio (bloqueio
  pessoal / regra de ministério), nada genérico introduzido.
- [5] Decisão vs default: ✅ — `variant='compact'` e reposicionamento do FAB são decisões
  registradas com motivo acima, não primeiro valor.
- [6] Riqueza gráfica: N/A — correção de layout, não tela nova; sem expectativa de gráfico/ilustração.

### Contraste

- `fonts.inactive2` (`#C7C7CC`) sobre `backgroundColor` (`#FFFFFF`), label do empty-state:
  **1.68:1 — ❌ falha AA** (precisa 4.5:1). Mesmo com `muted` (opacity 0.4) reduzindo ainda mais.
  **Pré-existente**: é o default do `FancyListEmpty` já usado sem `labelColor` nas 32 telas do app,
  não uma regressão desta sessão — meu diff só mudou layout (compact), não cor. Registrado como
  débito, não bloqueio (texto secundário/decorativo de estado vazio, não conteúdo principal da
  tela; corrigir aqui sem corrigir as outras 31 telas criaria inconsistência nova).
- `fonts.inactive2` dark (`#73737A`) sobre `#121212`: 3.98:1 — ⚠️ abaixo de 4.5 mas acima de 3:1
  (mesmo caso, pré-existente).
- Ícone `lock-outline` do header da seção, `fonts.inactive` (`#6F6F6F`) sobre branco: 5.02:1 — ✅ AA.

### Consistência interna

- Zero hex hardcoded — cores via `usePallete()`/`ColorUtils.withAlpha`, inalterado.
- `gap: 8` no compact bate com o `gap: 8` já usado no wrapper de cards da mesma tela (linha
  `{ gap: 8 }` das listas de regras/bloqueios) — mesma unidade, não valor novo.
- `FancyButton type='text'` com ícone segue o padrão documentado no `CLAUDE.md` do frontend
  ("Botão terciário/link → `FancyButton type='text'`").
- `npx tsc --noEmit`: zero erros. `prettier --write` aplicado só nos 2 arquivos tocados.

### Débito de design

- Contraste do label padrão de `FancyListEmpty` (`fonts.inactive2`, 1.68:1 light / 3.98:1 dark)
  falha AA — problema sistêmico do componente, presente nas 32 telas que o usam, não introduzido
  nesta sessão. Fix futuro: escurecer o default (ex. usar `fonts.inactive` em vez de `inactive2`
  quando não-muted, ou aumentar contraste do tom `inactive2` em ambos os temas) — decisão de cor
  que afeta muitas telas, precisa aprovação do usuário antes de mudar um token global.
- Critério 6 (riqueza gráfica) não avaliável neste escopo — correção de layout, sem expectativa de
  ilustração/gráfico novo.

---

# Design System — Título + ícone de card de detalhe/entidade (escopo: EscalaHeader, MinisterioStatsCard)

> Escopo: `EscalaHeader.tsx`, `MinisterioStatsCard.tsx` e demais cards de detalhe/entidade (card
> único representando 1 item com dados próprios — não list item, não section header).
> Revisão: 2026-08-05

## Regras de Design Confirmadas

- **[confirmed 2026-08-05, revisado 2026-08-05]** Título de card de detalhe/entidade:
  `FancyText type='bold' size='medium' color={palette.fonts.dark} numberOfLines={1}` em
  qualquer variante (cheia e compacta usam o mesmo tamanho agora — `largeMedium` ficava grande
  demais na variante cheia). Sem `lineHeight` manual — deixar o default do componente. Aplicado
  em `EscalaHeader.tsx` e `MinisterioStatsCard.tsx` (`FullCard` e `CompactCard`).
- **[confirmed 2026-08-05]** Subtítulo/eyebrow de seção dentro de um card (ex: "EVENTO",
  "SETLIST", "EQUIPE" em `EscalaEventoPage.tsx`, via `renderSectionEyebrow`): ícone 12px +
  `FancyText type='semiBold' size={10} color={accentLabelColor}` com label em uppercase — tier
  hierárquico abaixo do título do card, não precisa de leading icon circular. Já era consistente
  nas 3 ocorrências antes desta revisão; documentado aqui como padrão confirmado, sem mudança de
  código.
- **[confirmed 2026-08-05]** Ícone/avatar leading antes do título: círculo com
  `backgroundColor: ColorUtils.withAlpha(corDeReferência, 0.12)`, ícone/imagem por cima na cor
  cheia. Quando a entidade tem imagem própria (ex: logo do ministério em
  `MinisterioStatsCard`), usa a imagem; quando não tem (ex: escala não tem logo), usa
  `MaterialCommunityIcons` relevante ao domínio com cor semântica já em uso no card — nunca cor
  nova. Achado: `EscalaHeader` não tinha nenhum leading, divergindo de `MinisterioStatsCard`.

## Direção visual — Componentes (aprovada)

- `EscalaHeader.tsx`: leading icon 32px circular, ícone `calendar-range`
  (`MaterialCommunityIcons`), cor `statusVisual.color` (reaproveita a cor do status já usada na
  borda-top do card, sem token novo), fundo `withAlpha(statusVisual.color, 0.12)`. Título sem
  `lineHeight` manual.
- `IgrejaCard.tsx` fica fora deste escopo — é list item (repete N vezes numa lista), não card de
  detalhe único; não herda esta regra.
- `indisponibilidades/index.tsx`: cabeçalhos de seção "Bloqueios pessoais" e "Regras deste
  ministério" ajustados pra `type='bold'` (eram `semiBold`), alinhando peso com o título de card
  de detalhe. São section headers dentro de página (não card de detalhe/entidade isolado) — não
  herdam o leading icon circular tintado; ícone `lock-outline` plano mantido como estava.
- `indisponibilidades/index.tsx` (revisão seguinte, mesmo dia): ícone `format-list-checks` (plano,
  16px, `palette.fonts.inactive`) adicionado no header "Regras deste ministério" pra simetria com
  `lock-outline` de "Bloqueios pessoais" — ambos section headers da mesma página, mesmo peso de
  leitura. Tamanho dos dois títulos reduzido de `size='medium'` pra `size='small'` — hierarquia
  menor que título de card de detalhe (que usa `medium`), pois são sub-seções dentro de card, não
  entidade isolada. `FancyListItemCard`/legenda do calendário (`legend`) ganhou
  `justifyContent: 'space-between'` pra alinhar item da direita na borda. `FancyListEmpty` ganhou
  prop `containerStyle` (opcional, não quebra os outros 6 usos de `variant='compact'`) — usada
  aqui pra centralizar o texto vazio dentro do card (`justifyContent:'center', width:'100%'`),
  já que o `compact` padrão é alinhado à esquerda (uso original: linha inline fora de card).
- `indisponibilidades/index.tsx` (3ª revisão, mesmo dia, verificada por print no device): botão
  "Nova regra" trocado de `type='text'` com label (link azul solto, empurrava título pra 2 linhas)
  pra botão circular `type='contained' mode='icon' size={38}` só com ícone `plus` — mesmo padrão
  de `LiderancaEAcessosTab.tsx` e `RepertorioCategoriasManagerSheet.tsx` pra ação de "adicionar
  item numa seção de card". `type='text'` sem precedente nesse contexto no app; `contained`/`light`
  ou ícone circular são os únicos padrões usados pra essa ação. Ajuste seguinte, mesmo botão:
  `size={38}`→`32`, ícone `22`→`24` (círculo menor, ícone relativamente maior).
- `indisponibilidades/index.tsx` (4ª revisão, mesmo dia, verificada por print no device com dados
  reais): `cardReadonly` (bloqueios pessoais) tinha `borderStyle:'dashed'`. Toda outra ocorrência
  de dashed border no app (`EscalaWizardReviewStep`, `AssistenteParticipantesStep`,
  `AssistenteRevisaoStep`) é pra estado vazio/placeholder — nunca pra item com dado real.
  Removido `dashed`, mantido `solid` — fundo tintado (`withAlpha(fonts.inactive, 0.04)`) já
  comunica "somente leitura" sozinho.
- `indisponibilidades/index.tsx` (5ª revisão, mesmo dia, verificada por print no device com dados
  reais): leading icon dos itens de "Bloqueios pessoais" usava cor única `palette.fonts.inactive`
  pros 3 tipos de regra, diferente de "Regras deste ministério" que colore por tipo
  (`LIMITE_MENSAL`→`warning`, resto→`secondary`). Perdia diferenciação visual entre itens.
  Alinhado pra usar a mesma lógica de cor por tipo nas duas listas.
- `indisponibilidades/index.tsx` (6ª revisão, mesmo dia): wrapper `cardReadonly` (box cinza com
  borda em volta de cada item) removido de "Bloqueios pessoais" a pedido — itens agora são
  `FancyListItemCard` puro (fundo branco, sem borda extra), diferenciados só pela cor do ícone
  por tipo (decisão anterior). Style morto `cardReadonly` removido do arquivo.
- `indisponibilidades/index.tsx` (7ª revisão, mesmo dia, verificada por print no device):
  `FancyListItemCard` sempre desenha card próprio (bg + borda + shadow, ver
  `FancyListItemCard.tsx:56-64`) — mesmo sem `containerStyle`, cada item de "Bloqueios pessoais"
  ainda aparecia com card por trás. Trocado por row simples (`View` com ícone squircle 40px + texto),
  sem card/shadow/borda — itens ficam soltos dentro do card da seção. `FancyListItemCard` mantido
  em "Regras deste ministério" (é pressable/editável, faz sentido ter affordance de card lá).

- `indisponibilidades/index.tsx` (8ª revisão, mesmo dia): densidade dos itens reduzida pra caber
  mais regras sem rolar (ação mais frequente na tela é ler/revisar, não editar — prioriza
  densidade sobre alvo de toque generoso). 3 achados aprovados:
  1. Gap entre itens das duas listas (bloqueios pessoais e regras do ministério) era `14` — não é
     múltiplo de 4 nem 8 (grid do projeto) e era o maior contribuinte pra altura da lista. `14`→`8`.
  2. `FancyListItemCard` (regras do ministério) tem `minHeight: 78` no componente global (floor
     pensado pra outras 20+ telas com leading de imagem/avatar 46px) — nos itens desta lista
     (conteúdo real ~64px sem detalhe) sobrava padding morto. Override local via `containerStyle`
     (`regraCardFlat`), sem tocar componente global: `minHeight: 64`.
  3. `paddingVertical` do `FancyListItemCard` é `12`/`12` (24 total) no componente global — reduzido
     localmente via mesmo `containerStyle` pra `8` (16 total), ainda múltiplo de 4/8.
  - `regraCardFlat` final: `borderWidth:0, borderColor:'transparent', shadowOpacity:0,
    shadowColor:'transparent', paddingHorizontal:0, paddingVertical:8, minHeight:64`.

## Log de telas revisadas

| Tela                                        | Data       | Findings                                                                | Resultado         |
| -------------------------------------------- | ---------- | ------------------------------------------------------------------------ | ------------------ |
| EscalaHeader vs MinisterioStatsCard (título) | 2026-08-05 | F1 (tamanho/peso/cor já convergiam, faltava documentar), F2 (leading icon ausente em EscalaHeader), F3 (lineHeight manual divergente) | Todos aprovados e implementados |
| Revisão de tamanho do título (largeMedium → medium) | 2026-08-05 | Título grande demais na variante cheia | Regra revisada; aplicado em EscalaHeader e MinisterioStatsCard (FullCard) |
| indisponibilidades/index.tsx (peso dos section headers) | 2026-08-05 | semiBold divergia do bold confirmado para título de card | Ajustado pra bold; ícone leading fora de escopo (section header, não card de entidade) |
| indisponibilidades/index.tsx (densidade de itens) | 2026-08-05 | F1 (gap 14 não é múltiplo de 4/8), F2 (minHeight 78 herdado sobrando padding), F3 (paddingVertical 12/12 do componente global) | Todos aprovados e implementados |

---

# Design System — Banner de erro de submit (escopo: `FancyErrorBanner`)

> Escopo: mensagem de erro em nível de submit/API dentro de modal ou formulário (ex: conflito
> de regra ao salvar), distinta de erro de campo (validação inline).
> Revisão: 2026-08-06

## Regra confirmada

- **[confirmed 2026-08-06]** Erro de campo (validação de um input específico, ex:
  `errors.diasSemana`) continua usando `FancyErrorText` (texto simples, sem fundo) —
  componente tem 22 usos no app, a maioria erro de campo em `Controlled*`. Não alterado.
- **[confirmed 2026-08-06]** Erro de nível de submit (falha ao salvar, conflito retornado pela
  API) usa novo componente `components/forms/FancyErrorBanner.tsx`: fundo
  `ColorUtils.withAlpha(Pallete.error, 0.12)`, borda `withAlpha(Pallete.error, 0.28)`,
  `borderRadius: 12`, ícone `alert-circle-outline` (`MaterialCommunityIcons`, 18px,
  `Pallete.error`) + texto (`FancyErrorText`-style, `size='extraSmall' type='medium'
  color={Pallete.error}`), row com `gap: 8`.
- Motivo da separação: transformar todo `FancyErrorText` em banner colorido criaria um bloco
  vermelho pesado embaixo de cada campo de formulário do app (22 usos) — errado pro caso de uso
  (erro de campo é leve, discreto; erro de submit é evento raro que merece mais destaque).
- Referência de padrão já existente no app: `BillingNoticeBanner.tsx` (fundo tint + ícone
  circular + gradiente) — não reaproveitado diretamente por ser pesado demais (card com gradiente,
  badge, CTA) pro contexto de erro inline dentro de modal; `FancyErrorBanner` é a versão
  leve/compacta do mesmo princípio (fundo tint por tom semântico + ícone).

## Onde usar

- Aplicado em `AddRegraModal.tsx:301` (substituiu `FancyErrorText` no `submitError`).
- Usar em qualquer outro modal/form que hoje mostra erro de submit/API via `FancyErrorText` sem
  fundo — banner é o padrão daqui pra frente pra esse caso específico.

## Auditoria

- Zero hex hardcoded — cor via `usePallete()`/`ColorUtils.withAlpha`.
- Sem `elevation`/sombra (não é card, é banner inline leve — sem `Pallete.shadows`).
- `npx tsc --noEmit`: zero erros.

---

# Design System — EventoFormModal (escopo: assistente de escalas, bottom sheet "Editar Evento")

> Escopo: `EventoFormModal.tsx` + dependências diretas (`FancyBottomSheetModal`,
> `FancyContainerList`, `FancyCard.Simple`/`FancyBaseCard`, `EscalaFormFuncaoList`).
> Revisão: 2026-08-15

## Regras de Design Confirmadas

### Hierarquia — título de sheet vs. header de seção vs. título de item

- **[confirmed 2026-08-15]** Achado: título do sheet (`title={data?.nome}`), título do header de
  seção (`FancyContainerList`, `size='medium' type='bold'`) e título de cada item de lista
  (`FancyBaseCard`, `size='medium' type='bold'`) renderizam no mesmo tamanho/peso (13px bold via
  `MEDIUM_SIZE_FONT`) — três níveis de hierarquia colapsam num só, sem diferenciação visual.
- Regra: título de sheet sobe pra `size='largeMedium'` (15px), mantendo `type='bold'` —
  diferencia do header de seção e do item de lista, que continuam em `medium` (13px). Sheet title
  é o nível mais alto da tela (nome do evento), não deveria competir visualmente com sub-elementos.

### Cores — ações de header de lista (add vs. destrutiva)

- **[confirmed 2026-08-15]** Achado: botões `+` (adicionar) e limpar-tudo
  (`list-clear`) no header de `FancyContainerList` renderizam ambos com `type='contained'`,
  mesma cor azul (`palette.buttons.active`) — nenhuma distinção visual entre ação aditiva e ação
  destrutiva/irreversível (limpar toda a lista de equipe).
- Regra (reforça `CLAUDE.md` do frontend: "Ações destrutivas → `palette.error` sólido com
  `palette.icons.light`"): botão de limpar-tudo em `FancyContainerList.buttons` usa
  `color: palette.error` explícito, distinto do botão `+` que mantém `palette.buttons.active`.
  `FancyContainerList` ganha suporte a `tone?: 'default' | 'destructive'` por botão (default mantém
  comportamento atual, sem quebrar os outros usos do componente).

### Densidade de item de lista — listas com 6+ itens

- **[confirmed 2026-08-15]** Achado: `FancyBaseCard` (usado por `FancyCard.Simple` na seção
  "Equipe") renderiza ~70px por item, 3 linhas empilhadas (título/subtítulo/dado adicional) —
  confirmado que a lista "Equipe" tipicamente tem 6-15 itens, então o card atual força rolagem
  pesada pro caso comum.
  o card atual força rolagem pesada pro caso comum.
- Regra: listas com contagem tipicamente ≥6 itens usam variante compacta de item (título +
  subtítulo numa linha só, ícone de ação menor) — mesmo princípio já aplicado em
  `indisponibilidades/index.tsx` (ver seção acima, "densidade de itens": `paddingVertical` 12→8,
  remoção de padding morto). Aplicar override local via `containerStyle` no `FancyCard.Simple`
  desta tela, sem mudar o default global de `FancyBaseCard` (79+ outros usos no app).

### Rótulo obrigatório em campo de dado

- **[confirmed 2026-08-15]** Achado: data do evento (`format(data.dataOcorrencia, ...)`) renderiza
  solta, sem label, com `type='medium' size='small' color={fonts.inactive}` — diverge do padrão de
  todo outro campo da tela (`ControlledSearchSelect`/`FancyBottomSheetSelect`), que usa label
  `size='extraSmall' type='semiBold' color={fonts.inactive}` acima do valor.
- Regra: todo campo de dado exibido numa tela de formulário leva label no padrão já usado pelos
  outros campos da mesma tela — sem exceção pra "campo derivado"/"campo somente leitura".

## Log de Telas Revisadas

| Tela                                    | Data       | Findings                                                                                                        | Resultado                        |
| ---------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| EventoFormModal (assistente de escalas) | 2026-08-15 | F1 (hierarquia sheet/seção/item colapsada), F2 (add/limpar-tudo mesma cor), F3 (densidade item p/ lista 6-15), F4 (data sem label) | Todos aprovados — implementação pendente |

---

# Design System — NotificationButton + FancyHeader (escopo: botão de notificações e header padrão)

> Escopo: `components/header/NotificationButton.tsx`, `components/header/FancyHeader.tsx`.
> Revisão: 2026-08-17

## Regras Confirmadas

- **[confirmed 2026-08-17]** Badge do sino de notificações é indicador binário (tem/não tem
  não-lida), não contador — usa dot fixo `8×8px`, sem número dentro. Motivo: número de 2-3
  dígitos não cabia sem distorcer o círculo em nenhum tamanho testado; usuário preferiu o padrão
  dot (iOS/Gmail/WhatsApp) a ajustar o círculo pro número. Ver histórico abaixo — havia uma
  primeira correção (diâmetro/fonte fixos, 19px/11px) que ficou obsoleta por esta.
- **[confirmed 2026-08-17]** Posição do dot (`right: -2, top: 0` sobre ícone de 19px) — avaliado
  e aprovado, não encosta na silhueta do sino no build atual.

## Achados avaliados (sem ação)

- Touch target do container do sino (`24×30`) abaixo do mínimo `≥44px` do checklist do
  `CLAUDE.md` do frontend — **débito registrado, não corrigido nesta rodada** (fora do escopo
  pedido pelo usuário).
- Alinhamento vertical entre `HeaderMenuButton` (ícone+título) — mecanismo é
  `flexDirection:'row'` + `alignItems:'center'`, estruturalmente correto; qualquer desvio visual
  fica a nível de métrica de fonte (Montserrat), não bug de layout. Sem ação.
- Tamanho do título do header (`largeMedium`/`medium`) vs. `DashboardSection` eyebrow
  (`size='small'`) — proporção 15:12 é degrau de escala normal, hierarquia correta. Sem ação.

## Débito de design

- Touch target `24×30` do `NotificationButton` (e `HeaderMenuButton`/`HeaderBackButton`, mesmo
  padrão) abaixo de 44px — decisão de aumentar afeta o header padrão do app inteiro, precisa
  aprovação antes de mudar.

## Log de Telas Revisadas

| Tela | Data | Findings | Resultado |
| --- | --- | --- | --- |
| NotificationButton (badge) | 2026-08-17 | Número "13" estourava círculo em qualquer tamanho fixo testado | Trocado por dot 8px sem número |
| NotificationButton + FancyHeader (avaliação livre) | 2026-08-17 | F1 (touch target <44px), F2 (posição do dot — rejeitado, não se aplica), F3 (alinhamento título — ok), F4 (tamanho do título — ok) | F1 registrado como débito; F2 rejeitado (R1); F3/F4 sem ação |

---

# Design System — Checklist de Configuração de Escala (escopo: tela/banner nova)

> Escopo: banner + expansão na listagem de escalas do ministério (Fase 1 do roadmap Versão 2).
> Revisão: 2026-08-19 — fluxo `trfernandes-atelier` completo (advise + grilling + concept).

## Entendimento (advise + grilling, fechado com o usuário)

- Banner aparece na listagem de escalas do ministério, **só quando o checklist está incompleto**
  — pensado pro primeiro acesso (líder novo que já quer sair gerando escala sem ter configurado
  nada). Também um item de menu na mesma tela, acessível a qualquer momento.
- Admin usa a mesma visão do líder, ministério por ministério — sem tela agregada por igreja
  nesta fase (`GET /igrejas/:id/checklist-escala` fica sem consumo no app por ora).
- Pré-checagem intercepta automaticamente o botão "Gerar" no último passo do Assistente já
  existente (`assistant.tsx`) — nunca bloqueia (ADR 0003), só avisa com opção "Gerar mesmo
  assim".
- Tela de uso raro (configuração, não daily driver).

## Conceito

- **Paradigma**: nenhum dos 12 paradigmas-padrão isolado — é essencialmente uma variação de
  "Master-detail com preview inline" (item 7), mas com o preview substituindo o resultado
  esperado ("check") por um **resultado real** (contagem) quando resolvido. Casa com a dimensão
  dominante (estado de configuração, não dado temporal/espacial/conversa) e a restrição mobile
  (baixa densidade, uma ação óbvia por vez, thumb zone).
- **Estrutura OOUX**:
  - `Passo do Checklist` (função/vínculo/função-do-voluntário) → não vira tela própria, nem
    lista genérica com checkbox — vira **linha de estado** dentro de um card expansível na
    listagem de escalas (ver Direção abaixo).
  - `Checklist` (agregador dos 3 passos, por ministério) → não é tela própria nesta fase — é o
    card/banner citado acima, aberto por toque ou pelo item de menu.
  - `Pré-checagem` (por vaga/evento) → modal (`FancyModalDialog`), intercepta o botão "Gerar".
  - `Função` (cadastro) → sem tela nova; reaproveita o cadastro de função já existente
    (`ministerio-funcoes`), só ganha sugestões (catálogo) — decisão de onde vive o catálogo
    ainda em aberto, não bloqueia o conceito de tela.
- **Elemento-assinatura**: **"a frase que muda de sentença"** — no topo do card, uma única linha
  de status narra o que falta em linguagem de domínio ("Falta cadastrar função" → "Falta
  vincular voluntários" → "Falta atribuir função aos voluntários" → "Ministério pronto pra
  escalar"), recalculada ao vivo conforme o líder resolve cada passo. Nunca frasa como
  bloqueio/impedimento (ADR 0003: avisa, não bloqueia) — sempre framing de "falta X", nunca "não
  pode Y".
  - Item resolvido **não vira checkmark** — vira um chip com o dado real que foi criado (ex:
    "4 funções", "9 voluntários"), reforçando "você construiu algo" em vez de "você marcou uma
    tarefa".
  - Item ainda não alcançável na ordem lógica (ex: atribuir função sem ter voluntário vinculado
    ainda) fica visualmente esmaecido, mas **continua tocável** — nunca trava navegação
    (consistente com "nunca bloqueia").
  - Cada linha é tocável por inteiro (sem `FancyButton` dentro da linha) — toque no corpo da
    linha navega pro cadastro correspondente.
- **Gate da Lei de Jakob**: passou. Trocando cor/logo por um concorrente do mesmo segmento, a
  estrutura ainda seria reconhecível — nenhum outro app de escala voluntária usa "frase de status
  que narra o próximo passo em linguagem de domínio" + "chip de contagem real em vez de check" no
  lugar do checklist genérico de onboarding.

### Direções descartadas (subagentes paralelos, técnicas de divergência)

| Direção | Técnica | Por que descartada (parcial) |
| --- | --- | --- |
| "GO/NO-GO de palco" (veredito bloqueante, itens com severidade) | Analogia forçada (backstage de show) | Framing "escala não pode ser gerada" contradiz ADR 0003 (nunca bloqueia) — mantida só a ideia de frase de status dinâmica, reescrita sem linguagem de bloqueio |
| Cadeado que trava item 3 até 1+2 resolverem | Estratégia oblíqua (sem botão) | Lock literal implica bloqueio de navegação, que o produto não tem hoje — mantida só a ideia de linha inteira tocável (sem botão) e esmaecimento visual sem travar toque |
| Trilha horizontal fixa de 3 estações | SCAMPER Eliminate | Estrutura de trilha não cabia bem no espaço de uma listagem de escalas (empurraria conteúdo real da tela) — mantida a ideia central (chip com contagem real em vez de check) |

### Revisão 2026-08-21 — Checklist vira tela própria

Durante a camada de cor (`trfernandes-atelier-explore` Ramo A), o usuário revisou um ponto do
entendimento acima: o card/banner na listagem de escalas **continua existindo** como ponto de
entrada (sugestão no primeiro acesso + item de menu), mas agora é só um **teaser compacto**
(frase de status + indicador de toque) — ele não expande mais os 3 passos in-place. Tocar no
teaser (ou no item de menu) **navega pra uma tela própria do Checklist**, que mostra os mesmos 3
passos (mesmo conteúdo, mesmo elemento-assinatura "frase que muda de sentença" + chip com dado
real), só que em tela cheia. Essa tela não tem entrada própria fora desses dois pontos — não vira
destino de menu lateral nem tab, é alcançável só a partir da listagem de escalas do ministério.

Cogitou-se também mostrar um card equivalente em Início (dashboard) — descartado pelo usuário
("esqueci desse detalhe, esquece essa ideia"), fora de escopo desta fase.

Isso muda a estrutura OOUX (linha 647-656 acima):
- `Passo do Checklist` → continua **linha de estado**, mas agora dentro da tela própria, não do
  card da listagem.
- `Checklist` (agregador dos 3 passos) → **é tela própria** nesta fase (correção do texto
  original acima, que dizia o contrário) — reaproveita a mesma linguagem visual e cores já
  aprovadas (Variante F, ver seção Cor abaixo).
- O card da listagem passa a ser só o `Teaser do Checklist` — objeto novo, compacto: mesma frase
  de status como título, sem os 3 passos, com indicador de navegação (chevron).

Paradigma ajustado: deixa de ser puramente "Master-detail com preview inline" (item 7) e passa a
ser um híbrido com "Lista + detalhe" (item 1) — o teaser na listagem funciona como o item de
lista compacto, a tela própria é o detalhe pra onde a navegação leva. O elemento-assinatura (frase
que muda de sentença, chip com dado real, esmaecido mas tocável) continua idêntico — só migrou de
container (card expansível → tela).

## Próximo passo

Cor/tipografia/componentes reais — `trfernandes-atelier-explore` Ramo A.
