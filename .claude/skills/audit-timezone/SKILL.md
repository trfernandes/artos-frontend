---
name: audit-timezone
description: Auditoria e testes para toda lógica de data/hora com timezone
---

# Auditoria de Timezone & Date/Time

Encontra e corrige bugs de data/hora em múltiplos fusos horários automaticamente.

## Como usar

```
/audit-timezone
```

## O que faz

1. **Identifica** todas as funções que lidam com datas/horários:
   - Rehearsal times (horários de ensaio)
   - Countdown badges (crachás de contagem regressiva)
   - Calendar markers (marcadores de calendário)
   - Agenda dates (datas de agenda)

2. **Cria testes** cobrindo:
   - UTC
   - America/Sao_Paulo (Brasil UTC-3)
   - Horário de verão (DST edge cases)
   - Meia-noite (midnight boundaries)
   - Formatação por locale

3. **Loop** até 100% dos testes passar:
   - Roda testes
   - Encontra falhas
   - Corrige código (não o teste)
   - Roda novamente

4. **Entrega:**
   - Relatório de cobertura
   - Lista de todos os bugs encontrados e corrigidos
   - CI check configurado

## Requisitos

- ✅ Vitest ou Jest instalado
- ✅ timezone-mock disponível
- ✅ npm test -- --watch funcionando

## Benefício

Bugs de timezone como aquele das escalas **nunca mais** voltam.

## Resultado esperado

Suite de testes robusta + histórico de todas as correções feitas.
