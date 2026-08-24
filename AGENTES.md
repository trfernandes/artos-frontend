# 🤖 Agentes Especializados do Artos

Seu projeto possui **3 agentes Claude** que automatizam tarefas repetitivas de design, exploração e
qualidade.

Ao invés de você iterar manualmente, o agente faz o trabalho enquanto você toma um café. ☕

---

## 📊 Visão Geral Rápida

| Agente                    | O que faz                                      | Quando usar                                | Tempo     |
| ------------------------- | ---------------------------------------------- | ------------------------------------------ | --------- |
| **📱 Refinamento Visual** | Itera um componente UI até ficar pixel-perfect | Componente pronto mas com pequenos ajustes | 3-15 min  |
| **🎨 Design Paralelo**    | Explora 5 variantes de design simultaneamente  | Em dúvida sobre layout/direção visual      | 20-30 min |
| **⏰ Audit Timezone**     | Encontra e corrige bugs de data/hora           | Antes de deploy ou após bugs de timezone   | 15-30 min |

---

## 🎯 Qual Agente Usar?

```
Seu cenário                              Agente a usar
──────────────────────────────────────────────────────

Componente tem spacing errado            → Refinamento Visual
Cores não batem com o design             → Refinamento Visual
Badge está torto                         → Refinamento Visual

Não sabe qual layout escolher            → Design Paralelo
Quer comparar grid vs lista              → Design Paralelo
Apresentar 5 opções para stakeholder     → Design Paralelo

Horário de ensaio tá errado              → Audit Timezone
App quebra em horário de verão           → Audit Timezone
Agenda mostra data errada ao meio-noite  → Audit Timezone
```

---

## 🚀 Como Usar

### Opção 1: Refinamento Visual

```bash
/refinamento-autonomo [componente] [caminho-da-spec-image]

Exemplo:
/refinamento-autonomo notifications-card design/notifications-card.png
```

### Opção 2: Design Paralelo

```bash
/paralelo-design [tela-ou-componente]

Exemplo:
/paralelo-design team-members-tab
```

### Opção 3: Audit Timezone

```bash
/audit-timezone

# É só isso! Não precisa de parâmetros.
```

---

## 📚 Documentação Completa

Cada agente tem um guia detalhado com exemplos, pré-requisitos e troubleshooting:

### 📱 [Refinamento Visual Autônomo](docs/agentes/1-refinamento-visual-guia.md)

**Para**: Designers e devs de UI que querem iterar rápido.

**Aprender**: Como usar o agente para ajustar espaçamentos, cores, tamanhos até ficar perfeito.

### 🎨 [Design Paralelo](docs/agentes/2-design-paralelo-guia.md)

**Para**: Product managers e designers que exploram múltiplas direções.

**Aprender**: Como gerar 5 variantes de layout simultaneamente e comparar resultados.

### ⏰ [Audit Timezone](docs/agentes/3-audit-timezone-guia.md)

**Para**: Devs e QA que trabalham com datas e horários.

**Aprender**: Como auditar toda lógica de timezone e garantir testes robustos.

### 🔧 [Troubleshooting](docs/agentes/TROUBLESHOOTING.md)

**Para**: Quando algo der errado.

**Encontre**: Soluções rápidas para ADB, Expo, Git e TypeScript.

---

## ✅ Pré-requisitos Globais

### Para Refinamento Visual

- [ ] Telefone Android ou emulador
- [ ] USB Debugging ativado
- [ ] Expo rodando: `npx expo start`

### Para Design Paralelo

- [ ] Git configurado
- [ ] Pasta do projeto limpa (sem mudanças não committadas)

### Para Audit Timezone

- [ ] Jest ou Vitest instalado
- [ ] npm test funcionando

---

## 💡 Exemplos Reais

### Cenário 1: Designer quer refinar card

```
Designer: "O card de notificação tá quase perfeito, mas o spacing está 2px fora"

Você: /refinamento-autonomo notifications-card design/notifications-card.png

Resultado: 3 minutos depois, card perfeito com 2 commits automáticos
```

### Cenário 2: Precisa explorar layouts

```
PM: "Qual layout é melhor para listar voluntários? Grid? Lista? Cards?"

Você: /paralelo-design volunteers-list

Resultado: 25 minutos depois, 5 variantes implementadas com screenshots + análise
```

### Cenário 3: Bug de timezone em produção

```
QA: "Horário de ensaio tá errado quando muda timezone"

Você: /audit-timezone

Resultado: 20 minutos depois, 3 bugs encontrados e corrigidos com testes robustos
```

---

## 📊 Estatísticas de Economia

| Tarefa                             | Tempo Manual | Com Agente | Economia        |
| ---------------------------------- | ------------ | ---------- | --------------- |
| Refinar componente com 7 iterações | 30 min       | 8 min      | 22 min (73%)    |
| Explorar 5 variantes de design     | 3-4 horas    | 30 min     | 3,5 horas (87%) |
| Auditar timezone com testes        | 2 horas      | 25 min     | 1h 35min (79%)  |

---

## 🔄 Como Estão Integrados?

Os agentes estão como **skills Claude** no seu projeto:

```
.claude/skills/
├── refinamento-autonomo/     ← Refinement loop
├── paralelo-design/          ← Design exploration
└── audit-timezone/           ← Testing automation

.agents/skills/
└── code-review-expert/       ← Bônus: Code review automático
```

Cada skill tem seu próprio `SKILL.md` com instruções detalhadas.

---

## 🎓 Aprendizado Rápido

**5 minutos**: Leia este arquivo. **15 minutos**: Leia o guia do agente que você vai usar.
**Primeiro uso**: Comande o agente e observe. Tudo é reversível via git.

---

## ❓ Perguntas Frequentes

**P: Os agentes podem quebrar meu código?** A: Não. Cada mudança tem um commit automático. Você pode
reverter com `git revert`.

**P: Posso usar em iOS?** A: Sim (refinamento visual), mas Android é mais rápido. Design paralelo e
audit timezone funcionam em qualquer plataforma.

**P: E se algo der errado?** A: Veja [TROUBLESHOOTING.md](docs/agentes/TROUBLESHOOTING.md). Cobre
90% dos problemas.

**P: Quanto custa?** A: Zero. Os agentes rodamlocalmente usando seu arquivo `SKILL.md`.

**P: Posso usar os agentes simultaneamente?** A: Sim, mas recomenda-se um por vez para evitar
conflitos de git.

---

## 🚀 Começar Agora

1. Escolha um agente acima
2. Leia o guia correspondente (15 min)
3. Execute o comando
4. Observe o agente trabalhando

**Sugestão**: Comece com `/refinamento-autonomo` em um componente pequeno como teste.

---

## 📞 Suporte

- Problemas técnicos? → Ver [TROUBLESHOOTING.md](docs/agentes/TROUBLESHOOTING.md)
- Dúvidas sobre um agente? → Leia o guia correspondente
- Ideia de novo agente? → Adicione em [FUTURE.md](./FUTURE.md) (não existe ainda, criar se
  necessário)

---

**Última atualização**: Maio 2026  
**Status**: Todos os 3 agentes operacionais  
**Manutenção**: Ver `.claude/skills/*/SKILL.md` para detalhes técnicos
