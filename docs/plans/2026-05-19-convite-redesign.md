# Convite Redesign — Fluxo Unificado + Fix Flash

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mostrar a tela de convite sempre (logado ou não), com botões dinâmicos por estado; substituir o redirect pós-login por um bottom sheet de confirmação dentro do app.

**Architecture:**
- `invite/[token].tsx` busca preview sem autenticação (endpoint já é público). Botões variam por `user` state reativo — sem re-fetch.
- `usePostLoginRedirect` passa a chamar um callback `onPendingInvite(token)` em vez de navegar para a rota pública — elimina o flash.
- `(app)/_layout.tsx` gerencia um `pendingInviteToken` local e renderiza `PendingInviteBottomSheet` quando preenchido.

**Tech Stack:** React Native / Expo Router, AsyncStorage, FancyBottomSheetModal, IgrejaRepository

---

### Task 1: Corrigir `invite/[token].tsx` — desacoplar preview de auth

**Files:**
- Modify: `artos_frontend/app/(public)/invite/[token].tsx`

**Step 1: Remover `user` do useEffect de preview**

Substituir a dependência `[urlToken, user]` por `[urlToken]`. Remover o bloco `if (!user) { ... router.replace('/(auth)/login') }` do interior do useEffect.

```tsx
useEffect(() => {
  const handleInvite = async () => {
    if (!urlToken) {
      setError('Token de convite inválido');
      setLoadingPreview(false);
      return;
    }
    // REMOVIDO: bloco if (!user) { ... }
    try {
      const previewData = await IgrejaRepository.getConvitePreview(urlToken);
      setPreview(previewData);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      Toast.show({ type: 'error', text1: 'Erro', text2: errorMsg });
    } finally {
      setLoadingPreview(false);
    }
  };
  handleInvite();
}, [urlToken]); // <-- removido `user`
```

**Step 2: Atualizar botões do branch `jaMembro`**

Quando `preview.jaMembro`:
- Se `user` → "Ir para o app" + "Fechar" (comportamento atual, mantém `/(app)`)
- Se `!user` → "Fazer login" (contained) + "Fechar" (outlined)

```tsx
<View style={styles.buttonGroup}>
  {user ? (
    <>
      <FancyButton label='Ir para o app' onPress={() => router.replace('/(app)')} />
      <FancyButton label='Fechar' type='outlined' onPress={() => router.replace('/(app)')} />
    </>
  ) : (
    <>
      <FancyButton label='Fazer login' onPress={handleLoginForInvite} />
      <FancyButton label='Fechar' type='outlined' onPress={handleBack} />
    </>
  )}
</View>
```

**Step 3: Adicionar `handleLoginForInvite`**

```tsx
const handleLoginForInvite = async () => {
  if (urlToken) {
    await AsyncStorage.setItem('pendingInviteToken', urlToken);
  }
  router.replace('/(auth)/login');
};
```

**Step 4: Atualizar branch `solicitacaoPendente` — adicionar fallback sem user**

Quando `preview.solicitacaoPendente` e `!user`:
- Mostrar o card normal com "Fazer login" (igual ao jaMembro sem user)

**Step 5: Atualizar o branch principal (convite válido) — botões dinâmicos**

```tsx
<View style={styles.buttonGroup}>
  {user ? (
    <>
      <FancyButton
        label={loadingAccept ? 'Aceitando...' : 'Aceitar convite'}
        onPress={handleAccept}
        disabled={loadingAccept}
      />
      <FancyButton label='Cancelar' type='outlined' onPress={handleBack} disabled={loadingAccept} />
    </>
  ) : (
    <>
      <FancyButton label='Fazer login para aceitar' onPress={handleLoginForInvite} />
      <FancyButton label='Cancelar' type='outlined' onPress={handleBack} />
    </>
  )}
</View>
```

**Step 6: Rodar tsc**
```
cd artos_frontend && npx tsc --noEmit
```
Esperado: 0 erros.

---

### Task 2: Criar `PendingInviteBottomSheet`

**Files:**
- Create: `artos_frontend/components/pages/invite/PendingInviteBottomSheet.tsx`

**Step 1: Criar o componente**

```tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import FancyBottomSheetModal from '../../modal/FancyBottomSheetModal';
import FancyText from '../../FancyText';
import FancyButton from '../../buttons/FancyButton';
import FancyVerticalSpacer from '../../FancyVerticalSpacer';
import DefaultIcons from '../../FancyIcons';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { IgrejaRepository } from '../../../domain/services/IgrejaRepository';
import { ResponseConvitePreviewDto } from '../../../domain/dtos/Igreja/response-convite-preview.dto';
import { ColorUtils } from '../../../utils/color_utils';
import { ThemePalette } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

type Props = {
  token: string | null;
  onDismiss: () => void;
};

export default function PendingInviteBottomSheet({ token, onDismiss }: Props) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const { refreshMe } = useAuth();
  const [preview, setPreview] = useState<ResponseConvitePreviewDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setPreview(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    IgrejaRepository.getConvitePreview(token)
      .then(setPreview)
      .catch(() => setError('Não foi possível carregar o convite.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token || accepting) return;
    setAccepting(true);
    try {
      const result = await IgrejaRepository.aceitarConvite(token);
      if (result.result === 'MEMBER_CREATED') {
        Toast.show({ type: 'success', text1: 'Bem-vindo!', text2: 'Você agora faz parte da igreja.' });
        await refreshMe();
        router.replace('/(app)');
      } else if (result.result === 'REQUEST_CREATED') {
        Toast.show({ type: 'info', text1: 'Solicitação enviada', text2: 'Aguarde a aprovação da liderança.' });
        router.replace('/(app)/join-church/requests');
      }
      onDismiss();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao aceitar convite' });
    } finally {
      setAccepting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={Pallete.primary} />
          <FancyVerticalSpacer height={8} />
          <FancyText style={styles.mutedText}>Carregando convite...</FancyText>
        </View>
      );
    }
    if (error || !preview) {
      return (
        <View style={styles.center}>
          <FancyText style={styles.errorText}>{error || 'Convite não encontrado.'}</FancyText>
          <FancyVerticalSpacer height={12} />
          <FancyButton label='Fechar' type='outlined' onPress={onDismiss} />
        </View>
      );
    }
    if (preview.jaMembro) {
      return (
        <View style={styles.center}>
          <View style={styles.statusRow}>
            <DefaultIcons.Custom library='MaterialIcons' name='check-circle' size={16} color={Pallete.confirm} />
            <FancyText type='semiBold' size='small' style={styles.confirmText}>Você já é membro</FancyText>
          </View>
          <FancyVerticalSpacer height={16} />
          <FancyButton label='Ir para o app' onPress={() => { onDismiss(); router.replace('/(app)'); }} />
        </View>
      );
    }
    if (preview.solicitacaoPendente) {
      return (
        <View style={styles.center}>
          <FancyText size='small' style={styles.mutedText}>Você já possui uma solicitação pendente para esta igreja.</FancyText>
          <FancyVerticalSpacer height={16} />
          <FancyButton label='Ver solicitações' onPress={() => { onDismiss(); router.replace('/(app)/join-church/requests'); }} />
          <FancyVerticalSpacer height={8} />
          <FancyButton label='Fechar' type='outlined' onPress={onDismiss} />
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <FancyText size='small' style={styles.mutedText}>Você recebeu um convite para:</FancyText>
        <FancyVerticalSpacer height={4} />
        <FancyText type='semiBold' size='large'>{preview.igreja.nome}</FancyText>
        <FancyVerticalSpacer height={16} />
        <FancyButton label={accepting ? 'Aceitando...' : 'Aceitar convite'} onPress={handleAccept} disabled={accepting} />
        <FancyVerticalSpacer height={8} />
        <FancyButton label='Dispensar' type='outlined' onPress={onDismiss} disabled={accepting} />
      </View>
    );
  };

  return (
    <FancyBottomSheetModal visible={!!token} onClose={onDismiss} title='Convite pendente'>
      {renderContent()}
    </FancyBottomSheetModal>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    center: { alignItems: 'center', paddingBottom: 8 },
    mutedText: { color: palette.fonts.inactive, textAlign: 'center' },
    errorText: { color: palette.error, textAlign: 'center' },
    confirmText: { color: palette.confirm },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  });
}
```

**Step 2: Rodar tsc**
```
cd artos_frontend && npx tsc --noEmit
```
Esperado: 0 erros.

---

### Task 3: Atualizar `usePostLoginRedirect` — callback em vez de navigate

**Files:**
- Modify: `artos_frontend/hooks/usePostLoginRedirect.ts`

**Step 1: Aceitar callback `onPendingInvite`**

```typescript
type Options = {
  onPendingInvite?: (token: string) => void;
};

export function usePostLoginRedirect({ onPendingInvite }: Options = {}) {
  // ... código existente ...

  // Substituir dentro de checkAndRedirect:
  // ANTES:
  // replaceOnce(`/(public)/invite/${pendingToken}`, () => { Toast.show(...) });
  
  // DEPOIS:
  if (onPendingInvite) {
    await AsyncStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
    onPendingInvite(pendingToken);
    hasCheckedRef.current = true;
    return;
  } else {
    // fallback: comportamento anterior (não quebra outros usos)
    replaceOnce(`/(public)/invite/${pendingToken}`, () => {
      Toast.show({ type: 'info', text1: 'Processando convite...' });
    });
    hasCheckedRef.current = true;
    return;
  }
```

**Step 2: Rodar tsc**
```
cd artos_frontend && npx tsc --noEmit
```
Esperado: 0 erros.

---

### Task 4: Wiring em `(app)/_layout.tsx`

**Files:**
- Modify: `artos_frontend/app/(app)/_layout.tsx`

**Step 1: Adicionar state + bottom sheet**

```tsx
import { useState } from 'react';
import PendingInviteBottomSheet from '../../components/pages/invite/PendingInviteBottomSheet';

// dentro de RootLayout:
const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(null);
usePostLoginRedirect({ onPendingInvite: setPendingInviteToken });

// no JSX, dentro do GestureHandlerRootView (após o Stack):
<PendingInviteBottomSheet
  token={pendingInviteToken}
  onDismiss={() => setPendingInviteToken(null)}
/>
```

**Step 2: Rodar tsc**
```
cd artos_frontend && npx tsc --noEmit
```
Esperado: 0 erros.

---

### Verificação end-to-end

1. **Deslogado + link de convite:** Abre a tela, mostra card da igreja, botão "Fazer login para aceitar"
2. **Clica "Fazer login":** Salva token, vai para login
3. **Loga:** `usePostLoginRedirect` lê o token, chama `onPendingInvite`, bottom sheet aparece com o convite
4. **Aceita:** Toast + vai para `/(app)` ou fila — sem flash
5. **Dispensar:** Bottom sheet fecha, fica no app normalmente
6. **Logado + link de convite:** Abre tela direto com botões "Aceitar convite" / "Cancelar"
7. **Logado + já é membro:** Tela com pílula verde + "Ir para o app" / "Fechar"
8. **Convite inválido:** Mensagem de erro + "Voltar"
