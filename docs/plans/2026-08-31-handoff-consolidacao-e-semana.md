# Handoff — consolidação de branches + lista da semana

Escrito porque o Notion desconectou desta sessão (conector "Diakonia" mostra `enabledInChat:
false`, apesar de conectado na conta — parece ser sincronização cliente↔sessão, resolve abrindo uma
conversa nova) e o que está registrado só nesta conversa se perderia se a sessão terminar antes de
reconectar. Qualquer sessão nova (qualquer conta) deve ler este doc primeiro.

## 1. Estado dos repos (já pushado, nada pendente em disco)

- **Backend** `staging`: HEAD `d727cfa`. Consolida esta sessão (Evento.tipo, banner, audit-log,
  dupla função/pessoa avulsa) + os 17 commits de `claude/notion-task-triage-ozzy04` (setlist
  rascunho/publicado, lock de concorrência, horário por ministério, convite multi-ministério,
  permissão de ministérios por evento, etc.) + 4 commits que outra sessão pushou direto em
  `staging` durante a mesclagem. 263/263 testes passando.
- **Frontend** `claude/dazzling-darwin-y7uflx`: HEAD `fa2bbdc`. Consolida esta sessão + 8 commits
  que outra sessão pushou direto na branch + `claude/botao-substituicao-bloqueado-egmy0z` (fix real:
  botão de substituição não abria modal) + `claude/corrigir-erro-od1miw` (prettier/CI).
  `tsc`/`prettier` limpos.
- Branches órfãs já verificadas e resolvidas: `claude/new-session-poiejy` e `claude/ola-5d8o6y`
  (conteúdo já 100% absorvido, nada a fazer). `claude/bold-goldstine`/`claude/hardcore-boyd`
  abandonadas desde abril, ignoradas.
- **Fora do escopo desta consolidação, intencionalmente**: branch `1.2` (epic Nova Versão 2) e
  `claude/handoff-setup-continuation-vrgci0` (só docs de design, Sobrecarga).

**Antes de mesclar/pushar mais nada**: rodar `git fetch` nas duas branches ativas primeiro — pelo
menos 2 outras contas/sessões estão pushando direto nelas em paralelo, confirmado ao vivo nesta
sessão (rejeição de push não-fast-forward + branches novas aparecendo no meio do trabalho).

## 2. Itens confirmados pelo usuário como já resolvidos, AINDA NÃO atualizados no Notion

O Notion caiu antes de eu conseguir marcar estes 3 como "Resolvido" no banco "Diakonia". Preciso
alguém (outra sessão, ou esta quando reconectar) atualizar:

- **Problema de login do Paulo** (Tipo: Bug) — usuário confirmou resolvido, sem mais detalhe.
- **Erro ao Criar Template** (Tipo: Bug, Prioridade: Alta, estava "Em andamento") — usuário
  confirmou resolvido.
- **Lista de funções ao adicionar função ao evento vaza de outros ministérios** (criado por mim
  nesta sessão, Tipo: Bug, Prioridade: Média) — usuário confirmou resolvido.

## 3. Perguntas em aberto (usuário ainda não respondeu)

- **Fallback de foto de perfil**: usuário quer mudar o ícone genérico atual
  (`AppImages.emptyProfile`, confirmado no código) — mas não disse por qual (iniciais? outra
  imagem? cor de fundo?).
- **"Verificar se os contadores estão corretos"**: item vago demais — não sei qual contador/tela.
  Perguntar antes de agir.
- **"Ao criar escala manual, melhorar determinação das funções do evento"**: não sei o que
  "melhorar" significa aqui (lista errada? falta busca? ordem ruim?). Perguntar antes de agir.

## 4. Trabalho em andamento

- **Excluir igreja cadastrada** (Bug/Melhoria, Prioridade Alta): confirmado no código que NÃO existe
  endpoint de delete pra `IgrejaEntity` hoje (`IgrejaController`/`IgrejaService` não têm método
  delete). Escopo claro, sem dependência de resposta do usuário — **próximo item a implementar**,
  ainda não iniciado (nenhum código escrito).

## 5. Contexto da lista da semana (não confiar cegamente na próxima leitura do Notion)

Vários itens que apareciam como "Novo"/"Em andamento" no banco "Diakonia" já estavam resolvidos por
commits que vieram na consolidação, sem status atualizado (Notion é anotação manual do usuário, não
reflete o app real automaticamente). Antes de tratar qualquer item do Notion como "ainda quebrado",
vale perguntar ao usuário ou verificar no código — ele mesmo já corrigiu essa lista 3 vezes nesta
conversa.
