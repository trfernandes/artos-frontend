# Navegação determinística via adb — pesquisa

Pesquisa de fontes primárias (docs oficiais Expo Router / Android / React Native) + teste empírico
no device físico (`RQCWC04P4VX`), motivada por instabilidade de `adb shell input tap x y` em menus
dinâmicos (drawer colapsável, listas com scroll). Ver também `docs/mobile-deeplink-routes.md`
(mapa de rotas deep link já validado).

## Recomendação no topo

**Vencedor: `adb shell uiautomator dump` + parse de `bounds` pra calcular coordenada de tap,
combinado com deep link (`am start -d "diakonia://..."`) pra saltos grandes de rota.**

Testei ao vivo nesta sessão (device `RQCWC04P4VX`, app em foreground na tela `/configuracoes`):

```
MSYS_NO_PATHCONV=1 adb -s RQCWC04P4VX shell uiautomator dump /sdcard/window_dump.xml
MSYS_NO_PATHCONV=1 adb -s RQCWC04P4VX exec-out cat /sdcard/window_dump.xml > dump.xml
```

Resultado: **126 nodes, 40 com `text` não-vazio, 10 com `content-desc` não-vazio**, incluindo texto
em português (`"Voluntários"`, `"Configurações"`, `"Notificações, 13 não lidas"`) e `bounds`
exatos por elemento (`bounds="[80,520][122,564]"`). Isso **contradiz a suposição da memória de
sessão anterior** de que Fabric não expõe texto pra accessibility tree — pelo menos via
`uiautomator dump` bruto, expõe sim (ver seção 3 pra detalhe e hipótese do porquê `mobile-mcp`
falha onde isso funciona).

Por quê é superior a tap por coordenada chutada / screenshot-then-tap:
- Elimina a corrida entre screenshot e estado real da tela — o dump É o estado real no momento da
  leitura, e o tap seguinte usa bounds calculados desse mesmo dump, não de pixels de uma imagem.
- Resiliente a scroll/reflow: se a lista mudou de posição, o texto/resource-id ainda identifica o
  elemento certo — só a coordenada muda, e ela vem do dump atual, não de uma suposição anterior.
- Não exige mudança de código no app (funciona no client hoje, sem rebuild).
- Fallback bom pros dois casos "inviáveis" do `mobile-deeplink-routes.md` (`pessoal/escalas/evento`,
  `notification-detail`) que exigem JSON grande como param — em vez de montar o deep link, navega
  pela UI real, mas com precisão de accessibility tree em vez de tap às cegas.

Custo: mais passos por navegação (dump → parse → calcular bounds → tap) que um deep link direto.
Por isso a combinação: **deep link pra chegar perto da tela alvo, uiautomator dump só pro último
passo (tocar no item específico da lista/menu)**.

---

## 1. Navegação programática sem tap por coordenada

### 1.1 `router.push()` via deep link (`Linking`) — já em uso

Confirmado em `docs/mobile-deeplink-routes.md`. Fonte oficial: Expo Router docs sobre deep linking
— rotas usam `scheme` do `app.json` e resolvem via `Linking` internamente.

> "Deep linking is when a URL opens a specific page in your app."
— [Navigating between pages in Expo Router](https://docs.expo.dev/router/basics/navigation/)

Limitação conhecida (já documentada): params JSON grandes (`evento`, `notification`) são
inviáveis de montar à mão.

### 1.2 `store.navigationRef` (interno, não suportado)

Expo Router não expõe oficialmente um `NavigationContainer`/`navigationRef` global (diferente do
padrão React Navigation com `createNavigationContainerRef()`). Existe um acesso interno não
documentado:

```js
import { store } from "expo-router/build/global-state/router-store";
store.navigationRef
```

> "this is not recommended and might not be supported for long" — resposta oficial no discussion.
— [Navigating without the navigation prop · expo/router Discussion #909](https://github.com/expo/router/discussions/909)

Existe também `useNavigationContainerRef()` exportado de `expo-router`, mas é hook — só usável
dentro de componente React (ex: no root layout, pra integrações tipo Sentry/BugSnag), não
diretamente de fora via adb.
— [Router - Expo Documentation](https://docs.expo.dev/versions/latest/sdk/router/)

**Avaliação pro caso de uso**: não vale a pena. É API interna instável só pra ganhar "chamar
`router.push` direto" — o ganho real (evitar montar deep link) já é resolvido melhor pela opção
1.3 abaixo, sem depender de path interno do pacote.

### 1.3 Comando custom via `adb shell am broadcast` + `BroadcastReceiver` nativo (requer código)

Padrão usado por ferramentas de dev tooling React Native (ex: VS Code React Native extension) pra
disparar ações no app sem tocar na tela:

```bash
adb shell am broadcast -a com.church.artos.DEBUG_NAVIGATE --es route "/ministerios/escalas" -e evento '<json>'
```

> "adb shell am broadcast -a react.native.RELOAD" — exemplo de broadcast custom disparando ação
no app já em runtime.
— [Extend the ADB to Make App Debugging Easier](https://medium.com/swlh/extend-the-adb-to-make-app-debugging-easier-59d42fa8cf71) *(nota: fonte secundária — usar só como referência de padrão, não fonte primária)*

Isso resolveria o problema do JSON grande (`evento`, `notification`) — o broadcast pode carregar
o JSON inteiro como extra de string, um `BroadcastReceiver` nativo Android recebe e repassa pro JS
via `DeviceEventEmitter`, que chama `router.push(JSON.parse(...))`.

**Avaliação pro caso de uso**: tecnicamente a solução mais completa (resolve os 2 casos "inviáveis"
do mapa de rotas), mas exige escrever módulo nativo Android + registrar receiver no
`AndroidManifest.xml` + código JS de listener — mudança de código não-trivial só pra
tooling de debug do assistente. **Não recomendado agora**; documentar como opção futura se os
casos JSON grande virarem bloqueio recorrente.

### 1.4 `registerDevMenuItems` (`expo-dev-menu`) — dev menu custom

Projeto já usa `expo-dev-client` (`package.json:41`, `~6.0.21`), então dev menu custom é viável:

```js
import { registerDevMenuItems } from 'expo-dev-menu';
registerDevMenuItems([{ name: 'Ir pra rota X', callback: () => router.push('/rota') }]);
```
— [DevMenu - Expo Documentation](https://docs.expo.dev/versions/latest/sdk/dev-menu/)

Mas o dev menu abre com shake/tecla e precisa de tap na UI do menu — não elimina interação por
toque, só move o problema. **Não serve** pro objetivo (zero coordenada chutada).

---

## 2. Espera determinística (substituir `sleep` fixo)

### 2.1 `dumpsys window` — foco atual / transição de app

```bash
adb shell dumpsys window | grep -i "mCurrentFocus\|mFocusedApp"
```

Testado ao vivo: retornou `mCurrentFocus=Window{... com.church.artos/com.church.artos.MainActivity}`
— confirma qual activity/app tem foco no momento exato do comando (não depende de screenshot
desatualizado).

`dumpsys window -a | grep 'mAppTransitionState'` reporta `APP_STATE_READY`/`APP_STATE_IDLE` —
útil pra saber se a transição de tela terminou antes do próximo comando.
— citado (fonte secundária, sem doc oficial Android encontrada com esse detalhe específico) em
discussões de automação Android; `dumpsys` em si é documentado oficialmente aqui:
[dumpsys | Android Developers](https://developer.android.com/tools/dumpsys) — mas a doc oficial
não detalha `mAppTransitionState` especificamente, foca em `gfxinfo`/`procstats`/uso geral.

### 2.2 `uiautomator dump` como espera + leitura combinadas

Melhor abordagem prática: `uiautomator dump` **já falha explicitamente** se a UI não estiver em
estado idle:

> Erro comum: "ERROR: could not get idle state" — ocorre quando UIAutomator espera a main thread
entrar em estado idle e a tela tem animação contínua/dinâmica impedindo isso.
— [uiautomator dump fails on apps with continuous animation · Issue #117 · mobile-next/mobilewright](https://github.com/mobile-next/mobilewright/issues/117)

Ou seja: rodar `uiautomator dump` em loop curto (retry com backoff pequeno, ex. 300ms) até ele
não retornar esse erro **é**, na prática, um wait determinístico — mais barato que `sleep` fixo
generoso e mais confiável que `sleep` curto arriscado.

### 2.3 API moderna UI Automator (`waitForStable()`) — não aplicável via adb puro

A API Kotlin moderna (UI Automator 2.4+) tem `activeWindow().waitForStable()`, que espera a UI
parar de mudar antes de prosseguir:

> "Use waitForStable() primarily ... when you know the UI is in an unstable state ... to verify
the UI has completely settled before capturing."
— [UI Automator | Android Developers](https://developer.android.com/training/testing/other-components/ui-automator)

Mas essa API só existe dentro de um app instrumentado (teste Kotlin/Java rodando no device via
`adb shell am instrument`), não como subcomando de `adb shell` solto. **Não aplicável** direto ao
fluxo atual (adb puro, sem harness de teste instrumentado) — é o que o Maestro usa por baixo
(ver seção 3), não algo replicável com uma linha de shell.

**Conclusão prática seção 2**: usar o retry de `uiautomator dump` (2.2) como gate de espera — é o
único método verificável com `adb` puro sem infra extra.

---

## 3. `uiautomator dump` em RN Fabric — teste empírico

Contrariando a memória de sessão anterior ("Fabric não expõe texto pra accessibility tree, mesma
limitação do mobile-mcp"), o teste ao vivo nesta sessão mostrou que **`adb shell uiautomator
dump` funciona normalmente** no app Fabric:

| Atributo | Nodes totais | Não-vazios |
|---|---|---|
| `text` | 126 | 40 |
| `content-desc` | 126 | 10 |
| `resource-id` | 126 | 3 (só chrome nativo Android; tela testada não usa `testID`) |

Exemplos reais capturados (tela `/configuracoes`): `text="Voluntários"`,
`text="Configurações"`, `content-desc="Notificações, 13 não lidas"`,
`content-desc="Geral. Expandir seção"`.

Formato de bounds: `bounds="[80,520][122,564]"` — centro do tap = `((80+122)/2, (520+564)/2)`.

### Por que `resource-id` (testID) está quase sempre vazio

`testID` só aparece como `resource-id` no dump se o componente RN tiver a prop `testID` setada
explicitamente:

> "React Native checks if a testID is provided for a view and exposes it through the view's
accessibility node delegate ... resource-id is what is used when working on UIAutomator-based
tests."
— [PR #29610 · facebook/react-native](https://github.com/react/react-native/pull/29610)

Esse app não usa `testID` amplamente (fora do escopo desta pesquisa mudar isso). Na prática, usar
`text` e `content-desc` como chave de busca é suficiente e já funciona hoje sem mudança de código.

### Por que `mobile-mcp` falhava e `uiautomator dump` bruto não

Não achei issue específica documentando o motivo exato no repo `mobile-next/mobile-mcp`. Hipótese
com base no comportamento observado do Maestro (que usa o mesmo UIAutomator por baixo e funciona
bem com Fabric — ver abaixo): `mobile-mcp`'s `mobile_list_elements_on_screen` provavelmente usa
uma consulta de accessibility node info diferente (talvez filtrando por `isImportantForAccessibility`
mais restritivo, ou rodando antes da árvore assentar), não uma limitação fundamental de Fabric.
**Não é fonte primária confirmada — tratar como hipótese, não fato.** O dado sólido é: dump bruto
via `adb shell uiautomator dump` funciona neste app, testado ao vivo.

Confirmação cruzada — Maestro (ferramenta de teste E2E já em uso no projeto, `flows/*.yaml`) usa
exatamente esse mecanismo em apps React Native:

> "Android: UIAutomator dump provides view hierarchy with resource-ids (testIDs), text, and
bounds ... Maestro provides full support for React Native applications on both Android and iOS by
operating at the accessibility layer."
— [Demystifying Maestro's UI Testing Implementation](https://handstandsam.com/2024/11/18/demystifying-maestros-ui-testing-implementation/),
[React Native | Maestro Docs](https://docs.maestro.dev/get-started/supported-platform/react-native)

Diferença: Maestro roda um server instrumentado in-process (via `adb shell am instrument`) que
chama a API UIAutomator Kotlin moderna; `adb shell uiautomator dump` é o comando standalone mais
simples, sem instrumentação. Ambos batem na mesma AccessibilityNodeInfo do Android — por isso os
resultados baterem.

---

## 4. Introspecção de estado de navegação via Metro/DevTools

React Native DevTools (baseado em Chrome DevTools frontend) tem console que permite **avaliar
JavaScript arbitrário** contra o app rodando:

> "The Console panel allows you to view and filter messages, evaluate JavaScript, inspect object
properties, and more." ... "React Native DevTools is based on the Chrome DevTools frontend."
— [React Native DevTools](https://reactnative.dev/docs/react-native-devtools)

Isso significa: se o app expuser algo tipo `globalThis.__DEBUG_ROUTER__ = router` em dev, dá pra
chamar `globalThis.__DEBUG_ROUTER__.push('/rota')` no console do DevTools. Mas:
- A doc não confirma uma **API scriptável via CLI** (fora da UI do Chrome DevTools) — não achei
  endpoint CDP documentado oficialmente pra automatizar isso via `adb`/script sem abrir o browser.
  Seria preciso usar Chrome DevTools Protocol (`chrome-remote-interface` ou similar) manualmente,
  fora do escopo de "comando adb simples".
- Exige mudança de código (expor o router em `globalThis`) — mesmo trade-off da seção 1.3, mas
  mais simples de implementar (não precisa módulo nativo, só um `if (__DEV__) globalThis.x = ...`
  no root layout).

Não existe "debug menu" (`/__debug`) já implementado neste app — confirmado que
`registerDevMenuItems`/`expo-dev-menu` está disponível (dependência presente) mas não usado ainda
pra esse fim.

**Avaliação**: viável como próximo passo se `uiautomator dump` não bastar pros casos de JSON
grande, mas exige decidir entre (a) expor router em `globalThis` + pilotar via protocolo CDP
scriptado, ou (b) broadcast nativo (seção 1.3). Ambos requerem mudança de código; nenhum foi
implementado nesta pesquisa (fora de escopo — só pesquisa).

---

## 5. Navegação por D-pad (`adb shell input keyevent`)

Keycodes confirmados (Android `KeyEvent` — `android.view.KeyEvent`):
`KEYCODE_DPAD_UP` (19), `KEYCODE_DPAD_DOWN` (20), `KEYCODE_DPAD_LEFT` (21), `KEYCODE_DPAD_RIGHT`
(22), `KEYCODE_DPAD_CENTER` (23).

```bash
adb shell input keyevent 20   # DPAD_DOWN
adb shell input keyevent 23   # DPAD_CENTER (seleciona item focado)
```

React Native tem `TVEventHandler`, mas é **limitado e projetado pra Android TV**, não pra apps
Android normais:

> Issues abertas mostram TVEventHandler só emitindo `focus`/`blur` de forma confiável em muitos
setups, eventos direcionais (`up`/`down`/`left`/`right`) inconsistentes fora de TV.
— [Directional navigation event listener (TVEventHandler) not working · Issue #19917](https://github.com/facebook/react-native/issues/19917),
[TVEventHandler doesn't recognize D-Pad · Issue #20924](https://github.com/facebook/react-native/issues/20924)

Além disso, esta app não é TV app — não tem `isTVOS`/focus engine configurado, componentes Fancy
(`FancyButton`, `FancyList` etc.) não implementam handlers de foco por d-pad. Pra isso funcionar
precisaria: (a) app configurado como "Android TV-aware" ou usar `react-native-tvos`, (b) todo
componente interativo ter foco navegável via d-pad implementado — reformar bastante código só pra
esse propósito de tooling.

**Avaliação**: descartar. Nem a doc nem os componentes do design system suportam isso hoje, e o
ganho sobre `uiautomator dump` + tap calculado é nulo (mesmo trabalho de "achar o elemento certo",
só que com navegação sequencial mais lenta e menos confiável que endereçamento direto por bounds).

---

## Resumo comparativo

| Técnica | Determinístico? | Requer mudança de código? | Resolve JSON grande? | Veredito |
|---|---|---|---|---|
| Deep link (`am start -d`) | Sim (rota fixa) | Não | Não | Já em uso — manter pra saltos de rota |
| `uiautomator dump` + tap por bounds | Sim | Não | Indiretamente (navega UI real) | **Recomendado** — usar pro passo final de precisão |
| `store.navigationRef` interno | Sim, mas frágil | Não (mas API instável) | Sim, se combinado com script | Não recomendado — API não suportada |
| `am broadcast` + `BroadcastReceiver` nativo | Sim | Sim (módulo nativo) | Sim | Opção futura, não agora |
| `registerDevMenuItems` (dev menu) | N/A (ainda exige tap) | Sim (leve) | Não resolve o problema (menu ainda é UI) | Descartado |
| Console DevTools + `globalThis` router | Sim, se scriptado via CDP | Sim (leve) | Sim | Opção futura, mais trabalho de setup CDP |
| D-pad (`input keyevent`) | Não (foco RN não implementado) | Sim (grande, TV-aware) | Não | Descartado |
