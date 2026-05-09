# 🔧 Troubleshooting - Guia Rápido

Problemas comuns com os 3 agentes e soluções rápidas.

---

## 📱 Refinamento Visual

### ❌ "ADB não reconhece o telefone"

**Verificação rápida**:
```bash
adb devices
# Se não aparece seu telefone:
```

**Solução**:
1. **Ativa USB Debugging no telefone**:
   - Configurações → Sobre o telefone
   - Toque "Número da compilação" 7 vezes
   - Volta → Opções de desenvolvedor
   - Ativa "Depuração USB"

2. **Autoriza no telefone**:
   - Você vai ver: "Permitir Depuração?"
   - Toca "Permitir"

3. **Reconecta USB**:
   - Desconecta o cabo
   - Aguarda 10 segundos
   - Reconecta

4. **Testa novamente**:
   ```bash
   adb devices
   # Deve aparecer seu device agora
   ```

**Se ainda não funcionar**:
- Tenta outro cabo USB (seu pode estar ruim)
- Reinicia o telefone
- Reinicia o computador
- Atualiza drivers ADB (raro, mas possível)

---

### ❌ "Screenshot sai branco ou pixelado"

**Solução**:
```bash
# Testa screenshot manualmente:
node scripts/take-screenshot.js debug.png

# Abre o arquivo debug.png
# Se saiu branco: problema de permissão
# Se saiu pixelado: problema de render
```

**Se branco** (permissão):
```bash
# Autoriza captura de tela:
adb shell pm grant com.expo.modules Android.permission.CAPTURE_SECURE_SURFACE
```

**Se pixelado** (render):
- Certifica que o app tá responsivo
- Fecha outras apps
- Verifica se telefone tem >= 3GB RAM livre
- Tira screenshot novamente

---

### ❌ "App não recarrega durante refinement"

**Solução**:
1. **Verifica Expo**:
   ```bash
   cd artos_frontend
   npx expo start
   # Deve aparecer QR code
   ```

2. **Escaneia QR code**:
   - Abre câmera do telefone
   - Aponta para QR code
   - Toca na notificação
   - Espera app carregar (10-20 segundos)

3. **Se não funcionar**:
   ```bash
   # Mata Expo antigo:
   npx expo stop
   
   # Limpa cache:
   rm -rf node_modules/.cache
   
   # Inicia novamente:
   npx expo start --clear
   ```

4. **Manualmente no telefone**:
   - Abre app do Expo
   - Toca em "recente"
   - Seu project deve aparecer
   - Toca para recarregar

---

### ❌ "TypeScript errors durante refinement"

**Solução**:
```bash
# Verifica erros:
npx tsc --noEmit

# Se houver erro, agente vai corrigir automaticamente
# Se não corrigir, você corrige manual:
# 1. Abre arquivo com erro
# 2. Fixa o erro
# 3. Salva
# 4. Agente continua
```

---

### ❌ "Agente não acha o componente"

**Solução**:
```bash
# Procura o componente:
grep -r "NotificationsCard" artos_frontend/

# Deve aparecer: components/NotificationsCard.tsx
# Use exatamente este nome no comando:
/refinamento-autonomo NotificationsCard design/...

# Não use variações:
# ❌ notifications-card (kebab-case)
# ❌ NotificationCard (singular)
# ✅ NotificationsCard (exato do arquivo)
```

---

### ❌ "Imagem de design não encontrada"

**Solução**:
```bash
# Verifica se arquivo existe:
ls -la artos_frontend/design/

# Deve ter:
# design/notifications-card.png
# design/event-badge.png
# etc

# Se não tiver, salva a imagem:
# 1. Abre Figma
# 2. Export do componente
# 3. Salva em: artos_frontend/design/[nome].png
```

---

## 🎨 Design Paralelo

### ❌ "Git worktrees já existem"

**Solução**:
```bash
# Remove worktrees antigas:
git worktree list

# Para cada uma que vê:
git worktree remove ../team-variant-1
git worktree remove ../team-variant-2
# etc

# Ou force remove:
rm -rf ../team-variant-*

# Tenta novamente:
/paralelo-design seu-componente
```

---

### ❌ "Working tree dirty - não posso fazer worktrees"

**Solução**:
```bash
# Verifique seu estado:
git status

# Se tem mudanças, commita:
git add .
git commit -m "WIP: suas mudanças"

# Ou stash se não quer commitar:
git stash

# Verifica se tá limpo:
git status
# Deve retornar: "nothing to commit, working tree clean"

# Agora pode rodar agente
```

---

### ❌ "Expo não consegue rodar em 5 variants"

**Solução**:
```bash
# Mata todos os Expos:
pkill -f "expo"        # Mac/Linux
taskkill /F /IM node.exe  # Windows (force kill todos nodes)

# Espera 10 segundos
# Testa novo Expo:
npx expo start

# Se tiver erro de porta:
# Tenta outra porta:
npx expo start --port 8082
```

---

### ❌ "Screenshots dos variants saem brancas"

**Solução**:
Seu telefone não conectou ao ADB.

```bash
# Verifica conexão:
adb devices

# Se não aparece device:
# Reconecta USB + autoriza novamente (ver refinamento visual)

# Se aparece mas screenshots em branco:
# Problema no Expo das variants
# Verifica logs:
cd ../team-variant-1
npx expo start
# Vê se tem erro no terminal
```

---

### ❌ "Agente criou tudo mas matriz comparativa está incompleta"

**Solução**:
```bash
# Tira screenshots manualmente de cada variant:
cd ../team-variant-1
npx expo start
node scripts/take-screenshot.js variant1.png
# Repete para cada variant

# Compila você mesmo a matriz
# Agente tentou mas talvez telefone não conectou
```

---

## ⏰ Audit Timezone

### ❌ "npm test não funciona"

**Solução**:
```bash
# Limpa e reinstala:
rm -rf node_modules package-lock.json
npm install

# Tenta rodar testes:
npm test

# Se ainda falhar com jest/vitest error:
npm install --save-dev jest @types/jest
# ou
npm install --save-dev vitest
```

---

### ❌ "timezone-mock não existe"

**Solução**:
```bash
npm install --save-dev timezone-mock

# Agente tenta instalar automaticamente
# Mas se não conseguir, você instala manual
```

---

### ❌ "Um teste falha mesmo após agente corrigir"

**Solução**:
```bash
# Vê qual teste falhou:
npm test -- --verbose

# Encontra o arquivo:
find . -name "*.test.ts" | grep timezone

# Lê o teste e o código
# Manual debug se necessário:

# 1. Abre arquivo com teste
# 2. Lê o que tá testando
# 3. Abre arquivo com função
# 4. Compara lógica
# 5. Fixa se necessário

# Testa novamente:
npm test
```

---

### ❌ "Agente encontra 0 bugs/funções com datas"

**Solução**:
Suas funções podem estar nomeadas diferente.

```bash
# Procura por keywords:
grep -r "Date\|Time\|timezone\|hour\|minute\|second" src/ --include="*.ts"

# Se encontrar, renomeia para padrão:
# ❌ getTime() → ✅ getRehearsalTime()
# ❌ format() → ✅ formatEventDate()
# ❌ calc() → ✅ calculateCountdownTime()

# Tenta novamente:
/audit-timezone
```

---

### ❌ "Testes criados, mas cobertura baixa"

**Solução**:
Agente talvez não tenha encontrado todas funções com datas.

```bash
# Vê cobertura atual:
npm test -- --coverage

# Procura o que tá faltando:
grep -r "new Date\|Date.now()\|getTime()" src/ --include="*.ts"

# Se tem muitas funções, agente talvez tenha perdido:
# Reporte qual função falta teste
# Ou rode /audit-timezone novamente
```

---

### ❌ "Agente criou testes mas código não muda"

**Solução**:
```bash
# Agente às vezes cria testes sem corrigir se muito complexo
# Você corrige manual:

# 1. Vê qual teste falha:
npm test -- --verbose

# 2. Encontra o código:
grep -r "function-name" src/

# 3. Fixa:
# Abre arquivo
# Lê o teste
# Identifica o problema
# Corrige o código

# 4. Testa:
npm test
```

---

## 🌍 Problemas Globais (Todos os Agentes)

### ❌ "Mudanças não foram committed"

**Solução**:
```bash
# Vê o que tem não committed:
git status

# Adiciona tudo:
git add .

# Commita:
git commit -m "agente: mudanças automáticas"

# Se agente quebrou algo:
# Volta atrás:
git revert [hash-do-commit-ruim]
```

---

### ❌ "Node.js / npm não tá funcionando"

**Solução**:
```bash
# Verifica versão:
node --version  # Deve ser 16+
npm --version   # Deve ser 8+

# Se muito velho, atualiza:
# Windows: https://nodejs.org/en/download/
# Mac: brew install node
# Linux: sudo apt-get install nodejs npm

# Depois:
npm install --global npm@latest
```

---

### ❌ "Git não tá funcionando"

**Solução**:
```bash
# Verifica status:
git status

# Se erro de permissão/credencial:
# Configure:
git config user.name "Seu Nome"
git config user.email "seu@email.com"

# Se submodules problem:
git submodule update --init --recursive

# Se corrupted:
# Drástico, mas último recurso:
# Backup tudo
# Clone de novo
# Merge suas changes manualmente
```

---

### ❌ "Terminal tá confuso / outputs estranhos"

**Solução**:
```bash
# Limpa terminal:
clear  # Mac/Linux
cls    # Windows

# Sai do diretório e volta:
cd ../
cd artos_frontend

# Novo terminal:
# Às vezes é mais rápido que limpar
```

---

## 🆘 Se Nada Funcionar

### Plano de Resgate

1. **Volta para versão anterior**:
   ```bash
   git log --oneline
   # Vê o hash anterior ao agente bagunçar
   git reset --hard [hash-anterior]
   ```

2. **Limpa tudo**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Reinicia tudo**:
   ```bash
   # Mata processos:
   pkill -f expo
   pkill -f node
   pkill -f npm
   
   # Novo terminal
   npx expo start
   ```

4. **Tenta novamente**:
   ```
   /refinamento-autonomo seu-componente design/spec.png
   ```

---

### Se Ainda Não Funcionar

1. **Procura em issues**:
   - GitHub do projeto: search "agente"
   - Stack Overflow: search "expo adb"

2. **Documentação oficial**:
   - [Expo Docs](https://docs.expo.dev)
   - [ADB Docs](https://developer.android.com/tools/adb)
   - [Jest Docs](https://jestjs.io/)

3. **Pede ajuda**:
   - Colega que usa os agentes
   - Time de suporte
   - Comunidade Expo/React Native

---

## 💡 Dicas Gerais

### Mantenha Tudo Atualizado
```bash
npm update  # Atualiza dependências
npx expo@latest start  # Usa última versão do Expo
git pull  # Pega atualizações do projeto
```

### Use Correct Directory
```bash
# Sempre execute do raiz do app:
cd artos_frontend

# Não de subcpastas:
# ❌ cd artos_frontend/components && /refinamento-autonomo...
# ✅ cd artos_frontend && /refinamento-autonomo...
```

### Check Logs
```bash
# Agente deixa logs:
cat .agente-last-log.txt  # Se existir

# Expo logs:
npx expo start --verbose

# Teste logs:
npm test -- --verbose
```

---

## 📞 Sumário Rápido por Agente

### 📱 Refinamento Visual
| Problema | Solução Rápida |
|----------|---|
| ADB não conecta | USB Debug + autoriza telefone |
| Screenshot branco | Verifica permissões + fecha apps |
| App não recarrega | npx expo start novamente |
| TS errors | npx tsc --noEmit |
| Componente não achado | Procura nome exato |

### 🎨 Design Paralelo
| Problema | Solução Rápida |
|----------|---|
| Worktrees existem | git worktree remove ../team-variant-* |
| Working tree dirty | git commit suas mudanças |
| Expo erro porta | pkill -f expo (limpa portas) |
| Screenshots brancas | Reconecta ADB |
| Matriz incompleta | Tira screenshots manual |

### ⏰ Audit Timezone
| Problema | Solução Rápida |
|----------|---|
| npm test falha | npm install novamente |
| timezone-mock missing | npm install --save-dev timezone-mock |
| Teste falha | npm test --verbose (debug) |
| Nenhuma função encontrada | Procura por Date/Time keywords |
| Cobertura baixa | Busca funções faltando e adiciona |

---

**Última atualização**: Maio 2026  
**Status**: Troubleshooting para 90% dos problemas  
**Se tudo falhar**: Reset hard e reclone + tenta novamente
