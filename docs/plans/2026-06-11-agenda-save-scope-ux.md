# Agenda Details — Save Scope UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task.

**Goal:** Corrigir o fluxo de salvamento na tela de detalhes de ocorrência de agenda: dados de
data/hora/local sempre salvam só na ocorrência atual (sem dialog de escopo); template, ensaio e
responsável do setlist exibem **um único dialog consolidado** em vez de múltiplos dialogs
sequenciais.

**Architecture:** Toda a lógica fica em `saveAllChanges` dentro de `AgendaDetailsDadosTab.tsx`. A
função `promptScope` passa a ser substituída por `promptConsolidatedScope`, que recebe uma lista dos
campos com mudanças propagáveis e exibe um único `FancyAlert.alert`. Dados de ocorrência
(`dadosDirty`) usam `TemplatePadraoEscopoEnum.OCORRENCIA` diretamente, sem dialog.

**Tech Stack:** React Native, TypeScript, `FancyAlert.alert` (já importado),
`TemplatePadraoEscopoEnum`.

---

### Task 1: Remover dialog de escopo para dados de ocorrência (data/hora/local)

**Arquivo:**

- Modify: `artos_frontend/components/pages/ministerios/agenda/AgendaDetailsDadosTab.tsx:1068-1072`

**Contexto:** O bloco `if (dadosDirty)` na função `saveAllChanges` chama `promptScope`, que exibe um
dialog perguntando onde salvar. Dados de data/hora/local são intrinsecamente específicos de uma
ocorrência — não faz sentido propagar para futuras.

**Passo 1: Localizar o bloco e substituir**

Arquivo: `artos_frontend/components/pages/ministerios/agenda/AgendaDetailsDadosTab.tsx`

Encontrar (linhas ~1068–1072):

```tsx
if (dadosDirty) {
  const scope = await promptScope('a data, horário e local desta ocorrência');
  if (scope === 'cancel') return false;
  dadosScope = scope;
}
```

Substituir por:

```tsx
if (dadosDirty) {
  dadosScope = TemplatePadraoEscopoEnum.OCORRENCIA;
}
```

**Passo 2: Verificar TypeScript**

```bash
cd artos_frontend && npx tsc --noEmit
```

Esperado: zero erros.

**Passo 3: Commit**

```bash
git add components/pages/ministerios/agenda/AgendaDetailsDadosTab.tsx
git commit -m "fix: dados de ocorrência (data/hora/local) salvam sempre só na ocorrência atual"
```

---

### Task 2: Consolidar múltiplos dialogs de escopo em um único

**Arquivo:**

- Modify: `artos_frontend/components/pages/ministerios/agenda/AgendaDetailsDadosTab.tsx:731-749`
  (função `promptScope`) e `1050-1066` (blocos `if (templateDirty)`, `if (responsavelSetlistDirty)`,
  `if (ensaioDirty)`)

**Contexto:** Hoje, se template + ensaio estiverem sujos, `saveAllChanges` exibe 2 dialogs
sequenciais perguntando a mesma coisa ("nesta ocorrência / a partir daqui"). A correção: descobrir
quais campos propagáveis estão sujos, construir um label descritivo e mostrar **um único dialog**.

**Passo 1: Substituir `promptScope` por `promptConsolidatedScope`**

Localizar a função `promptScope` (linhas ~731–749):

```tsx
const promptScope = useCallback((fieldLabel: string): Promise<ScopePromptResult> => {
  return new Promise((resolve) => {
    FancyAlert.alert(
      `Como deseja aplicar ${fieldLabel.toLowerCase()}?`,
      'Você pode aplicar só nesta data ou para esta e as próximas ocorrências.',
      [
        { text: 'Cancelar', style: 'destructive', onPress: () => resolve('cancel') },
        {
          text: 'Apenas nesta data',
          onPress: () => resolve(TemplatePadraoEscopoEnum.OCORRENCIA),
        },
        {
          text: 'Em todas a partir daqui',
          onPress: () => resolve(TemplatePadraoEscopoEnum.SERIE),
        },
      ],
    );
  });
}, []);
```

Substituir por (mantém o mesmo nome de variável pra não quebrar TypeScript — recebe lista de
labels):

```tsx
const promptConsolidatedScope = useCallback((fieldLabels: string[]): Promise<ScopePromptResult> => {
  return new Promise((resolve) => {
    const joined =
      fieldLabels.length === 1
        ? fieldLabels[0]
        : fieldLabels.slice(0, -1).join(', ') + ' e ' + fieldLabels[fieldLabels.length - 1];
    FancyAlert.alert(
      'Onde aplicar as alterações?',
      `Você alterou: ${joined}. Deseja salvar só nesta data ou em todas as ocorrências a partir daqui?`,
      [
        { text: 'Cancelar', style: 'destructive', onPress: () => resolve('cancel') },
        {
          text: 'Apenas nesta data',
          onPress: () => resolve(TemplatePadraoEscopoEnum.OCORRENCIA),
        },
        {
          text: 'Em todas a partir daqui',
          onPress: () => resolve(TemplatePadraoEscopoEnum.SERIE),
        },
      ],
    );
  });
}, []);
```

**Passo 2: Substituir os 3 blocos `if (xDirty)` com `promptScope` por um único bloco consolidado**

Localizar em `saveAllChanges` os 3 blocos (linhas ~1050–1066):

```tsx
if (templateDirty) {
  const scope = await promptScope('este template da equipe');
  if (scope === 'cancel') return false;
  templateScope = scope;
}

if (isLouvorMinisterio && responsavelSetlistDirty) {
  const scope = await promptScope('este responsável do setlist');
  if (scope === 'cancel') return false;
  responsavelScope = scope;
}

if (ensaioDirty) {
  const scope = await promptScope('este horário de ensaio');
  if (scope === 'cancel') return false;
  ensaioScope = scope;
}
```

Substituir por:

```tsx
const propagableLabels: string[] = [];
if (templateDirty) propagableLabels.push('template da equipe');
if (isLouvorMinisterio && responsavelSetlistDirty) propagableLabels.push('responsável do setlist');
if (ensaioDirty) propagableLabels.push('horário de ensaio');

if (propagableLabels.length > 0) {
  const scope = await promptConsolidatedScope(propagableLabels);
  if (scope === 'cancel') return false;
  if (templateDirty) templateScope = scope;
  if (isLouvorMinisterio && responsavelSetlistDirty) responsavelScope = scope;
  if (ensaioDirty) ensaioScope = scope;
}
```

**Passo 3: Atualizar dependências do `useCallback` de `saveAllChanges`**

No array de dependências de `saveAllChanges`, trocar `promptScope` por `promptConsolidatedScope`:

```tsx
  // antes:
  //   promptScope,
  // depois:
      promptConsolidatedScope,
```

**Passo 4: Remover `promptScope` do array de dependências (se não for mais usado)**

Se `promptScope` não for mais referenciado em nenhum outro lugar do componente, pode apagar a função
inteiramente. Verificar com:

```bash
grep -n "promptScope" components/pages/ministerios/agenda/AgendaDetailsDadosTab.tsx
```

Se a busca retornar apenas a definição antiga (que já foi removida no Passo 1) e nenhum uso, pode
deletar.

**Passo 5: Verificar TypeScript**

```bash
cd artos_frontend && npx tsc --noEmit
```

Esperado: zero erros.

**Passo 6: Commit**

```bash
git add components/pages/ministerios/agenda/AgendaDetailsDadosTab.tsx
git commit -m "fix: consolidar dialogs de escopo em um único ao salvar ocorrência"
```

---

### Task 3: Verificação manual no emulador

**O que verificar:**

1. Alterar apenas **data/hora/local** → clicar Salvar → **sem dialog**, toast "Ocorrência
   atualizada" aparece diretamente.

2. Alterar apenas **template** → clicar Salvar → **um dialog** "Onde aplicar as alterações? / Apenas
   nesta data / Em todas a partir daqui".

3. Alterar **template + ensaio juntos** → clicar Salvar → **um único dialog** com mensagem "Você
   alterou: template da equipe e horário de ensaio."

4. Alterar **template + dados juntos** → clicar Salvar → **um dialog** só para template/ensaio;
   dados são salvos silenciosamente na ocorrência.

5. Cancelar no dialog → nada é salvo, estado `dirty` mantido.

6. Clicar "Atenção" (seção de cancelamento) → confirmar que o card de atenção está correto (task já
   feita).

---

### Observações para o implementador

- O frontend **não tem testes** — não criar arquivos `.spec.ts`.
- Após cada mudança de código rodar obrigatoriamente `npx tsc --noEmit` antes de commitar.
- O `FancyAlert.alert` é síncrono em sua definição mas resolve via Promise — o padrão já existe no
  código, não alterar.
- O tipo `ScopePromptResult = TemplatePadraoEscopoEnum | 'cancel'` já cobre tudo que
  `promptConsolidatedScope` retorna.
- O comportamento de `shouldRemoveOccurrenceOverride` dentro de cada `saveXByScope` **não muda** —
  continua correto.
