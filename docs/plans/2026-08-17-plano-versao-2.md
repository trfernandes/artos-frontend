# Plano Versão 2 — Checklist, Sobrecarga (Saúde), Substituição/Troca, Painel Admin, Analytics

Consolidado 2026-08-17 (base: handoff 2026-08-12, arquivado em `docs/plans/archive/`). Fonte: `docs/plans/archive/2026-08-08-*.md` + `docs/plans/archive/2026-08-09-versao-unificada.md` + `docs/adr/0001-0004.md`. Domínio completo em `CONTEXT.md` (raiz do repo).

**Princípio geral**: em toda fase com tela nova/alterada, design de tela primeiro, implementação depois. Não começar código de UI antes do design estar fechado (mesmo padrão já seguido em Substituição/Troca e Sobrecarga, ver seções "Design" abaixo — aplicar também nas fases que ainda não têm design fechado: Checklist, Painel Admin, Analytics).

Projeto: Diakonia. Frontend `artos_frontend/` (Expo/React Native). Backend `backend/` (NestJS). Repos git separados.

---

## Ordem de implementação recomendada (ver plano unificado completo)

1. **Fase 1 — Checklist Configuração Escala** (backend). Menor risco, extrai regra de elegibilidade compartilhada (`EscalaElegibilidadeService`, ainda não existe — decisão implícita do plano unificado).
2. **Fase 2 — Substituição + Troca** (backend). Reusa `EscalaElegibilidadeService` da Fase 1.
3. **Fase 3 — Sobrecarga de Voluntário / "Saúde"** (backend). Depois da Fase 2 pra não conflitar no mesmo enum de notificação e no gatilho de `EscalaItemEntity`.
4. **Fase 4 — Frontend mobile**, consolidado, só depois das 3 fases de backend fechadas.
5. **Fase 5 — Painel Admin da Plataforma**. Sem overlap, pode rodar em paralelo/qualquer momento. Único ponto de atenção: mexe em `auth/` (checagem de Igreja suspensa).
6. **Fase 6 — Analytics**. Depois de todas as outras (última prioridade). Design de telas das fases 1-5 continua/fecha antes da implementação de analytics começar — instalar analytics faz mais sentido com as telas novas já definidas, evita re-instrumentar depois.

Pontos de junção reais entre os planos (por isso a ordem, não "qualquer ordem"):
- `PossuiFuncaoRule` + `DisponibilidadeRule` (`backend/src/escalas/services/generator/rules/`) usadas por 3 features: gerador (já existe), pré-checagem Checklist, candidatos-elegíveis Substituição.
- `tipo-notificacao.enum.ts` recebe tipos novos de Substituição/Troca (Fase 2) e Sobrecarga (Fase 3) — sequenciar evita conflito de merge.
- Gatilho em `EscalaItemEntity` tocado por Sobrecarga (Fase 3) e por realocação de Substituição (Fase 2).

---

## 1. Checklist de Configuração de Escala

ADR: `docs/adr/0003-checklist-nao-bloqueia-geracao.md` — **avisa, não bloqueia**. Vaga sem candidato elegível já é comportamento intencional do gerador hoje (permite atribuição manual pelo líder depois).

### Estado atual observado
- Backend não tem endpoint de "o que falta configurar". Gerador (`backend/src/escalas/services/generator/`) recebe DTO já pronto do frontend.
- Cadeia de dependência (FKs `nullable: false`): Igreja → Ministério → Função do Ministério (texto livre, sem catálogo em produção) → Voluntário vinculado → Voluntário+Função → Evento (independente do Ministério) → Template (opcional).
- `voluntarioId: null` silencioso quando não há candidato elegível (`escala-generator.ts:199-214`, comentário confirma intencional).
- Nenhum onboarding/checklist/wizard existe hoje.

### Backend
- `GET /ministerios/:id/checklist-escala` — `temFuncoes`, `temVoluntariosVinculados`, `temVoluntariosComFuncao`. Calculado ao vivo, sem persistir.
- `GET /igrejas/:id/checklist-escala` — agrega todos os Ministérios + `temEventos`. Gate: só `FULL_PERMISSION_SET` (Admin), reusar `MinisterioAcessosService`.
- `POST /escalas/pre-checagem` — recebe formato parecido `CreateEscalaDto`, reusa `EscalaContext.loadContext()` + regras de elegibilidade (só a fase de elegibilidade, não gera de fato). Retorna por Evento/Função: `{ funcaoId, funcaoNome, eventoId, data, candidatosElegiveis }`.
- Catálogo de Funções sugeridas: constante fixa (vocal, guitarra, baixo, bateria, teclado, mídia, infantil, recepção etc, baseado em `ministerio-funcoes.seeder.ts` de dev) — decidir backend vs frontend na hora.
- **Extrair `EscalaElegibilidadeService`** nesta fase (decisão do plano unificado, não estava nos originais) — vai ser reusado pela Fase 2.

### Frontend
- Tela "Configurar Escala" com checklist visual, cada passo linkando pro cadastro correspondente. Visão por Ministério (Líder) e agregada (Admin).
- Cadastro de Função: autocomplete/chips com sugestões + campo livre.
- Modal de pré-checagem antes de "Gerar Escala": lista Funções sem candidato, opção "Gerar mesmo assim".

### Em aberto
- Se Líder pode cadastrar Evento (RBAC não confirmado) — afeta onde aparece o passo "Evento".
- Nome exato dos endpoints.
- Onde vive o catálogo de Funções sugeridas.

---

## 2. Substituição + Troca de Escala

ADR: `docs/adr/0002-substituicao-gate-duas-etapas.md` — substituto aceita PRIMEIRO, Líder aprova DEPOIS (hoje Líder é notificado direto na criação, sem consultar o substituto).

### Estado atual observado (importante: frontend já avançou em paralelo, não é mock)
- `EscalaSubstituicaoEntity`, `EscalaSubstituicaoStatusEnum` (`Pendente/Aprovada/Recusada/Cancelada`), controller/service já existem — fluxo 100% manual, `substitutoId` obrigatório.
- **Já existe e funciona**: `SubstituicaoModalPage.tsx` (form real, `ControlledSearchSelect` lista voluntários do ministério, exclui solicitante) + fluxo completo de aceite/recusa/cancelamento (`SubstituicaoRecebidaCard.tsx`, `RecusarSubstituicaoModal.tsx`, `CancelarSubstituicaoModal.tsx`, `SubstituicoesRequestsFrame.tsx`, `SubstituicaoMinisterioCard.tsx` visão Líder).
- Lista de candidatos hoje = todo mundo do ministério, ordem alfabética — **sem filtro de elegibilidade nem ranking por Score de Solicitude** (é o que falta).
- **Não existe**: Troca (zero referência no código) — único pedaço 100% novo do frontend, junto com estado `AguardandoAprovacaoLider` (backend).
- Arquivo morto/órfão pra apagar: `components/pages/pessoal/escalas/evento/SubstituicaoModal.tsx` (mock antigo, sem referências).

### Backend
- `EscalaSubstituicaoStatusEnum`: novo valor `AguardandoAprovacaoLider` (setado quando substituto aceita). `Pendente` = aguardando aceite do substituto agora.
- `EscalaSubstituicaoEntity`: novo campo `substituicaoReciproca: EscalaSubstituicaoEntity | null` (self-reference, define Troca vs Substituição simples).
- `GET /escalas/itens/:escalaItemId/candidatos-substituicao` — reusa `EscalaElegibilidadeService` (Fase 1) contra `MinisterioVoluntarioEntity` ativos do ministério. Ordena por **Score de Solicitude**: `COUNT(EscalaSubstituicaoEntity WHERE substituto=candidato AND status=Aprovada)` desc, all-time, calculado on-the-fly.
- Fluxo: solicitante cria (`Pendente`, notifica substituto — tipo novo) → substituto aceita (`AguardandoAprovacaoLider`, só agora notifica Líder) ou recusa (`Recusada`, cascata cancela ponta recíproca se Troca) → Líder aprova (`Aprovada`, realoca no `EscalaItemEntity`) ou recusa (`Recusada`, cascata).
- Troca: cria as 2 `EscalaSubstituicaoEntity` numa transação, linkadas. Recusa/cancelamento de uma ponta cancela a outra (checar no service de update, não só create).
- Notificações novas: `SubstituicaoSolicitadaAoSubstituto` (substituto escolhido); avisar solicitante do resultado (não decidido se desejado); `EscalaTrocaSolicitada`/`EscalaTrocaAprovada` mantidos só pro Líder, disparados pós-aceite.

### Design (definido em atelier 2026-08-08)
- Troca na lista de pedidos: **um card só**, estende `SubstituicaoCardBase.tsx` modo "troca" mostrando as duas pontas (reusa "swap bubble" visual existente).
- Criação: no `SubstituicaoModalPage.tsx`, após escolher substituto, toggle "Quero substituir de volta" revela 2º `ControlledSearchSelect` com itens do substituto.
- Status novo precisa cor/ícone em `getStatusVisual()` (`SubstituicaoCardBase.tsx`).

### Achado pendente (não implementado, decisão visual em aberto)
Agenda do voluntário (`app/(app)/(drawer)/pessoal/escalas/index.tsx` + `EventoAccordeon.tsx` + `FuncoesTable.tsx`) não mostra origem de Substituição/Troca depois de aprovada — dado (`substituicaoId`) já existe na API, não é exibido. Ponto certo: `FuncaoRow` em `FuncoesTable.tsx` (linhas ~60-67), 2ª linha discreta tipo "Substituindo João"/"Troca com João". **Decisão visual não fechada — perguntar em sessão de design antes de implementar.**

### Em aberto
- Se solicitante é notificado do resultado (provavelmente sim, não confirmado).
- Nome exato de endpoint/enum novos.
- Score de Solicitude sem janela de tempo (all-time) — pode favorecer voluntário mais antigo, revisar.

---

## 3. Sobrecarga de Voluntário ("Saúde")

ADR: `docs/adr/0001-sobrecarga-dois-limiares-independentes.md` — **dois limiares independentes por OR**, não score ponderado (peso arbitrário difícil de justificar/explicar pro usuário). Trade-off aceito: falso-negativo possível (ex: 2 ministérios + 11 escalas, ambos abaixo do limiar individual).

### Backend
- Novo service `voluntario-sobrecarga.service.ts` (módulo `voluntarios-sobrecarga/` ou dentro de `voluntarios/`).
- `verificarSobrecarga(voluntarioId, igrejaId)`: conta `MinisterioVoluntarioEntity` ativo (limiar **3**) OU conta `EscalaItemEntity` últimos 3 meses (limiar **12**). Retorna `{ sobrecarregado, porMinisterios, porEscalas }`.
- Persistência de estado pra saber cruzamento (false→true): campo `sobrecarregadoDesde: Date | null` — preferir entidade separada `VoluntarioSobrecargaEstadoEntity` (não sujar `VoluntarioEntity`, alinhado ao padrão de entidades ricas do projeto).
- Trigger: criar/ativar `MinisterioVoluntarioEntity` → checa limiar ministérios. Criar `EscalaItemEntity`/publicar escala → checa limiar escalas.
- Cruzou pra sobrecarregado=true → dispara alerta + persiste. Caiu abaixo → zera estado, sem notificação de "resolvido" (fora de escopo).
- Notificações: reusar `TipoNotificacaoEnum.ComunicadoLider` e `SistemaAlertaAdmin` (já reservados, não usados). Payload Líder: genérico, sem nomear outros ministérios (`sinalizaOutrosMinisterios: boolean`). Payload Admin: completo. Líder só recebe se sobrecarga envolve vínculo ativo no ministério dele; Admin sempre.
- `GET /voluntarios/me/sobrecarga` — estado + contadores pro indicador pessoal.
- Testes: cruzamento por ministério, por escala, não-duplicação, recruzamento pós-queda, escopo payload líder vs admin.

### Design (definido em atelier 2026-08-08)
- Líder/Admin: novo card em `components/pages/inicio/DashboardKpiGrid.tsx` (mesmo padrão dos cards existentes), sempre visível, sem tela dedicada nova.
- Voluntário: aviso discreto na tela Pessoal/Perfil, só renderiza se o próprio estiver sobrecarregado, sem botão de ação (confirmado em grilling).
- Referência visual: [Burnout Dashboard Concept](https://dribbble.com/shots/18581534-Burnout-Dashboard-Concept) (Nickelfox).

### Em aberto
- Nome exato módulo/service.
- Campo em `VoluntarioEntity` vs entidade separada (recomendação: separada).
- Tratamento visual do alerta no client (ícone, cor, tela destino).

---

## 4. Painel Admin da Plataforma

ADR: `docs/adr/0004-admin-plataforma-usuario-separado.md` — **entidade nova separada** (`AdminPlataformaEntity`), não reusar `VoluntarioEntity` com flag. Motivo: todo código multi-tenant assume "toda query filtra por igrejaId" (`backend/CLAUDE.md:113-116`); forçar encaixe espalharia exceção por todo canto.

### Estado atual observado (greenfield)
- Nenhum conceito de admin cross-igreja hoje — só `IgrejaVoluntarioRoleEnum.ADMIN`, escopado a 1 igreja.
- `IgrejaEntity.status: IgrejaStatusEnum` (`PENDENTE_ATIVACAO | ATIVA | SUSPENSA`) já existe mas **`SUSPENSA` é valor morto** — nunca setado nem checado. Checagens de status existentes bloqueiam só ENTRAR numa igreja, não login de vínculo já ativo.
- Billing (`backend/src/billing/`) já tem `SubscriptionEntity` completo, mas só por igreja, sem visão agregada.
- Cadastro de igreja é 100% self-service automático (sem aprovação humana).

### Backend
- Novo módulo `admin-plataforma/`: `AdminPlataformaEntity` (email, senha hash, sem igreja). Auth própria (Passport+JWT), guard novo `AdminPlataformaAuthGuard` (não reusar `JwtAuthGuard` — sem `igrejaId` no payload). Sem tela de cadastro (usuário único, criado via seed/script).
- `GET /admin-plataforma/igrejas` — lista todas com status, subscription, limites.
- `GET /admin-plataforma/metricas` — `mrr` (anual /12), `totalIgrejas`, `totalIgrejasAtivas`, `trialsExpirando` (7 dias).
- `GET /admin-plataforma/igrejas/:id` — detalhe read-only pra suporte/debug.
- `POST /admin-plataforma/igrejas/:id/suspender` / `/reativar` — seta `status`. **Precisa adicionar checagem de status na auth de voluntário** (não existe hoje) — investigar onde contexto de Igreja é resolvido por request em `auth/` na hora de implementar. Corpo exige `motivo` obrigatório (log de auditoria).
- Nova entidade `AdminPlataformaLogEntity`: quem, igreja alvo, ação, motivo, criadoEm. Gravado na mesma transação da ação.

### Frontend — painel web separado
- Projeto novo fora de `artos_frontend` (que é só mobile). Stack não decidida (provável Next.js/React).
- Telas: login; lista Igrejas (filtro status/assinatura); detalhe read-only; dashboard métricas; ação suspender/reativar com motivo obrigatório.

### Em aberto
- Onde exatamente plugar checagem de `status !== SUSPENSA` em `auth/` (investigar na hora).
- Stack do painel web.
- Nome exato módulo/entidades.
- **Ponto de atenção cross-cutting**: se alguma fase 1-4 mexer em `auth/` no meio do caminho, revisar conflito com essa checagem antes de mergear.

---

## 6. Analytics

Instalar analytics no Diakonia. Prioridade mais baixa — entra por último, depois de checklist/substituição/sobrecarga/painel admin fechados.

**Ferramenta decidida: PostHog** (2026-08-17). Comparado contra Mixpanel/Amplitude/Firebase Analytics — self-host + session replay + feature flags + A/B test no mesmo produto pesou mais que o histórico de confiabilidade (9 incidentes em 6 meses documentados publicamente, incluindo 1 perda permanente de dado — ver comparativo arquivado). Ponto de atenção pra implementação: não depender de feature flag do PostHog pra decisão de produção sem fallback, dado histórico de queda.

### Em aberto
- Escopo: só mobile (`artos_frontend`), ou cobre painel admin web (Fase 5) também.
- **Grilling 2026-08-17 (pendente)**: session replay do PostHog captura tela inteira por padrão, risco LGPD se alguma tela mostrar dado sensível (ex: criança do Ministério infantil, contato de Voluntário). Opções levantadas: (1) auditar telas antes de ligar replay, (2) ligar só evento na Fase 6 e tratar replay como sub-decisão separada depois de auditoria, (3) não usar replay. Recomendação dada: opção 2. Retomar essa pergunta na próxima sessão de grilling.
- Quais eventos rastrear — depende das telas novas das fases 1-5 estarem com design fechado primeiro, pra instrumentar direto no lugar certo sem retrabalho.
- Onde plugar (provider no root do app vs por tela) — investigar na hora.

---

## Riscos/decisões pendentes gerais (do plano unificado)

- `EscalaElegibilidadeService` é decisão de refactor implícita, não estava em nenhum plano original — confirmar nome/local ao implementar Fase 1.
- Migrations em sequência: cada fase (1-3) deve ter migration própria, testada em staging (`next`) antes da próxima começar, pra isolar rollback.
- Se extração do `EscalaElegibilidadeService` mudar decisão de ADR existente, atualizar o ADR correspondente.
