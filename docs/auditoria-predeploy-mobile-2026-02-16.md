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

## Passo 5 - Validação de Formulários (Bloco 3)

### Evidências salvas
1. `docs/auditoria-evidence/step-05/useform-occurrences.txt`
2. `docs/auditoria-evidence/step-05/useform-key-lines.txt`
3. `docs/auditoria-evidence/step-05/handleSubmit-occurrences.txt`
4. `docs/auditoria-evidence/step-05/useform-summary-raw.txt`

### Tabela completa de `useForm()`
| Arquivo | Hook | zodResolver | onError | Submit desabilita |
|---|---|---|---|---|
| `app/(app)/(drawer)/admin/eventos/add.tsx:39` | `form` | SIM | SIM | SIM |
| `app/(app)/(drawer)/admin/eventos/edit.tsx:39` | `eventoForm` | SIM | SIM | NAO |
| `app/(app)/(drawer)/admin/ministerios/add.tsx:32` | `form` | SIM | SIM | NAO |
| `app/(app)/(drawer)/admin/ministerios/edit.tsx:61` | `form` | SIM | SIM | NAO |
| `app/(app)/(drawer)/configuracoes/index.tsx:112` | `dadosForm` | SIM | NAO | SIM |
| `app/(app)/(drawer)/configuracoes/index.tsx:132` | `modoEntradaForm` | SIM | NAO | SIM |
| `app/(app)/(drawer)/configuracoes/index.tsx:141` | `notificacoesForm` | SIM | NAO | SIM |
| `app/(app)/(drawer)/ministerios/escalas/assistant.tsx:141` | `form` | SIM | NAO | NAO |
| `app/(app)/(drawer)/ministerios/indisponibilidades/index.tsx:49` | `{control, watch}` | SIM | NAO | NAO |
| `app/(app)/(drawer)/ministerios/integrantes/add.tsx:25` | `form` | SIM | SIM | NAO |
| `app/(app)/(drawer)/ministerios/integrantes/edit.tsx:37` | `form` | SIM | SIM | NAO |
| `app/(app)/(drawer)/ministerios/templates_equipe/add.tsx:15` | `form` | SIM | SIM | NAO |
| `app/(app)/(drawer)/ministerios/templates_equipe/edit.tsx:43` | `form` | SIM | SIM | NAO |
| `app/(app)/(drawer)/pessoal/perfil/edit.tsx:37` | `form` | SIM | NAO | SIM |
| `app/(auth)/create-igreja-account.tsx:158` | `createForm` | NAO | NAO | N/A |
| `app/(auth)/create-voluntario-account.tsx:28` | `createForm` | SIM | NAO | NAO |
| `app/(auth)/forgot-password.tsx:29` | `useForm` | SIM | NAO | SIM |
| `components/pages/admin/eventos/EventoRepeticaoInputCustom.tsx:67` | `recorrenciaForm` | SIM | SIM | NAO |
| `components/pages/admin/ministerios/AddLiderancaFormModal.tsx:21` | `form` | SIM | SIM | NAO |
| `components/pages/admin/ministerios/EditLiderancaFormModal.tsx:13` | `form` | SIM | NAO | NAO |
| `components/pages/admin/ministerios/VoluntarioAddFormModal.tsx:24` | `form` | SIM | SIM | NAO |
| `components/pages/admin/ministerios/VoluntarioEditFormModal.tsx:26` | `form` | SIM | SIM | NAO |
| `components/pages/admin/voluntarios/MinisterioAddForm.tsx:48` | `form` | SIM | NAO | SIM |
| `components/pages/ministerios/escalas/assistant/EscalaFormFixoModal.tsx:26` | `form` | SIM | SIM | NAO |
| `components/pages/ministerios/escalas/assistant/EventoFormFuncaoModal.tsx:24` | `form` | SIM | SIM | NAO |
| `components/pages/ministerios/escalas/assistant/EventoFormModal.tsx:92` | `formTemplate` | SIM | SIM | NAO |
| `components/pages/ministerios/funcoes/FuncaoFormModal.tsx:34` | `{control, handleSubmit, reset}` | SIM | SIM | NAO |
| `components/pages/ministerios/integrantes/FormFields.tsx:61` | `formModal` | SIM | NAO | NAO |
| `components/pages/ministerios/templates_equipe/TemplateFixoEquipeList.tsx:37` | `formAdd` | SIM | NAO | NAO |
| `components/pages/ministerios/templates_equipe/TemplateFuncoesList.tsx:43` | `formAdd` | SIM | NAO | NAO |
| `components/pages/pessoal/escalas/index/SubstituicaoModalPage.tsx:87` | `form` | SIM | SIM | SIM |
| `components/pages/pessoal/indisponibilidade/AddPeriodModal.tsx:37` | `{control, handleSubmit, setValue, trigger}` | SIM | NAO | NAO |
| `components/pages/pessoal/indisponibilidade/DateAvailabilityAdjustmentModal.tsx:37` | `{control, handleSubmit, reset, watch}` | SIM | NAO | NAO |
| `components/pages/pessoal/perfil/ChangePasswordModal.tsx:29` | `useForm` | SIM | NAO | SIM |
| `hooks/useCrud.ts:98` | `useForm` | NAO | NAO | N/A |
| `hooks/useIgrejaCrud.ts:26` | `form` | SIM | NAO | N/A |

### Máscaras e teclado numérico
1. `app/(app)/(drawer)/configuracoes/index.tsx:343` usa `maskType="cep"`.
2. `app/(app)/(drawer)/configuracoes/index.tsx:365` usa `maskType="phone"`.
3. `app/(app)/(drawer)/configuracoes/index.tsx:352` usa `keyboardType="numeric"`.
4. `app/(auth)/forgot-password.tsx:84` usa `keyboardType="email-address"`.
5. Nos demais formulários, o uso de teclado numérico/máscara é `NÃO COMPROVADO` ou inexistente.

### Achados principais do bloco 3
1. Boa cobertura de Zod: 34/36 ocorrências com `zodResolver`.
2. `onError` de submit ainda é inconsistente: vários formulários tratam só via `try/catch` e não via callback de `handleSubmit`.
3. `app/(auth)/create-igreja-account.tsx:158` contém `useForm()` sem resolver e sem uso funcional (código residual).

---

## Passo 6 - Hooks de API: `useMutation` (Bloco 4)

### Evidências salvas
1. `docs/auditoria-evidence/step-06/usemutation-occurrences.txt`
2. `docs/auditoria-evidence/step-06/hooks_useCrud.ts.numbered.txt`
3. `docs/auditoria-evidence/step-06/hooks_useCadastroIgrejaEmail.ts.numbered.txt`
4. `docs/auditoria-evidence/step-06/hooks_useEscalaCrud.ts.numbered.txt`
5. `docs/auditoria-evidence/step-06/hooks_useEventoTemplatePadrao.ts.numbered.txt`
6. `docs/auditoria-evidence/step-06/hooks_useIndisponibilidadesVoluntariosCrud.ts.numbered.txt`
7. `docs/auditoria-evidence/step-06/hooks_useMinisterioVoluntarioFuncoesCrud.ts.numbered.txt`
8. `docs/auditoria-evidence/step-06/hooks_useNotificacoesCrud.ts.numbered.txt`
9. `docs/auditoria-evidence/step-06/hooks_useSairDaIgreja.ts.numbered.txt`
10. `docs/auditoria-evidence/step-06/app__app__join-church_requests.tsx.numbered.txt`
11. `docs/auditoria-evidence/step-06/app__app___drawer__admin_solicitacoes_index.tsx.numbered.txt`

### Tabela completa de `useMutation()`
| Arquivo | Hook | Endpoint | onError | Loading | Invalidation |
|---|---|---|---|---|---|
| `hooks/useEscalaCrud.ts:49` | `generateMutation` | POST /escalas/gerar | SIM | SIM | SIM |
| `hooks/useCadastroIgrejaEmail.ts:136` | `reenviarEmailMutation` | POST /public/cadastro-igreja/{id}/reenviar-email | SIM | SIM | SIM |
| `hooks/useCadastroIgrejaEmail.ts:164` | `alterarEmailMutation` | PATCH /public/cadastro-igreja/{id}/alterar-email | SIM | SIM | SIM |
| `hooks/useCrud.ts:161` | `createMutation` | Dinamico (add do repository consumidor) | SIM | SIM | SIM |
| `hooks/useCrud.ts:175` | `updateMutation` | Dinamico (update do repository consumidor) | SIM | SIM | SIM |
| `hooks/useCrud.ts:189` | `removeMutation` | Dinamico (remove do repository consumidor) | SIM | SIM | SIM |
| `hooks/useEventoTemplatePadrao.ts:24` | `mutation` | PATCH /igrejas/{igrejaId}/eventos/{eventoId}/template-padrao | NAO | PARCIAL | SIM |
| `hooks/useEventoTemplatePadrao.ts:32` | `removeMutation` | DELETE /igrejas/{igrejaId}/eventos/{eventoId}/template-padrao | NAO | PARCIAL | SIM |
| `hooks/useIndisponibilidadesVoluntariosCrud.ts:44` | `upsertMany` | POST /indisponibilidades-voluntarios/upsert | SIM | SIM | SIM |
| `hooks/useIndisponibilidadesVoluntariosCrud.ts:62` | `removeWithIgreja` | DELETE /indisponibilidades-voluntarios/{id}?igrejaId= | SIM | SIM | SIM |
| `hooks/useNotificacoesCrud.ts:25` | `marcarComoLidoMutation` | PATCH /notificacoes/{id}/lida | NAO | SIM | SIM |
| `hooks/useNotificacoesCrud.ts:33` | `marcarTodasComoLidasMutation` | PATCH /notificacoes/lidas | NAO | SIM | SIM |
| `hooks/useMinisterioVoluntarioFuncoesCrud.ts:46` | `updateFuncoesMutation` | PUT /ministerio-voluntario-funcoes/voluntarios/{id}/funcoes | SIM | SIM | SIM |
| `hooks/useSairDaIgreja.ts:17` | `mutation` | DELETE /igrejas/{igrejaId}/voluntarios/{voluntarioId} | SIM | SIM | SIM |
| `app/(app)/join-church/requests.tsx:69` | `cancelMutation` | POST /me/igrejas/solicitacoes/{id}/cancelar | SIM | SIM | SIM |
| `app/(app)/(drawer)/admin/solicitacoes/index.tsx:123` | `aprovarMutation` | POST /igrejas/{igrejaId}/solicitacoes/{id}/aprovar | SIM | SIM | SIM |
| `app/(app)/(drawer)/admin/solicitacoes/index.tsx:135` | `rejeitarMutation` | POST /igrejas/{igrejaId}/solicitacoes/{id}/negar | SIM | SIM | SIM |
| `app/(app)/(drawer)/admin/solicitacoes/index.tsx:147` | `criarConviteMutation` | POST /igrejas/{igrejaId}/convites | SIM | SIM | SIM |
| `app/(app)/(drawer)/admin/solicitacoes/index.tsx:159` | `revogarConviteMutation` | POST /convites/{id}/revogar | SIM | SIM | SIM |

### Achados principais do bloco 4 (mutations)
1. Falta `onError` explícito em `hooks/useEventoTemplatePadrao.ts:24`, `hooks/useEventoTemplatePadrao.ts:32`, `hooks/useNotificacoesCrud.ts:25`, `hooks/useNotificacoesCrud.ts:33`.
2. Invalidação de cache está bem coberta na maioria das mutações.
3. Mensagens de erro em geral são amigáveis, mas ainda há telas com logs técnicos em fluxo de erro.

---

## Passo 7 - Hooks de API: `useQuery` (Bloco 4)

### Evidências salvas
1. `docs/auditoria-evidence/step-07/usequery-occurrences.txt`
2. `docs/auditoria-evidence/step-07/hooks_useDashboard.ts.numbered.txt`
3. `docs/auditoria-evidence/step-07/hooks_useCrud.ts.numbered.txt`
4. `docs/auditoria-evidence/step-07/hooks_useCadastroIgrejaEmail.ts.numbered.txt`
5. `docs/auditoria-evidence/step-07/hooks_useIgrejaConfiguracoes.ts.numbered.txt`
6. `docs/auditoria-evidence/step-07/hooks_useMinisteriosDrawer.ts.numbered.txt`
7. `docs/auditoria-evidence/step-07/hooks_useNotificacoesCrud.ts.numbered.txt`
8. `docs/auditoria-evidence/step-07/app__app__join-church_requests.tsx.numbered.txt`
9. `docs/auditoria-evidence/step-07/app__app___drawer__admin_solicitacoes_index.tsx.numbered.txt`

### Tabela completa de `useQuery()`
| Arquivo | Hook | Endpoint | onError | Loading | Invalidation |
|---|---|---|---|---|---|
| `hooks/useDashboard.ts:25` | `query` | DashboardRepository.getDashboard (multiplos endpoints de dashboard) | NAO (tratado via isError no consumidor) | SIM | N/A |
| `hooks/useDashboard.ts:59` | `useMinisterioDashboard` | DashboardRepository.getMinisterioDashboard (retorna {} atualmente) | NAO | PARCIAL | N/A |
| `hooks/useCrud.ts:147` | `dataQuery` | Dinamico (fetchAll/search do repository consumidor) | NAO | SIM | N/A |
| `hooks/useCadastroIgrejaEmail.ts:57` | `statusQuery` | GET /public/cadastro-igreja/{id}/status | NAO | SIM | N/A |
| `hooks/useIgrejaConfiguracoes.ts:27` | `configuracoesQuery` | GET /igrejas/{igrejaId}/configuracoes | NAO | SIM | N/A |
| `hooks/useMinisteriosDrawer.ts:24` | `ministeriosDrawerQuery` | POST /igrejas/{igrejaId}/ministerios/search | NAO | SIM | N/A |
| `hooks/useNotificacoesCrud.ts:13` | `listarQuery` | GET /notificacoes | NAO | SIM | N/A |
| `hooks/useNotificacoesCrud.ts:19` | `contarNaoLidasQuery` | GET /notificacoes/nao-lidas/count | NAO | SIM | N/A |
| `app/(app)/join-church/requests.tsx:63` | `solicitacoesQuery` | GET /me/igrejas/solicitacoes | SIM (UI com retry) | SIM | N/A |
| `app/(app)/(drawer)/admin/solicitacoes/index.tsx:76` | `solicitacoesQuery` | GET /igrejas/{igrejaId}/solicitacoes | PARCIAL (sem estado de erro dedicado) | SIM | N/A |
| `app/(app)/(drawer)/admin/solicitacoes/index.tsx:104` | `convitesQuery` | GET /igrejas/{igrejaId}/convites | PARCIAL (sem estado de erro dedicado) | SIM | N/A |

### `enabled`, `staleTime` e `retry`
1. `hooks/useDashboard.ts:37-40` define `enabled`, `staleTime` (5 min) e `retry: 1`.
2. `hooks/useCadastroIgrejaEmail.ts:66-68` define `enabled` e `staleTime` (10s), sem `retry` explícito.
3. `hooks/useMinisteriosDrawer.ts:44-47` define `enabled`, `staleTime: 0`, `gcTime: 0` (intencional para troca de igreja).
4. `hooks/useCrud.ts:153` usa `enabled` condicional, sem `staleTime/retry` explícitos.
5. `hooks/useNotificacoesCrud.ts:16-23`, `hooks/useIgrejaConfiguracoes.ts:27-37`, `app/(app)/join-church/requests.tsx:63-67`, `app/(app)/(drawer)/admin/solicitacoes/index.tsx:76-119` não configuram `staleTime/retry`.

### Achados principais do bloco 4 (queries)
1. Ausência frequente de `onError` no hook (tratamento difuso na UI).
2. Em `app/(app)/(drawer)/admin/solicitacoes/index.tsx`, falhas de query podem cair em estado vazio sem feedback claro de erro.
3. `useMinisterioDashboard` (`hooks/useDashboard.ts:59`) consulta método que retorna objeto vazio no repositório (`domain/services/DashboardRepository.ts:440-442`).

---

## Passo 8 - Fluxos de Navegação (Bloco 5)

### Evidências salvas
1. `docs/auditoria-evidence/step-08-10/app__app__join-church_index.tsx.numbered.txt`
2. `docs/auditoria-evidence/step-08-10/app__app__join-church_requests.tsx.numbered.txt`
3. `docs/auditoria-evidence/step-08-10/app__public__invite__token_.tsx.numbered.txt`
4. `docs/auditoria-evidence/step-08-10/app__app___layout.tsx.numbered.txt`
5. `docs/auditoria-evidence/step-08-10/app__app___drawer___layout.tsx.numbered.txt`
6. `docs/auditoria-evidence/step-08-10/components_drawer_FancyDrawerIgrejaSelector.tsx.numbered.txt`
7. `docs/auditoria-evidence/step-08-10/components_drawer_FancyDrawerIgrejaSelectorModal.tsx.numbered.txt`
8. `docs/auditoria-evidence/step-08-10/app__app___drawer__admin_solicitacoes_index.tsx.numbered.txt`
9. `docs/auditoria-evidence/step-08-10/contexts_AuthContext.tsx.numbered.txt`

### Entry flow (OPEN / APPROVAL / INVITE)
1. OPEN mode: `PARCIAL`.
2. Evidência: `app/(app)/join-church/index.tsx:119-134` trata `MEMBER_CREATED` (entrada direta) e `REQUEST_CREATED` (pendente).
3. Risco: o redirect pós-sucesso vai para `/(app)/(drawer)` e não especificamente para ministérios (`app/(app)/join-church/index.tsx:126`).
4. APPROVAL mode: `OK` para estado pendente (envia para requests e exibe status) em `app/(app)/join-church/index.tsx:127-134` e `app/(app)/join-church/requests.tsx:22-51`.
5. INVITE mode: `OK` para validação de código e mensagens de erro amigáveis em `app/(app)/join-church/index.tsx:18-53`.
6. INVITE inválido: `OK` com mensagens explícitas (`app/(app)/join-church/index.tsx:24-46`).

### Approval flow (líderes)
1. Lista de pendentes: `OK` em `app/(app)/(drawer)/admin/solicitacoes/index.tsx:76-96`.
2. Aprovar/rejeitar atualiza UI: `OK` via `invalidateQueries` (`app/(app)/(drawer)/admin/solicitacoes/index.tsx:128`, `app/(app)/(drawer)/admin/solicitacoes/index.tsx:140`).
3. Confirmação antes de rejeitar: `OK` em `app/(app)/(drawer)/admin/solicitacoes/index.tsx:186-199`.

### Church switching
1. Limpa cache ao trocar igreja: `OK` em `contexts/AuthContext.tsx:106-109`.
2. Recarrega dados da nova igreja: `OK` por `queryClient.clear` + nova `igrejaAtiva`.
3. Reset de stack: `ISSUE` (não há reset de navegação explícito após troca) em `contexts/AuthContext.tsx:104-110`.
4. Invalidação/reset QueryClient: `OK` (clear completo).

### Navegação geral
1. Rotas protegidas por role: `ISSUE`.
2. `hooks/useProtectedRoute.ts` existe mas não é usado em nenhum lugar (`hooks/useProtectedRoute.ts:13`, sem chamadas).
3. Layouts admin não aplicam guardas de role (ex.: `app/(app)/(drawer)/admin/ministerios/_layout.tsx:5-24`, `app/(app)/(drawer)/admin/eventos/_layout.tsx:5-25`).
4. Drawer abre/fecha: `OK` (itens chamam `navigation.closeDrawer` em `components/drawer/FancyDrawer.tsx:60`, `components/drawer/FancyDrawer.tsx:106`, `components/drawer/FancyDrawer.tsx:115`).
5. Modais com fechamento por backdrop: `OK` em `components/drawer/FancyDrawerIgrejaSelectorModal.tsx:58-63`.

---

## Passo 9 - UX e Feedback Visual (Bloco 6)

### Loading states
1. Mutations: `PARCIAL`.
2. Boa cobertura em fluxos principais (`app/(app)/(drawer)/admin/solicitacoes/index.tsx:281-283`, `app/(app)/join-church/requests.tsx:152`, `app/(auth)/login.tsx:292`).
3. Gap em alguns hooks (`hooks/useEventoTemplatePadrao.ts:24`, `hooks/useEventoTemplatePadrao.ts:32`) sem padrão local explícito de loading no próprio hook.
4. Queries primeira carga: `OK` em telas principais (dashboard, join requests, notificações).
5. Pull-to-refresh: `OK` em `app/(app)/join-church/requests.tsx:230-237` e `app/(app)/(drawer)/admin/solicitacoes/index.tsx:261-268`.
6. Skeleton/shimmer: `ISSUE` (predomina spinner; ausência de skeleton nas telas principais).

### Success states
1. Em geral `OK`: toasts em aprovar/rejeitar/cancelar/atualizar dados.
2. Criação/edição com navegação de retorno: `OK` em múltiplas telas de CRUD.

### Error states
1. Mutations: `PARCIAL`.
2. Há mensagens amigáveis em boa parte dos fluxos (`getApiErrorMessage` + toasts).
3. Risco de mensagem técnica/log excessivo em produção por `console.log` não protegido.
4. Retry explícito: `OK` em `app/(app)/join-church/requests.tsx:191`.
5. Em `admin/solicitacoes`, falha de query sem estado de erro dedicado: `ISSUE` (`app/(app)/(drawer)/admin/solicitacoes/index.tsx`).

### Empty states
1. `OK` em join requests e admin solicitações (placeholders dedicados).
2. CTA presente quando aplicável (ex.: inserir código em `app/(app)/join-church/requests.tsx:217-221`).

### Duplo clique
1. `PARCIAL`.
2. Muitos botões desabilitam durante request.
3. Ainda existem ações de submit sem bloqueio explícito no componente de origem (ex.: alguns modais/formulários com `Submit desabilita = NAO`).

---

## Passo 10 - Segurança, Performance, Design System e Edge Cases (Blocos 7-10)

### Segurança
1. Logs sensíveis/debug sem guarda `__DEV__`: `ISSUE`.
2. Evidências: `domain/services/CadastroIgrejaRepository.ts:128-133`, `app/_layout.tsx:44`, `app/(app)/(drawer)/configuracoes/index.tsx:162`, `components/pages/ministerios/agenda/AgendaDetailsDadosTab.tsx:105-107`.
3. Token em storage seguro: `OK` (`core/storage/authTokenStorage.ts:7-27`).
4. Token duplicado em AsyncStorage dentro de `user`: `ISSUE CRÍTICO` (`contexts/AuthContext.tsx:139`, `contexts/AuthContext.tsx:154`, `contexts/AuthContext.tsx:216`, `contexts/AuthContext.tsx:248`).
5. Inputs de senha com `secureTextEntry`: `OK` (`components/fields/FancyPasswordInput.tsx:13`, `app/(auth)/create-voluntario-account.tsx:130`).
6. Segredo hardcoded/versionado: `ISSUE CRÍTICO` em `.env:1` (arquivo versionado).
7. DSN Sentry hardcoded e `sendDefaultPii: true`: `ISSUE ALTO` (`app/_layout.tsx:23`, `app/_layout.tsx:27`).

### Hardcoded/local hosts
1. Não há `localhost`/`10.0.2.2`/`127.0.0.1` em runtime app principal.
2. Ocorrências estão concentradas em scripts/docs internos.

### Performance
1. Listas grandes com `ScrollView + map`: `ISSUE MÉDIO` em `app/(app)/(drawer)/admin/solicitacoes/index.tsx:258-287`, `app/(app)/(drawer)/admin/solicitacoes/index.tsx:292-323`.
2. `SectionList` sem `keyExtractor`: `RISCO MÉDIO` em `components/pages/notifications/NotificationsList.tsx:90-104`.
3. `FancyDrawer` com memoização inconsistente (`itemRunningIndex` mutável em dependência): `ISSUE MÉDIO` (`components/drawer/FancyDrawer.tsx:44-67`).
4. Imagens: `OK` (uso de `expo-image` com cache em `components/images/FancyImage.tsx:20-25`).

### Design system e acessibilidade
1. Paleta diverge do baseline informado no checklist (`#2D7CFF`, `#FF8243`): `ISSUE` em `constants/colors.ts:2-7`.
2. `FancyButton` define `accessibilityState.disabled` sempre como `true`: `ISSUE ALTO` (`components/buttons/FancyButton.tsx:118`).
3. Cobertura de `accessibilityLabel/accessibilityHint`: `PARCIAL` (há suporte na base, adoção incompleta nas telas).

### Edge cases
1. Usuário sem igreja: `OK` (redirect para join church) em `app/(app)/(drawer)/_layout.tsx:11-13`.
2. Usuário com múltiplas igrejas: `OK` (seletor e troca) em `components/drawer/FancyDrawerIgrejaSelector.tsx:18-22`.
3. Nomes longos: `PARCIAL` (há `numberOfLines` em pontos críticos, mas não cobertura global).
4. Teclado: `PARCIAL` (boa cobertura no fluxo auth via `AuthScreen`; não global em todas as telas).
5. Rotação: `OK` (portrait em `app.json:7` e `AndroidManifest.xml:19`).

---

## Resumo Final

### 🔴 CRÍTICO (segurança, app quebra, data leak)
1. **`docs/auditoria-evidence/step-01/tsc-noemit.txt:1`**
   - Problema: build TypeScript quebrado com dezenas de erros (incluindo `Toast` não importado em `app/(app)/(drawer)/admin/eventos/add.tsx:69`).
   - Sugestão: zerar erros de compilação antes de release (`npx tsc --noEmit` como gate de CI).
   - Severidade: 🔴
2. **`.env:1`**
   - Problema: arquivo de ambiente versionado contendo chave de aplicação.
   - Sugestão: remover do git history, rotacionar chave e migrar para secrets de CI/EAS.
   - Severidade: 🔴
3. **`contexts/AuthContext.tsx:139`**
   - Problema: objeto `user` persistido em AsyncStorage com `access_token` (data leak em storage não endurecido).
   - Sugestão: persistir somente dados não sensíveis em AsyncStorage e manter token apenas no SecureStore.
   - Severidade: 🔴
4. **`app.json:6` + `android/app/src/main/AndroidManifest.xml:28` + `app/(app)/join-church/index.tsx:74` + `components/pages/igreja/JoinChurchModal.tsx:70`**
   - Problema: divergência de schemes/deeplink parser (`diakonia` vs `artos`) e parsing inconsistente.
   - Sugestão: unificar scheme em config nativa + Expo e padronizar regex de extração de token.
   - Severidade: 🔴

### 🟡 ALTO (UX ruim, erros não tratados, fluxos quebrados)
1. **`eas.json` (ausente)**
   - Problema: sem profiles `development/preview/production` para pipeline previsível.
   - Sugestão: criar `eas.json` com env por profile e channel/credentials definidos.
   - Severidade: 🟡
2. **`android/app/build.gradle:117`**
   - Problema: `release` usando `signingConfigs.debug`.
   - Sugestão: configurar assinatura de release real (upload keystore/EAS credentials).
   - Severidade: 🟡
3. **`app/(app)/(drawer)/admin/ministerios/_layout.tsx:5`** (e demais layouts admin)
   - Problema: ausência de guardas de role em layout/rota; segurança baseada majoritariamente em menu.
   - Sugestão: aplicar guarda de role no nível de rota (redirect 403/sem permissão).
   - Severidade: 🟡
4. **`hooks/useProtectedRoute.ts:13`**
   - Problema: hook de proteção existe mas não é usado.
   - Sugestão: integrar no root layout ou remover para evitar falsa sensação de proteção.
   - Severidade: 🟡
5. **`hooks/useNotificacoesCrud.ts:25` e `hooks/useNotificacoesCrud.ts:33`**
   - Problema: mutações sem `onError`; falhas podem ficar silenciosas para usuário.
   - Sugestão: adicionar `onError` com toast amigável e telemetria controlada.
   - Severidade: 🟡
6. **`hooks/useEventoTemplatePadrao.ts:24` e `hooks/useEventoTemplatePadrao.ts:32`**
   - Problema: ausência de `onError` no hook (depende do consumidor tratar sempre).
   - Sugestão: padronizar `onError` no hook e manter tratamento local complementar.
   - Severidade: 🟡
7. **`app/(app)/(drawer)/admin/solicitacoes/index.tsx:76`**
   - Problema: queries sem estado de erro dedicado; falhas podem aparentar lista vazia.
   - Sugestão: incluir bloco de erro com CTA “Tentar novamente”.
   - Severidade: 🟡
8. **`app/_layout.tsx:23`**
   - Problema: DSN Sentry hardcoded.
   - Sugestão: mover DSN para secret/env por ambiente.
   - Severidade: 🟡
9. **`app/_layout.tsx:27`**
   - Problema: `sendDefaultPii: true` sem evidência de gate de consentimento.
   - Sugestão: revisar compliance/LGPD e condicionar por consentimento.
   - Severidade: 🟡
10. **`android/app/src/main/AndroidManifest.xml:3`**
   - Problema: permissões potencialmente excessivas (`READ/WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW`, `RECORD_AUDIO`).
   - Sugestão: reduzir ao mínimo necessário por feature ativa.
   - Severidade: 🟡
11. **`hooks/useIgrejaCrud.ts:39`**
   - Problema: logs de debug com payload em produção sem guarda `__DEV__` consistente.
   - Sugestão: padronizar logger com redaction + gate por ambiente.
   - Severidade: 🟡
12. **`contexts/AuthContext.tsx:104-110`**
   - Problema: troca de igreja limpa cache mas não reseta stack de navegação.
   - Sugestão: resetar navegação para rota raiz da nova igreja após switch.
   - Severidade: 🟡
13. **`hooks/useDashboard.ts:59` + `domain/services/DashboardRepository.ts:440-442`**
   - Problema: query de dashboard ministerial aponta para método que retorna `{}`.
   - Sugestão: implementar endpoint real ou remover hook não funcional.
   - Severidade: 🟡
14. **`components/buttons/FancyButton.tsx:118`**
   - Problema: `accessibilityState.disabled` sempre true.
   - Sugestão: usar `disabled: isBtnDisabled`.
   - Severidade: 🟡
15. **`components/drawer/FancyDrawer.tsx:22`**
   - Problema: URL de review iOS com placeholder `id__APP_ID__`.
   - Sugestão: substituir pelo App Store ID real antes de release.
   - Severidade: 🟡

### 🟢 MÉDIO (performance, polish, inconsistências visuais)
1. **`components/drawer/FancyDrawer.tsx:44-67`**
   - Problema: dependência de memo inclui variável mutável `itemRunningIndex`; `firstExpandableIndex` calculado e não usado.
   - Sugestão: remover estado transitório do array de dependências e limpar código morto.
   - Severidade: 🟢
2. **`app/(app)/(drawer)/admin/solicitacoes/index.tsx:258-323`**
   - Problema: listas renderizadas com `ScrollView + map` (risco de custo em listas grandes).
   - Sugestão: migrar para `FlatList` virtualizada.
   - Severidade: 🟢
3. **`components/pages/notifications/NotificationsList.tsx:90`**
   - Problema: `SectionList` sem `keyExtractor` explícito.
   - Sugestão: definir `keyExtractor` estável por ID.
   - Severidade: 🟢
4. **`hooks/useCrud.ts:147`**
   - Problema: query sem `staleTime/retry` padrão; pode haver refetch excessivo em alguns consumidores.
   - Sugestão: definir defaults por domínio (staleTime/retry) e sobrescrever por caso.
   - Severidade: 🟢
5. **`constants/colors.ts:2-7`**
   - Problema: paleta diverge da especificação informada no checklist.
   - Sugestão: alinhar tokens de design (`primary`/`secondary`) ao padrão de release.
   - Severidade: 🟢
6. **`app/(auth)/create-igreja-account.tsx:158`**
   - Problema: `useForm()` residual sem uso.
   - Sugestão: remover código morto para reduzir ambiguidade.
   - Severidade: 🟢

### ⚪ BAIXO (nice-to-have, melhorias futuras)
1. **`app/(app)/(drawer)/admin/eventos/edit.tsx:39`**
   - Problema: botão de submit sem `disabled` explícito (mas com loading de tela).
   - Sugestão: desabilitar ação localmente para consistência UX.
   - Severidade: ⚪
2. **`app/(app)/(drawer)/admin/ministerios/add.tsx:32`**
   - Problema: padrão de `onError` de formulário varia por tela.
   - Sugestão: padronizar helper de submit com callback de erro amigável.
   - Severidade: ⚪
3. **`app/(app)/(drawer)/ministerios/templates_equipe/add.tsx:15`**
   - Problema: erros de validação exibidos só em log em alguns fluxos.
   - Sugestão: substituir logs por mensagens UI curtas.
   - Severidade: ⚪

---

## Top 10 Prioridades Antes de Testes nas Lojas

1. **Build TS quebrado** (`docs/auditoria-evidence/step-01/tsc-noemit.txt:1`).
2. **`.env` versionado com chave** (`.env:1`).
3. **Token persistido em AsyncStorage dentro de `user`** (`contexts/AuthContext.tsx:139`).
4. **Deep link inconsistente (scheme/parsers)** (`app.json:6`, `AndroidManifest.xml:28`, `app/(app)/join-church/index.tsx:74`, `components/pages/igreja/JoinChurchModal.tsx:70`).
5. **Ausência de `eas.json`** (`eas.json` ausente).
6. **Release Android assinado com debug config** (`android/app/build.gradle:117`).
7. **Guardas de role ausentes em rotas admin** (`app/(app)/(drawer)/admin/ministerios/_layout.tsx:5` e similares).
8. **DSN hardcoded + PII ativo no Sentry** (`app/_layout.tsx:23`, `app/_layout.tsx:27`).
9. **Erro de query sem feedback na tela de solicitações admin** (`app/(app)/(drawer)/admin/solicitacoes/index.tsx:76`).
10. **Permissões Android potencialmente excessivas** (`android/app/src/main/AndroidManifest.xml:3`, `android/app/src/main/AndroidManifest.xml:5`, `android/app/src/main/AndroidManifest.xml:7`).

---

## Status de Aceite do Entregável

1. Itens dos 10 blocos respondidos com evidências por arquivo/linha: **SIM**.
2. Tabelas completas de `useForm`, `useMutation` e `useQuery`: **SIM**.
3. Findings com referência de arquivo/linha única: **SIM**.
4. Top 10 priorizado para pré-loja: **SIM**.
5. Sem exposição de segredo em texto aberto: **SIM**.

---

## Atualização Pós-Correções (17/02/2026)

### Status atual dos bloqueios técnicos
1. `npx tsc --noEmit`: **OK (sem erros)**.
2. Persistência de token sensível em `AsyncStorage`: **CORRIGIDO** (`contexts/AuthContext.tsx`).
3. Parser de convite/deeplink inconsistente: **CORRIGIDO** (`utils/inviteToken.ts`, fluxos de join church).
4. `Toast` faltando em `admin/eventos/add`: **CORRIGIDO**.
5. `eas.json` ausente: **CORRIGIDO** (`eas.json` criado com `development/preview/production`).
6. `.env` versionado: **CORRIGIDO no repositório atual** (`.env` removido do índice, `.env.example` criado).  
   Observação: ainda é recomendado rotacionar segredos previamente expostos.
7. Guardas de role em rotas admin: **CORRIGIDO** (layouts `admin/*` com `useRoleGuard`).
8. DSN Sentry hardcoded e PII em produção: **CORRIGIDO** (`app/_layout.tsx` via ENV e `sendDefaultPii` controlado por env).
9. Permissões Android excessivas: **MITIGADO via Expo config** (`app.json` com `blockedPermissions`).

### Riscos pré-loja que permanecem
1. Versionamento de release ainda não incrementado:
   - `app.json:5` (`version`)
   - `app.json:17` (`ios.buildNumber`)
   - `app.json:27` (`android.versionCode`)
2. URL iOS de avaliação ainda com placeholder:
   - `components/drawer/FancyDrawer.tsx:25`
3. Assinatura Android release em `build.gradle` continua apontando para configuração debug local (somente relevante se este diretório nativo for usado no pipeline final):
   - `android/app/build.gradle:128`
