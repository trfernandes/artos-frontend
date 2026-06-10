# EscalaEventoPage — Fix Delete + Modais → BottomSheet

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir o botão excluir evento (sem feedback ao usuário) e converter os modais de "adicionar função" e "substituição" para bottom sheets.

**Architecture:** Todas as mudanças são em `EscalaEventoPage.tsx` e seus dois filhos de modal. Nenhuma mudança no backend necessária — a rota `DELETE /escalas/:escalaId/itens` já existe e aceita `igrejaId` via query param.

**Tech Stack:** React Native, Expo Router, FancyBottomSheetModal, FancyButton, react-hook-form não usado aqui (estado local simples).

---

### Task 1: Fix do delete silencioso

**Files:**
- Modify: `app/(app)/(drawer)/ministerios/escalas/details.tsx` (função `handleDeleteEvento`, bloco catch)

**Step 1: Adicionar toast de erro no catch**

Localizar o bloco (em torno da linha 361-379 de `details.tsx`):

```ts
const handleDeleteEvento = useCallback(
  async (eventoId: string, dataOcorrencia: string): Promise<boolean> => {
    try {
      if (!igrejaAtiva?.id) return false;
      await EscalaRepository.deleteItensByEvento(escalaId, igrejaAtiva.id, {
        eventoId,
        dataOcorrencia,
      });
      await refetchEscala();
      Toast.show({
        type: 'success',
        text1: 'Evento removido com sucesso.',
      });
      return true;
    } catch {
      return false;  // ← AQUI: silencia o erro, usuário não vê nada
    }
  },
  [escalaId, refetchEscala, igrejaAtiva?.id],
);
```

Substituir o catch por:

```ts
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível remover o evento.',
      });
      return false;
    }
```

**Step 2: Verificar que `npx tsc --noEmit` passa**

**Step 3: Commit**
```
fix: add error toast on delete evento failure in EscalaEventoPage
```

---

### Task 2: Converter AdicionarFuncaoModal → FancyBottomSheetModal

**Files:**
- Modify: `components/pages/ministerios/escalas/details/AdicionarFuncaoModal.tsx`
- Modify: `components/pages/ministerios/escalas/details/EscalaEventoPage.tsx` (uso do componente)

**Contexto:** Atualmente é um `FancyModalDialog` (modal centralizado). A API do `FancyBottomSheetModal`:
```tsx
<FancyBottomSheetModal
  visible={boolean}
  onClose={() => void}
  title="string"
  footer={<ReactNode>}  // botões ficam aqui
>
  {/* conteúdo */}
</FancyBottomSheetModal>
```

**Step 1: Reescrever `AdicionarFuncaoModal.tsx`**

Remover `FancyModalDialog` e `FancyModalDialogProps`. Novo componente:

```tsx
import FancyBottomSheetModal from '../../../../modal/FancyBottomSheetModal';
import { StyleSheet, View } from 'react-native';
import FancyText from '../../../../FancyText';
import FancySearchSelect from '../../../../fields/FancySearchSelect';
import { format } from 'date-fns';
import { useState } from 'react';
import FancyErrorText from '../../../../forms/FancyErrorText';
import FancyGroup from '../../../../list/FancyGroup';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import DefaultIcons from '../../../../FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyButton from '../../../../buttons/FancyButton';

export interface AdicionarFuncaoModalProps {
  visible: boolean;
  onClose: () => void;
  ministerioId: string;
  eventoNome: string;
  eventoId: string;
  dataOcorrencia: Date;
  dataInicio: Date;
  dataTermino: Date;
  onConfirm: (data: AdicionarFuncaoConfirmDialog) => Promise<void>;
}

export interface AdicionarFuncaoConfirmDialog {
  funcaoId: string;
  eventoId: string;
  dataOcorrencia: string;
}

export default function AdicionarFuncaoModal({
  visible,
  onClose,
  ministerioId,
  eventoNome,
  eventoId,
  dataOcorrencia,
  dataInicio,
  dataTermino,
  onConfirm,
}: AdicionarFuncaoModalProps) {
  const palette = usePallete();
  const { data: funcoes, isLoading: isLoadingFuncoes } = useMinisterioFuncoesCrud({
    autoFetch: true,
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: 'EQUALS' as any,
            value: { type: 'LITERAL' as any, value: ministerioId },
          },
        ],
      },
    },
  });

  const funcoesSearchList = funcoes.map((f) => ({
    title: f.nome,
    value: f.id!,
  }));

  const [selectedFuncao, setSelectedFuncao] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedFuncao) {
      setErrors({ funcao: 'Campo Obrigatório' });
      return;
    }
    setErrors({});
    try {
      setIsSubmitting(true);
      await onConfirm({
        funcaoId: selectedFuncao,
        eventoId,
        dataOcorrencia: format(dataOcorrencia, 'yyyy-MM-dd'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FancyBottomSheetModal
      visible={visible}
      onClose={onClose}
      title='Adicionar Função ao Evento'
      closeDisabled={isSubmitting}
      footer={
        <View style={styles.footer}>
          <FancyButton
            label='Cancelar'
            type='outlined'
            onPress={onClose}
            disabled={isSubmitting}
            containerStyle={styles.footerBtn}
          />
          <FancyButton
            label='Adicionar'
            type='contained'
            onPress={handleConfirm}
            isLoading={isSubmitting}
            loadingText='Adicionando...'
            disabled={isLoadingFuncoes}
            containerStyle={styles.footerBtn}
          />
        </View>
      }
    >
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: palette.backgroundColor2,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: palette.borderCard,
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
          }}
        >
          <FancyText type='semiBold' size='small'>{eventoNome}</FancyText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <DefaultIcons.Custom library='MaterialIcons' name='event' size={12} color={palette.primary} />
            <FancyText size='extraSmall' type='medium'>
              {`${format(dataOcorrencia, 'dd/MM/yyyy')} - ${format(dataInicio, 'HH:mm')} à ${format(dataTermino, 'HH:mm')}`}
            </FancyText>
          </View>
        </View>

        <FancyGroup title='Selecionar Função:' contentContainerStyle={{ gap: 15 }}>
          <View style={{ flexDirection: 'column', gap: 5 }}>
            <FancySearchSelect
              label='Função'
              placeholder='Buscar função...'
              value={selectedFuncao}
              onChange={(value) => {
                setSelectedFuncao(Array.isArray(value) ? value[0] || null : value);
                setErrors((prev) => { const { funcao, ...rest } = prev; return rest; });
              }}
              listItems={funcoesSearchList}
              isLoading={isLoadingFuncoes}
              disabled={isSubmitting || isLoadingFuncoes}
            />
            {errors && <FancyErrorText message={errors['funcao']} />}
          </View>
        </FancyGroup>
      </View>
    </FancyBottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingHorizontal: 16, paddingBottom: 8 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  footerBtn: { flex: 1 },
});
```

**Step 2: Atualizar uso em `EscalaEventoPage.tsx`**

Localizar o bloco `{adicionarFuncaoModalOpen && ...}` (~linha 685-700) e substituir:

```tsx
{adicionarFuncaoModalOpen && (
  <AdicionarFuncaoModal
    visible={adicionarFuncaoModalOpen}
    onClose={() => setAdicionarFuncaoModalOpen(false)}
    ministerioId={ministerioId}
    eventoNome={data.evento.nome}
    eventoId={data.evento.id}
    dataOcorrencia={DateUtilsApi.dateTimeFromApi(data.dataOcorrencia)}
    dataInicio={data.evento.dataInicio!}
    dataTermino={data.evento.dataTermino!}
    onConfirm={async (funcaoData) => {
      const ok = await onAdicionarFuncao?.(funcaoData);
      if (ok) setAdicionarFuncaoModalOpen(false);
    }}
  />
)}
```

**Step 3: Verificar `npx tsc --noEmit`**

**Step 4: Commit**
```
refactor: convert AdicionarFuncaoModal to FancyBottomSheetModal
```

---

### Task 3: Converter SubstituirVoluntarioModal → FancyBottomSheetModal

**Files:**
- Modify: `components/pages/ministerios/escalas/details/SubstituirVoluntarioModal.tsx`
- Modify: `components/pages/ministerios/escalas/details/EscalaEventoPage.tsx` (uso do componente)

**Step 1: Reescrever `SubstituirVoluntarioModal.tsx`**

Mesma estratégia: remover `FancyModalDialog` e `FancyModalDialogProps`, adicionar props `visible/onClose/onConfirm`, wrapper `FancyBottomSheetModal` com `footer`:

```tsx
export interface SubstituirVoluntarioModalProps {
  visible: boolean;
  onClose: () => void;
  data: EscalaItemEquipeType & {
    ministerioId: string;
    idEscalaItem: string;
    evento: { dataOcorrencia: Date; dataInicio: Date; dataTermino: Date };
  };
  currentEquipe?: EscalaItemEquipeType[];
  onConfirm: (data: SubstituicaoConfirmDialog) => Promise<void>;
}
```

O `handleConfirm` interno mantém o `FancyAlert` de confirmação antes de chamar `onConfirm`.

O footer fica:
```tsx
footer={
  <View style={styles.footer}>
    <FancyButton label='Cancelar' type='outlined' onPress={onClose} disabled={isSubmitting} containerStyle={styles.footerBtn} />
    <FancyButton label='Substituir' type='contained' onPress={handleConfirm} isLoading={isSubmitting} loadingText='Substituindo...' containerStyle={styles.footerBtn} />
  </View>
}
```

**Step 2: Atualizar uso em `EscalaEventoPage.tsx`**

Bloco `{substituicaoModalProps.isOpen && ...}` (~linha 643-662):

```tsx
{substituicaoModalProps.isOpen && (
  <SubstituirVoluntarioModal
    visible={substituicaoModalProps.isOpen}
    onClose={() => setSubstituicaoModalProps({ isOpen: false })}
    data={{
      ...substituicaoModalProps.data!,
      evento: {
        dataInicio: data.evento.dataInicio!,
        dataTermino: data.evento.dataTermino!,
        dataOcorrencia: DateUtilsApi.dateTimeFromApi(data.dataOcorrencia),
      },
      ministerioId,
    }}
    currentEquipe={data.equipe}
    onConfirm={async (subData) => {
      const ok = await onChangeVoluntario?.(subData);
      if (ok) setSubstituicaoModalProps({ isOpen: false });
    }}
  />
)}
```

**Step 3: Verificar `npx tsc --noEmit`**

**Step 4: Commit**
```
refactor: convert SubstituirVoluntarioModal to FancyBottomSheetModal
```
