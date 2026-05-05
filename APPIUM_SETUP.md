# Appium Setup para Screenshots Automáticos

## ✅ O que foi instalado

```
✓ appium (v2+)
✓ appium-uiautomator2-driver (Android)
✓ appium-xcuitest-driver (iOS)
✓ webdriverio
```

## 🚀 Como usar

### 1. Abra 3 terminais

**Terminal 1: Inicie o Appium**
```bash
npx appium
```
Saída esperada:
```
[Appium] Welcome to Appium v2.x.x
[Appium] Listening on http://localhost:4723
```

**Terminal 2: Inicie o simulador**
```bash
# iOS
open -a Simulator

# Ou Android
emulator -avd your_emulator_name
```

**Terminal 3: Inicie o Expo**
```bash
npx expo start
```

### 2. Tire um screenshot manualmente para testar

```bash
node scripts/take-screenshot.js ./test-screenshot.png ios
```

Ou para Android:
```bash
node scripts/take-screenshot.js ./test-screenshot.png android
```

## 📝 Configuração do app

Atualize `appium.config.js` com:
- `app`: Bundle ID (iOS) ou Package ID (Android) do seu app
- `deviceName`: Nome do simulador
- `platformVersion`: Versão do SO

Procure em:
- **iOS**: Xcode → Product → Scheme → Edit Scheme → Info
- **Android**: AndroidManifest.xml ou `eas.json`

## 🔧 Troubleshooting

**"Connection refused"**
- Appium não está rodando. Execute: `npx appium` no terminal

**"App not found"**
- Verifique o bundle ID/package ID em `appium.config.js`
- Certifique-se que o app foi buildado

**"Simulator/Emulator not found"**
- Abra o simulador manualmente primeiro
- Para iOS: `open -a Simulator`
- Para Android: `emulator -list-avds` e depois `emulator -avd name`

## 🎯 Integração com /refinamento-autonomo

Quando você usar:
```
/refinamento-autonomo notifications-card design/notifications-card.png
```

Internamente, o skill vai usar:
```bash
node scripts/take-screenshot.js iterations/iteration-1.png ios
```

E comparará o resultado com `design/notifications-card.png` visualmente.
