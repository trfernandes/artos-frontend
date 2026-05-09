---
name: refinamento-autonomo
description: Loop autônomo de refinamento visual até ficar pixel-perfect
---

# Refinamento Autônomo de UI

Refina um componente de UI iterativamente até ele corresponder exatamente a uma imagem de spec.

## Como usar

```
/refinamento-autonomo [componente] [caminho-da-spec-image]
```

**Exemplo:**
```
/refinamento-autonomo notifications-card design/notifications-card.png
```

## O que faz

1. **Lê** a imagem spec (design/notifications-card.png)
2. **Localiza** o componente no código
3. **Loop** (até <3 diferenças ou 10 iterações):
   - Faz uma mudança no código
   - Recarrega o app via Expo (você já tem rodando)
   - **Tira screenshot via ADB** (automático!)
   - Compara com a spec visualmente
   - Lista diferenças encontradas
   - Corrige as diferenças
4. **Commita** após cada iteração bem-sucedida
5. **Relata** tabela final de todas as iterações

## ⚡ Setup (bem rápido)

### Para Android físico (o que você tá usando)

1. **Conecte o telefone via USB**
   ```bash
   adb devices
   ```
   Deve mostrar seu device conectado

2. **Ative USB Debugging no telefone**
   - Configurações → Sobre o telefone → Toque "Número da compilação" 7x
   - Volta → Opções de desenvolvedor → Ativa "Depuração USB"
   - Autorize a conexão no telefone

3. **Inicie o app no telefone**
   ```bash
   npx expo start
   # Escaneia o QR code com seu telefone
   ```

4. **Pronto!** Agora é só usar:
   ```
   /refinamento-autonomo notifications-card design/notifications-card.png
   ```

### Teste rápido
```bash
node scripts/take-screenshot.js test.png
```
Vai tirar um screenshot em 2 segundos! ✨

## Requisitos

- ✅ Telefone Android conectado via USB
- ✅ USB Debugging ativado
- ✅ App rodando via Expo (escanear QR code)
- ✅ Imagem spec no projeto (ex: `design/notifications-card.png`)
- ✅ Zero TS errors obrigatório
- ✅ Seguir padrões FancyComponent do projeto

## Resultado esperado

Componente visualmente idêntico à spec, com:
- ✅ 3+ screenshots (iterações)
- ✅ Commits documentando cada mudança
- ✅ Tabela final mostrando progresso
- ✅ Zero TypeScript errors em todo o processo

## 📚 Documentação

Problemas? Consulte `ANDROID_SETUP.md` para troubleshooting.
