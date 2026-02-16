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

## Passo 3 - Environment e Segredos (Blocos 1 e 7)

### Evidências salvas
1. `docs/auditoria-evidence/step-03/env-files.txt`
2. `docs/auditoria-evidence/step-03/git-tracked-env.txt`
3. `docs/auditoria-evidence/step-03/env-classification.txt`
4. `docs/auditoria-evidence/step-03/.env.redacted.numbered.txt`
5. `docs/auditoria-evidence/step-03/.env.local.redacted.numbered.txt`
6. `docs/auditoria-evidence/step-03/.env.staging.redacted.numbered.txt`
7. `docs/auditoria-evidence/step-03/api-url-usage.txt`
8. `docs/auditoria-evidence/step-03/localhost-scan.txt`
9. `docs/auditoria-evidence/step-03/security-patterns.txt`
10. `docs/auditoria-evidence/step-03/gitignore.numbered.txt`

### Checklist environment
| Item | Status | Evidência |
|---|---|---|
| `API_URL` configurável via ENV | `OK` | `domain/api/api-client.ts:6` usa `process.env.EXPO_PUBLIC_API_URL` |
| URLs separadas dev/staging/prod | `PARCIAL` | `.env.local` (local), `.env.staging` (staging), `.env` (remote) em `docs/auditoria-evidence/step-03/env-classification.txt` |
| Credencial hardcoded em código | `ISSUE` | DSN Sentry hardcoded em `app/_layout.tsx:23` |
| Segredo em arquivo versionado | `ISSUE` | `.env` contém chave de app (`.env:1`) e está versionado (`docs/auditoria-evidence/step-03/git-tracked-env.txt`) |
| Referências a localhost/IP local no app | `OK` | Sem ocorrência em runtime app; ocorrências encontradas só em scripts/docs (`docs/auditoria-evidence/step-03/localhost-scan.txt`) |
| Política de gitignore para env | `ISSUE` | `.env` não está ignorado; `.gitignore` ignora apenas `.env.local` e `.env.staging` (`.gitignore:36`-`.gitignore:39`) |

### Riscos novos classificados
1. `.env` versionado com segredo de app: **CRÍTICO** (exposição de segredo e risco de uso indevido).
2. DSN Sentry hardcoded no código: **ALTO** (manutenção/rotação e segregação de ambientes prejudicadas).
3. Estratégia de ambientes sem `eas.json` e sem controle explícito de env por profile: **ALTO**.

---

## Próximos passos
1. Passo 4: autenticação e sessão (token storage, refresh, 401/403, logout e corrida).
2. Passo 5: inventário completo de `useForm()`.
3. Passos 6-11: hooks de API, navegação, UX, segurança, performance, design/acessibilidade e edge cases.

## Passo 4 - Autenticação e Sessão (Bloco 2 + parte de 7)

### Evidências salvas
1. `docs/auditoria-evidence/step-04/contexts_AuthContext.tsx.numbered.txt`
2. `docs/auditoria-evidence/step-04/core_storage_authTokenStorage.ts.numbered.txt`
3. `docs/auditoria-evidence/step-04/domain_api_api-client.ts.numbered.txt`
4. `docs/auditoria-evidence/step-04/core_network_authBridge.ts.numbered.txt`
5. `docs/auditoria-evidence/step-04/hooks_usePostLoginRedirect.ts.numbered.txt`
6. `docs/auditoria-evidence/step-04/hooks_useProtectedRoute.ts.numbered.txt`
7. `docs/auditoria-evidence/step-04/app__auth__login.tsx.numbered.txt`
8. `docs/auditoria-evidence/step-04/app__auth__create-voluntario-account.tsx.numbered.txt`
9. `docs/auditoria-evidence/step-04/app__auth__create-igreja-account.tsx.numbered.txt`
10. `docs/auditoria-evidence/step-04/domain_dtos_login_login.response.ts.numbered.txt`

### Checklist token/session
| Item | Status | Evidência |
|---|---|---|
| Token salvo com storage seguro | `OK` | `core/storage/authTokenStorage.ts:7`, `core/storage/authTokenStorage.ts:20`, `core/storage/authTokenStorage.ts:25` (SecureStore) |
| Refresh token implementado | `ISSUE` | Não há fluxo `/auth/refresh` nem `refreshToken` em `contexts/AuthContext.tsx` |
| Token expirado força logout | `OK` | `contexts/AuthContext.tsx:91`-`contexts/AuthContext.tsx:93` |
| Limpeza completa no logout | `PARCIAL` | Limpa token/user/igreja/cache em `contexts/AuthContext.tsx:180`-`contexts/AuthContext.tsx:184`; não há limpeza explícita de outros dados auxiliares em AsyncStorage |
| Interceptor adiciona token automaticamente | `OK` | `domain/api/api-client.ts:15`-`domain/api/api-client.ts:19` |
| 401 faz logout + redirect login | `OK` | `contexts/AuthContext.tsx:91`-`contexts/AuthContext.tsx:93` e `contexts/AuthContext.tsx:186` |
| 403 com mensagem adequada | `PARCIAL` | Mensagem existe utilitária em `domain/api/api-error.ts:25`, sem tratamento global unificado |
| Múltiplos 401 simultâneos | `OK` | Guarda `isSigningOutRef` em `contexts/AuthContext.tsx:167` |
| Race condition de refresh token | `ISSUE` | Não aplicável por ausência de refresh token; sessão depende de novo login |

### Checklist login/registro
| Item | Status | Evidência |
|---|---|---|
| Login inválido com mensagem clara | `OK` | `app/(auth)/login.tsx:175`-`app/(auth)/login.tsx:179` |
| Registro e-mail duplicado com mensagem clara | `PARCIAL` | Usa mensagem bruta do backend em `app/(auth)/create-voluntario-account.tsx:75`; sem tratamento específico |
| Campos de senha com toggle visibilidade | `OK` | `components/fields/FancyPasswordInput.tsx:13`, `components/fields/FancyPasswordInput.tsx:31` |
| Botão de login desabilita durante request | `OK` | `app/(auth)/login.tsx:292` |

### Riscos novos classificados
1. Persistência do objeto `user` com `access_token` em AsyncStorage (`contexts/AuthContext.tsx:139`, `contexts/AuthContext.tsx:154`, `contexts/AuthContext.tsx:216`, `contexts/AuthContext.tsx:248`): **CRÍTICO**.
2. Ausência de refresh token/renovação de sessão: **ALTO**.
3. Fluxo `authBridge` incompleto (`triggerUnauthorized` sem `setUnauthorizedHandler` ativo): **MÉDIO**.

---

## Próximos passos
1. Passo 5: mapear todos os `useForm()` e validar `zodResolver`, `onError`, disable submit, máscara e teclado numérico.
2. Passo 6: mapear todos os `useMutation()`.
3. Passo 7: mapear todos os `useQuery()`.
