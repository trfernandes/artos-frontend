# Diakonía — Domínio

Contexto único do produto: gestão de igreja (ministérios, escalas, voluntários). Backend em
`backend/` (repo git próprio), frontend em `artos_frontend/`.

## Language

**Igreja**: Tenant do sistema. Todo Ministério, Voluntário-vínculo e Escala pertence a uma Igreja.

**Voluntário**: Conta/usuário do sistema (`VoluntarioEntity`). Existe independente de qualquer
Ministério.

**Ministério**: Área de serviço dentro de uma Igreja (ex: louvor, mídia, infantil).
`MinisterioEntity`.

**Vínculo** (Voluntário-Ministério): Relação entre um Voluntário e um Ministério
(`MinisterioVoluntarioEntity`), com hierarquia própria (Voluntario/Líder/Auxiliar) e status
(Ativo/Inativo). Um Voluntário pode ter no máximo um Vínculo por Ministério, mas Vínculos com vários
Ministérios diferentes ao mesmo tempo. _Avoid_: "participação", "associação"

**Líder**: Hierarquia de Vínculo com escopo restrito ao próprio Ministério — não enxerga outros
Ministérios da Igreja. _Avoid_: confundir com role ADMIN de Igreja (esse sim tem visão de todos os
Ministérios)

**Escala**: Agendamento de Voluntários pra um período (`EscalaEntity`), com itens individuais
(`EscalaItemEntity`) ligando Vínculo + Evento + data/hora.

**Substituição**: Pedido de um Voluntário (solicitante) pra que outro Voluntário (substituto) assuma
um Item de Escala que ele não pode cumprir. Unilateral — substituto não devolve nada.
`EscalaSubstituicaoEntity`. _Avoid_: "troca" pra se referir a substituição simples (nomenclatura
antiga do código, `EscalaTroca*`, confunde os dois conceitos)

**Troca**: Duas Substituições recíprocas linkadas entre si (A substitui B num Item, B substitui A em
outro Item). Não é entidade própria — é duas `EscalaSubstituicaoEntity` com vínculo entre elas. Tudo
ou nada: se um lado é recusado, o outro é cancelado automaticamente.

**Candidato elegível a Substituição**: Voluntário com Vínculo ativo na mesma Função do Item de
Escala e sem Indisponibilidade na data — mesmas regras já usadas no gerador automático de escala
(`PossuiFuncaoRule` + `DisponibilidadeRule`).

**Score de Solicitude**: Taxa de aceite (não contagem bruta) — `Aprovada` / total de vezes escolhido
como substituto (`Pendente`+`Aprovada`+`Recusada`), all-time. Usado pra ordenar a lista de
candidatos sugeridos — não é limiar nem gera alerta sozinho.

Decisão 2026-08-17: taxa, não contagem, pra não favorecer voluntário antigo sobre novato com mesmo
comportamento de aceite. Denominador conta só quem foi de fato solicitado como substituto (não quem
apenas apareceu como Candidato elegível e nunca foi chamado). Empate na taxa desempata por volume
total de pedidos recebidos (desc) — sem mínimo artificial de amostra, pra não reintroduzir viés
contra voluntário novo.

Decisão 2026-08-22: deixa de ser cálculo puramente interno — Líder passa a ver o Score de Solicitude
de cada Voluntário do seu Ministério (antes só existia pra ordenar candidatos, sem exposição).

**Score de Serviço**: Métrica composta de confiabilidade (Solicitude + Comparecimento +
Indisponibilidade), vive na seção "Scores" do perfil em Integrantes. 3 emblemas, um por fator, sem
ranking comparativo: "O Pontual", "Sempre Presente", "Voluntário Solícito".

**Check-in de chegada**: Voluntário se autoregistra ("Cheguei") na tela da escala do dia, numa
janela de 30min antes a 30min depois do horário marcado — alimenta o fator Comparecimento do Score
de Serviço com hora real, não só confirmação binária. Janela de tolerância pra contar como pontual é
15 minutos por padrão, configurável por Líder de Ministério (não é ajuste global da Igreja).
_Avoid_: confundir com a marcação manual de `Ausente` pelo Líder — são complementares (Líder marca
quem faltou; check-in registra a hora de quem compareceu).

## Checklist de Configuração de Escala (feature de onboarding)

Orientação guiada dos dados que precisam existir antes de gerar Escala pela primeira vez. Hoje esse
setup não tem nenhuma orientação — igreja descobre o que falta só na tentativa e erro (vaga fica
nula silenciosamente).

_Achado 2026-08-08_: já existe Tutorial guiado (spotlight/tooltip, jornada `lider-primeiros-passos`
— Integrantes → Funções → Templates → Escalas → Assistente) em produção. Ele resolve "pra onde ir",
não "o que preencher"/"o que falta". Checklist continua sendo a peça que falta — sem ele, líder é
guiado até a tela certa e ainda assim não sabe se os dados que colocou bastam pra gerar escala
completa. Implementar Checklist é prioridade, não feature nova a mais.

**Passo do Checklist**: Um item verificável: Ministério existe, Função existe, Voluntário vinculado
ao Ministério, Voluntário tem Função atribuída, Evento existe (nível Igreja). Cada passo tem estado
feito/pendente, calculado ao vivo (não é um flag salvo).

Cadastro de Evento é exclusivo de Admin de Igreja (decisão 2026-08-17, RBAC já existente) — Líder
vendo o Checklist não cadastra Evento direto, só enxerga o passo pendente e precisa pedir pro Admin.
Demais passos (Função, Vínculo, Voluntário+Função) o Líder resolve sozinho, escopado ao próprio
Ministério.

**Pré-checagem de geração**: Validação disparada ANTES de confirmar "gerar escala", mostrando por
Função/Evento se há Candidato elegível — mesmas regras do gerador
(`PossuiFuncaoRule`+`DisponibilidadeRule`). Não bloqueia — só avisa; voluntário permanece livre pra
gerar mesmo incompleto (vaga vazia continua sendo comportamento válido, não erro). _Avoid_:
"validação" sozinho — é aviso, não bloqueio

**Catálogo de Funções sugeridas**: Decisão 2026-08-22: vai ser criado (antes só cogitado) — lista de
nomes de Função comuns (vocal, guitarra, bateria, teclado...) oferecida como sugestão/autocomplete
no cadastro de Função, sem impedir texto livre. Onde o catálogo vive (constante do backend vs
constante do frontend) ainda não foi decidido.

Escopo do Checklist, decisão 2026-08-22: é feature só de Líder de Ministério — a visão agregada por
Igreja (endpoint já implementado, `GET /igrejas/:id/checklist-escala`) não vai ser consumida no app;
Admin não tem tela própria de Checklist.

## Painel Admin da Plataforma (ferramenta interna, fora do produto das igrejas)

Painel web separado do app, pro dono da plataforma controlar dados cross-igreja. Não confundir com
Admin de Igreja (`IgrejaVoluntarioRoleEnum.ADMIN`) — esse é escopado a UMA igreja; o Admin de
Plataforma enxerga TODAS. _Avoid_: "superadmin" pra descrever Admin de Igreja — são conceitos de
nível diferente

**Admin de Plataforma**: Usuário interno, entidade própria (não é `VoluntarioEntity`, sem vínculo a
Igreja nenhuma). Único usuário por enquanto (o dev/dono).

**Suspensão de Igreja**: Ação do Admin de Plataforma que bloqueia login de todos os vínculos daquela
Igreja. Usa `IgrejaStatusEnum.SUSPENSA` — valor já existe no enum hoje, mas não é setado nem checado
em lugar nenhum (achado da exploração: dead code). Reativar destrava na hora. Toda Suspensão gera
entrada de log de auditoria (quem, quando, motivo).

É ferramenta de moderação (abuso, violação de termos, investigação) — não de billing. Decisão
2026-08-17: `SubscriptionEntity` continua cobrando normal durante Suspensão, independente do motivo.
Inadimplência não passa por aqui — é fluxo separado do provider de pagamento, não ação manual do
Admin de Plataforma. _Avoid_: tratar Suspensão como forma de pausar ou cancelar cobrança

**Ações de assinatura** (adicionado em grilling 2026-08-23): Admin de Plataforma ganha 5 ações sobre
a assinatura de qualquer Igreja, na tela Detalhe da Igreja — Mudar plano (sincroniza de verdade com
o Asaas), Aplicar desconto (percentual por N ciclos), Isenção, Cancelar, Pausar. Todas geram entrada
no log de auditoria (motivo opcional, diferente da obrigatoriedade de Suspensão).

**Isenção**: Generaliza o `EXEMPT_CHURCH_ID` hardcoded que já existe hoje (variável de ambiente, uma
única Igreja, sempre plano Crescimento, sempre permanente). Vira ação de UI — Admin de Plataforma
escolhe qual plano conceder, com prazo de validade opcional (permanente se não definido).

**Pausa de Assinatura**: Estado intermediário entre Ativa e Cancelada — assinatura para de cobrar e
acesso fica bloqueado (mesmo tratamento de Suspensa) por um período, sem encerrar de vez. Adicionado
após pesquisa de mercado (ver `docs/research/2026-08-23-retencao-saas-assinatura.md`) — tática de
retenção com melhor evidência encontrada. Oferecida tanto como ação manual do Admin de Plataforma
quanto como opção dentro do formulário de suporte, quando a Igreja pede cancelamento/downgrade.
_Avoid_: confundir com Suspensão — Pausa é ação de retenção oferecida à própria Igreja, Suspensão é
moderação unilateral do Admin de Plataforma

## Sobrecarga de Voluntário (feature de cuidado pastoral)

Estado do Voluntário quando cruza QUALQUER UM de dois eixos independentes (OR): dispersão entre
Ministérios (ponderada por carga real) ou frequência total de Escalas. Ver
`docs/adr/0001-sobrecarga-dois-limiares-independentes.md` pro racional completo e a revisão
2026-08-22 (peso por ministério). _Avoid_: "carga pastoral", "fadiga voluntária" — termos mais
abstratos, não usar no código/UI

**Peso de Ministério**: Não é mais contagem simples de vínculos. Peso de um Ministério pra um
Voluntário = (Escalas desse Ministério pra essa pessoa, últimos 3 meses) ÷ (média de Escalas por
Ministério na Igreja inteira, mesmo período). Ministério na média da Igreja pesa ~1; bem mais ativo
que a média pesa mais que 1; quase parado pesa bem menos que 1.

**Eixos de Sobrecarga**: Dois eixos independentes, fixos no sistema (não configuráveis por Igreja):

- **Eixo de Ministérios**: soma dos Pesos de Ministério do Voluntário ≥ 3.
- **Eixo de Escalas**: 12+ itens de Escala nos últimos 3 meses (janela móvel).

Escopado por Igreja — conta só Vínculos/Escalas dentro da mesma Igreja, não soma entre Igrejas
diferentes onde o mesmo Voluntário possa servir. Decisão 2026-08-17: caso raro na prática (servir em
2+ Igrejas ao mesmo tempo), e cruzar Igreja violaria isolamento multi-tenant — uma Igreja não deve
saber que o Voluntário também serve em outra.

**Tendência**: Cada eixo compara o trimestre atual com o trimestre imediatamente anterior (ex: "peso
de ministérios subiu de 1.8 pra 3.2") — ajuda o Líder a distinguir "está estável nesse ritmo há
tempo" de "piorou rápido recentemente".

**Sinais adicionais de saúde** (independentes dos dois eixos acima — alertam sozinhos):

- **Queda de comparecimento**: `Ausente`/total ≥ ~20% no período — limiar fixo, igual pra todos.
- **Aumento de indisponibilidade**: indisponibilidade declarada no trimestre atual ≥ 2x a média
  pessoal dos últimos 6 meses — comparado à própria linha de base da pessoa, não um número fixo
  global.
- **Humor pós-escala**: 2 respostas consecutivas baixas (1-2 de 5) no questionário de humor exibido
  após cada ocorrência de Escala — ver seção "Feedback pós-Escala" abaixo.

Motivo dos sinais adicionais: os dois eixos de Sobrecarga medem volume/dispersão de serviço, não
estado emocional. Alguém pode estar mal sem ter cruzado nenhum eixo numérico — os sinais de
comparecimento/indisponibilidade/humor existem justamente pra cobrir esse caso, e cada um alerta por
conta própria.

**Estado de acompanhamento** (unifica alerta automático + pedido do próprio Voluntário): Cada
situação sinalizada (por qualquer um dos eixos/sinais acima, ou por pedido do Voluntário) fica
registrada até o Líder marcar "já tratei". Uma vez marcado, o sistema para de notificar
repetidamente — mas **reabre sozinho se a situação piorar** depois (não é silenciamento permanente;
uma conversa de meses atrás não deveria continuar "resolvendo" uma piora nova).

**Ação do Voluntário**: Voluntário sinalizado (por qualquer eixo/sinal) vê os mesmos números que o
Líder vê sobre ele (simetria total — decisão 2026-08-22, revisando a assimetria original) e tem um
botão de baixa fricção ("quero conversar sobre minha carga de serviço") que cria uma situação em
acompanhamento pro Líder, com o mesmo ciclo de vida do parágrafo acima.

**Distribuição do alerta/insight**:

- Líder recebe alerta e insight completo dos Voluntários do próprio Ministério — incluindo
  drill-down do motivo exato (qual eixo/sinal, com os números), localizado no perfil do Voluntário
  em Integrantes.
- Admin de Igreja recebe visão agregada, com detalhe completo (já tem `FULL_PERMISSION_SET`
  cross-Ministério).
- Voluntário vê o próprio indicador de Sobrecarga na tela Pessoal, agora com os mesmos números que o
  Líder vê (ver "Ação do Voluntário" acima).

**Tela "Como funciona a Saúde do Voluntariado"**: Tela de referência sempre acessível (a partir do
card do dashboard e da tela de Integrantes) que explica em linguagem simples os 5 sinais que compõem
a Sobrecarga/Saúde (peso de ministério, total de escalas, comparecimento, indisponibilidade, humor)
— existe pra que o Líder confie na régua antes mesmo de precisar agir sobre um caso específico.
Complementa o drill-down por pessoa, não o substitui.

**Insights de Saúde em Integrantes**: Nova seção na tela de Integrantes do Ministério, com duas
camadas:

- **Agregada** (topo da lista): contadores separados por tipo de sinal (ex: "2 sobrecarregados, 1
  com queda de comparecimento") — nunca um número único misturado, porque cada tipo de sinal pede um
  tipo de cuidado diferente.
- **Individual** (perfil de cada Voluntário): seção "Saúde" reúne sobrecarga + tendência +
  comparecimento + indisponibilidade + humor + estado de acompanhamento — **separada** da seção
  "Scores" (Score de Solicitude + Score de Serviço), decisão 2026-08-22, pra não misturar tom de
  cuidado com tom de avaliação/desempenho.

## Feedback pós-Escala (auto-relato do Voluntário)

Questionário leve exibido ao Voluntário depois que a data de ocorrência de um Item de Escala passa —
dois canais de aparição, não excludentes: notificação push no dia seguinte, e também na próxima vez
que o Voluntário abre o app. Sempre opcional/pulável (consistente com
`docs/adr/0003-checklist-nao-bloqueia-geracao.md` — o produto não força resposta de formulário).

Um fluxo só, duas seções:

**Humor**: Escala de 1-5 (rosto/número) + campo de texto opcional. **Identificado** — o Líder vê a
resposta de cada ocorrência, não só uma média (é ferramenta de cuidado direto do Líder pela equipe,
não pesquisa anônima de clima). Alimenta o sinal de humor descrito na seção "Sobrecarga de
Voluntário" acima (2 respostas baixas seguidas alertam o Líder).

**Feedback do serviço**: Nota geral (1-5) + campo de texto livre ("como foi pra você hoje?", dicas
pro Líder sobre a condução do Ministério). **Anônimo pro Líder** — o sistema guarda o vínculo com o
Voluntário internamente (pra moderação de abuso), mas a UI do Líder/Admin não expõe quem escreveu o
quê. Visível pro Líder do Ministério e pro Admin da Igreja.

Pedido de feedback acontece em toda ocorrência de Escala, sem limite de frequência — quem serve
muito e cansa de responder simplesmente pula (é opcional).

**Pergunta customizada**: pergunta própria que o Líder do Ministério cadastra, somada às perguntas
fixas de "Feedback do serviço" (não é seção nova) — tipo escala numérica, texto livre ou múltipla
escolha/sim-não, sobre a própria experiência do respondente ou sobre outra pessoa/o grupo (ex: nível
de técnica de um solista). Escopada ao Ministério do Líder que criou — sem edição por Admin de
Igreja nem pergunta global. Segue a mesma regra de anonimato da seção onde mora. Sem limite de
perguntas customizadas ativas por Líder; exibição pro Líder é agregada por tipo (média pra escala,
contagem por opção pra múltipla escolha/sim-não, lista pra texto livre).

## Tutorial interativo (tours)

- **Tour**: sequência curta de passos guiados sobre uma única tela do app, disparada manualmente
  pelo usuário. Não navega para outras telas.
- **Passo (tour step)**: um item de um tour — referencia um `targetId`, um título e uma descrição.
- **Tutorial Target**: elemento real de uma tela registrado sob um id, para que um tour possa
  desenhar o spotlight nele.
- **Catálogo de tours**: registro central de quais tours existem no app e se cada um já foi visto ou
  pulado pelo usuário.
