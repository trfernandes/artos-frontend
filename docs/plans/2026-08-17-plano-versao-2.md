# Plano Versão 2 — Checklist, Sobrecarga (Saúde), Substituição/Troca, Painel Admin, Analytics

Consolidado 2026-08-17 (base: handoff 2026-08-12, arquivado em `docs/plans/archive/`). Fonte: `docs/plans/archive/2026-08-08-*.md` +
`docs/plans/archive/2026-08-09-versao-unificada.md` + `docs/adr/0001-0004.md`. Domínio completo em `CONTEXT.md` (raiz do repo).

Revisado em grilling 2026-08-19 (furos + decisões abaixo, ver seção "Revisão 2026-08-19" ao final).

**Princípio geral**: em toda fase com tela nova/alterada, design de tela primeiro, implementação depois. Não começar código de UI antes
do design estar fechado (mesmo padrão já seguido em Substituição/Troca e Sobrecarga, ver seções "Design" abaixo). **Atualização
2026-08-22**: Checklist e Painel Admin já fecharam design (ver seções 1 e 5) — só Analytics ainda não tem tela própria, mas entra por
último e não bloqueia nada até lá.

Projeto: Diakonia. Frontend `artos_frontend/` (Expo/React Native). Backend `backend/` (NestJS). Repos git separados.

---

## Ordem de implementação recomendada (ver plano unificado completo)

0. **Melhorias pequenas soltas** (adicionado 2026-08-21, ver seção 0) — sem dependência com nenhuma fase, podem entrar a qualquer
   momento, inclusive em paralelo com qualquer uma das fases abaixo.
1. **Fase 1 — Checklist Configuração Escala** (backend). ✅ Backend implementado (`EscalaElegibilidadeService`,
   `EscalaChecklistService`, `EscalaPreCheckagemService` — ver seção 1). ✅ Design fechado 2026-08-21 (`trfernandes-atelier-explore`
   Ramo A, ver `docs/design-system.md`). Falta implementar o frontend, ver seção 4.
2. **Dupla Função + Pessoa Avulsa** (adicionado 2026-08-19, ver seção 1.5) — logo após a Fase 1, antes da Fase 2, pra não compor
   conflito de merge em `EscalaItemEntity` com as fases seguintes.
3. **Fase 2 — Substituição + Troca** (backend). Reusa `EscalaElegibilidadeService` da Fase 1.
4. **Fase 3 — Sobrecarga de Voluntário / "Saúde"** (backend). Depois da Fase 2 pra não conflitar no mesmo enum de notificação e no
   gatilho de `EscalaItemEntity`. Inclui também o **Score de Serviço** (adicionado em grilling 2026-08-19, sem número de fase próprio —
   ver seção 3).
5. **Fase 4 — Frontend mobile**, consolidado, só depois das 3 fases de backend fechadas.
6. **Fase 5 — Painel Admin da Plataforma**. Sem overlap, pode rodar em paralelo/qualquer momento. Único ponto de atenção: mexe em
   `auth/` (checagem de Igreja suspensa).
7. **Fase 6 — Analytics**. Depois de todas as outras (última prioridade). Design de telas das fases 1-5 continua/fecha antes da
   implementação de analytics começar — instalar analytics faz mais sentido com as telas novas já definidas, evita re-instrumentar
   depois.

**Decisão do grilling 2026-08-19**: design de tela do Checklist (Fase 1) e do Painel Admin (Fase 5) roda antes de seguir pra Fase 2
backend — ambas ainda não tinham sessão de design (diferente de Substituição/Troca e Sobrecarga, que já têm), furo achado na revisão do
plano. **Fechado em 2026-08-22** — as duas sessões rodaram (ver seções 1 e 5), outro furo achado numa auditoria de planejamento
posterior (a de Painel Admin nunca tinha rodado de fato apesar da decisão de 08-19).

Pontos de junção reais entre os planos (por isso a ordem, não "qualquer ordem"):

- `PossuiFuncaoRule` + `DisponibilidadeRule` (`backend/src/escalas/services/generator/rules/`) usadas por 3 features: gerador (já
  existe), pré-checagem Checklist, candidatos-elegíveis Substituição.
- `tipo-notificacao.enum.ts` recebe tipos novos de Substituição/Troca (Fase 2) e Sobrecarga (Fase 3) — sequenciar evita conflito de
  merge.
- Gatilho em `EscalaItemEntity` tocado por Sobrecarga (Fase 3) e por realocação de Substituição (Fase 2).

---

## 0. Melhorias pequenas soltas (adicionado 2026-08-21)

Duas features pequenas, isoladas, sem dependência com nenhuma fase abaixo — só frontend nas duas, podem entrar a qualquer momento.
Vieram de uma lista maior que o usuário trouxe misturando bugs e features; os bugs foram removidos do planejamento (usuário corrige
numa sessão separada, na própria máquina) — só essas duas ficaram como trabalho novo.

### Mostrar função do integrante em chip (tela Integrantes)

Tela "Integrantes" do ministério não mostra a função de cada um num chip, diferente da tela "Voluntários" que já mostra. Replicar o
mesmo padrão visual.

### Convite incluir voluntário em vários ministérios

- **Backend: já suporta.** `IgrejaConviteEntity.ministerios` (`igreja-convite.entity.ts:63-69`) é `ManyToMany` com `MinisterioEntity` —
  vazio hoje só cria vínculo com a igreja; preenchido, vincula automaticamente o voluntário aos ministérios ao aceitar o convite.
  Nenhuma mudança de backend necessária.
- **Frontend: falta a UI.** `NovoConviteModal.tsx` não tem nenhum seletor de ministério hoje — precisa adicionar
  `ControlledSearchSelect`/multi-seleção de ministérios no formulário de criação de convite, e enviar no payload já aceito pelo
  backend.

---

## 1. Checklist de Configuração de Escala

**Status (2026-08-21): backend implementado e mergeado na branch de trabalho. Design fechado** (`trfernandes-atelier-explore` Ramo A —
cor, tipografia e componentes aprovados, ver `docs/design-system.md` seção "Checklist de Configuração de Escala"). Falta implementar o
frontend (ver seção 4).

ADR: `docs/adr/0003-checklist-nao-bloqueia-geracao.md` — **avisa, não bloqueia**. Vaga sem candidato elegível já é comportamento
intencional do gerador hoje (permite atribuição manual pelo líder depois).

### Estado atual observado

- Backend não tem endpoint de "o que falta configurar". Gerador (`backend/src/escalas/services/generator/`) recebe DTO já pronto do
  frontend.
- Cadeia de dependência (FKs `nullable: false`): Igreja → Ministério → Função do Ministério (texto livre, sem catálogo em produção) →
  Voluntário vinculado → Voluntário+Função → Evento (independente do Ministério) → Template (opcional).
- `voluntarioId: null` silencioso quando não há candidato elegível (`escala-generator.ts:199-214`, comentário confirma intencional).
- Nenhum onboarding/checklist/wizard existe hoje.

### Backend (implementado 2026-08-19)

- `GET /ministerios/:id/checklist-escala` — `temFuncoes`, `temVoluntariosVinculados`, `temVoluntariosComFuncao`. Calculado ao vivo, sem
  persistir. Gate: quem tem permissão `Escalas:Gerar` no ministério.
- `GET /igrejas/:id/checklist-escala` — agrega todos os Ministérios + `temEventos`. Gate: só Admin da igreja. **Decisão 2026-08-22: não
  vai ser consumido no app** — Checklist é feature só de Líder de Ministério, sem visão agregada de Admin (endpoint fica implementado
  mas sem consumidor).
- `POST /escalas/pre-checagem` — recebe formato parecido `CreateEscalaDto` (`PreCheckagemEscalaDto`, sem `nome`/`criadoPor`), reusa
  `EscalaContext.loadContext()` + `EscalaElegibilidadeService`. Retorna por Evento/Função:
  `{ eventoId, data, funcaoId, funcaoNome, candidatosElegiveis }` (contagem, não lista de nomes).
- `EscalaElegibilidadeService` extraído (`src/escalas/services/escala-elegibilidade.service.ts`) — só `PossuiFuncaoRule` +
  `DisponibilidadeRule`, reusado pela Fase 2.
- Catálogo de Funções sugeridas: **não implementado**, mas **decidido criar** (2026-08-22) — lista de nomes comuns (vocal, guitarra,
  bateria, teclado...) oferecida como sugestão/autocomplete, sem impedir texto livre. Onde vive (constante backend vs frontend) segue
  em aberto.

### Frontend

Estrutura final definida em design (ver seção 4 e `docs/design-system.md`): teaser compacto na listagem de escalas → tela própria
"Checklist" (só Líder de Ministério, sem visão agregada de Admin) → modal de pré-checagem em bottom sheet no botão "Gerar" do
Assistente.

### Em aberto

- Onde vive o catálogo de Funções sugeridas (backend constante vs frontend constante).

---

## 1.5. Dupla Função + Pessoa Avulsa (adicionado 2026-08-19)

Duas melhorias pequenas na atribuição manual de escala, especificadas fora deste grilling (usuário já trouxe decisões prontas,
conferidas contra o código). **Sequenciamento: implementar logo após a Fase 1, antes da Fase 2** — ambas mexem em
`EscalaItemEntity`/`escala-itens.service.ts`, mesmo ponto de conflito já mapeado entre Fase 2 (Substituição/Troca) e Fase 3
(Sobrecarga); fazendo antes, as fases seguintes já nascem em cima da lógica atualizada em vez de reconciliar depois.

### Feature 1: liberar dupla função

- `escala-itens.service.ts:90-101` (`update`): query de conflito hoje ignora função — bloqueia qualquer repetição do mesmo voluntário
  no evento/data, mesmo em função diferente. Adicionar função na comparação: bloqueia só duplicata na MESMA função, libera funções
  diferentes (ex: alguém que canta E toca teclado no mesmo culto).
- Frontend: `AdicionarVoluntarioModal.tsx:73-80` e `SubstituirVoluntarioModal.tsx:83-93` (`alreadyAssignedIds`) fazem o mesmo filtro
  cru no dropdown, ignorando função — ajustar pra só excluir da lista se for a mesma função.

### Feature 2: pessoa avulsa (não cadastrada)

- Nova coluna nullable `nomeAvulso` (texto) em `EscalaItemEntity`, sem entidade própria — não persiste/reaproveita entre escalas (não
  tem autocomplete/histórico, líder retype o nome toda vez).
- `voluntario` (relação) fica `null` quando é avulso; sem checagem de conflito pra avulso (líder decide sozinho, sem regra automática).
- Sem notificação push pro avulso (não tem conta no app) — status ainda existe (`Pendente`/`Confirmado`), só que o líder marca
  manualmente.
- Fora do fluxo de geração automática de escala — só atribuição manual.
- UI: toggle "Pessoa não cadastrada" nos dois modais (`AdicionarVoluntarioModal`, `SubstituirVoluntarioModal`), que troca o
  `FancySearchSelect` por um `TextInput` de nome quando ligado.
- Onde o nome do voluntário aparece hoje (cards, lista de equipe, notificação de líder) precisa de fallback pra `nomeAvulso` quando
  `voluntario` for `null`.

### Design

Mudanças pequenas em componentes/modais que já existem (toggle + ajuste de filtro), não telas novas — não precisa de sessão de design
própria, segue os padrões visuais já estabelecidos nesses modais.

---

## 2. Substituição + Troca de Escala

ADR: `docs/adr/0002-substituicao-gate-duas-etapas.md` — substituto aceita PRIMEIRO, Líder aprova DEPOIS (hoje Líder é notificado direto
na criação, sem consultar o substituto).

### Estado atual observado (importante: frontend já avançou em paralelo, não é mock)

- `EscalaSubstituicaoEntity`, `EscalaSubstituicaoStatusEnum` (`Pendente/Aprovada/Recusada/Cancelada`), controller/service já existem —
  fluxo 100% manual, `substitutoId` obrigatório.
- **Já existe e funciona**: `SubstituicaoModalPage.tsx` (form real, `ControlledSearchSelect` lista voluntários do ministério, exclui
  solicitante) + fluxo completo de aceite/recusa/cancelamento (`SubstituicaoRecebidaCard.tsx`, `RecusarSubstituicaoModal.tsx`,
  `CancelarSubstituicaoModal.tsx`, `SubstituicoesRequestsFrame.tsx`, `SubstituicaoMinisterioCard.tsx` visão Líder).
- Lista de candidatos hoje = todo mundo do ministério, ordem alfabética — **sem filtro de elegibilidade nem ranking por Score de
  Solicitude** (é o que falta).
- **Não existe**: Troca (zero referência no código) — único pedaço 100% novo do frontend, junto com estado `AguardandoAprovacaoLider`
  (backend).
- Arquivo morto/órfão pra apagar: `components/pages/pessoal/escalas/evento/SubstituicaoModal.tsx` (mock antigo, sem referências).

### Backend

- `EscalaSubstituicaoStatusEnum`: novo valor `AguardandoAprovacaoLider` (setado quando substituto aceita). `Pendente` = aguardando
  aceite do substituto agora.
- `EscalaSubstituicaoEntity`: novo campo `substituicaoReciproca: EscalaSubstituicaoEntity | null` (self-reference, define Troca vs
  Substituição simples).
- `GET /escalas/itens/:escalaItemId/candidatos-substituicao` — reusa `EscalaElegibilidadeService` (Fase 1) contra
  `MinisterioVoluntarioEntity` ativos do ministério. Ordena por **Score de Solicitude**:
  `COUNT(EscalaSubstituicaoEntity WHERE substituto=candidato AND status=Aprovada)` desc, all-time, calculado on-the-fly.
- Fluxo: solicitante cria (`Pendente`, notifica substituto — tipo novo) → substituto aceita (`AguardandoAprovacaoLider`, só agora
  notifica Líder) ou recusa (`Recusada`, cascata cancela ponta recíproca se Troca) → Líder aprova (`Aprovada`, realoca no
  `EscalaItemEntity`) ou recusa (`Recusada`, cascata).
- Troca: cria as 2 `EscalaSubstituicaoEntity` numa transação, linkadas. Recusa/cancelamento de uma ponta cancela a outra (checar no
  service de update, não só create).
- Notificações novas: `SubstituicaoSolicitadaAoSubstituto` (substituto escolhido); avisar solicitante do resultado (não decidido se
  desejado); `EscalaTrocaSolicitada`/`EscalaTrocaAprovada` mantidos só pro Líder, disparados pós-aceite.

### Design (definido em atelier 2026-08-08)

- Troca na lista de pedidos: **um card só**, estende `SubstituicaoCardBase.tsx` modo "troca" mostrando as duas pontas (reusa "swap
  bubble" visual existente).
- Criação: no `SubstituicaoModalPage.tsx`, após escolher substituto, toggle "Quero substituir de volta" revela 2º
  `ControlledSearchSelect` com itens do substituto.
- Status novo precisa cor/ícone em `getStatusVisual()` (`SubstituicaoCardBase.tsx`).

### Achado pendente (não implementado, decisão visual em aberto)

Agenda do voluntário (`app/(app)/(drawer)/pessoal/escalas/index.tsx` + `EventoAccordeon.tsx` + `FuncoesTable.tsx`) não mostra origem de
Substituição/Troca depois de aprovada — dado (`substituicaoId`) já existe na API, não é exibido. Ponto certo: `FuncaoRow` em
`FuncoesTable.tsx` (linhas ~60-67), 2ª linha discreta tipo "Substituindo João"/"Troca com João". **Decisão visual não fechada —
perguntar em sessão de design antes de implementar.**

### Em aberto

- Se solicitante é notificado do resultado (provavelmente sim, não confirmado).
- Nome exato de endpoint/enum novos.
- Score de Solicitude sem janela de tempo (all-time) — pode favorecer voluntário mais antigo, revisar.

**Decisão do grilling 2026-08-19**: candidato elegível que nunca foi chamado como substituto (taxa 0/0, indefinida) entra no **topo da
lista**, junto de quem tem 100% de aceite — não penaliza quem nunca teve chance, alinhado com o motivo já registrado no `CONTEXT.md`
pra usar taxa (não contagem bruta) e evitar viés contra voluntário novo.

---

## 3. Sobrecarga de Voluntário ("Saúde")

**Revisão completa em grilling 2026-08-22** — sessão dedicada a explorar o módulo com lente de cuidado pastoral/psicológico (pedido do
usuário: "o app oferece alerta e insights necessários pra um cuidado pelos líderes? o próprio voluntário consegue perceber isso? tá
claro o processo de cálculo?"). Boa parte do desenho original (ADR 0001, atelier 2026-08-08) foi revisada — ver
`docs/adr/0001-sobrecarga-dois-limiares-independentes.md` (revisão completa) e `CONTEXT.md` (seções "Sobrecarga de Voluntário" e
"Feedback pós-Escala").

ADR: **dois eixos independentes por OR**, agora **ponderados** (não mais contagem simples nem score único). O eixo de "ministérios"
deixou de contar vínculo puro — cada ministério pesa proporcional a quanto ele realmente demanda da pessoa, evitando tratar um
ministério fraco igual a um pesado. Isso também absorveu o falso-negativo que o ADR original aceitava (2 ministérios pesados sem cruzar
o limiar de 3 já cruzam pelo peso) — o terceiro sinal combinado que chegou a ser cogitado foi descartado por redundância.

### Backend — eixos de Sobrecarga

- Novo service `voluntario-sobrecarga.service.ts` (módulo `voluntarios-sobrecarga/` ou dentro de `voluntarios/`).
- **Peso de Ministério** = (escalas desse ministério pra essa pessoa, últimos 3 meses) ÷ (média de escalas por ministério na igreja
  inteira, mesmo período). `verificarSobrecarga(voluntarioId, igrejaId)`: soma dos pesos de ministério ≥ **3** OU `EscalaItemEntity`
  últimos 3 meses ≥ **12**. Retorna os dois eixos com seus valores brutos (não só um booleano) — necessário pro drill-down.
- **Tendência**: cada eixo compara o trimestre atual com o trimestre imediatamente anterior — exige guardar (ou recalcular sob demanda)
  os valores do trimestre anterior, não só o atual.
- Persistência de estado (cruzamento false→true e histórico de tendência): entidade separada `VoluntarioSobrecargaEstadoEntity` (não
  sujar `VoluntarioEntity`, alinhado ao padrão de entidades ricas do projeto).
- Trigger: criar/ativar `MinisterioVoluntarioEntity` → recalcula peso. Criar `EscalaItemEntity`/publicar escala → recalcula os dois
  eixos.
- Janela "últimos 3 meses": reusa a convenção já usada em `EscalaContext` (`subMonths(new Date(), 3)`, date-fns).

### Backend — sinais adicionais (independentes, alertam sem depender dos eixos acima)

- **Queda de comparecimento**: `Ausente`/total de `EscalaItemEntity` ≥ ~20% no período — limiar fixo, igual pra todo mundo.
- **Aumento de indisponibilidade**: indisponibilidade declarada no trimestre atual ≥ 2x a média pessoal dos últimos 6 meses (linha de
  base por pessoa, não limiar global).
- **Humor pós-escala**: 2 respostas consecutivas baixas (1-2 de 5) no questionário de humor — ver "Feedback pós-Escala" abaixo.

### Backend — estado de acompanhamento (unifica alerta automático + pedido do voluntário)

- Cada situação sinalizada (por qualquer eixo/sinal acima, ou por pedido do voluntário) vira um registro de "situação em
  acompanhamento" — substitui a decisão anterior de "sem cooldown/debounce" por um modelo mais rico: Líder marca "já tratei", sistema
  para de notificar repetidamente, mas **reabre sozinho se a situação piorar** depois (não é silenciamento permanente).
- `POST /voluntarios/me/sobrecarga/pedir-conversa` — voluntário sinaliza "quero conversar sobre minha carga de serviço", cria uma
  situação em acompanhamento pro Líder do(s) ministério(s) relevante(s).
- Notificações: reusar `TipoNotificacaoEnum.ComunicadoLider` e `SistemaAlertaAdmin` (já reservados). Líder só recebe alerta de
  sobrecarga por dispersão de ministérios se envolve vínculo ativo no ministério dele; Admin sempre recebe visão completa.

### Backend — simetria de dados

- `GET /voluntarios/me/sobrecarga` — decisão revisada: retorna os **mesmos dados completos** que o Líder vê sobre a pessoa (valores dos
  dois eixos, sinais adicionais, drill-down), não mais um indicador genérico. Simetria total entre o que o Líder vê e o que o
  voluntário vê sobre si mesmo.
- Testes: cálculo de peso por ministério, cruzamento por eixo, tendência trimestral, os 3 sinais adicionais isoladamente, ciclo de vida
  do estado de acompanhamento (tratado → reaberto por piora), escopo payload líder vs admin, simetria líder/voluntário.

### Design (revisado em grilling 2026-08-22, ver `docs/design-system.md`)

- Líder/Admin: card em `components/pages/inicio/DashboardKpiGrid.tsx`, agora com tendência (ex: "peso subiu de 1.8 pra 3.2"), sempre
  visível.
- Drill-down do motivo (qual eixo/sinal, com os números) vive no perfil do voluntário em Integrantes, não num modal separado do
  dashboard — um lugar só pra tudo sobre a saúde daquela pessoa.
- Tela "Como funciona a Saúde do Voluntariado" — referência sempre acessível (a partir do card do dashboard e de Integrantes)
  explicando os 5 sinais em linguagem simples, complementando o drill-down por pessoa.
- Insights em Integrantes: visão agregada no topo da lista (contadores separados por tipo de sinal, nunca um número único misturado) +
  visão individual no perfil (seção "Saúde": eixos + tendência + 3 sinais + estado de acompanhamento — **separada** da seção "Scores":
  Solicitude + Serviço, pra não misturar tom de cuidado com tom de avaliação).
- Voluntário: tela Pessoal mostra os mesmos dados do Líder (simetria) + botão "quero conversar sobre minha carga de serviço" (baixa
  fricção, sem formulário).
- Referência visual original: [Burnout Dashboard Concept](https://dribbble.com/shots/18581534-Burnout-Dashboard-Concept) (Nickelfox) —
  ainda vale pro card do dashboard, mas a tela "Como funciona" e os insights de Integrantes são estrutura nova, sem referência externa
  usada.

### Em aberto

- Nome exato módulo/service/entidade.
- Tratamento visual exato do alerta no client (ícone, cor) — fica pra sessão de `trfernandes-atelier-explore` desta feature.
- Fórmula exata de "média de escalas por ministério na igreja" (janela de recalculo, tratamento de igreja muito nova com poucos dados
  históricos) — decidir na implementação.

### Feedback pós-Escala (recriado em grilling 2026-08-22 — ideia do usuário, não estava documentada)

Questionário leve pro voluntário depois que a data de ocorrência de uma Escala passa. Não encontramos registro anterior dessa ideia em
nenhum plano/ADR das duas branches — foi descrita do zero nesta sessão e grillada como feature nova.

**Trigger**: dois canais, não excludentes — notificação push no dia seguinte ao evento, e também aparece na próxima abertura do app
depois da data. Sempre opcional/pulável (ADR 0003).

**Fluxo único, duas seções**:

1. **Humor** — escala de 1-5 (rosto/número) + campo de texto opcional. **Identificado**: Líder vê a resposta de cada ocorrência (não só
   uma média) — é ferramenta de cuidado direto, não pesquisa anônima. Alimenta o sinal de humor descrito acima (2 respostas baixas
   seguidas alertam).
2. **Feedback do serviço** — nota geral (1-5) + campo livre ("como foi pra você hoje?", dicas sobre a condução do ministério).
   **Anônimo pro Líder** (sistema guarda o vínculo internamente, pra moderação de abuso, mas a UI não expõe quem escreveu). Visível pro
   Líder do ministério e pro Admin da igreja.

Pedido de feedback acontece em **toda ocorrência de Escala**, sem limite de frequência — decisão consciente (throttling adicionaria
complexidade sem necessidade real, já que é opcional).

**Backend**: nova entidade (ex: `EscalaFeedbackEntity`), 1:1 com `EscalaItemEntity`, campos separados pra humor (identificado) e
serviço (anônimo na leitura, rastreado na escrita).

**Em aberto**: nome exato de entidade/módulo; se feedback de serviço aparece agregado por Evento (visão "como foi o culto de hoje" pro
Líder) ou só como lista de comentários avulsos — decidir na sessão de design.

**Perguntas customizadas do Líder (adicionado em grilling 2026-08-23, já no MVP)**:

Líder do Ministério pode cadastrar perguntas próprias, que se somam às perguntas fixas da seção "Feedback do serviço" (não é uma
terceira seção) — ex: "qual foi o nível de técnica hoje? (1-10)".

- **Escopo**: por Ministério. Cada Líder cria/edita perguntas só do próprio Ministério; não existe pergunta customizada global de
  Igreja nem edição por Admin.
- **Quem cria/edita**: só o Líder do Ministério — mesmo escopo já usado no Checklist de Configuração de Escala.
- **Tipos suportados**: escala numérica (ex: 1-10), texto livre, e múltipla escolha/sim-não.
- **Alvo da pergunta**: pode ser sobre a própria experiência do respondente ou sobre outra pessoa/o grupo (ex: avaliar o solista, ou
  "como foi a banda hoje?").
- **Anonimato**: segue a regra da seção onde mora — anônima pro Líder na leitura, com vínculo rastreado internamente, igual o resto de
  "Feedback do serviço".
- **Quantidade**: sem limite de perguntas customizadas ativas por Líder.
- **Exibição pro Líder**: agregada por tipo — média ao longo do tempo pra escala numérica, contagem por opção pra múltipla
  escolha/sim-não, lista de respostas pra texto livre.
- **Backend**: nova entidade de definição de pergunta (ex: `EscalaFeedbackPerguntaCustomizadaEntity`, escopada a `MinisterioEntity`) +
  entidade de resposta (1:N com `EscalaFeedbackEntity`, guardando tipo + valor).

### Score de Serviço (adicionado em grilling 2026-08-19, revisado 2026-08-22)

Métrica composta de confiabilidade do voluntário, entregue **junto com esta fase** — vive na seção "Scores" do perfil em Integrantes
(separada da seção "Saúde", ver Design acima).

**Propósito**: métrica informativa pro Líder/Admin, com uso futuro em premiações/reconhecimento (gamificação básica entra já nesta fase
— ver "Premiação" abaixo).

**Fatores v1** (com transparência de cálculo — o Líder vê os 3 fatores separados, não só um número final):

1. **Solicitude** — taxa de aceite quando chamado pra substituir (mesmo cálculo do Score de Solicitude da Fase 2). **Revisão
   2026-08-22: agora também exposto ao Líder como métrica própria** (decisão original dizia "não exposto"; Líder passa a ver o Score de
   Solicitude de cada voluntário diretamente, além do uso interno pra ranquear candidatos na Fase 2).
2. **Comparecimento** — taxa `Confirmado` vs `Ausente` no histórico de `EscalaItemEntity`.
3. **Indisponibilidade** — frequência de indisponibilidades declaradas no período (menos indisponibilidade = melhor).

**Nova capacidade necessária**: hoje `EscalaItemStatusEnum.Ausente` existe no enum mas **nunca é setado em lugar nenhum do código** —
falta a funcionalidade do Líder marcar falta/presença manualmente. Regras:

- Só pode marcar depois que a data do evento já passou.
- Marcar `Ausente` **não notifica o voluntário** — fica só registrado internamente, alimenta o score (e, separadamente, o sinal de
  "queda de comparecimento" da Sobrecarga).

**Escopo**: geral (por igreja, cross-ministério) **e** por ministério — os dois níveis.

**Visibilidade**:

- Líder e Admin veem o score de qualquer voluntário do escopo deles.
- O próprio voluntário vê **só o seu**, nunca o de outros voluntários.

**Premiação**: emblemas/títulos individuais (ex: "O Pontual"), conquistados por cruzar limiares em cada fator — **sem ranking
comparativo** entre voluntários.

### Em aberto (Score de Serviço)

- Nome exato de módulo/service/entidade.
- Limiares exatos pra cada emblema (ex: quantos % de comparecimento pra ganhar "O Pontual") — decidir na sessão de design.
- Lista completa de emblemas/nomes — só "O Pontual" foi citado como exemplo.

### Quiz de vendas — novo slide (adicionado 2026-08-22)

Módulo de Saúde do Voluntariado vira **6º slide** no carrossel de `quiz-vendas-funcionalidades.tsx` (hoje tem 5, ver
`docs/design-system.md`) — adicionado, não substitui nenhum existente, por ser o único diferencial de cuidado emocional/pastoral do
carrossel (os outros 5 são todos logística de escala).

- Categoria: **CUIDADO COM O VOLUNTARIADO**.
- Título: **"Você percebe quando alguém está no limite"**.
- Subtítulo: _"Diakonia avisa o líder quando um voluntário está servindo demais ou dando sinais de cansaço — antes que ele desista."_

---

## 4. Frontend Mobile consolidado

**Adicionado em grilling 2026-08-19** — furo achado na revisão do plano: o documento tinha seções detalhadas pras Fases 1, 2, 3, Painel
Admin e Analytics, mas a Fase 4 (frontend mobile consolidado) só aparecia na lista de ordem, sem seção própria. Consolida aqui as notas
de frontend que já estavam espalhadas nas seções 1-3.

Só começa depois das 3 fases de backend (1, 2, 3) fechadas — telas consomem os três de uma vez, evita retrabalho de integração.

### Checklist de Configuração de Escala (Fase 1)

**Design fechado 2026-08-21** (`trfernandes-atelier-explore` Ramo A completo — cor, tipografia, componentes; ver
`docs/design-system.md`). Estrutura final, revisada durante o design (diferente da descrição original desta seção):

- **Teaser compacto** na listagem de escalas do ministério (substitui o card expansível original) — ícone + frase de status + seta,
  visível só quando o checklist está incompleto, mais item de menu sempre acessível.
- Toque no teaser (ou no item de menu) **navega pra tela própria "Checklist"** — não expande mais in-place. Tela só é alcançável por
  esses dois pontos de entrada (não é destino de menu lateral). Mostra os 3 passos completos (`Step Row`): função cadastrada →
  voluntário vinculado → função atribuída, cada um com cor própria que converge pra esmeralda ao resolver.
- Cadastro de Função: autocomplete/chips com sugestões + campo livre (catálogo ainda em aberto, ver seção 1 "Em aberto").
- `FancyBottomSheetModal` de pré-checagem antes de "Gerar Escala" (revisão de decisão — conceito original previa `FancyModalDialog`,
  usuário preferiu bottom sheet ao comparar as duas na camada de componentes): lista Funções sem candidato, opção "Gerar mesmo assim".
- Cogitou-se replicar o teaser em Início (dashboard) — descartado pelo usuário, fora de escopo desta fase.

### Substituição + Troca (Fase 2)

- Já tem design fechado (atelier 2026-08-08) — ver seção 2 "Design".
- Card único de Troca estendendo `SubstituicaoCardBase.tsx`; toggle "Quero substituir de volta" no modal de criação; cor/ícone novo em
  `getStatusVisual()`.
- Achado pendente ainda sem decisão visual: origem de Substituição/Troca na Agenda do voluntário (`FuncaoRow` em `FuncoesTable.tsx`) —
  perguntar em sessão de design antes de implementar.

### Sobrecarga de Voluntário / Saúde do Voluntariado (Fase 3)

**Revisão completa em grilling 2026-08-22** — ver seção 3 "Design" (substitui a descrição original desta subseção, que ainda refletia
só o design de 2026-08-08):

- Card no `DashboardKpiGrid.tsx` (Líder/Admin), agora com tendência trimestral.
- Drill-down do motivo e insights de saúde vivem no perfil do voluntário em Integrantes (seção "Saúde", separada de "Scores"), não em
  modal separado do dashboard.
- Nova tela "Como funciona a Saúde do Voluntariado", sempre acessível.
- Nova visão agregada no topo de Integrantes (contadores por tipo de sinal).
- Tela Pessoal do voluntário: mesmos dados do líder (simetria) + botão "quero conversar sobre minha carga de serviço".
- Novo fluxo de **Feedback pós-Escala** (humor identificado + feedback de serviço anônimo), tela própria de baixa fricção, exibida após
  cada ocorrência de escala.
- Novo 6º slide no quiz de vendas (`quiz-vendas-funcionalidades.tsx`) — ver seção 3 "Quiz de vendas".

### Em aberto

- Onde vive o catálogo de Funções sugeridas do Checklist (backend vs frontend) — decidir na sessão de design desta fase.

---

## 5. Painel Admin da Plataforma

ADR: `docs/adr/0004-admin-plataforma-usuario-separado.md` — **entidade nova separada** (`AdminPlataformaEntity`), não reusar
`VoluntarioEntity` com flag. Motivo: todo código multi-tenant assume "toda query filtra por igrejaId" (`backend/CLAUDE.md:113-116`);
forçar encaixe espalharia exceção por todo canto.

### Estado atual observado (greenfield)

- Nenhum conceito de admin cross-igreja hoje — só `IgrejaVoluntarioRoleEnum.ADMIN`, escopado a 1 igreja.
- `IgrejaEntity.status: IgrejaStatusEnum` (`PENDENTE_ATIVACAO | ATIVA | SUSPENSA`) já existe mas **`SUSPENSA` é valor morto** — nunca
  setado nem checado. Checagens de status existentes bloqueiam só ENTRAR numa igreja, não login de vínculo já ativo.
- Billing (`backend/src/billing/`) já tem `SubscriptionEntity` completo, mas só por igreja, sem visão agregada.
- Cadastro de igreja é 100% self-service automático (sem aprovação humana).

### Backend

- Novo módulo `admin-plataforma/`: `AdminPlataformaEntity` (email, senha hash, sem igreja). Auth própria (Passport+JWT), guard novo
  `AdminPlataformaAuthGuard` (não reusar `JwtAuthGuard` — sem `igrejaId` no payload). Sem tela de cadastro (usuário único, criado via
  seed/script).
- `GET /admin-plataforma/igrejas` — lista todas com status, subscription, limites.
- `GET /admin-plataforma/metricas` — `mrr` (anual /12), `totalIgrejas`, `totalIgrejasAtivas`, `trialsExpirando` (7 dias).
- `GET /admin-plataforma/igrejas/:id` — detalhe read-only pra suporte/debug.
- `POST /admin-plataforma/igrejas/:id/suspender` / `/reativar` — seta `status`. Corpo exige `motivo` obrigatório (log de auditoria).
- Nova entidade `AdminPlataformaLogEntity`: quem, igreja alvo, ação, motivo, criadoEm. Gravado na mesma transação da ação.
- **Login com 2FA obrigatório** (decisão 2026-08-19, ver abaixo) — TOTP, biblioteca tipo `otplib`.

### Frontend — vive no site público, não em projeto novo (decisão 2026-08-19)

- **Repositório**: `trfernandes/diakonia-public-site` (site estático de `diakonia.app.br`, HTML/CSS/JS puro sem build, deploy
  Cloudflare Pages). Já existe um `/painel/` nesse site, mas é o Painel do Administrador da IGREJA (faturas/assinatura, escopado a 1
  igreja) — **não é o mesmo painel**, e não pode ocupar a mesma rota.
- **Rota**: `/admin` — Next.js dentro do mesmo repositório, publicado como sub-rota com export estático (`next export`), convivendo com
  o resto do site (vanilla, sem build).
- Telas: login (com 2FA); lista Igrejas (filtro status/assinatura); detalhe read-only; dashboard métricas; ação suspender/reativar com
  motivo obrigatório.

**Design fechado 2026-08-22** (`trfernandes-atelier-brief` + `trfernandes-atelier-concept`, achado em auditoria de planejamento — essa
sessão estava marcada como pendente desde 2026-08-19 e nunca tinha rodado; registrado em `docs/design-system.md` do repositório
`diakonia-public-site`, branch `main`):

- Paradigma: nenhuma tabela paginada de igrejas nem dashboard de gráficos como destino padrão (o genérico de admin panel) — destino
  padrão é uma **fila de exceções priorizada por critério objetivo** (suspensão ativa > inadimplência > trial expirando em ≤7 dias >
  sem login de admin da igreja há 30+ dias), que **colapsa pra uma única linha** ("Tudo em rota normal") quando não há nenhuma
  pendência, em vez de tela vazia.
- Elemento-assinatura: **"a fila que evapora"** — a ausência de problemas é comunicada explicitamente como algo verificado, não como
  silêncio/vazio.
- Busca funciona como palette de comando (estilo Cmd+K), não como tela de resultados em lista — único jeito de alcançar uma igreja que
  está "em rota normal" (não apareceria na fila).
- Lista de Igrejas tradicional (browse-all) não é mais o destino padrão pós-login, mas continua existindo como tela secundária
  acessível pro caso raro de navegar tudo.
- Cor/tipografia/componentes reais (`trfernandes-atelier-explore` Ramo A) ficam pra quando for implementar de fato — objetivo desta
  rodada era fechar o planejamento/estrutura, não o visual.

### Em aberto

- Onde exatamente plugar checagem de `status !== SUSPENSA` em `auth/` (investigar na hora) — resolvido _quando_ checar (ver decisão de
  Suspensão abaixo), falta só o _onde_ no código.
- Nome exato módulo/entidades.
- Detalhe de build: como o export estático do Next.js (`/admin`) se integra ao pipeline de deploy do resto do site (que não tem build)
  no Cloudflare Pages.
- **Ponto de atenção cross-cutting**: se alguma fase 1-4 mexer em `auth/` no meio do caminho, revisar conflito com essa checagem antes
  de mergear.

**Decisões do grilling 2026-08-19**:

- **Suspensão não revoga sessão ativa na hora** — só bloqueia login/token novo dali pra frente. JWT de voluntário expira em até 1 dia
  (`expiresIn: '1d'`, `auth.module.ts`); suspensão é ferramenta de moderação, não resposta a incidente de segurança (alinhado com ADR
  0004), 1 dia de tolerância é aceitável e evita checagem de status em todo request autenticado do sistema.
- **2FA obrigatório** pro Admin de Plataforma via **TOTP** (app autenticador) — dado o nível de privilégio (acesso a todas as igrejas,
  ação de suspender), vale o custo de implementar já na primeira versão. Rate-limit de tentativas de login não é suficiente sozinho.
- **Stack: Next.js**, **hosting: Cloudflare Pages** dentro do repositório `diakonia-public-site` (não Render, não projeto novo
  separado) — usuário pediu explicitamente pra painel ficar "junto do site diakonia.app.br".

---

## 6. Analytics

Instalar analytics no Diakonia. Prioridade mais baixa — entra por último, depois de checklist/substituição/sobrecarga/painel admin
fechados.

**Ferramenta decidida: PostHog** (2026-08-17). Comparado contra Mixpanel/Amplitude/Firebase Analytics — self-host + session replay +
feature flags + A/B test no mesmo produto pesou mais que o histórico de confiabilidade (9 incidentes em 6 meses documentados
publicamente, incluindo 1 perda permanente de dado — ver comparativo arquivado). Ponto de atenção pra implementação: não depender de
feature flag do PostHog pra decisão de produção sem fallback, dado histórico de queda.

**Decisão do grilling 2026-08-22** (retomando a pendência de 2026-08-17): **auditar todas as telas do app procurando dado sensível
antes de ligar qualquer coisa do PostHog** — nem eventos entram na Fase 6 até a auditoria estar completa. Mais conservador que a
recomendação original (que sugeria liberar eventos já na Fase 6 e tratar só o replay como sub-decisão separada) — usuário preferiu zero
risco no meio tempo a ganhar velocidade de instrumentação. Auditoria de telas sensíveis vira pré-requisito da Fase 6, não uma
sub-tarefa dentro dela.

### Em aberto

- Escopo: só mobile (`artos_frontend`), ou cobre painel admin web (Fase 5) também.
- Quais eventos rastrear — depende das telas novas das fases 1-5 estarem com design fechado primeiro, pra instrumentar direto no lugar
  certo sem retrabalho.
- Onde plugar (provider no root do app vs por tela) — investigar na hora.
- Escopo exato da auditoria de telas sensíveis (lista de telas a revisar, critério do que conta como "dado sensível") — decidir ao
  iniciar a Fase 6.

---

## Riscos/decisões pendentes gerais (do plano unificado)

- `EscalaElegibilidadeService` é decisão de refactor implícita, não estava em nenhum plano original — confirmar nome/local ao
  implementar Fase 1. ✅ Feito 2026-08-19, ver seção 1.
- Migrations em sequência: cada fase (1-3) deve ter migration própria, testada em staging (`next`) antes da próxima começar, pra isolar
  rollback.
- Se extração do `EscalaElegibilidadeService` mudar decisão de ADR existente, atualizar o ADR correspondente.

---

## Revisão 2026-08-19 (grilling — furos do plano)

Pedido do usuário: revisar o plano atrás de furos, com suspeita confirmada de que UI/design não tinha sido planejada. Achados e
decisões, todos já refletidos nas seções acima — resumo aqui pra rastreabilidade:

1. **UI não planejada** (confirmado): Checklist (Fase 1) e Painel Admin (Fase 5) não tinham sessão de design, diferente de
   Substituição/Troca e Sobrecarga. → Design de ambos roda agora, antes da Fase 2 backend.
2. **Doc sem seção própria pra Frontend Mobile** (Fase 4 só aparecia na lista de ordem). → Seção 4 adicionada, consolidando notas que
   estavam espalhadas nas seções 1-3.
3. **Score de Solicitude com denominador zero** (candidato nunca chamado) não tinha regra de desempate. → Entra no topo, junto de 100%.
4. **Janela "3 meses" da Sobrecarga** sem definição exata (calendário vs rolling), risco dado histórico de bug de timezone no projeto.
   → Reusa `subMonths(now, 3)` já usado em `EscalaContext`.
5. **Alerta de Sobrecarga sem cooldown** — risco de spam em caso de voluntário oscilando no limiar. → Sem cooldown por enquanto,
   cenário raro.
6. **Suspensão de igreja sem definição de revogação de sessão ativa**. → Não revoga na hora, só bloqueia login novo.
7. **Painel Admin sem menção de 2FA/rate-limit**, apesar de ser conta de altíssimo privilégio. → 2FA obrigatório via TOTP.
8. **Painel Admin sem repositório/stack/hosting reais definidos** — durante a rodada, descoberto que já existe
   `trfernandes/diakonia-public-site` (site estático de `diakonia.app.br`) com um `/painel/` que é de outro conceito (Painel do
   Administrador da Igreja, faturas). → Painel Admin da Plataforma vive nesse mesmo repositório, rota `/admin`, Next.js com export
   estático convivendo com o resto do site vanilla, hosting Cloudflare Pages (não Render).

## Revisão 2026-08-19 (parte 2 — grilling do Score de Serviço)

Pedido do usuário: incluir no plano uma métrica de confiabilidade do voluntário (pontualidade, solicitude, indisponibilidade). Grilling
completo, decisões refletidas na seção 3 ("Score de Serviço"). Resumo:

- Nome: **Score de Serviço**.
- Entra junto da Fase 3 (Sobrecarga), sem número de fase próprio.
- Fatores v1: Solicitude (interno, da Fase 2) + Comparecimento (`Confirmado`/`Ausente`) + Indisponibilidade declarada.
- Nova capacidade descoberta como necessária: Líder marcar falta/presença manualmente (não existe hoje — `Ausente` tá no enum mas nunca
  é setado em código nenhum).
- Escopo geral (por igreja) **e** por ministério, os dois.
- Visibilidade: Líder/Admin veem tudo do escopo deles; voluntário vê só o próprio.
- Premiação: emblemas individuais (ex: "O Pontual"), sem ranking comparativo entre voluntários.

### Nota operacional — branches

Descoberto durante a sessão: os repos têm `main` e `master` divergentes (147 commits só em `master`, 51 só em `main`) — `main` parece
órfã/desatualizada, não mexida. Criada branch **`1.2`** em `artos-backend` e `artos-frontend`, a partir de `master`, pra concentrar
todo o trabalho da Versão 2 (backend e frontend) até estar testado — evita que builds locais (`eas build`, sempre manual, rodado a
partir de `master`) peguem código não testado. Merge de `1.2` → `master` só quando a Versão 2 estiver pronta pra lançar.
