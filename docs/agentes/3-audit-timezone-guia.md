# ⏰ Auditoria de Timezone & Date/Time

## O que é?

Um **agente que automaticamente encontra e corrige bugs de data/hora** em múltiplos fusos horários.

Você já passou por isso:
- App mostra hora errada quando você viaja
- Countdown badge pisca "Amanhã" mas é hoje
- Escala aparece no dia errado ao meio-noite
- Formato de locale diferente em Brasil vs Portugal

**Este agente encontra e CORRIGE tudo isso.**

```
Processo tradicional:        Processo com Audit Timezone:
─────────────────────────    ────────────────────────────

Usuário reporta bug         Você: /audit-timezone
    ↓                            ↓
Você debug em São Paulo      Agente encontra TODAS funções
    ↓                        que lidam com datas
Sem problema lá?                ↓
    ↓                        Cria testes cobrindo:
Testa em UTC                 • UTC (London)
    ↓                        • São Paulo (UTC-3)
Boom! Bug em UTC            • Horário de verão
    ↓                        • Meia-noite
Debugs por 30 min               ↓
    ↓                        Roda testes
Corrige                      Encontra 3-5 bugs
    ↓                        Corrige código
Testa novamente                (não o teste!)
    ↓                        Roda testes
Finalmente funciona             ↓
(45 minutos depois)         Tudo passa! 100%
                            (25 minutos depois)
```

**Economia**: 20 minutos por bug encontrado.

---

## 🎯 Problema que Resolve

### Bugs Comuns de Timezone

```
❌ Rehearsal time mostra 15h quando é 14h
   Causa: Cálculo de UTC offset errado

❌ Countdown badge mostra "Amanhã" mas é hoje
   Causa: Bug em DST (daylight saving time) boundary

❌ Agenda mostra evento no dia errado ao meio-noite
   Causa: Comparação de datas sem considerar timezone

❌ Formato de locale errado em Brasil vs Portugal
   Causa: Hardcoded locale, não lê do sistema

❌ Escalas aparecem no dia errado após viagem
   Causa: App não recalcula após timezone change

❌ Notificação de "2 horas atrás" errada
   Causa: Timestamp em timezone errado
```

Você **NUNCA** quer esses bugs chegando até seus usuários.

---

## 🚀 Como Usar

### Um Comando Simples

```bash
/audit-timezone
```

**Pronto!** Não precisa de parâmetros.

---

## 🔍 O Que o Agente Faz

### Fase 1: Exploração (5 min)
Encontra todas funções que lidam com datas/horas:

```
Procurando por:
✅ Rehearsal times (horários de ensaio)
✅ Countdown badges (crachás de contagem regressiva)
✅ Calendar markers (marcadores de calendário)
✅ Agenda dates (datas de agenda)
✅ Created/Updated timestamps
✅ Relative dates ("2 horas atrás", "Amanhã")
✅ Locale formatting (pt-BR, pt-PT, etc)
```

**Resultado**: Lista de todas funções encontradas com file paths.

---

### Fase 2: Testes (3 min)
Cria testes cobrindo múltiplos cenários:

```
Para cada função encontrada:

Testa em:
  • UTC (London/London time)
  • America/Sao_Paulo (UTC-3, Brasil)
  • America/New_York (UTC-4/5, USA com DST)
  • Europe/Lisbon (UTC+0/1, Portugal com DST)

Testa edge cases:
  • Meia-noite (00:00)
  • Fim do dia (23:59)
  • Transição de DST (quando muda horário)
  • Primeiro dia do mês
  • Ano novo
  • Leap year

Testa formato:
  • Português Brasil (pt-BR)
  • Português Portugal (pt-PT)
  • Inglês (en-US)
  • Formato 12h vs 24h
```

---

### Fase 3: Encontra Bugs (2-3 min)
Roda os testes. Cada falha = 1 bug encontrado.

```
❌ TEST FAIL: rehearsal_time_sao_paulo_dst
   Function: getRehearsalTimeDisplay
   Expected: "15:30"
   Got: "16:30" (offset wrong by 1)
   File: src/utils/dateTime.ts:42

❌ TEST FAIL: countdown_midnight_boundary
   Function: getCountdownText
   Expected: "Em 2 horas"
   Got: "Amanhã" (date comparison off by 1)
   File: src/hooks/useCountdown.ts:18

❌ TEST FAIL: agenda_locale_format
   Function: formatAgendaDate
   Expected: "5 de maio de 2026"
   Got: "05/05/2026"
   File: src/utils/formatting.ts:33
```

---

### Fase 4: Corrige Código (10-15 min)
**Importante**: O agente corrige o CÓDIGO, não o teste.

Para cada bug:
1. Lê o código
2. Identifica o problema
3. CORRIGE o código
4. Roda os testes novamente
5. Repete até passar

```
[audit-timezone] Encontrado bug: rehearsal_time offset
  → Mudando getRehearsalTimeDisplay em dateTime.ts
  → Adicionando proper offset calculation
  → Testando...
  ✅ PASSOU!

[audit-timezone] Encontrado bug: countdown midnight boundary
  → Mudando getCountdownText em useCountdown.ts
  → Usando date comparison with timezone awareness
  → Testando...
  ✅ PASSOU!

[audit-timezone] Encontrado bug: agenda locale format
  → Mudando formatAgendaDate em formatting.ts
  → Usando navigator.language para locale
  → Testando...
  ✅ PASSOU!
```

---

### Fase 5: Relatório (1 min)
Gera relatório completo:

```
AUDITORIA DE TIMEZONE - RESUMO
═══════════════════════════════

Funções auditadas: 12
Bugs encontrados: 3
Bugs corrigidos: 3
Testes criados: 48
Taxa de sucesso: 100%

BUGS ENCONTRADOS E CORRIGIDOS:
────────────────────────────

1. getRehearsalTimeDisplay (src/utils/dateTime.ts:42)
   Problema: Cálculo de UTC offset errado
   Solução: Usar timezone-aware formatting
   Commits: d4e5f6g, h8i9j0k

2. getCountdownText (src/hooks/useCountdown.ts:18)
   Problema: Comparação de datas ignorava timezone
   Solução: Normalizar para UTC antes de comparar
   Commits: l1m2n3o, p4q5r6s

3. formatAgendaDate (src/utils/formatting.ts:33)
   Problema: Locale hardcoded em pt-BR
   Solução: Usar navigator.language como fallback
   Commits: t7u8v9w

TESTES CRIADOS:
────────────────

 rehearsal_time_utc
 rehearsal_time_sao_paulo
 rehearsal_time_new_york
 rehearsal_time_lisbon
 rehearsal_time_dst_boundary
 ... (48 testes no total)

COBERTURA ANTES: 34%
COBERTURA DEPOIS: 89%

RECOMENDAÇÃO:
Adicionar testes de timezone como CI check.
Ver: tests/timezone.test.ts
```

---

## ⏱️ Timeline

| Fase | Duração | O que é feito |
|------|---------|---|
| Exploração | 5 min | Encontra funções com data/hora |
| Teste | 3 min | Cria suite de testes |
| Encontra bugs | 2-3 min | Roda e identifica falhas |
| Corrige | 10-15 min | Fixa código (não teste) |
| Relatório | 1 min | Gera resumo |
| **Total** | **~30 min** | Suite de testes 100% passando |

---

## ✅ Pré-requisitos

### Software
- [ ] Jest ou Vitest instalado
- [ ] npm test funcionando
- [ ] timezone-mock disponível (ou será instalado)
- [ ] TypeScript configurado

### Verificação Rápida
```bash
# Testa se está pronto:
npm test -- --listTests | head

# Deve retornar: lista de testes encontrados

# Se não tiver testes ainda:
npm test -- --init
```

---

## 📚 Exemplos Reais

### Exemplo 1: Auditoria Antes de Deploy

**Contexto**: Você vai fazer deploy amanhã. Quer garantir que não tem bugs de timezone.

**Setup**:
```bash
# Certifica que app está buildável:
npm test

# Sem mudar nada, roda o agente:
```

**Comando**:
```
/audit-timezone
```

**Resultado**: 
- 3 bugs encontrados (que você não sabia que existiam!)
- Todos corrigidos
- Suite de testes com 48 testes novos
- Cobertura subiu de 34% para 89%
- Deploy com confiança! ✅

---

### Exemplo 2: Após Relato de Bug em Produção

**Contexto**: Usuário reportou: "Horário de ensaio tá errado"

**Setup**:
```bash
# Você não sabe exatamente qual função tem bug
# Agente vai encontrar
```

**Comando**:
```
/audit-timezone
```

**Resultado**:
- Agente encontra a função que tá errada
- Cria testes que reproduzem o bug
- Corrige a função
- Testes passam
- Você merga fix para main e deploya
- Usuário fica feliz!

---

### Exemplo 3: Refactor de Date Logic

**Contexto**: Você refatorou todo o código de datas. Quer ter certeza que não quebrou nada.

**Setup**:
```bash
git checkout refactor/date-logic
npm test  # Verifica se basic tests passam
```

**Comando**:
```
/audit-timezone
```

**Resultado**: 
- Agente testa seu refactor em múltiplos timezones
- Se quebrou algo, encontra
- Se tá tudo certo, confirma com testes robustos
- Merge com confiança!

---

## ❓ FAQ

### P: O agente modifica meus testes?
**A**: Não! Ele CRIA novos testes, não modifica existentes.

Ele cria em: `tests/timezone.test.ts` ou similar.

### P: Qual timezone brasileiro ele testa?
**A**: `America/Sao_Paulo` (UTC-3, horário de Brasília).

Também testa DST, midnight, etc.

### P: E Portugal?
**A**: `Europe/Lisbon` (UTC+0/+1 com DST).

---

### P: Posso escolher outros timezones?
**A**: Pode pedir:
```
/audit-timezone
Adicionalmente, testar: Australia/Sydney, Asia/Tokyo
```

---

### P: Quanto tempo leva?
**A**: ~25-30 minutos total.

Depende de:
- Quantas funções com datas você tem
- Complexidade do código
- Número de testes criados

---

### P: O agente quebra meu código?
**A**: Nunca intencional. Se algo der errado:
```bash
git log --oneline  # Vê todos os commits do agente
git revert [hash]  # Desfaz um
git reset --hard HEAD~5  # Desfaz últimos 5 commits
```

---

### P: Posso rodar em production?
**A**: **Não recomendado**. Teste antes:
1. Rode em `develop` branch
2. Verifique commits
3. Rode testes localmente
4. Se tudo OK, merge para production

---

### P: Meu app não tem testes ainda. Posso usar?
**A**: Sim! Agente cria do zero. Mas setup leva um pouco mais.

---

## 🔧 Troubleshooting

### ❌ Problema: "npm test falha com erro estranho"

**Solução**:
```bash
# Limpa cache:
rm -rf node_modules
npm install

# Tenta novamente:
npm test
```

Se continuar:
```bash
# Vê o erro completo:
npm test -- --verbose
```

---

### ❌ Problema: "timezone-mock não está instalado"

**Solução**:
```bash
npm install --save-dev timezone-mock
```

O agente tenta instalar automaticamente, mas às vezes não funciona.

---

### ❌ Problema: "Agente não acha nenhuma função com datas"

**Solução**:
Suas funções talvez não estejam nomeadas de forma reconhecível.

Procura:
```bash
grep -r "Date\|Time\|timezone\|locale" src/ --include="*.ts"
```

Se encontrar funções, renomeia para pattern que agente recogniza:
- `getRehearsalTime`
- `formatDate`
- `getCountdownText`
- `getCountdownBadge`
- `getAgendaTime`

---

### ❌ Problema: "Um teste falha mesmo após agente trabalhar"

**Solução**:
Isso raramente acontece. Se acontecer:
```bash
# Vê qual teste falhou:
npm test -- --verbose

# Encontra o arquivo do teste:
grep -r "test name" tests/

# Lê o teste e o código
# Manual debug se necessário
```

Reporte o bug se for de responsabilidade do agente.

---

## 📊 Monitorando Progresso

Enquanto o agente trabalha:

```bash
# Em outro terminal, monitora commits:
watch git log --oneline -10

# Monitora testes rodando:
npm test -- --watch

# Vê mudanças em tempo real:
git diff
```

---

## ✨ Dicas

### Dica 1: Rode antes de viagem
Se você vai viajar, rode /audit-timezone antes de sair. Garante que seu app funciona em outros timezones.

### Dica 2: Salve o relatório
Após agente terminar, salva o relatório:
```bash
# Agente gera em algum lugar, procura:
find . -name "*timezone*" -name "*report*" -o -name "*audit*"

# Salva em: docs/timezone-audit-2026-05-05.md
```

### Dica 3: Adicione ao CI
Depois que agente criar testes:
```bash
# No seu CI (GitHub Actions, etc):
npm test -- tests/timezone.test.ts

# Roda automaticamente em cada PR
```

### Dica 4: Documente suas convenções
Se sua app usa convenções especiais para datas:
```markdown
# Convenções de Date/Time

- Sempre armazenar em UTC no banco
- Sempre comparar com Date.now() (sempre UTC)
- Sempre formatar com locale do navegador
- Edge case de midnight: usar isSameDay() utility
```

Salva em: `docs/datetime-conventions.md`

### Dica 5: Teste em múltiplos locales
Além de timezones, teste locale formatting:
```bash
# Muda idioma do telefone
# Roda sua app
# Vê se datas formatam certo
```

---

## 🎓 Fluxo Ideal: Do Bug Encontrado ao Teste Automático

```
1. Usuário reporta bug de timezone
   └─ "Horário de ensaio tá errado em NYC"

2. Você verifica:
   /audit-timezone
   └─ Agente encontra a função exata

3. Agente cria testes + corrige código
   └─ Testes agora cobrem NYC + São Paulo + UTC

4. Deploy com confiança
   └─ Nunca mais esse bug volta

5. Adiciona teste ao CI
   └─ Qualquer mudança de date/time passa por aqui

6. Próximo dev, herdeiro de testes robustos
   └─ Não pode quebrar date/time sem CI reclamar
```

---

## 🚀 Depois do Audit

1. **Revise commits**: Lê cada commit que agente fez
2. **Teste manualmente**: Muda seu phone timezone, testa
3. **Adicione ao CI**: Testes rodam automaticamente
4. **Documente**: Convenções de date/time da sua app
5. **Treine o time**: Compartilhe como usar esse agente

---

## 📞 Próximos Passos

Depois de rodar /audit-timezone:

1. **Valide**: Testes passam ✅
2. **Merge**: Para branch principal
3. **Deploy**: Para produção
4. **Monitore**: Verifique que não tem regressões
5. **Automate**: Adicione ao CI/CD

---

**Última atualização**: Maio 2026  
**Status**: Operacional ✅  
**Próxima versão**: Suporte para custom timezones por projeto
