# Pacotão de mudanças — Rastreabilidade, Banner de conectividade, Evento.tipo

Consolidado 2026-08-25, a partir de grilling de um lote de 10 itens vindos de notas de app
("Novas mudanças — DIAKONIA"). Fora do escopo de `docs/plans/2026-08-17-plano-versao-2.md` (que é a
epic Checklist/Substituição/Sobrecarga/Painel Admin/Site institucional, branch `1.2`) — estes são
itens cross-cutting, planejados e lançados junto com o resto do trabalho já feito nesta sessão
(Dupla Função + Pessoa Avulsa, commit `093cec5`/`b2126c5`).

Projeto: Diakonia. Frontend `artos-frontend/` (Expo/React Native). Backend `artos-backend/`
(NestJS). Repos git separados.

**Branches**: `staging` (backend) + `claude/dazzling-darwin-y7uflx` (frontend) — mesmas branches
ativas usadas pra Dupla Função/Pessoa Avulsa nesta sessão. Sem branch nova — pacote único, lançado
junto.

---

## Resultado do grilling — mapa completo do lote de 10 itens

| # | Item | Decisão |
|---|---|---|
| 1 | Rastreabilidade | Qualquer edição sensível de escalas/ministérios/config/vínculos. Admin vê tudo, Líder vê do próprio ministério. **Neste pacote** (seção 1). |
| 2 | Tocar música (YouTube/Spotify) no picker | Já implementado em sessão anterior (`MusicListenButton`/`YoutubePlayerSheet`, commit `8822363`/`ef24b27`). **Fechado, sem trabalho.** |
| 3 | Banner "servidor off" (falso positivo) | Fix de 3 partes: failure threshold + startup probe + estado neutro intermediário. **Neste pacote** (seção 2). |
| 4 | Layout de música no picker (etiquetas/frequência) | **Descartado** — não entra neste pacote nem depois, a pedido do usuário. |
| 5 | Tela de Perfil (redesign) | **Spin-off** — sessão própria de design (`trfernandes-atelier-brief`/`concept`/`explore`) depois deste pacote. Usuário não sabe exatamente o que está errado, só que "está errado" — precisa de sessão de design dedicada, não cabe em grilling de bug list. |
| 6 | Chip "Auto" em Setlist | **Descartado** — não entra neste pacote nem depois, a pedido do usuário. |
| 7 | Ministério "reuniões" / Louvor "ensaios extras" → `Evento.tipo` | Novo campo `tipo` (Culto/Reunião/Ensaio). Reunião e Ensaio: sem geração automática de escala, sem Escala/equipe, sem Setlist. **Neste pacote** (seção 3). |

---

## 1. Rastreabilidade (log de auditoria)

### Estado atual observado

Não existe nenhuma persistência de auditoria hoje. `CONTEXT.md` (seção Painel Admin) menciona
"Toda Suspensão gera entrada de log de auditoria" mas é intenção declarada sem implementação — não
há entidade, service, nem controller. O único "auditoria" que existe no código é o array em memória
retornado por `GeradorDeEscalas.executar()` (avaliação de regras por candidato durante geração
automática) — não persiste, não é sobre ações administrativas, e não tem relação com este item.

Autenticação: `req.user` = `{ id, sub, email }` (JWT `sub` = voluntarioId). Sem `@CurrentUser`
decorator — padrão do repo é `@Req() req: any` + `req.user.id` direto no controller, repassado como
parâmetro pro service (ex: `escala.controller.ts:24`
`this.escalasService.gerarEscala(dto, req.user.id)`). `igrejaId` não vem do token — é resolvido por
request a partir do recurso alvo.

### Escopo (decidido em grilling)

- **O que gera log**: qualquer edição sensível de Escalas, Ministérios, Configurações de Igreja, e
  Vínculos (Voluntário-Ministério).
- **Quem vê**: Admin da Igreja vê tudo (cross-Ministério); Líder vê só do próprio Ministério.

### Backend

Novo módulo `src/audit-log/`:

```
audit-log/
├── entities/audit-log.entity.ts
├── enums/audit-log-acao.enum.ts
├── dtos/response-audit-log.dto.ts
├── audit-log.service.ts
├── audit-log.controller.ts
└── audit-log.module.ts
```

**`AuditLogEntity`** (estende `BaseEntity`, ganha `id`/`createdAt`/`updatedAt` — `createdAt` é o
timestamp do evento, não precisamos de coluna própria):

```typescript
@Entity('audit_logs')
@Index(['igreja', 'createdAt'])
@Index(['ministerio', 'createdAt'])
export class AuditLogEntity extends BaseEntity {
  @ManyToOne(() => IgrejaEntity, { nullable: false, onDelete: 'CASCADE' })
  igreja: IgrejaEntity;

  @RelationId((log: AuditLogEntity) => log.igreja)
  igrejaId: string;

  // Nullable: algumas ações (ex: configuração de Igreja) não são escopadas a um Ministério.
  @ManyToOne(() => MinisterioEntity, { nullable: true, onDelete: 'CASCADE' })
  ministerio?: MinisterioEntity;

  @RelationId((log: AuditLogEntity) => log.ministerio)
  ministerioId?: string;

  @ManyToOne(() => VoluntarioEntity, { nullable: false, onDelete: 'CASCADE' })
  autor: VoluntarioEntity;

  @RelationId((log: AuditLogEntity) => log.autor)
  autorId: string;

  @Column({ type: 'enum', enum: AuditLogAcaoEnum })
  acao: AuditLogAcaoEnum;

  // Nome da entidade de domínio afetada (ex: 'EscalaItem', 'Ministerio', 'MinisterioVoluntario',
  // 'Igreja'). String livre em vez de enum — evita migration toda vez que um novo tipo de ação
  // sensível é instrumentado.
  @Column({ type: 'varchar', length: 100 })
  entidade: string;

  @Column({ type: 'uuid', nullable: true })
  entidadeId?: string;

  // Resumo pronto pra exibir na UI (ex: "Alterou função de João Silva de Vocal para Guitarra").
  // Montado no momento do registro, não recalculado na leitura — evita join pesado toda vez que a
  // lista é exibida.
  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'jsonb', nullable: true })
  dadosAntes?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  dadosDepois?: Record<string, unknown>;
}
```

`AuditLogAcaoEnum`: `CRIACAO | EDICAO | EXCLUSAO`.

**`AuditLogService.registrar(params)`**: método único de escrita, fire-and-forget na prática (chamado
de dentro de outros services após a operação principal confirmar). Não deve fazer a operação
principal falhar se o log falhar — logar erro e seguir (é rastreabilidade auxiliar, não é
requisito de consistência transacional forte).

**Pontos de instrumentação (Fase 1 deste pacote — expandir depois conforme necessidade, não é
lista fechada pra sempre)**:

- `escala-itens.service.ts`: `update()` (atribuição manual, dupla função, pessoa avulsa) e remoção —
  já é o service mexido nesta sessão pra Dupla Função/Pessoa Avulsa.
- `ministerios.service.ts`: `update()` (edição de dados do Ministério).
- `ministerio-voluntarios.service.ts` (ou nome equivalente — confirmar ao implementar): mudança de
  hierarquia (Voluntario/Líder/Auxiliar) e status (Ativo/Inativo) do Vínculo.
- `igrejas.service.ts`: `update()` (configurações da Igreja — nome, joinMode, etc).

**`GET /audit-logs`**: query params `igrejaId` (obrigatório), `ministerioId` (opcional). Guard:
Admin da Igreja vê sem filtro de `ministerioId`; Líder só recebe logs do(s) Ministério(s) onde tem
Vínculo de Líder ativo (rejeita ou ignora `ministerioId` fora desse conjunto). Reusa o padrão de
`IgrejaAccessGuard` já existente.

Migration: nova tabela `audit_logs`, próximo timestamp livre depois de `1813500018000` (conferir no
momento de implementar — outra sessão pode ter avançado a numeração).

### Frontend

- `domain/api/AuditLogApi.ts` → `domain/services/AuditLogRepository.ts` → `hooks/useAuditLog.ts`
  (mesma camada API → Repository → Hook do resto do projeto).
- Tela nova: lista de log, acessível a partir de Configurações (Admin) ou do painel do Ministério
  (Líder). Usa `FancyList` + `FancyListEmpty`. Cada item: ícone por `acao`, `descricao`, autor,
  timestamp relativo.
- Sem filtro de Ministério na UI do Líder (já vem filtrado pelo backend); Admin ganha um
  `ControlledDropDown`/`FancyBottomSheetSelect` pra filtrar por Ministério (opcional, "Todos" como
  default).

---

## 2. Banner "servidor off" (falso positivo)

### Causa raiz confirmada

`core/network/connectivity/ConnectivityProvider.tsx`:

- Toda checagem automática (mount, polling, retomada de foreground) usa `timeoutMs = 8000` (linha
  45, default de `runHealthCheck`; mesmo default em `core/network/health.ts:3` `pingHealth`).
- Só o botão manual "Atualizar" usa `MANUAL_RECHECK_TIMEOUT_MS = 25000` (linha 22), passado
  explicitamente por `recheck()` (linha 142).
- Polling: 60s quando `ok`, 15s quando `serverDown` (linhas 56-63).
- Sem probe de startup separado — a primeira checagem (disparada no mount, linha 92-95) usa o mesmo
  8000ms do steady-state.
- Sem failure threshold — uma única checagem falha já vira `isServerDown = true` (linha 51).
- State machine tem só 2 status derivados de 2 booleans (`isOffline` + `isServerDown` →
  `'ok' | 'offline' | 'serverDown'`, linha 131) — sem estado neutro intermediário.

Cold start do Render free-tier costuma passar de 8s — a checagem automática expira antes do server
acordar, dispara falso positivo. O recheck manual (25s) quase sempre "resolve" porque dá tempo do
cold start terminar, reforçando a falsa impressão de que é falha intermitente.

### Fix (aprovado: as 3 partes)

Pesquisa (Kubernetes `startupProbe`/`livenessProbe`, `failureThreshold`, UX de estado neutro tipo
Slack) embasou a recomendação. As 3 mudanças em `ConnectivityProvider.tsx`:

1. **Startup probe**: primeira checagem após mount usa um timeout maior e próprio (ex: 20000ms,
   alinhado ao tempo real de cold start do Render), separado do timeout de steady-state polling
   (que continua 8000ms — não faz sentido esperar 20s numa checagem periódica normal).
2. **Failure threshold**: só marca `isServerDown = true` depois de N falhas consecutivas (ex: 2),
   não na primeira. Reseta o contador em qualquer sucesso.
3. **Estado neutro intermediário**: novo status `'connecting'` no lugar de pular direto de `'ok'`
   pra `'serverDown'` — cobre o intervalo entre a 1ª falha e o threshold ser atingido. Banner mostra
   mensagem neutra ("Conectando...", sem tom de erro) nesse estado, não a mensagem de erro atual.

`FancyConnectivityBanner.tsx` precisa de um 3º branch de texto/estilo pro novo status `'connecting'`
(hoje só distingue `'offline'` de "else = serverDown"), e o guard de retorno `null` (linha 15)
continua só pra `'ok'`.

Sem mudança de backend — `/health` já responde certo, o problema é só timeout/threshold no cliente.

---

## 3. `Evento.tipo` (Culto / Reunião / Ensaio)

### Estado atual observado

`EventoEntity` (`src/eventos/entities/evento.entity.ts`) não tem campo `tipo`. Já existe
`horarioEnsaioPadrao` (nullable) — sinal de que Ensaio já era um conceito parcialmente antecipado
antes de existir um campo `tipo` de verdade.

Geração automática de Escala: `escala-context.ts` `EscalaContext.loadContext()` carrega os Eventos
via `eventoRepository.find()` e passa pro `GeradorDeEscalas.executar()`. Setlist: não é módulo
próprio — vive dentro de `eventos.service.ts` + entidades `evento-setlist-*`, todas escopadas por
`eventoId`.

Precedente de UI pra esconder aba condicionalmente por tipo: `agenda/details.tsx` (linha ~195-210)
já esconde a aba "SetList" com `if (isLouvorMinisterioTipo())` — mesmo padrão de array-push
condicional será usado aqui, só que a condição passa a ser `evento.tipo`.

### Escopo (decidido em grilling)

Novo enum `EventoTipoEnum`: `Culto | Reuniao | Ensaio`. Comportamento por tipo:

| | Culto | Reunião | Ensaio |
|---|---|---|---|
| Entra na geração automática de Escala | Sim | Não | Não |
| Tem Escala/equipe (qualquer, manual inclusive) | Sim | Não | Não |
| Tem Setlist | Sim | Não | Não |

Reunião e Ensaio ficam idênticos em comportamento (nenhum dos dois tem Escala nem Setlist) — mesmo
o usuário tendo confirmado explicitamente que Ensaio não precisa de Setlist apesar de "ensaiar
repertório" ser a razão de existir do conceito (perguntado 2x em grilling, resposta mantida:
"Ensaio não tem Setlist mesmo").

### Backend

- Migration: `ALTER TABLE eventos ADD COLUMN tipo` enum `Culto/Reuniao/Ensaio`, default `Culto`
  (não-nullable — todo Evento existente vira Culto, comportamento idêntico ao atual, sem quebra).
- `EventoTipoEnum` em `src/eventos/enums/evento-tipo.enum.ts`.
- `EventoEntity`: novo `@Column({ type: 'enum', enum: EventoTipoEnum, default: EventoTipoEnum.Culto }) tipo: EventoTipoEnum;`.
- DTOs (`create-evento.dto.ts`/`update-evento.dto.ts`/`response-evento.dto.ts` — nomes exatos a
  confirmar ao abrir o arquivo): adicionar `tipo` com `@IsEnum(EventoTipoEnum)`.
- Gate de geração: `escala-context.ts` `loadContext()` (ou o ponto de entrada em
  `escalas.service.ts` `gerarEscala`/`regerarEscala`) passa a filtrar/rejeitar Eventos com
  `tipo !== Culto` antes de considerá-los candidatos à geração. Decisão de implementação: filtrar
  silenciosamente (Reunião/Ensaio nunca aparecem como opção pro gerador) em vez de erro — mais
  simples e coerente com o Evento simplesmente "não ter esse conceito".
- Gate de Setlist: mutations em `eventos.service.ts` relacionadas a setlist (criar/editar item,
  estrutura, responsável, observações) rejeitam com erro de validação se `evento.tipo !== Culto`.
- Gate de Escala/equipe manual: endpoints de atribuição manual de `EscalaItemEntity` (o mesmo
  `escala-itens.service.ts` desta sessão) precisam rejeitar Eventos com `tipo !== Culto` — cobre o
  caso de alguém tentar atribuir voluntário manualmente a uma Reunião/Ensaio pela API direto (não só
  via geração automática).

### Frontend

- `eventoSchema.ts` (zod): campo `tipo` (`z.nativeEnum` ou equivalente), default `Culto`.
- `EventosDadosForm.tsx`: novo `ControlledDropDown` pra `tipo` (3 opções, cabe em dropdown — não
  precisa de bottom sheet).
- `domain/dtos/Evento/evento.create.ts` / `evento.response.ts` / `evento.update.ts`: campo `tipo`.
- `agenda/details.tsx`: aba "Equipe" (Escala) e aba "SetList" só entram em `tab_items` se
  `evento.tipo === 'Culto'` — mesmo padrão condicional já usado pra `isLouvorMinisterioTipo()`.
- `EventosListView.tsx`: sem mudança obrigatória neste pacote (filtro por tipo é melhoria futura,
  não bloqueante).

---

## Ordem de implementação

1. `Evento.tipo` (backend → frontend) — mais contido, sem dependência dos outros dois.
2. Banner de conectividade (frontend só) — mais contido, sem dependência de nada.
3. Rastreabilidade (backend → frontend) — maior, depende de nenhum dos dois acima mas é o mais
   trabalhoso; feito por último pra não bloquear os outros dois em fila.

Cada item: implementar, `tsc --noEmit`/testes limpos, commit próprio (não squash os 3 num commit
só), push pro final da sessão.
