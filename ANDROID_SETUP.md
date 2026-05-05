# Setup Android para Screenshots Automáticos

## ✅ Configuração necessária

### 1. Conecte o telefone via USB

```bash
# Verifique se está reconhecido
adb devices

# Saída esperada:
# List of attached devices
# ABC123DEF456	device
```

### 2. Ative USB Debugging no telefone

1. Abra **Configurações**
2. Vá em **Sobre o telefone**
3. Toque em **Número da compilação** 7 vezes (até aparecer "Modo do desenvolvedor ativado")
4. Volte e abra **Opções de desenvolvedor**
5. Ative **Depuração USB**

### 3. Autorize a conexão

Quando conectar, aparecerá um aviso no telefone: "Permitir acesso aos dados?"
- ✅ Toque em **Sim** ou **Sempre confiar neste computador**

---

## 🚀 Como tirar screenshot

**Comando simples:**
```bash
node scripts/take-screenshot.js screenshot.png
```

Pronto! O screenshot aparece em `./screenshot.png`

---

## 🔍 Verificar conexão

```bash
# Ver se device está conectado
adb devices

# Ver informações do device
adb shell getprop ro.build.version.release

# Ver app rodando
adb shell pidof com.diakonia.app
```

---

## ⚠️ Problemas comuns

### "adb devices" mostra "unauthorized"
- Abra o **Configurações** do telefone
- Aparecerá uma notificação perguntando se autoriza
- Toque em **Sim**

### "adb: command not found"
- Instale Android SDK
- Ou adicione ao PATH: `export PATH=$PATH:~/Android/Sdk/platform-tools`

### Device desconecta depois de tirar screenshot
- Normal! ADB reconecta automaticamente na próxima vez
- Se der problema, use: `adb reconnect`

---

## ✨ Integração com /refinamento-autonomo

Quando usar:
```
/refinamento-autonomo notifications-card design/notifications-card.png
```

Internamente vai rodar:
```bash
node scripts/take-screenshot.js iterations/iteration-1.png
```

Sem precisar fazer nada!
