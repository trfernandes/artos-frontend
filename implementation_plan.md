# Implementation Plan — Correção do Splash Screen no iOS (Build 55/TestFlight)

## [Overview]

Eliminar a sequência indesejada "logo grande → logo pequeno → login" observada no cold start do iOS
na build 55 do TestFlight, garantindo uma transição única e suave da splash nativa para o app.

O app Diakonia (React Native + Expo SDK 54) usa `expo-splash-screen` para a splash nativa e um
overlay JS (`AppSplashOverlay`) para cobrir o intervalo entre o fim da splash nativa e o primeiro
render completo. No iOS, a splash nativa é definida por um storyboard (`SplashScreen.storyboard`)
gerido pelo plugin `expo-splash-screen`. A build 55 foi gerada com `splash-icon.png` em
`resizeMode: "cover"`, o que faz a splash nativa ocupar a tela toda. O overlay JS usa a mesma imagem
em `Animated.Image` com `resizeMode="cover"`. A diferença de escala percebida pelo usuário (logo
"grande" depois "pequeno") acontece porque a splash nativa exibe a imagem em tela cheia, enquanto o
overlay JS, ao usar a mesma imagem full-screen, pode apresentar um breve frame de transição ou o
sistema pode estar mostrando uma segunda instância da splash nativa antes do overlay assumir. Além
disso, o `SplashScreenManager` nativo recria a view do storyboard como `loadingView` sobre a
`rootView` até que `RCTContentDidAppearNotification` dispare; se o JS demorar a sinalizar prontidão,
o usuário vê a splash nativa, depois uma segunda exibição da mesma splash (nativa) e só então o app.
A solução passa por: (1) garantir que a splash nativa iOS use uma imagem de logo centralizado e bem
dimensionado (não full-screen), (2) simplificar o overlay JS para não reexibir a mesma imagem
full-screen, e (3) sincronizar o momento de `hideAsync` com a primeira pintura do app, evitando
frames intermediários.

## [Types]

Nenhuma alteração de tipos TypeScript é necessária. As props de `AppSplashOverlay` já suportam
`onImageReady`; podemos reutilizá-las. Opcionalmente, podemos adicionar uma prop
`variant?: 'full' | 'logo'` para controlar o modo do overlay, mas isso não é obrigatório.

## [Files]

- `artos_frontend/app.json`: alterar a configuração do plugin `expo-splash-screen` para iOS, usando
  `resizeMode: "contain"` e `imageWidth` adequado, e apontar para uma nova imagem de splash
  otimizada para iOS (logo centralizado em fundo transparente ou cor sólida).
- `artos_frontend/assets/images/splash-icon-ios.png` (novo): imagem 1024×1024 (ou 1200×1200) com o
  logo centralizado sobre fundo `#151A2C`, sem preencher a tela toda, para ser usada apenas no iOS.
- `artos_frontend/components/AppSplashOverlay.tsx`: modificar para, no iOS, não reexibir a imagem
  full-screen; em vez disso, manter apenas o fundo sólido `#151A2C` e, opcionalmente, um logo menor
  centralizado, ou simplesmente não exibir imagem alguma (apenas fundo), já que a splash nativa já
  mostrou o logo. Garantir que `onImageReady` dispare após o primeiro frame renderizado.
- `artos_frontend/app/_layout.tsx`: garantir que `SplashScreen.hideAsync()` no iOS só seja chamado
  após o overlay estar pronto e o app ter pintado; manter a lógica atual de `onImageReady` e
  `handleReady`.
- `artos_frontend/assets/images/splash-icon.png` (opcional): manter como fallback para Android, já
  que o Android usa a splash full-screen com sucesso.

## [Functions]

- `AppSplashOverlay` (`components/AppSplashOverlay.tsx`):
  - Modificar o render para iOS: ao invés de `Animated.Image` com `splash-icon.png` em tela cheia,
    renderizar um `View` com `backgroundColor: '#151A2C'` e, se desejado, um logo centralizado em
    tamanho fixo (ex: 180 px de largura) usando a imagem `logo.png` ou uma nova imagem de splash
    otimizada.
  - Manter `onImageReady` para garantir que `SplashScreen.hideAsync()` só seja chamado após o
    overlay estar pintado.
  - No Android, manter o comportamento atual (fade-in da logo full-screen) porque a splash nativa
    Android é apenas o fundo colorido.
- `RootLayoutNav` (`app/_layout.tsx`):
  - Manter `SplashScreen.hideAsync()` no iOS vindo de `AppSplashOverlay.onImageReady`.
  - Garantir que `handleReady` só dispare quando `fontsLoaded && !loading`.
  - Considerar adicionar um pequeno atraso (ex: 50 ms) após `onImageReady` antes de `hideAsync` para
    evitar que o sistema recrie a splash nativa em um frame intermediário.

## [Classes]

Nenhuma classe nova ou modificação de classe. O componente funcional `AppSplashOverlay` será
refatorado.

## [Dependencies]

Nenhuma dependência nova. Continuaremos usando `expo-splash-screen` e `expo-asset`.

## [Testing]

- Testar localmente no iOS simulator ou dispositivo via `expo run:ios --configuration Release` (se
  possível) ou gerar uma build de desenvolvimento iOS.
- Como builds na Expo são limitadas, a estratégia é:
  1. Validar a mudança no simulador/dispositivo local primeiro.
  2. Só então submeter uma nova build iOS (`eas build --platform ios`) após confirmar que a splash
     nativa e o overlay estão alinhados.
- Capturar vídeo do cold start (fechar o app pelo seletor e abrir) para confirmar que não há mais
  "logo grande → logo pequeno".
- Verificar que o Android continua com o comportamento desejado (splash full-screen com fade suave).

## [Implementation Order]

1. Criar a imagem `assets/images/splash-icon-ios.png` com o logo centralizado sobre fundo `#151A2C`,
   dimensões recomendadas 1024×1024, deixando margem generosa ao redor do logo.
2. Atualizar `app.json` para usar `splash-icon-ios.png` no iOS com `resizeMode: "contain"` e
   `imageWidth: 200` (ou valor que deixe o logo proporcional), mantendo `splash-icon.png`
   full-screen para Android.
3. Refatorar `components/AppSplashOverlay.tsx`:
   - iOS: renderizar apenas o fundo sólido `#151A2C` (ou fundo + logo pequeno centralizado), sem a
     imagem full-screen.
   - Android: manter o fade-in da imagem full-screen.
   - Garantir que `onImageReady` seja chamado após o primeiro frame.
4. Revisar `app/_layout.tsx` para garantir que `SplashScreen.hideAsync()` no iOS só ocorra após o
   overlay estar pronto e o app pintado.
5. Rodar `npx tsc --noEmit` no frontend para validar tipos.
6. Testar em dispositivo/simulador iOS local.
7. Submeter nova build iOS e validar no TestFlight.
