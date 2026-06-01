# 🎨 Exploração de Design Paralelo

## O que é?

Um **agente que gera 5 variantes de design completamente diferentes AO MESMO TEMPO**.

Ao invés de você propor 1 design, iterar, descartar e tentar outro (que leva 3-4 horas), você vê
todas as 5 opções lado a lado em **30 minutos**.

```
Fluxo tradicional:          Fluxo com Design Paralelo:
────────────────────       ─────────────────────────

Propõe design A             Você → /paralelo-design
    ↓                              ↓
Itera por 1h            5 agentes criam em paralelo
    ↓                   (20-30 minutos)
Descarta A                         ↓
    ↓                       Você recebe:
Propõe design B           - 5 screenshots
    ↓                     - Matriz comparativa
Itera por 1h              - Recomendação
    ↓
Descarta B
    ↓
...até achar um bom
(3-4 horas no total)
```

**Resultado**: 5 designs implementados, testados e documentados. Você escolhe qual é melhor.

---

## 🎯 Para que serve?

Use quando:

✅ **Você está em dúvida** entre múltiplos layouts  
✅ **Quer explorar rapidamente** sem compromisso  
✅ **Precisa apresentar opções** para stakeholder ou PM  
✅ **Novidade de feature** e não tem direction clara  
✅ **Redesign** e quer explorar direções diferentes

---

## 🚀 Como Usar

### Um Comando Simples

```bash
/paralelo-design [tela-ou-componente]
```

**Exemplos**:

```
/paralelo-design team-members-tab

/paralelo-design volunteer-scheduler

/paralelo-design notifications-drawer

/paralelo-design event-card
```

### O que Acontece Depois

```
Você: /paralelo-design team-members-tab

↓ Agente cria 5 git worktrees isoladas

├─ team-variant-1/  (Grid com fotos grandes)
├─ team-variant-2/  (Lista densa)
├─ team-variant-3/  (Cards tipo bento)
├─ team-variant-4/  (Lista com texto completo)
└─ team-variant-5/  (2-column roster)

↓ Cada agente trabalha em paralelo

Iteração 1: ████░░░░░  50%
Iteração 2: ██░░░░░░░  20%
Iteração 3: ██████░░░  60%
Iteração 4: ███░░░░░░  30%
Iteração 5: █████░░░░  50%

↓ Todas terminam simultaneamente (~30 min)

↓ Você recebe:

📱 Screenshot 1    📱 Screenshot 2    📱 Screenshot 3
Grid + Fotos      Lista Densa       Cards Bento

📱 Screenshot 4    📱 Screenshot 5
Texto Completo    2-Column Roster

+

Matriz Comparativa:
┌────────────┬──────────┬──────────┬─────────┬──────────┐
│ Variant    │ Layout   │ Touchs   │ Densidy │ Score    │
├────────────┼──────────┼──────────┼─────────┼──────────┤
│ 1: Grid    │ Espaçoso │ 60pt btn │ Baixa   │ ⭐⭐⭐   │
│ 2: Lista   │ Compacta │ 48pt btn │ Alta    │ ⭐⭐⭐⭐ │
│ 3: Bento   │ Dinâmica │ 56pt btn │ Média   │ ⭐⭐⭐⭐⭐│
│ 4: Texto   │ Verbosa  │ 52pt btn │ Alta    │ ⭐⭐    │
│ 5: 2-Col   │ Balanço  │ 54pt btn │ Média   │ ⭐⭐⭐⭐ │
└────────────┴──────────┴──────────┴─────────┴──────────┘

Recomendação:
A Variant 3 (Bento Cards) oferece melhor balanço de
densidade, accessibilidade (touch targets) e estética.
Merge: variant-3
```

---

## ⏱️ Timeline

| Fase            | Duração     | O que acontece                   |
| --------------- | ----------- | -------------------------------- |
| Setup           | 30s         | Agente cria 5 worktrees          |
| Desenvolvimento | 20-25 min   | 5 agentes codificam em paralelo  |
| Screenshots     | 2-3 min     | Tira screenshot de cada variante |
| Análise         | 2 min       | Compila matriz comparativa       |
| **Total**       | **~30 min** | Você tem 5 opções prontas        |

---

## ✅ Pré-requisitos

### Software

- [ ] Git configurado
- [ ] Node.js 16+
- [ ] Expo instalado

### Estado do Projeto

- [ ] Sem mudanças não-committadas (`git status` limpo)
- [ ] Branch limpa (não em meio a rebase/merge)
- [ ] Nenhuma git worktree ativa de exploração anterior

### Verificação Rápida

```bash
# Certifica que está tudo limpo:
git status
# Deve retornar: "nothing to commit, working tree clean"

# Não deve ter worktrees antigas:
git worktree list
# Deve retornar: apenas ./main (sua branch atual)
```

---

## 🎨 As 5 Variantes Padrão

O agente cria essas 5 designs automaticamente:

### Variant 1: Grid com Fotos Grandes

```
┌─────────┬─────────┐
│ Foto 1  │ Foto 2  │
│ Nome 1  │ Nome 2  │
└─────────┴─────────┘
┌─────────┬─────────┐
│ Foto 3  │ Foto 4  │
│ Nome 3  │ Nome 4  │
└─────────┴─────────┘
```

- ✅ Visual, elegante
- ❌ Baixa densidade
- 💡 Bom para descoberta

---

### Variant 2: Lista Densa/Compacta

```
1. Nome 1   📞 📧
2. Nome 2   📞 📧
3. Nome 3   📞 📧
4. Nome 4   📞 📧
```

- ✅ Muito compacta
- ✅ Fácil de escanear
- ❌ Menos visual
- 💡 Bom para listas longas

---

### Variant 3: Cards Tipo Bento

```
┌────────────────────┐
│ 📸 Nome 1          │
│ Role | Team        │
│ 📞  📧  ✉️         │
└────────────────────┘
┌────────────────────┐
│ 📸 Nome 2          │
│ Role | Team        │
│ 📞  📧  ✉️         │
└────────────────────┘
```

- ✅ Bonito e informativo
- ✅ Boa densidade
- ✅ Toque targets grandes
- 💡 Bom balanço geral

---

### Variant 4: Lista com Texto Completo

```
Nome Completo
Role: Coordenador | Team: Louvor
Contato: 11 98765-4321 | email@...
───────────────────────────────────
Nome Completo
Role: Volunteer | Team: Crianças
Contato: 11 91234-5678 | email@...
───────────────────────────────────
```

- ✅ Muito informativo
- ✅ Tudo em uma linha
- ❌ Longo demais em mobile
- 💡 Bom para detalhes

---

### Variant 5: 2-Column Roster (Balanço)

```
┌──────────┬──────────┐
│ Foto 1   │ Foto 2   │
│ Nome 1   │ Nome 2   │
│ Role | T │ Role | T │
└──────────┴──────────┘
┌──────────┬──────────┐
│ Foto 3   │ Foto 4   │
│ Nome 3   │ Nome 4   │
│ Role | T │ Role | T │
└──────────┴──────────┘
```

- ✅ Visual e compacta
- ✅ Balanço bom
- ✅ Toque targets grandes
- 💡 Meio-termo versátil

---

## 📚 Exemplos Reais

### Exemplo 1: Redesenhar Team Members Tab

**Contexto**: Seu PM quer explorar como apresentar voluntários.

**Setup**:

```bash
# Certifica branch limpa
git status  # "nothing to commit"
git worktree list  # apenas ./main
```

**Comando**:

```
/paralelo-design team-members-tab
```

**Aguarda**: ~30 minutos

**Resultado**:

- 5 screenshots de diferentes layouts
- Matriz mostrando:
  - Densidade de informação
  - Touch target sizes
  - Facilidade de escanear
  - Visual appeal
- Recomendação: "Variant 3 (Bento) é o melhor balanço"

**Próximo passo**:

```bash
# Se gostou da variant 3, merge:
git checkout team-variant-3
git checkout -b feature/redesign-team
git merge team-variant-1
git merge team-variant-2
# ... etc

# Ou apenas copia o código da variant que gostou
```

---

### Exemplo 2: Explorar Layouts de Scheduler

**Contexto**: Nova feature de agendamento. Não sabe qual layout.

**Setup**:

```bash
git status  # Limpo ✅
```

**Comando**:

```
/paralelo-design volunteer-scheduler
```

**Resultado**: 30 min depois, 5 formas de apresentar calendário/horários.

---

### Exemplo 3: Redesign de Event Card

**Contexto**: Event card precisa de redesign. Explorar estilos.

**Comando**:

```
/paralelo-design event-card
```

**Resultado**: 5 variantes de card com diferentes estilos, informações, visual.

---

## ❓ FAQ

### P: As 5 variantes sempre são as mesmas?

**A**: Por padrão sim (grid, lista, bento, texto, 2-column). Você pode customizar pedindo:

```
/paralelo-design team-members-tab
Com variantes: grid, carrossel, expandable-list, tabs, avatar-only
```

### P: Qual variante devo escolher?

**A**: A recomendação do agente é baseada em:

- Densidade de informação
- Touch targets accessíveis (>44px)
- Facilidade de escanear
- Visual appeal

Mas a escolha é sua! Pode chooser qualquer uma.

### P: E se nenhuma das 5 for boa?

**A**: Raro, mas possível. Faça:

1. Escolha a mais próxima
2. Use `/refinamento-autonomo` para iterar
3. Ou especifique variantes customizadas no próximo /paralelo-design

### P: Posso escolher 2 elementos de variantes diferentes?

**A**: Sim! Você pode mixar:

- Layout da variant 2
- Cards da variant 3
- Cores da variant 5

Mantenha o seu próprio branch e cherry-pick o que gostou.

### P: Quanto tempo leva mesmo?

**A**: Normalmente 25-35 minutos depending de:

- Tamanho da tela
- Complexidade dos dados
- Performance do seu PC
- Velocidade de Expo

### P: Preciso fazer nada enquanto ele trabalha?

**A**: Não! É completamente autônomo. Você pode sair, tomar café, fazer outra coisa.

### P: Git worktrees criadas onde?

**A**: Na mesma pasta do projeto:

```
artos_frontend/
├── .
├── team-variant-1/  ← worktree criada pelo agente
├── team-variant-2/
├── team-variant-3/
├── team-variant-4/
├── team-variant-5/
└── ... (seu projeto original intacto)
```

Depois de terminar:

```bash
# Remove worktrees não utilizadas:
git worktree remove ../team-variant-1
git worktree remove ../team-variant-2
# etc
```

---

## 🔧 Troubleshooting

### ❌ Problema: "Working tree dirty, not ready for exploration"

**Solução**:

```bash
# Commit suas mudanças:
git add .
git commit -m "WIP: seu commit message"

# Ou stash se não quer commitar:
git stash

# Testa:
git status  # Deve ser limpo
```

---

### ❌ Problema: "Git worktree error - variant-1 already exists"

**Solução**:

```bash
# Remove worktrees antigas:
git worktree list

# Remove cada uma:
git worktree remove ../team-variant-1
git worktree remove ../team-variant-2
# etc

# Ou força:
rm -rf ../team-variant-*
```

Depois tenta novamente.

---

### ❌ Problema: "Expo error - cannot start on all 5 variants"

**Solução**: Cada variant tenta rodar seu próprio Expo na porta 8081. Se conflitar:

```bash
# Mata todos os Expos:
pkill -f "expo"  # Mac/Linux
taskkill /F /IM node.exe  # Windows

# Espera 10 segundos
# Tenta novamente
```

---

### ❌ Problema: "Agente criou tudo mas screenshots saem brancas"

**Solução**: Seus telefone talvez não conectou. Verifique:

```bash
adb devices
# Deve aparecer seu device

# Se não aparecer:
# 1. Desconecta USB
# 2. Ativa USB Debugging novamente
# 3. Reconecta
```

Se o problema persistir, veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## 📊 Monitorando Progresso

Enquanto o agente trabalha, você pode:

```bash
# Ver commits das 5 branches:
git log --all --graph --oneline

# Ver size de cada worktree:
du -sh ../team-variant-*

# Ver se Expo tá rodando:
ps aux | grep expo
```

---

## ✨ Dicas

### Dica 1: Comece com componentes simples

Seu primeiro /paralelo-design com um card pequeno, não uma tela inteira.

### Dica 2: Organize seus screenshots

Depois, salva os 5 screenshots em uma pasta:

```
comparisons/
├── 2026-05-05_team-members/
│   ├── variant-1-grid.png
│   ├── variant-2-lista.png
│   ├── variant-3-bento.png
│   ├── variant-4-texto.png
│   └── variant-5-2col.png
└── ANALYSIS.md
```

### Dica 3: Faça notas rápidas

Durante o agente trabalhar, anote suas primeiras impressões:

```markdown
## Primeiras Impressões

Variant 1 (Grid): Muito espaçoso, acho bonito Variant 2 (Lista): Muito compacta, cansa ler Variant 3
(Bento): Achei perfeito! Variant 4 (Texto): Muita informação Variant 5 (2-Col): Também bom,
alternativa para variant 3
```

### Dica 4: Teste em diferentes tamanhos

Se seu app suporta múltiplos tamanhos, rode em:

- Telefone pequeno (4.5")
- Telefone médio (6")
- Tablet (7-10")

Cada layout pode ter comportamento diferente.

### Dica 5: Considere Dark Mode

O agente captura com seu tema atual. Se seu app usa dark mode, mude antes:

```
App Settings → Theme → Dark
```

---

## 🎓 Fluxo Completo: Do Conceito ao Merge

```
1. Você tem uma nova feature
2. Não sabe qual layout
3. Chama: /paralelo-design new-feature
4. Aguarda ~30 minutos
5. Recebe 5 screenshots + análise
6. Escolhe a melhor (ex: variant-3)
7. Faz checkout:
   git checkout team-variant-3
8. Cria branch de feature:
   git checkout -b feature/new-layout
9. Faz merge com main:
   git merge main
10. Refina com /refinamento-autonomo se necessário
11. Commita e faz PR
12. Deploy!
```

---

## 📞 Próximos Passos

Depois de escolher uma variante:

1. **Refine**: Use `/refinamento-autonomo` para pixel-perfect
2. **Teste**: Rode em múltiplos devices
3. **Valide**: Peça feedback de stakeholder
4. **Merge**: Para main
5. **Deploy**: Para produção

---

**Última atualização**: Maio 2026  
**Status**: Operacional ✅  
**Próxima versão**: Customização de variantes por parâmetro
