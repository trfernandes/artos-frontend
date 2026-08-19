# Plano Versão 2 — Checklist, Sobrecarga (Saúde), Substituição/Troca, Painel Admin, Analytics

Consolidado 2026-08-17 (base: handoff 2026-08-12, arquivado em `docs/plans/archive/`). Fonte: `docs/plans/archive/2026-08-08-*.md` +
`docs/plans/archive/2026-08-09-versao-unificada.md` + `docs/adr/0001-0004.md`. Domínio completo em `CONTEXT.md` (raiz do repo).

Revisado em grilling 2026-08-19 (furos + decisões abaixo, ver seção "Revisão 2026-08-19" ao final).

**Princípio geral**: em toda fase com tela nova/alterada, design de tela primeiro, implementação depois. Não começar código de UI antes
do design estar fechado (mesmo padrão já seguido em Substituição/Troca e Sobrecarga, ver seções "Design" abaixo — aplicar também nas
fases que ainda não têm design fechado: Checklist, Painel Admin, Analytics).

Projeto: Diakonia. Frontend `artos_frontend/` (Expo/React Native). Backend `backend/` (NestJS). Repos git separados.

---

## Ordem de implementação recomendada (ver plano unificado completo)

1. **Fase 1 — Checklist Configuração Escala** (backend). ✅ Backend implementado (`EscalaElegibilidadeService`,
   `EscalaChecklistService`, `EscalaPreCheckagemService` — ver seção 1). Falta design + frontend, ver seção 4.
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

**Decisão do grilling 2026-08-19**: design de tela do Checklist (Fase 1) e do Painel Admin (Fase 5) roda **agora**, antes de seguir pra
Fase 2 backend — ambas ainda não tinham sessão de design (diferente de Substituição/Troca e Sobrecarga, que já têm), furo achado na
revisão do plano.

Pontos de junção reais entre os planos (por isso a ordem, não "qualquer ordem"):

- `PossuiFuncaoRule` + `DisponibilidadeRule` (`backend/src/escalas/services/generator/rules/`) usadas por 3 features: gerador (já
  existe), pré-checagem Checklist, candidatos-elegíveis Substituição.
- `tipo-notificacao.enum.ts` recebe tipos novos de Substituição/Troca (Fase 2) e Sobrecarga (Fase 3) — sequenciar evita conflito de
  merge.
- Gatilho em `EscalaItemEntity` tocado por Sobrecarga (Fase 3) e por realocação de Substituição (Fase 2).

---

## 1. Checklist de Configuração de Escala

**Status (2026-08-19): backend implementado e mergeado na branch de trabalho.** Falta design + frontend (ver seção 4).

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
- `GET /igrejas/:id/checklist-escala` — agrega todos os Ministérios + `temEventos`. Gate: só Admin da igreja.
- `POST /escalas/pre-checagem` — recebe formato parecido `CreateEscalaDto` (`PreCheckagemEscalaDto`, sem `nome`/`criadoPor`), reusa
  `EscalaContext.loadContext()` + `EscalaElegibilidadeService`. Retorna por Evento/Função:
  `{ eventoId, data, funcaoId, funcaoNome, candidatosElegiveis }` (contagem, não lista de nomes).
- `EscalaElegibilidadeService` extraído (`src/escalas/services/escala-elegibilidade.service.ts`) — só `PossuiFuncaoRule` +
  `DisponibilidadeRule`, reusado pela Fase 2.
- Catálogo de Funções sugeridas: **não implementado** — ainda em aberto onde vive, ver abaixo.

### Frontend

- Tela "Configurar Escala" com checklist visual, cada passo linkando pro cadastro correspondente. Visão por Ministério (Líder) e
  agregada (Admin).
- Cadastro de Função: autocomplete/chips com sugestões + campo livre.
- Modal de pré-checagem antes de "Gerar Escala": lista Funções sem candidato, opção "Gerar mesmo assim".

### Em aberto

- Onde vive o catálogo de Funções sugeridas (backend constante vs frontend constante) — decidir na sessão de design agendada agora (ver
  "Revisão 2026-08-19").

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

ADR: `docs/adr/0001-sobrecarga-dois-limiares-independentes.md` — **dois limiares independentes por OR**, não score ponderado (peso
arbitrário difícil de justificar/explicar pro usuário). Trade-off aceito: falso-negativo possível (ex: 2 ministérios + 11 escalas,
ambos abaixo do limiar individual).

### Backend

- Novo service `voluntario-sobrecarga.service.ts` (módulo `voluntarios-sobrecarga/` ou dentro de `voluntarios/`).
- `verificarSobrecarga(voluntarioId, igrejaId)`: conta `MinisterioVoluntarioEntity` ativo (limiar **3**) OU conta `EscalaItemEntity`
  últimos 3 meses (limiar **12**). Retorna `{ sobrecarregado, porMinisterios, porEscalas }`.
- Persistência de estado pra saber cruzamento (false→true): campo `sobrecarregadoDesde: Date | null` — preferir entidade separada
  `VoluntarioSobrecargaEstadoEntity` (não sujar `VoluntarioEntity`, alinhado ao padrão de entidades ricas do projeto).
- Trigger: criar/ativar `MinisterioVoluntarioEntity` → checa limiar ministérios. Criar `EscalaItemEntity`/publicar escala → checa
  limiar escalas.
- Cruzou pra sobrecarregado=true → dispara alerta + persiste. Caiu abaixo → zera estado, sem notificação de "resolvido" (fora de
  escopo).
- Notificações: reusar `TipoNotificacaoEnum.ComunicadoLider` e `SistemaAlertaAdmin` (já reservados, não usados). Payload Líder:
  genérico, sem nomear outros ministérios (`sinalizaOutrosMinisterios: boolean`). Payload Admin: completo. Líder só recebe se
  sobrecarga envolve vínculo ativo no ministério dele; Admin sempre.
- `GET /voluntarios/me/sobrecarga` — estado + contadores pro indicador pessoal.
- Testes: cruzamento por ministério, por escala, não-duplicação, recruzamento pós-queda, escopo payload líder vs admin.

### Design (definido em atelier 2026-08-08)

- Líder/Admin: novo card em `components/pages/inicio/DashboardKpiGrid.tsx` (mesmo padrão dos cards existentes), sempre visível, sem
  tela dedicada nova.
- Voluntário: aviso discreto na tela Pessoal/Perfil, só renderiza se o próprio estiver sobrecarregado, sem botão de ação (confirmado em
  grilling).
- Referência visual: [Burnout Dashboard Concept](https://dribbble.com/shots/18581534-Burnout-Dashboard-Concept) (Nickelfox).

### Em aberto

- Nome exato módulo/service.
- Campo em `VoluntarioEntity` vs entidade separada (recomendação: separada).
- Tratamento visual do alerta no client (ícone, cor, tela destino).

**Decisões do grilling 2026-08-19**:

- Janela "últimos 3 meses": reusa a mesma convenção já usada em `EscalaContext` (`subMonths(new Date(), 3)`, date-fns) — não redefinir
  como "3 meses calendário", evita duas definições de "recente" coexistindo no sistema.
- Alerta repetido (voluntário oscilando perto do limiar): **sem cooldown/debounce** por enquanto — cenário raro na prática, não vale a
  complexidade extra de rastrear "quando foi o último alerta".

### Score de Serviço (adicionado em grilling 2026-08-19)

Métrica composta de confiabilidade do voluntário, entregue **junto com esta fase** (sem número de fase próprio) — compartilha
superfície de UI com a Sobrecarga (dashboard do líder) e reusa o Score de Solicitude da Fase 2.

**Propósito**: métrica informativa pro Líder/Admin, com uso futuro em premiações/reconhecimento (gamificação básica entra já nesta fase
— ver "Premiação" abaixo; qualquer coisa além de emblema individual fica pra depois).

**Fatores v1** (fechados, com transparência de cálculo — o Líder precisa ver os 3 fatores separados, não só um número final, pra
entender como o score foi composto):

1. **Solicitude** — taxa de aceite quando chamado pra substituir (mesmo cálculo do Score de Solicitude da Fase 2). Internamente reusado
   aqui; **não é exposto como métrica própria pro usuário** — só existe pra ranquear candidatos a substituto (Fase 2) e como componente
   deste score.
2. **Comparecimento** — taxa `Confirmado` vs `Ausente` no histórico de `EscalaItemEntity`.
3. **Indisponibilidade** — frequência de indisponibilidades declaradas no período (menos indisponibilidade = melhor).

**Nova capacidade necessária**: hoje `EscalaItemStatusEnum.Ausente` existe no enum mas **nunca é setado em lugar nenhum do código** —
falta a funcionalidade do Líder marcar falta/presença manualmente. Regras:

- Só pode marcar depois que a data do evento já passou (não faz sentido marcar presença de evento futuro).
- Marcar `Ausente` **não notifica o voluntário** — fica só registrado internamente, alimenta o score.

**Escopo**: geral (por igreja, cross-ministério) **e** por ministério — os dois níveis, não um ou outro.

**Visibilidade**:

- Líder e Admin veem o score de qualquer voluntário do escopo deles (geral pro Admin, do próprio ministério pro Líder).
- O próprio voluntário vê **só o seu**, nunca o de outros voluntários.

**Premiação**: emblemas/títulos individuais (ex: "O Pontual"), conquistados por cruzar limiares em cada fator — **sem ranking
comparativo** entre voluntários (ninguém vê a posição de outro, só os próprios emblemas). Alinhado com a visibilidade acima.

### Em aberto (Score de Serviço)

- Nome exato de módulo/service/entidade.
- Limiares exatos pra cada emblema (ex: quantos % de comparecimento pra ganhar "O Pontual") — decidir na sessão de design.
- Lista completa de emblemas/nomes — só "O Pontual" foi citado como exemplo, resto fica pra sessão de design.
- Se falta/presença marcada gera algum tipo de trigger pro Score de Sobrecarga (ex: muitas faltas também deveriam sinalizar "saúde" do
  voluntário?) — não discutido, revisar ao implementar.

---

## 4. Frontend Mobile consolidado

**Adicionado em grilling 2026-08-19** — furo achado na revisão do plano: o documento tinha seções detalhadas pras Fases 1, 2, 3, Painel
Admin e Analytics, mas a Fase 4 (frontend mobile consolidado) só aparecia na lista de ordem, sem seção própria. Consolida aqui as notas
de frontend que já estavam espalhadas nas seções 1-3.

Só começa depois das 3 fases de backend (1, 2, 3) fechadas — telas consomem os três de uma vez, evita retrabalho de integração.

### Checklist de Configuração de Escala (Fase 1)

- Tela "Configurar Escala" com checklist visual, cada passo linkando pro cadastro correspondente. Visão por Ministério (Líder) e
  agregada (Admin).
- Cadastro de Função: autocomplete/chips com sugestões + campo livre.
- Modal de pré-checagem antes de "Gerar Escala": lista Funções sem candidato, opção "Gerar mesmo assim".
- Design roda **antes** desta fase (decisão 2026-08-19, ver ordem de implementação) — via `trfernandes-atelier`, estendendo o design
  system já existente (não é produto novo).

### Substituição + Troca (Fase 2)

- Já tem design fechado (atelier 2026-08-08) — ver seção 2 "Design".
- Card único de Troca estendendo `SubstituicaoCardBase.tsx`; toggle "Quero substituir de volta" no modal de criação; cor/ícone novo em
  `getStatusVisual()`.
- Achado pendente ainda sem decisão visual: origem de Substituição/Troca na Agenda do voluntário (`FuncaoRow` em `FuncoesTable.tsx`) —
  perguntar em sessão de design antes de implementar.

### Sobrecarga de Voluntário (Fase 3)

- Já tem design fechado (atelier 2026-08-08) — ver seção 3 "Design".
- Card no `DashboardKpiGrid.tsx` (Líder/Admin); aviso discreto na tela Pessoal (só o próprio voluntário sobrecarregado, sem botão de
  ação).

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

### Em aberto

- Escopo: só mobile (`artos_frontend`), ou cobre painel admin web (Fase 5) também.
- **Grilling 2026-08-17 (pendente)**: session replay do PostHog captura tela inteira por padrão, risco LGPD se alguma tela mostrar dado
  sensível (ex: criança do Ministério infantil, contato de Voluntário). Opções levantadas: (1) auditar telas antes de ligar replay, (2)
  ligar só evento na Fase 6 e tratar replay como sub-decisão separada depois de auditoria, (3) não usar replay. Recomendação dada:
  opção 2. Retomar essa pergunta na próxima sessão de grilling.
- Quais eventos rastrear — depende das telas novas das fases 1-5 estarem com design fechado primeiro, pra instrumentar direto no lugar
  certo sem retrabalho.
- Onde plugar (provider no root do app vs por tela) — investigar na hora.

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
