---
name: paralelo-design
description: Spawn 5 agentes paralelos para explorar variantes de design simultaneamente
---

# Exploração de Design Paralelo

Cria 5 variantes de design diferentes **ao mesmo tempo** para você comparar e escolher.

## Como usar

```
/paralelo-design [tela/componente]
```

**Exemplo:**

```
/paralelo-design team-members-tab
```

## O que faz

1. **Cria 5 git worktrees** isoladas (team-variant-1, team-variant-2, etc)
2. **Cada agente implementa** um design diferente:
   - Variant 1: Grid com fotos grandes
   - Variant 2: Lista densa/compacta
   - Variant 3: Cards tipo bento
   - Variant 4: Lista com texto completo
   - Variant 5: 2-column roster

3. **Cada agente:**
   - Escreve o código (zero TS errors)
   - Tira screenshot via Expo
   - Escreve `DESIGN_NOTES.md` com vantagens/desvantagens

4. **Você recebe:**
   - 5 screenshots lado a lado
   - Matriz de comparação
   - Recomendação de qual merge

## Timing

- ⏱️ Leva ~20-30 minutos
- 🎯 Resultado: você vê todas as opções de uma vez

## Resultado esperado

Galeria visual com 5 designs + análise comparativa. Você escolhe qual gosta mais.
