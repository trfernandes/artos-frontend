# CONTEXT.md

Glossário de termos do domínio usados no código deste projeto. Sem detalhes de implementação — só o
significado dos termos, para todo mundo (humano ou agente) falar a mesma língua.

Contexto único do produto: gestão de igreja (ministérios, escalas, voluntários). Backend em `backend/` (repo git próprio), frontend em `artos_frontend/`.

## Language

**Igreja**:
Tenant do sistema. Todo Ministério, Voluntário-vínculo e Escala pertence a uma Igreja.

**Voluntário**:
Conta/usuário do sistema (`VoluntarioEntity`). Existe independente de qualquer Ministério.

**Ministério**:
Área de serviço dentro de uma Igreja (ex: louvor, mídia, infantil). `MinisterioEntity`.

**Vínculo** (Voluntário-Ministério):
Relação entre um Voluntário e um Ministério (`MinisterioVoluntarioEntity`), com hierarquia própria (Voluntario/Líder/Auxiliar) e status (Ativo/Inativo). Um Voluntário pode ter no máximo um Vínculo por Ministério, mas Vínculos com vários Ministérios diferentes ao mesmo tempo.
_Avoid_: "participação", "associação"

**Líder**:
Hierarquia de Vínculo com escopo restrito ao próprio Ministério — não enxerga outros Ministérios da Igreja.
_Avoid_: confundir com role ADMIN de Igreja (esse sim tem visão de todos os Ministérios)

**Escala**:
Agendamento de Voluntários pra um período (`EscalaEntity`), com itens individuais (`EscalaItemEntity`) ligando Vínculo + Evento + data/hora.

**Substituição**:
Pedido de um Voluntário (solicitante) pra que outro Voluntário (substituto) assuma um Item de Escala que ele não pode cumprir. Unilateral — substituto não devolve nada. `EscalaSubstituicaoEntity`.
_Avoid_: "troca" pra se referir a substituição simples (nomenclatura antiga do código, `EscalaTroca*`, confunde os dois conceitos)

**Troca**:
Duas Substituições recíprocas linkadas entre si (A substitui B num Item, B substitui A em outro Item). Não é entidade própria — é duas `EscalaSubstituicaoEntity` com vínculo entre elas. Tudo ou nada: se um lado é recusado, o outro é cancelado automaticamente.

**Candidato elegível a Substituição**:
Voluntário com Vínculo ativo na mesma Função do Item de Escala e sem Indisponibilidade na data — mesmas regras já usadas no gerador automático de escala (`PossuiFuncaoRule` + `DisponibilidadeRule`).

**Score de Solicitude**:
Taxa de aceite (não contagem bruta) — `Aprovada` / total de vezes escolhido como substituto (`Pendente`+`Aprovada`+`Recusada`), all-time. Usado só pra ordenar a lista de candidatos sugeridos — não é limiar nem gera alerta.

Decisão 2026-08-17: taxa, não contagem, pra não favorecer voluntário antigo sobre novato com mesmo comportamento de aceite. Denominador conta só quem foi de fato solicitado como substituto (não quem apenas apareceu como Candidato elegível e nunca foi chamado). Empate na taxa desempata por volume total de pedidos recebidos (desc) — sem mínimo artificial de amostra, pra não reintroduzir viés contra voluntário novo.

## Checklist de Configuração de Escala (feature de onboarding)

Orientação guiada dos dados que precisam existir antes de gerar Escala pela primeira vez. Hoje esse setup não tem nenhuma orientação — igreja descobre o que falta só na tentativa e erro (vaga fica nula silenciosamente).

_Achado 2026-08-08_: já existe Tutorial guiado (spotlight/tooltip, jornada `lider-primeiros-passos` — Integrantes → Funções → Templates → Escalas → Assistente) em produção. Ele resolve "pra onde ir", não "o que preencher"/"o que falta". Checklist continua sendo a peça que falta — sem ele, líder é guiado até a tela certa e ainda assim não sabe se os dados que colocou bastam pra gerar escala completa. Implementar Checklist é prioridade, não feature nova a mais.

**Passo do Checklist**:
Um item verificável: Ministério existe, Função existe, Voluntário vinculado ao Ministério, Voluntário tem Função atribuída, Evento existe (nível Igreja). Cada passo tem estado feito/pendente, calculado ao vivo (não é um flag salvo).

Cadastro de Evento é exclusivo de Admin de Igreja (decisão 2026-08-17, RBAC já existente) — Líder vendo o Checklist não cadastra Evento direto, só enxerga o passo pendente e precisa pedir pro Admin. Demais passos (Função, Vínculo, Voluntário+Função) o Líder resolve sozinho, escopado ao próprio Ministério.

**Pré-checagem de geração**:
Validação disparada ANTES de confirmar "gerar escala", mostrando por Função/Evento se há Candidato elegível — mesmas regras do gerador (`PossuiFuncaoRule`+`DisponibilidadeRule`). Não bloqueia — só avisa; voluntário permanece livre pra gerar mesmo incompleto (vaga vazia continua sendo comportamento válido, não erro).
_Avoid_: "validação" sozinho — é aviso, não bloqueio

## Painel Admin da Plataforma (ferramenta interna, fora do produto das igrejas)

Painel web separado do app, pro dono da plataforma controlar dados cross-igreja. Não confundir com Admin de Igreja (`IgrejaVoluntarioRoleEnum.ADMIN`) — esse é escopado a UMA igreja; o Admin de Plataforma enxerga TODAS.
_Avoid_: "superadmin" pra descrever Admin de Igreja — são conceitos de nível diferente

**Admin de Plataforma**:
Usuário interno, entidade própria (não é `VoluntarioEntity`, sem vínculo a Igreja nenhuma). Único usuário por enquanto (o dev/dono).

**Suspensão de Igreja**:
Ação do Admin de Plataforma que bloqueia login de todos os vínculos daquela Igreja. Usa `IgrejaStatusEnum.SUSPENSA` — valor já existe no enum hoje, mas não é setado nem checado em lugar nenhum (achado da exploração: dead code). Reativar destrava na hora. Toda Suspensão gera entrada de log de auditoria (quem, quando, motivo).

É ferramenta de moderação (abuso, violação de termos, investigação) — não de billing. Decisão 2026-08-17: `SubscriptionEntity` continua cobrando normal durante Suspensão, independente do motivo. Inadimplência não passa por aqui — é fluxo separado do provider de pagamento, não ação manual do Admin de Plataforma.
_Avoid_: tratar Suspensão como forma de pausar ou cancelar cobrança

## Sobrecarga de Voluntário (feature de cuidado pastoral)

Estado do Voluntário quando cruza QUALQUER UM de dois Limiares independentes (OR, não soma ponderada): volume de Ministérios ou frequência de Escalas. Cada Limiar é simples (contagem, não peso por hierarquia).
_Avoid_: "carga pastoral", "fadiga voluntária" — termos mais abstratos, não usar no código/UI

**Limiar de Sobrecarga**:
Dois Limiares independentes, fixos no sistema (não configuráveis por Igreja):
- **Limiar de Ministérios**: 3+ Vínculos ativos simultâneos.
- **Limiar de Escalas**: 12+ itens de Escala nos últimos 3 meses (janela móvel).

Escopado por Igreja — conta só Vínculos/Escalas dentro da mesma Igreja, não soma entre Igrejas diferentes onde o mesmo Voluntário possa servir. Decisão 2026-08-17: caso raro na prática (servir em 2+ Igrejas ao mesmo tempo), e cruzar Igreja violaria isolamento multi-tenant — uma Igreja não deve saber que o Voluntário também serve em outra.

**Alerta de Sobrecarga**:
Notificação disparada no momento em que um Voluntário cruza o Limiar (entra no 3º Vínculo ativo). Dispara de novo a cada vez que o Voluntário recruza o Limiar (sai e volta a ultrapassar) — não é notificação única na vida do Voluntário.

- Líder recebe alerta só dos Voluntários do próprio Ministério, com sinal genérico ("também serve em outro(s) Ministério(s)") — sem revelar quais, por não ter escopo de visão cross-Ministério hoje.
- Admin de Igreja recebe alerta agregado, com visão completa (já tem `FULL_PERMISSION_SET` cross-Ministério).
- Voluntário vê o próprio indicador de Sobrecarga na tela pessoal, com texto orientativo (sem botão de ação — não existe fluxo de sair de Ministério pelo próprio Voluntário hoje).

## Tutorial interativo (tours)

- **Tour**: sequência curta de passos guiados sobre uma única tela do app, disparada manualmente
  pelo usuário. Não navega para outras telas.
- **Passo (tour step)**: um item de um tour — referencia um `targetId`, um título e uma descrição.
- **Tutorial Target**: elemento real de uma tela registrado sob um id, para que um tour possa
  desenhar o spotlight nele.
- **Catálogo de tours**: registro central de quais tours existem no app e se cada um já foi visto ou
  pulado pelo usuário.
