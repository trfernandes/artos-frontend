# Auditoria Pré-Deploy Mobile Diakonia (Frontend)

Data: 2026-02-16  
Baseline commit: `e371919`  
Escopo: análise estática + build/tooling (sem execução em dispositivo/emulador)

## Passo 1 - Baseline e Build Health

### Comandos executados
1. `git rev-parse --short HEAD`
2. `npx expo config --type public`
3. `npx expo-doctor`
4. `npx tsc --noEmit`

### Evidências salvas
1. `docs/auditoria-evidence/step-01/expo-config-public.txt`
2. `docs/auditoria-evidence/step-01/expo-doctor.txt`
3. `docs/auditoria-evidence/step-01/tsc-noemit.txt`

### Resultado
1. Baseline confirmado no commit `e371919`.
2. `expo-doctor` falhou (1 check) por incompatibilidade de versões de pacotes Expo/SDK.
3. `tsc --noEmit` falhou com múltiplos erros de compilação, incluindo bloqueador em `app/(app)/(drawer)/admin/eventos/add.tsx(69,9)` (`Toast` não definido).

### Classificação inicial (pré-auditoria completa)
1. `tsc --noEmit` quebrado: **CRÍTICO** para estabilidade e release.
2. Mismatch de dependências SDK Expo: **ALTO** (risco de comportamento inconsistente em build nativo).

---

## Próximos passos
1. Passo 2: auditoria de configuração/build nativo (`app.json`, AndroidManifest, Gradle, assets, EAS).
2. Passo 3: auditoria de environment/segredos.
3. Demais blocos conforme plano aprovado.

## Passo 2 - Configuração e Build Nativo (Bloco 1)

### Evidências salvas
1. `docs/auditoria-evidence/step-02/app.json.txt`
2. `docs/auditoria-evidence/step-02/app.json.numbered.txt`
3. `docs/auditoria-evidence/step-02/android_app_build.gradle.numbered.txt`
4. `docs/auditoria-evidence/step-02/android_app_src_main_AndroidManifest.xml.numbered.txt`
5. `docs/auditoria-evidence/step-02/android_app_src_main_res_values_strings.xml.numbered.txt`
6. `docs/auditoria-evidence/step-02/assets-dimensions.txt`
7. `docs/auditoria-evidence/step-02/project-structure.txt`

### Checklist app config/build
| Item | Status | Evidência |
|---|---|---|
| `version` atualizada para lançamento | `CONFIRMAR` | `app.json:5` (`1.0.0`) sem baseline oficial no repo |
| `ios.buildNumber` incrementado | `CONFIRMAR` | `app.json:19` (`"1"`) |
| `android.versionCode` incrementado | `CONFIRMAR` | `app.json:29` e `android/app/build.gradle:97` (`1`) |
| `bundleIdentifier` iOS | `OK` | `app.json:18` (`com.church.artos`) |
| `package` Android | `OK` | `app.json:28`, `android/app/build.gradle:92`, `android/app/build.gradle:94` |
| Splash configurada | `OK` | `app.json:11`-`app.json:15`; strings Expo em `android/app/src/main/res/values/strings.xml:3`-`android/app/src/main/res/values/strings.xml:4` |
| Ícone principal 1024x1024 | `OK` | `assets/icon.png=1024x1024` em `docs/auditoria-evidence/step-02/assets-dimensions.txt` |
| Adaptive icon/splash asset presente | `OK` | `assets/adaptive-icon.png=1024x1024`, `assets/splash-icon.png=1024x1024` |
| Permissões declaradas | `ISSUE` | Permissões potencialmente excessivas em `android/app/src/main/AndroidManifest.xml:3`, `android/app/src/main/AndroidManifest.xml:5`, `android/app/src/main/AndroidManifest.xml:7` |
| Orientation definido | `OK` | `app.json:7` e `android/app/src/main/AndroidManifest.xml:19` (`portrait`) |
| Scheme deep link configurado | `ISSUE` | Expo usa `diakonia` (`app.json:6`), Android nativo usa `artos`/`exp+artosfrontend` (`android/app/src/main/AndroidManifest.xml:28`-`android/app/src/main/AndroidManifest.xml:29`) |
| App Links HTTPS `/invite` | `PARCIAL` | Definido em `app.json:30`-`app.json:42`; não refletido no intent-filter principal da `MainActivity` no manifesto |
| `eas.json` com profiles dev/preview/prod | `ISSUE` | Arquivo ausente (`docs/auditoria-evidence/step-02/project-structure.txt`) |

### Riscos novos classificados
1. Ausência de `eas.json`: **ALTO**.
2. Divergência de schemes de deep link (`diakonia` vs `artos`): **ALTO**.
3. Permissões Android potencialmente excessivas: **MÉDIO** (requer revisão por feature ativa).

---

## Próximos passos
1. Passo 3: Environment e segredos (`.env*`, API URL, credenciais hardcoded, localhost/IP local).
2. Passo 4: autenticação/sessão (storage, 401/403, logout, corrida de token).
3. Passos 5-11: formulários, hooks de API, navegação, UX, segurança, performance, design/acessibilidade e edge cases.
