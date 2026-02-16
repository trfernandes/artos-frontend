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
