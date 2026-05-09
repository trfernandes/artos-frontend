# 📱 Refinamento Visual Autônomo

## O que é?

Um **agente Claude que automaticamente corrige a aparência visual** de um componente até ficar exatamente como está desenhado no Figma.

Você diz qual componente quer refinar + mostra a imagem de design.

O agente então faz assim:
1. Muda o código do componente
2. Recarrega o app no seu telefone automaticamente
3. Tira screenshot via ADB com `scripts/take-screenshot.js`
4. Compara com o design com `scripts/compare-refinement-images.py`
5. Encontra diferenças (spacing, cor, tamanho)
6. Corrige no código
7. Repete até ficar pixel-perfect

**Resultado**: Componente visualmente idêntico à spec, com commits documentando cada iteração.

---

## 🎯 Para que serve?

Você estava gastando **30-45 minutos** ajustando espaçamentos, cores, tamanhos um detalhe por vez.

Agora o agente faz **em 5-15 minutos** enquanto você toma café. ☕

### Exemplos reais
- **Card de notificação** com spacing errado → 8 iterações, 10 minutos
- **Badges de evento** com tamanho incorreto → 3 iterações, 4 minutos
- **Drawer header** com cores desalinhadas → 2 iterações, 3 minutos
- **Lista de voluntários** com padding inconsistente → 5 iterações, 7 minutos

---

## 🚀 Como Usar (Passo a Passo)

### Passo 1️⃣: Prepare uma Imagem de Design

Você precisa de uma imagem PNG mostrando **exatamente como o componente deve ficar**.

**Opção A**: Screenshot do Figma
1. Abra seu design no Figma
2. Selecione o componente
3. Print screen ou export como PNG
4. Salve em: `artos_frontend/design/meu-componente.png`

**Opção B**: Screenshot do seu app anterior
1. Se já tinha uma versão boa, tira screenshot
2. Salva em: `artos_frontend/design/meu-componente.png`

**Dica**: Use nomes descritivos:
```
artos_frontend/design/
├── notifications-card.png
├── event-badge.png
├── drawer-header.png
└── volunteer-list-item.png
```

### Passo 2️⃣: Tenha o App Rodando

O agente precisa ver o app rodando no seu telefone para tirar screenshots.

```bash
# Terminal 1: Abra a pasta do app
cd artos_frontend

# Inicie o Expo
npx expo start

# Vai aparecer um QR code no terminal
# Escaneia com seu telefone (Expo app ou câmera)
# Espera carregar
```

**Verificação**: O app deve estar rodando no seu telefone antes de chamar o agente.

### Passo 3️⃣: Chame o Agente

Aqui é o simples:

```
/refinamento-autonomo [nome-do-componente] [caminho-da-imagem]
```

**Exemplos**:
```
/refinamento-autonomo notifications-card design/notifications-card.png

/refinamento-autonomo event-badge design/event-badge.png

/refinamento-autonomo drawer-header design/drawer-header.png
```

### Passo 4️⃣: Sente e Observe

O agente começa a trabalhar. Você vai ver:

```
✅ Analisando imagem spec...
✅ Localizando componente NotificationsCard...
✅ Iteração 1:
   - Tira screenshot
   - Compara com spec
   - Encontra: spacing do title 2px maior
   - Corrige código
   - Faz commit: "iter 1: ajusta spacing do title"

✅ Iteração 2:
   - Tira screenshot
   - Compara com spec
   - Encontra: badge 1px pequeno
   - Corrige código
   - Faz commit: "iter 2: aumenta tamanho do badge"

✅ Iteração 3:
   - Tira screenshot
   - Compara com spec
   - ✨ PERFEITO! Menos de 3 diferenças.
   - Faz commit final
```

---

## ⏱️ Quanto Tempo Leva?

Depende da complexidade:

| Tipo | Iterações | Tempo |
|------|-----------|-------|
| Simples (1-2 mudanças) | 3-4 | 3-5 min |
| Normal (3-5 mudanças) | 5-7 | 7-10 min |
| Complexo (6+ mudanças) | 8-10 | 12-15 min |

---

## ✅ O que Esperar

### Commits Automáticos
O agente cria um commit após cada iteração bem-sucedida:

```
git log --oneline
```

Você verá:
```
a1b2c3d [refinamento-autonomo] iter 8: centraliza ícone — PERFEITO!
d4e5f6g [refinamento-autonomo] iter 7: ajusta cor do background
h8i9j0k [refinamento-autonomo] iter 6: aumenta padding do texto
...
```

### Zero TypeScript Errors
O agente executa `npx tsc --noEmit` após cada mudança. Se houver TS error, ele corrige antes de continuar.

### Componente Pixel-Perfect
Quando terminar, o componente será visualmente idêntico à spec image.

---

## 🔧 Pré-requisitos

### Hardware
- [ ] **Telefone Android** (ou emulador)
- [ ] **Cabo USB** (para conexão ADB)
- [ ] **Computador com ADB instalado**

### Software
- [ ] **Node.js >= 16**
- [ ] **Expo CLI**: `npm install -g expo-cli` (ou `npm i -D expo`)
- [ ] **ADB no PATH**: `adb devices` funciona no terminal
- [ ] **App rodando**: `npx expo start` funcionando
- [ ] **Git configurado**: commits automáticos funcionam

### Configuração Rápida

#### 1. Instale ADB (se ainda não tem)

**Windows**:
```bash
# Com chocolatey
choco install adb

# Ou baixe em: https://developer.android.com/tools/adb
```

**Mac**:
```bash
brew install android-platform-tools
```

**Linux**:
```bash
sudo apt-get install android-tools-adb
```

#### 2. Configure USB Debugging no Telefone

```
Telefone:
1. Configurações → Sobre o telefone
2. Toque "Número da compilação" 7 vezes (até aparecer "Modo de desenvolvedor ativado")
3. Volta → Opções de desenvolvedor
4. Ativa "Depuração USB"
5. Conecta o telefone no computador
6. Você vai ver um popup: "Permitir Depuração?"
7. Toca "Permitir"
```

#### 3. Teste a Conexão

```bash
adb devices

# Deve mostrar:
# List of attached devices
# abc123def456       device

# Se não aparecer, siga troubleshooting abaixo
```

#### 4. Teste Screenshot

```bash
# Na pasta artos_frontend:
node scripts/take-screenshot.js test.png

# Deve criar um arquivo test.png em 2 segundos
```

#### 5. Teste Comparação

```bash
# Na pasta artos_frontend:
powershell -File scripts/run-refinement-capture.ps1 -ReferenceImage design/notifications-card.png
```

Isso gera:

- `.artifacts/refinement/current.png`
- `.artifacts/refinement/comparison/diff-overlay.png`
- `.artifacts/refinement/comparison/side-by-side.png`
- `.artifacts/refinement/comparison/metrics.json`

---

## 📚 Exemplos Práticos

### Exemplo 1: Refinar Notifications Card

Seu designer redesenhou o card de notificação. Precisa ficar EXATAMENTE assim.

**Setup**:
1. Export do Figma: `design/notifications-card.png`
2. App rodando: `npx expo start`
3. Abre a tela de notificações no app

**Comando**:
```
/refinamento-autonomo notifications-card design/notifications-card.png
```

**Resultado esperado**:
- 4-5 iterações
- 5 minutos
- Card pixel-perfect
- 5 commits automáticos

---

### Exemplo 2: Ajustar Event Badge

Seu badge de "Hoje às 15h" está com tamanho errado.

**Setup**:
1. Screenshot do design: `design/event-badge.png`
2. App rodando, navegue para uma tela com evento

**Comando**:
```
/refinamento-autonomo event-badge design/event-badge.png
```

**Resultado esperado**:
- 2-3 iterações
- 3 minutos
- Badge alinhado
- Cores e tamanho corretos

---

### Exemplo 3: Refinar Volunteer List Item

Sua lista de voluntários tem espaçamentos inconsistentes.

**Setup**:
1. Print do Figma: `design/volunteer-list-item.png`
2. App rodando na aba "Voluntários"

**Comando**:
```
/refinamento-autonomo volunteer-list-item design/volunteer-list-item.png
```

**Resultado esperado**:
- 6-7 iterações
- 8 minutos
- List item com spacing consistente
- Alinhado com design system

---

## ❓ FAQ

### P: Posso usar em iOS?
**A**: Sim, você pode. Mas precisa de:
- Mac com Xcode instalado
- Apple Developer Account
- É mais lento que Android

Recomendação: Use Android para desenvolvimento, iOS apenas para testes finais.

### P: E se eu não tiver um telefone Android?
**A**: Use um emulador Android Studio:
1. Instale Android Studio
2. Cria um emulador virtual
3. ADB conecta automaticamente
4. Funciona igualmente bem

### P: O agente pode quebrar alguma coisa?
**A**: Não. Cada iteração cria um commit automático. Se algo der errado:
```bash
# Reverter para versão anterior
git revert [commit-hash]

# Ou reverter últimas 3 iterações
git reset --soft HEAD~3
```

### P: Quanto tempo levam 10 iterações?
**A**: ~15 minutos. Depende de:
- Velocidade de reload do Expo (~2-3s)
- Tempo de análise visual do agente (~1-2s)
- Complexidade das mudanças

### P: Posso refinar 2 componentes ao mesmo tempo?
**A**: Tecnicamente sim, mas não recomendo. Git pode criar conflitos. Faça um por vez.

### P: O que acontece se houver TypeScript errors?
**A**: O agente detecta, corrige e continua. Você nunca terá TS errors no final.

### P: Preciso de internet?
**A**: Não! Tudo roda localmente. Claude roda offline.

---

## 🔧 Troubleshooting

### ❌ Problema: "ADB não reconhece o telefone"

**Solução**:
1. Desconecta o telefone
2. Ativa USB Debugging (veja pré-requisitos)
3. Reconecta o telefone
4. Autoriza no popup do telefone
5. Testa: `adb devices`

Se ainda não funcionar:
- Tenta outro cabo USB
- Desativa e reativa "Depuração USB"
- Reinicia o telefone

---

### ❌ Problema: "Screenshot retorna erro"

**Solução**:
```bash
# Teste manualmente:
node scripts/take-screenshot.js debug.png

# Se falhar com "permission denied":
# Seu phone talvez não tenha permissão

# Se falhar com "device not found":
adb devices  # Verifique se seu phone aparece
```

Se o arquivo apareceu, a captura ADB está funcionando. Depois valide a comparação:

```bash
powershell -File scripts/run-refinement-capture.ps1 -ReferenceImage design/notifications-card.png
```

---

### ❌ Problema: "App não recarrega durante iterações"

**Solução**:
1. Fecha o app no telefone
2. Vai no terminal rodando `npx expo start`
3. Escaneia o QR code novamente
4. Espera carregar completamente
5. Tenta o agente novamente

Se ainda não funcionar:
```bash
# Mata todos os processos Expo
npx expo stop

# Limpa cache
rm -rf node_modules/.cache

# Inicia novamente
npx expo start --clear
```

---

### ❌ Problema: "Agente não acha o componente"

**Solução**:
- Certifica que o componente existe e tem nome único
- Exemplo: `NotificationsCard` em `components/NotificationsCard.tsx`
- Use o nome exato do arquivo ou do componente

```bash
# Procura o componente:
grep -r "NotificationsCard" artos_frontend/components/
```

---

### ❌ Problema: "TypeScript errors durante refinement"

**Solução**:
O agente já trata isso, mas se aparecer erro final:
```bash
npx tsc --noEmit

# Veja o erro e comunique ao agente
# O agente corrigirá automaticamente
```

---

## 📊 Monitorando Progresso

Durante a execução, você pode ver:

```bash
# Em outro terminal, monitora commits:
watch git log --oneline -10

# Vê as mudanças em tempo real:
git diff HEAD
```

---

## ✨ Dicas e Tricks

### Dica 1: Tenha as imagens de design prontas
Antes de chamar o agente, organize suas imagens:
```
design/
├── notifications-card.png
├── event-badge.png
├── drawer-header.png
└── volunteer-list-item.png
```

### Dica 2: Teste com componentes simples primeiro
Comece refinando um badge ou texto pequeno. Pega experiência com componentes complexos depois.

### Dica 3: Mantenha o telefone ativo
O agente tira screenshots continuamente. Mantenha a tela do telefone ativa (não dorme).

### Dica 4: Commits descritivos ajudam
Os commits automáticos são descritivos:
```
[refinamento-autonomo] iter 1: ajusta spacing do card
[refinamento-autonomo] iter 2: corrige cor do badge
```

Isso deixa o histórico git super limpo para revisar depois.

### Dica 5: Use dark mode se preferir
O agente captura screenshots com seu tema atual (light/dark). Use o que você quer no resultado final.

---

## 🎓 Aprendizado Rápido

**Primeiro uso**: 5-10 minutos
**Uso subsequente**: 30 segundos (só chamar o agente)

---

## 📞 Se Algo Não Funcionar

1. Veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para problemas comuns
2. Verifique logs: `git log --oneline` para ver commits do agente
3. Reverta com `git reset --soft HEAD~3` se necessário

---

**Última atualização**: Maio 2026  
**Status**: Operacional ✅  
**Próxima versão**: iOS support melhorado
