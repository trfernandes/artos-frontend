# Four Bug Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir 4 bugs de UX e permissões no app Artos.

**Architecture:** Todos os bugs estão no frontend (artos_frontend/). Dois são correções de uma linha, um é adição de componente novo, um é mudança de configuração global.

**Tech Stack:** React Native / Expo Router, @tanstack/react-query, react-hook-form, TypeScript.

---

## Bug 1 — Telas recarregando ao voltar pro app

**Root cause:** `queryClient.ts:26` tem `refetchOnWindowFocus: true`. No React Native, isso dispara um refetch em todos os queries ativos toda vez que o app retorna do background (AppState: inactive/background → active). As telas já têm `useFocusEffect` + refetch manual para lidar com navegação interna — o `refetchOnWindowFocus` causa refetch duplo.

### Task 1: Desabilitar refetchOnWindowFocus

**Files:**
- Modify: `artos_frontend/core/react-query/queryClient.ts:26`

**Step 1: Aplicar fix**

Em `queryClient.ts`, mudar linha 26 de:
```typescript
refetchOnWindowFocus: true,
```
para:
```typescript
refetchOnWindowFocus: false,
```

**Step 2: Verificar TypeScript**

```
cd artos_frontend && npx tsc --noEmit
```
Expected: sem erros

**Step 3: Commit**

```bash
git add core/react-query/queryClient.ts
git commit -m "fix: disable refetchOnWindowFocus to prevent double-refresh on app resume"
```

---

## Bug 3 — Menu mostra tipo do ministério em vez de "Líder"

**Root cause:** `MenuData.ts:373-374` tem:
```typescript
subtitle: isAdmin
  ? MinisterioTipoLabel[ministerioTipo]
  : ministerio.hierarquia
    ? VoluntarioHierarquiaEnumLabel[ministerio.hierarquia]
    : '',
```
Quando o usuário é `ADMIN` e também é `Líder` do ministério, a branch `isAdmin` sempre mostra o tipo do ministério (ex: "Louvor"), nunca "Líder".

Há também um enum mismatch: a API retorna `hierarquia` como número (`1`), mas `VoluntarioHierarquiaEnum.Lider === '1'` (string). A comparação `===` falha. O `VoluntarioHierarquiaEnumLabel` usa o enum como chave, então `VoluntarioHierarquiaEnumLabel[1]` retorna `undefined`.

### Task 2: Corrigir subtitle do menu para admin+líder

**Files:**
- Modify: `artos_frontend/components/drawer/MenuData.ts` (~linha 373)

**Step 1: Aplicar fix**

Substituir o bloco de `subtitle` (~linha 373) por:
```typescript
subtitle:
  String(ministerio.hierarquia) === VoluntarioHierarquiaEnum.Lider
    ? VoluntarioHierarquiaEnumLabel[VoluntarioHierarquiaEnum.Lider]
    : isAdmin
      ? MinisterioTipoLabel[ministerioTipo]
      : ministerio.hierarquia
        ? VoluntarioHierarquiaEnumLabel[ministerio.hierarquia as VoluntarioHierarquiaEnum] ?? ''
        : '',
```

A lógica: se o usuário é Líder deste ministério (independentemente de ser admin), mostra "Líder". Se é admin mas não é Líder, mostra o tipo. Caso contrário, mostra hierarquia normal.

Também precisará adicionar import de `VoluntarioHierarquiaEnum` se ainda não importado no arquivo. Verificar no início do arquivo.

**Step 2: Verificar TypeScript**

```
cd artos_frontend && npx tsc --noEmit
```
Expected: sem erros

**Step 3: Commit**

```bash
git add components/drawer/MenuData.ts
git commit -m "fix: show 'Líder' in drawer menu when admin is also a ministry leader"
```

---

## Bug 4 — Admin+líder perde permissões de líder

**Root cause:** `ministerio_permissoes.ts:26` faz:
```typescript
if (ministerio.hierarquia === VoluntarioHierarquiaEnum.Lider) return true;
```
A API retorna `hierarquia: 1` (número), mas `VoluntarioHierarquiaEnum.Lider === '1'` (string). A comparação falha, então o Líder não recebe bypass e cai no check de permissões detalhadas (onde provavelmente não tem `AlterarOcorrencia`, etc.).

A mesma comparação ocorre na linha 49 em `canManageEventoOcorrencia`.

### Task 3: Corrigir comparação de hierarquia

**Files:**
- Modify: `artos_frontend/utils/ministerio_permissoes.ts:26` e `:49`

**Step 1: Corrigir linha 26**

```typescript
// Antes:
if (ministerio.hierarquia === VoluntarioHierarquiaEnum.Lider) return true;

// Depois:
if (String(ministerio.hierarquia) === VoluntarioHierarquiaEnum.Lider) return true;
```

**Step 2: Corrigir linha 49 em canManageEventoOcorrencia**

```typescript
// Antes:
return (
  ministerio.hierarquia === VoluntarioHierarquiaEnum.Lider ||

// Depois:
return (
  String(ministerio.hierarquia) === VoluntarioHierarquiaEnum.Lider ||
```

**Step 3: Verificar TypeScript**

```
cd artos_frontend && npx tsc --noEmit
```
Expected: sem erros

**Step 4: Commit**

```bash
git add utils/ministerio_permissoes.ts
git commit -m "fix: normalize hierarquia to string before enum comparison to fix leader permissions"
```

---

## Bug 2 — Adicionar líder abre como modal em vez de bottomsheet

**Root cause:** `AddLiderancaFormModal.tsx` usa `FancyModalDialog` (modal dialog, não bottomsheet). `AuxiliarMinisterioFormSheet.tsx` usa `FancyBottomSheetModal` — o padrão correto para o app. Ambas as instâncias de `AddLiderancaFormModal` em `LiderancaEAcessosTab.tsx` (uma no contexto de criação de ministério, outra no de edição) precisam ser substituídas.

### Task 4: Criar AddLiderancaFormSheet

**Files:**
- Create: `artos_frontend/components/pages/admin/ministerios/AddLiderancaFormSheet.tsx`

**Step 1: Criar o componente**

```typescript
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyBottomSheetModal from '../../../modal/FancyBottomSheetModal';
import FancyButton from '../../../buttons/FancyButton';
import FancySearchSelect from '../../../fields/FancySearchSelect';
import FancyText from '../../../FancyText';
import { DropDownItemProps } from '../../../fields/FancyDropDownItem';
import { usePallete } from '../../../../hooks/usePallete';
import { ResponseVoluntarioDto } from '../../../../domain/dtos/Voluntario/voluntario.response';
import { AddLiderFormData } from '../../../../domain/schemas/ministerioAdminSchema';
import { VoluntarioHierarquiaEnum } from '../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import { AppImages } from '../../../../assets/app_images';

type Props = {
  visible: boolean;
  volunteers: ResponseVoluntarioDto[];
  onClose: () => void;
  onSave: (data: AddLiderFormData) => void | Promise<void>;
};

export default function AddLiderancaFormSheet({ visible, volunteers, onClose, onSave }: Props) {
  const palette = usePallete();
  const [voluntarioId, setVoluntarioId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) setVoluntarioId('');
  }, [visible]);

  const volunteerOptions = useMemo<DropDownItemProps<string>[]>(
    () =>
      volunteers.map((v) => ({
        title: v.nome,
        value: v.id,
        left: {
          type: 'image',
          source:
            v.fotoThumbUrl || v.fotoUrl
              ? { uri: v.fotoThumbUrl || v.fotoUrl || '' }
              : AppImages.emptyProfile,
        } as any,
      })),
    [volunteers],
  );

  const handleSave = async () => {
    const selected = volunteers.find((v) => v.id === voluntarioId);
    if (!selected) return;
    setIsSaving(true);
    try {
      await onSave({
        voluntarioId: selected.id,
        voluntarioNome: selected.nome,
        fotoUrl: selected.fotoUrl ?? null,
        fotoThumbUrl: selected.fotoThumbUrl ?? null,
        hierarquia: VoluntarioHierarquiaEnum.Lider,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Adicionar líder'
      footer={
        <FancyButton
          label='Adicionar líder'
          type='contained'
          icon={{ library: 'Feather', name: 'user-plus', size: 16 }}
          disabled={!voluntarioId}
          isLoading={isSaving}
          onPress={handleSave}
        />
      }
    >
      <View style={styles.header}>
        <FancyText type='bold' size='medium'>
          Escolha o líder
        </FancyText>
        <FancyText size='small' color={palette.fonts.inactive}>
          O líder terá acesso completo a todas as funcionalidades do ministério.
        </FancyText>
      </View>
      <FancySearchSelect
        title='Líder'
        label='Líder'
        value={voluntarioId}
        onChange={(value) => setVoluntarioId(String(value))}
        listItems={volunteerOptions}
        searchPlaceholder='Buscar voluntário...'
      />
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
});
```

### Task 5: Substituir AddLiderancaFormModal no LiderancaEAcessosTab

**Files:**
- Modify: `artos_frontend/components/pages/admin/ministerios/LiderancaEAcessosTab.tsx`

Há **duas** instâncias a substituir.

**Step 1: Atualizar import no topo do arquivo**

```typescript
// Remover:
import AddLiderancaFormModal from './AddLiderancaFormModal';

// Adicionar:
import AddLiderancaFormSheet from './AddLiderancaFormSheet';
```

**Step 2: Substituir primeira instância (~linha 371)**

```tsx
// Remover:
{leaderModalVisible && (
  <AddLiderancaFormModal
    volunteers={eligibleLeaderVolunteers}
    onButton1Press={() => setLeaderModalVisible(false)}
    onButton2Press={(data) => {
      if (data) {
        lideresFieldArray.append({ ...data, hierarquia: VoluntarioHierarquiaEnum.Lider });
      }
      setLeaderModalVisible(false);
    }}
  />
)}

// Adicionar (sempre montado, controlado por visible):
<AddLiderancaFormSheet
  visible={leaderModalVisible}
  volunteers={eligibleLeaderVolunteers}
  onClose={() => setLeaderModalVisible(false)}
  onSave={(data) => {
    lideresFieldArray.append({ ...data, hierarquia: VoluntarioHierarquiaEnum.Lider });
  }}
/>
```

**Step 3: Substituir segunda instância (~linha 805)**

```tsx
// Remover:
{leaderModalVisible && (
  <AddLiderancaFormModal
    volunteers={eligibleLeaderVolunteers}
    onButton1Press={() => setLeaderModalVisible(false)}
    onButton2Press={async (data) => {
      setLeaderModalVisible(false);
      if (data) {
        await handleAddLeader(data);
      }
    }}
  />
)}

// Adicionar:
<AddLiderancaFormSheet
  visible={leaderModalVisible}
  volunteers={eligibleLeaderVolunteers}
  onClose={() => setLeaderModalVisible(false)}
  onSave={handleAddLeader}
/>
```

**Step 4: Verificar TypeScript**

```
cd artos_frontend && npx tsc --noEmit
```
Expected: sem erros

**Step 5: Commit**

```bash
git add components/pages/admin/ministerios/AddLiderancaFormSheet.tsx \
        components/pages/admin/ministerios/LiderancaEAcessosTab.tsx
git commit -m "feat: replace AddLiderancaFormModal with bottomsheet for consistent UX"
```

---

## Ordem de execução recomendada

1. Task 1 (Bug 1) — 1 linha, isolado
2. Task 3 (Bug 4) — 2 linhas, sem dependências
3. Task 2 (Bug 3) — 1 bloco, sem dependências
4. Task 4 + 5 (Bug 2) — novo componente + refactor

Executar `npx tsc --noEmit` após cada task. Nenhuma alteração de backend necessária.
