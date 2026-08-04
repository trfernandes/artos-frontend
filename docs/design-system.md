# Design System — Diakonia (escopo: quiz-vendas-funcionalidades)

> Escopo deste documento: redesign do carrossel de funcionalidades pós-quiz de vendas
> (`app/(auth)/quiz-vendas-funcionalidades.tsx`). Não cobre `quiz-vendas.tsx` (perguntas) nem
> `quiz-vendas-resultado.tsx` — ambos ficam como estão.

## Objetos do domínio
- Feature (funcionalidade) — item do carrossel: categoria, título, subtítulo, ilustração, cor de destaque
- Slide — unidade de navegação do carrossel (5 features + 1 conclusão)
- Ilustração — celular flutuando com UI simplificada da feature na tela, sem personagens
- Progress indicator — barra segmentada mostrando posição no carrossel
- Slide de conclusão — checkmark + copy + CTAs (criar conta / já tenho conta)
- Voluntário / Escala / Ministério / Repertório — objetos de domínio do produto real, referenciados pelas 5 features (escala automática, substituição fácil, lembrete automático, disponibilidade, repertório)
- Diagnóstico — resultado do quiz (tela anterior), fonte da dor que este carrossel resolve

## Tom e contexto
- Propósito: onboarding de vendas (funil pós-quiz) de app B2B de gestão de escala voluntária pra igrejas
- Tom: **calma e resolução** — arco narrativo: quiz + resultado usam paleta quente/urgente (dor, tempo perdido), funcionalidades mostra a solução já em ação, sem urgência.
- Público: líder/pastor/responsável de escala de igreja, decisor não-técnico, mobile, sessão curta (funil de vendas)
- Plataforma: mobile (Expo/React Native)
- Dimensão dominante: conversa/narrativa (carrossel guiado, não dados/tabela)
- Contexto de uso: mobile em movimento, sessão de poucos minutos dentro do funil de cadastro

## Features finais (5, aprovadas)

| # | category | title | subtitle |
|---|---|---|---|
| 1 | ESCALA AUTOMÁTICA | A escala se monta sozinha | Diakonia cruza disponibilidade e função de cada voluntário e monta a escala pra você. |
| 2 | SEM FURO NA ESCALA | Substituição sem correria | Voluntário indisponível? O app avisa o líder e já sugere quem pode entrar no lugar. |
| 3 | LEMBRETE AUTOMÁTICO | Ninguém esquece a escala | Notificação automática avisa cada voluntário — acabou o lembrete manual por WhatsApp. |
| 4 | DISPONIBILIDADE | Avisar que não pode é rápido | Voluntário marca os dias indisponíveis direto no app, sem precisar avisar ninguém um por um. |
| 5 | REPERTÓRIO | Repertório sempre à mão | Músicas, tom e ordem organizados por ministério, prontos pra ensaio. |

Decisão anterior tinha só 3 features genéricas ("Tudo num só lugar" era um catch-all fraco); revisão trocou por 5 funcionalidades reais e específicas do produto, com frases descrevendo a situação concreta que cada uma resolve.

## Referências
- Interna — `assets/images/quiz-resultado-so-falta-organizar.jpeg` (e demais `quiz-resultado-*.jpeg`) — ilustração vetorial flat existente no app, referência de **técnica de ilustração** (traço/estilo), usada como base pra um `style_id` custom no Recraft (`9e8f9e22-7bf2-444b-a89a-a995e38a790d`).
- As 5 ilustrações finais foram geradas via Recraft reaproveitando esse `style_id`, recoloridas por código (identificação precisa de triplas `rgb()` por saturação/matiz, nunca regex largo — risco real de recolorir tom de pele quando há personagem na cena) e convertidas de SVG pra PNG (projeto não tem `react-native-svg-transformer` configurado, só `react-native-svg` imperativo — `.svg` não renderiza via `<Image source={require(...)}>`).

## Decisão — sem personagens nas ilustrações

Pivô em relação à primeira versão (que tinha personagens fazendo as ações, ex: líder no meio da bagunça de papelada): usuário pediu ilustrações **sem pessoas**, mostrando a própria interface/celular fazendo a coisa acontecer, não alguém segurando o celular.

- Motivo: foco na solução em si (o app), mais barato e rápido iterar sem precisar manter consistência de personagem entre 5 cenas.
- Cada ilustração: celular flutuando sozinho (sem mão, sem rosto), tela mostrando uma UI simplificada específica da feature — grid de calendário com checks (feature 1), avatares conectados por seta de troca (feature 2), balão de notificação com sino (feature 3), calendário com X vermelhos em dias bloqueados + mini-calendário decorativo (feature 4), lista de músicas com nota musical (feature 5).
- Feature 4 passou por duas correções: (1) primeira versão usava check verde nos dias (lia como "marcar disponível"), trocado por X vermelho cobrindo a célula inteira (lê como "bloqueado/indisponível" sem ambiguidade) — vermelho mantido como está (convenção universal de bloqueio), não recolorido pro accent da feature; (2) o recolor pro verde da feature acabou pegando também o bezel do celular e 3 quadrados decorativos do calendário (mesma tripla `rgb()` reaproveitada pelo Recraft em elementos sem relação), deixando a imagem com aspecto "pintado" — revertido pro tom de pele padrão (igual às outras 4 imagens) e quadrados neutros, sem accent verde na ilustração (só a categoria/texto do slide carrega a cor).

## Direção visual — Cor (revisão 2 — pós-feedback)

- Revisão 1 (blend azul/amarelo/verde a 0.35 sobre a onda da ilustração) foi rejeitada pelo usuário: "muito espaço em branco, não gostei dessas cores em baixo sendo que a imagem de cima não tem a mesma cor, e não gostei dos tons das cores" — a onda usava accent alternado (azul/amarelo/verde) sobre ilustrações que são todas peach/laranja/bege, gerando descompasso visual em todo slide, e o blend a 0.35 deixava o tom lavado.
- Onda da ilustração (elemento que fica sobre a própria imagem) passa a usar **cor fixa** `Pallete.terciary` (laranja) — combina com o tom peach/laranja das 5 ilustrações, em vez de accent variável que nunca batia com a arte.
- Categoria e progress bar (elementos fora da imagem, não precisam bater com a ilustração) continuam variando por feature, mas em **cor cheia**, sem blend:
  - Feature 1 (Escala automática) — `Pallete.primary` (azul)
  - Feature 2 (Substituição fácil) — `Pallete.warning` (amarelo)
  - Feature 3 (Lembrete automático) — `Pallete.primary` (azul)
  - Feature 4 (Disponibilidade) — `Pallete.confirm` (verde)
  - Feature 5 (Repertório) — `Pallete.warning` (amarelo)
  - Conclusão — `Pallete.confirm` (verde, "problema resolvido")
- Contraste: cores de accent usadas só em onda/categoria/progress (nunca texto de corpo), que continua em `fonts.dark`/`fonts.inactive` — sem risco de AA.

## Direção visual — Cor (revisão 1, histórico — substituída acima)

- Paleta derivava de `ColorUtils.blendOver(Pallete.X, 0.35, Pallete.backgroundColor)` por feature, mesma cor usada na onda da ilustração e no progress bar — ver seção acima pra decisão atual.

## Direção visual — Componentes (aprovada)

- **Ilustração** (`QuizIllustrationPlaceholder`, prop `image`) — full-bleed, PNG real (celular + UI da feature) no lugar do ícone-em-caixa genérico, onda sólida na base. Aspect ratio ampliado pra 0.82 (crop leve controlado) pra ilustração ocupar mais espaço vertical — revisão pós-feedback "muito espaço em branco". `featureBlock` deixou de centralizar verticalmente com `flexGrow`, ancora no topo do scroll.
- **Progress bar** (`QuizSegmentedProgress`) — segmento ativo em cor sólida da feature atual (não gradiente).
- **Slide de conclusão** — checkmark com gradiente roxo→azul (mantido, é um elemento único fora do ciclo de cor por feature), onda sólida verde (`Pallete.confirm`) na base, CTA mantém `Pallete.terciary` (laranja, padrão já aprovado na tela de resultado, fora de escopo mudar).
- **Transição animada** — `Animated` embutido do RN (não Reanimated — ver `splash-overlay-reanimated-bug` na memória do projeto, mesmo bug de overlay em New Arch), fade+slide leve (opacity 0→1, translateX 12px→0) por slide.

## Direções rejeitadas (histórico)

| Direção | Por que rejeitada |
|---|---|
| 3 features genéricas ("Tudo num só lugar" como catch-all) | Substituído por 5 funcionalidades reais e específicas do produto, com frases concretas |
| Ilustração com personagem (líder no meio da bagunça, etc.) | Usuário pivotou pra "sem pessoas" — foco no app em si, mais simples de manter consistente em 5 cenas |
| Onda-gradiente entre cor atual e próxima feature | Paleta passou a alternar (azul/amarelo/verde) em vez de arco contínuo; gradiente entre cores opostas ficava feio — trocado por cor sólida por slide |
| Verde (`Pallete.confirm`) explicitamente rejeitado pro accent | Revertido nesta revisão — verde agora é usado (feature 4 e conclusão), pois a paleta deixou de ser um arco linear único |
| Feature 4 com check verde nos dias marcados | Lia como "marcar disponível" em vez de "indisponível"; trocado por X vermelho (convenção universal de bloqueio) |
| Recolorir tudo via regex largo de faixa de cor | Regra específica: nunca aplicar regex amplo sem antes listar e inspecionar as triplas `rgb()` candidatas — um regex largo já recolorou pele de personagem sem querer em uma iteração anterior |
| Feature 4 com bezel do celular + quadrados decorativos verdes | Recolor por tripla `rgb()` exata ainda pegou elementos não-relacionados que coincidentemente usavam a mesma cor original (bezel, quadrados de calendário); revertido pra pele/neutro — regra reforçada: mesmo com substituição literal, checar visualmente o resultado renderizado antes de aceitar |

---

# Design System — EscalaHeader (escopo: card de detalhes da escala)

> Escopo: `EscalaHeader.tsx` + `EscalaStatusBadge.tsx`  
> Revisão: 2026-08-03

## Regras de Design Confirmadas

### Cores — semântica de status
| Status | Cor | Justificativa |
|--------|-----|---------------|
| GERADA | `palette.fonts.inactive` (#6F6F6F) | Estado intermediário/neutro — escala existe mas não está no ar |
| PUBLICADA | `palette.confirm` (#228B22) | Estado positivo — escala ativa, semântica de "pronto/concluído" |
| CANCELADA | `palette.fonts.inactive` (#6F6F6F) | Arquivado — mesmo neutro de inativo |
| GERANDO | `palette.secondary` | Processo em andamento — mantido |
| ERRO | `palette.error` | Destrutivo — mantido |

**Regra geral:** `palette.warning` (âmbar) é reservado para estados de atenção/pendência, nunca para estados positivos/finalizados.

### Cores — saturação de palette.primary
- `palette.primary` é token de identidade/tempo do app — não de estado de entidade.
- No card EscalaHeader, primary é permitido em: borda-top (identidade do card), eyebrow tick + texto (label de tipo), pill de período (dado temporal).
- Proibido usar primary como cor de chip de status do ciclo de vida de uma entidade.

### Hierarquia de informação — origem vs. status
- **Origem** (Manual/Automática) é metadado estático, raramente muda e não guia ação imediata → representar como ícone discreto no eyebrow row, mesma cor do eyebrow com `ColorUtils.withAlpha(palette.primary, 0.65)`.
- **Status** é dado de ciclo de vida com ação implícita → único chip no title row, cor semântica por estado.
- Regra: nunca dois chips de peso visual igual no mesmo row quando os conceitos têm hierarquia diferente.

### Vocabulário visual — ícone vs. dot em chips
- `dot` = estado de ciclo de vida de uma entidade (muda com o tempo, guia ação).
- `icon` = atributo estático ou metadado contextual (origem, tipo, categoria).
- Nunca misturar os dois no mesmo row sem essa distinção semântica clara.

## Direção visual — layout (revisão 2, 2026-08-03 — Direção A "Faixa de status")

> Supersede parcialmente as regras acima. Motivo: usuário rejeitou o resultado da revisão 1 no uso real ("não to gostando do posicionamento, cores e etc") — passou por novo ciclo `trfernandes-atelier-advise` + `-explore` Ramo B, 3 direções geradas em Artifact, usuário aprovou Direção A.

### Estrutura — 3 rows (substitui eyebrow row + topRow + metaInlineRow)
- Row 1 (`headlineRow`): título + chip de status (`FancyChips` com `dot`), lado a lado.
- Row 2 (`metaRow`): origem (ícone+texto) · separador · período (ícone+texto) · indicador de progresso (`EscalaHealthIndicator compact`) empurrado pra direita (`marginLeft:'auto'`).
- Row 3 (`actionsRow`): ações, ver abaixo.
- Borda superior do card (`borderTopColor`) passa a ser **dinâmica**, usa a cor do status atual (reaproveita a tabela de cores já confirmada acima) — antes era sempre `palette.primary` fixo independente do status.

### Origem — ícone+texto (supersede regra anterior de ícone-only)
- Regra anterior ("Hierarquia de informação — origem vs. status") dizia origem = ícone discreto sozinho, alpha 0.65, sem texto.
- Usuário confirmou nesta rodada que essa regra causava o problema real "origem pouco visível" — origem agora é **ícone (12px) + texto** (`Manual`/`Automática`), cor `palette.fonts.inactive` (sem alpha reduzido), no `metaRow`.
- Ícone: `lightning-bolt` (Automática) / `pencil-outline` (Manual), `MaterialCommunityIcons`.

### Ações — grupo visível + kebab overflow
- Problema confirmado: botões de ação genéricos demais quando há 2-5 ações simultâneas soltas em row.
- Regra nova (corrigida — primeira implementação só mostrava `publish`, divergia do mockup aprovado): ação primária (`variant:'primary'`, ex. Recalcular) + **até 2 ações neutras** (`variant:'neutral'`, ordem de chegada no array — ex. Publicar, Insights) ficam visíveis direto na `actionsRow`. Ação `danger` (excluir) e qualquer neutra além das 2 primeiras entram em kebab (`OverflowActionsMenu`, `FancyPopup`, ícone `dots-vertical`).
- Cores de ação (tint por categoria: `secondary`=insights, `warning`=parametrização, `error`=destrutivo) mantidas inalteradas dentro do menu — regra de "cores semânticas em ações" do `CLAUDE.md` do frontend não foi tocada, só a exposição (visível vs. dentro do menu) mudou.
- Ícones dos itens de `actions` (Header.tsx) unificados pra `MaterialCommunityIcons` em todos (antes misturava com `MaterialIcons` — `tune`, `rocket-launch`, `delete-outline` — peso visual/traço diferente do resto, achado durante validação visual desta rodada).

## Log de telas revisadas
| Tela | Data | Findings | Resultado |
|------|------|----------|-----------|
| EscalaHeader — chips origem/status | 2026-08-03 | F1 (primary 4×), F2 (PUBLICADA=warning), F3 (chip origem=peso igual), F4 (vocabulário duplo) | Todos aprovados e implementados |
| EscalaHeader — Direção A (empilhamento/cores/origem/ações/espaçamento) | 2026-08-03 | Empilhamento em 4 blocos, cor de borda fixa sem hierarquia, origem pouco visível, botões de ação genéricos, ícones de biblioteca misturada | Todos aprovados e implementados; validado via ADB no device físico |

## Audit Log

### Audit — 2026-08-03 (EscalaHeader.tsx + Header.tsx, Direção A)

#### Critérios de originalidade
- [1] Troca de logo: ✅ — chip de status, origem e kebab levam dados reais do ciclo de vida da escala (Gerada/Publicada/Manual/Automática), não genérico.
- [2] Industry scan: ✅ — kebab reaproveita `FancyPopup` no mesmo padrão já usado em `EscaladoMenuPopup.tsx`, consistência interna em vez de padrão externo copiado.
- [3] Tells de IA: ✅ nenhum — sem gradiente decorativo (fora dos 3 tokens permitidos), sombra única (`shadows[200]`), ícones agora unificados em `MaterialCommunityIcons` (mistura com `MaterialIcons` corrigida nesta rodada).
- [4] Especificidade do domínio: ✅ — estrutura carrega status/origem/período/progresso específicos de escala de voluntariado, não serviria pra outro domínio sem alteração de dados exibidos.
- [5] Decisão vs default: ✅ — borda-top dinâmica por status, grouping de ações (visível vs. kebab) e origem ícone+texto são decisões registradas com motivo (ver seções acima), não primeiro valor.
- [6] Riqueza gráfica: ⚠️ — reaproveita `EscalaHealthIndicator` (donut) já existente; nenhum gráfico/ilustração novo introduzido. Aceitável pro escopo (correção visual, não tela nova), mas registrado como não-ganho nessa frente.

#### Contraste
- `fonts.dark` (#3E3E3E) sobre `backgroundColor` (#FFFFFF), título: 10.70:1 — ✅ AA/AAA
- `fonts.inactive` (#6F6F6F) sobre `backgroundColor` (#FFFFFF), meta row/GERADA/CANCELADA: 5.02:1 — ✅ AA (AAA falha, não exigido)
- `error` (#C0392B) sobre branco, chip ERRO: 5.44:1 — ✅ AA
- `confirm` (#228B22) sobre o fundo real do chip (`FancyChips` pinta o texto na própria `resolvedColor`, fundo é `withAlpha(color, 0.12)` — não branco sólido), chip PUBLICADA: **3.80:1 (light) / 3.39:1 (dark) — ❌ falha AA texto normal** (precisa 4.5:1; chip usa `size='small'`, abaixo do limiar de "texto grande"). Cor é regra `[confirmed]` de sessão anterior (não a Direção A desta rodada), mas a falha é real e mensurável nos dois temas — registrado como débito, não bloqueio desta entrega (não é regressão introduzida agora).
- Dark mode: `fonts.dark`/`fonts.inactive` sobre `#121212` — 16.79:1 e 8.03:1, ✅ ambos.

#### Consistência interna
- Zero hex hardcoded — todas as cores via `usePallete()`/`ColorUtils.withAlpha` (checado em `EscalaHeader.tsx` e `Header.tsx`).
- `borderRadius:18`, `shadows[200]`, `borderCard` batem com o padrão de card já usado no resto do app (inalterados nesta revisão).
- Ícones de ação agora consistentes (`MaterialCommunityIcons` em todos) — divergência de biblioteca encontrada e corrigida durante a validação visual desta rodada.
- `npx tsc --noEmit`: zero erros.

#### Débito de design
- Cor `confirm` (#228B22, status PUBLICADA) falha WCAG AA como texto normal em ambos os temas (3.80:1 light / 3.39:1 dark, medido contra o fundo real do chip) — herdado de decisão `[confirmed]` de sessão anterior, não desta rodada. Fix futuro: escurecer levemente o verde de `confirm` (ou introduzir uma variante mais escura só pro texto do chip, mantendo `confirm` puro pros demais usos) — decisão de cor que precisa aprovação do usuário antes de mudar uma regra `[confirmed]`.

## Critério de conclusão

- Tipografia: não redefinida — app já tem escala fixa via `FancyText`.
- Cor, componentes, ilustrações: aprovados camada por camada (ver seções acima), incluindo as duas correções de feature 4 pós-review do usuário.
- Bug encontrado e corrigido na validação: `activeGradient` da progress bar recebia `undefined` no slide de conclusão, caindo no azul default do componente em vez do verde calculado (`stepColors[5]`); corrigido pra sempre passar `[accentColor, accentColor]`.
- `npx tsc --noEmit`: zero erros após wiring das 5 imagens + cores + fix da progress bar.
- Validação visual no device físico (RQCWC04P4VX, ADB screencap): 6 telas do carrossel conferidas (5 features + conclusão) em light e dark mode — ok em ambos.
