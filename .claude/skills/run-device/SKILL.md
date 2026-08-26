---
name: run-device
description: Sobe o app no device físico Android via ADB-over-WiFi com Expo dev client
---
1. Rodar `adb devices`; sem device, rodar `Desktop\run-diakonia.ps1` e reportar resultado.
2. Se fora da rede local (Wi-Fi de casa), usar `npx expo start --dev-client --tunnel` em vez do script acima, e pegar a URL do tunnel em `localhost:4040/api/tunnels`.
3. Nunca fazer rebuild de release completo. Nunca dirigir o dev launcher com loop de screenshot+tap por coordenada.
4. Depois de carregado, usar deep link + screencap pra inspeção visual e reportar caminho absoluto do arquivo.
