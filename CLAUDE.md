# Diakonia — Frontend

Ver [../CLAUDE.md](../CLAUDE.md) pra paths, comandos, git, scope discipline.

## Expo Router — estrutura de rotas

```
app/
  (auth)/     — Stack sem header; retorna null se user já logado
    login, forgot-password, create-account, admin-discovery,
    create-igreja-account, create-voluntario-account,
    voluntario-aguardando-email, igreja-cadastro-aguardando-email
  (app)/
    (drawer)/  — menu lateral: inicio/, ministerios/, admin/, configuracoes/, pessoal/
    join-church/, notifications.tsx, notification-detail.tsx, voluntarios/
  (public)/
    invite/
```

## Padrões mobile — telas de auth

Padrão oficial: **flat** — sem `AuthLayout`, sem gradiente, sem card manual. Segue o padrão de
login/recovery/cadastro (telas existentes).

Conteúdo do form de toda tela de auth deve ser **centralizado verticalmente** (logo do login é
exceção).

## Padrões mobile — telas de app

- Container: `FancyPageView` (já tem padding 15px — não adicionar padding extra)
- Entre seções distintas dentro de `FancyPageView`: usar `FancyVerticalSpacer`
- Lista: `FancyList` com `FancyListEmpty` para estado vazio
- Scroll livre: `FancyScrollView` (não `ScrollView` nativo)
- Espaçamento horizontal de conteúdo que fica dentro de `FancyScrollView`: aplicar em
  `contentContainerStyle`, nunca no container pai — barra de scroll deve ficar colada na borda da
  tela. Conteúdo fixo fora do scroll (header, empty state) usa padding próprio separado.

## Padrões mobile — formulários

Sempre: `react-hook-form` + `zodResolver` + wrappers `Controlled*`.

```tsx
const { control, handleSubmit } = useForm({ resolver: zodResolver(MeuSchema) });
// Usar Controlled* — nunca os campos Fancy diretamente em formulários com RHF
<ControlledTextInput name="campo" control={control} label="..." />
<ControlledDropDown name="opcao" control={control} label="..." options={...} />
```

Wrappers disponíveis em `components/forms/`: ControlledTextInput, ControlledPasswordInput,
ControlledDropDown, ControlledBottomSheetSelect, ControlledTextArea, ControlledNumberInput,
ControlledMaskedTextInput, ControlledImagePicker, ControlledSearchSelect, ControlledSelectField,
ControlledFancyToggle, ControlledDateInput, ControlledColorPicker.

## Padrões mobile — dados

Camada: **API → Repository → Hook**

```
domain/api/MinisteriosApi.ts          → extends BaseApi('ministerios')
domain/services/MinisteriosRepository.ts → extends BaseRepository(MinisteriosApi)
hooks/useMinisteriosCrud.ts           → useCrud<>({ queryKey, fetchAll, add, update, remove, resolver, messages })
```

## Sistema de design

### usePallete()

```ts
const Pallete = usePallete();
// Agrupamentos disponíveis:
// Pallete.primary / secondary / terciary / warning / error / confirm
// Pallete.disabled / disabled2 / disabled3 / selected
// Pallete.buttons.active / inactive
// Pallete.fonts.dark / light / inactive / inactive2 / link
// Pallete.icons.dark / light / inactive / inactive2
// Pallete.border / borderCard
// Pallete.backgroundColor / backgroundColor2 / backgroundColor3 / backgroundColor4
// Pallete.overlays.backdrop / strongBackdrop
// Pallete.gradients.auth / drawerHeader / dashboard
// Pallete.shadows[100] / [200] / [300]
```

Para transparência: `ColorUtils.withAlpha(Pallete.primary, 0.12)` — nunca rgba/hex hardcoded.

### Gradientes — uso correto

Gradiente permitido **apenas** nos 4 tokens abaixo e **apenas** nos contextos correspondentes:

```tsx
// auth screens — flat, sem gradiente (ver seção acima)
// drawer header — FancyDrawerHeader já aplica
// dashboard — DashboardCard já aplica
// quiz-vendas — onda-assinatura do funil (QuizGradientWave, QuizSegmentedProgress
//   prop activeGradient) e checkmark do slide de conclusão — ver docs/design-system.md
// Em qualquer outro lugar: usar backgroundColor* tokens
```

### Sombras

```tsx
// Correto:
style={{ ...Pallete.shadows[200] }}
// Nunca:
style={{ elevation: 2, shadowOpacity: 0.2 }}
```

### Proibições absolutas

- Nunca hardcodar hex/rgb/rgba — sempre `usePallete()` ou `ColorUtils.withAlpha()`
- Nunca `Text` nativo — sempre `FancyText`
- Nunca `FlatList` — sempre `FancyList`
- Nunca `ScrollView` nativo — sempre `FancyScrollView`
- Nunca `TouchableOpacity` para botões — sempre `FancyButton` ou `FancyFab`
- Nunca `elevation` diretamente — sempre `Pallete.shadows[100|200|300]`
- Nunca gradiente fora dos 3 tokens permitidos (ver acima)
- Nunca `marginTop`/`marginBottom` ad-hoc entre seções em FancyPageView — usar `FancyVerticalSpacer`

### Decisões rápidas

- Botão principal → `FancyButton` (default type="contained")
- Botão secundário → `FancyButton type="outlined"`
- Botão terciário/link → `FancyButton type="text"`
- Seleção ≤6 itens → `FancyDropDown` | >6 itens → `FancyBottomSheetSelect`
- Modal de confirmação → `FancyModalDialog`
- Modal de alerta → `FancyAlert.alert(...)`
- Wizard multi-step → `FancySteps` + `FancyStepsConfig` com `scrollableContent={false}`

## TypeScript & UI

- Zero erros TypeScript após cada mudança — `npx tsc --noEmit` é obrigatório
- Nunca usar `as any` exceto em catch blocks de API (padrão existente aceitável)
- Não usar width percentages aninhados; preferir flex para centralização
- Ao propor redesign: apresentar 2-3 direções curtas em texto ANTES de codificar
- Após implementar: self-review — o resultado bate com o spec? (grid está em 2 colunas? badge
  aparece?)
- Ao duvidar do padrão visual: ler um card/componente existente antes de criar algo novo

## Princípios de UX (Material Design / Apple HIG)

### Feedback imediato

- Toque em qualquer elemento interativo deve produzir resposta visual em <100ms
- Bottom sheets e modais abrem imediatamente — nunca bloquear abertura aguardando dados
- Loading dentro do container (spinner centralizado), nunca antes de abrir o container

### Estados de loading em modais/sheets

- Loading inline em row no topo = errado (parece conteúdo vazio quebrado)
- Correto: `ActivityIndicator size='large'` centralizado preenchendo a área de conteúdo, sem texto
- Padrão:
  `<View style={{ alignItems: 'center', paddingVertical: 32 }}><ActivityIndicator size='large' /></View>`

### Hierarquia de ações (botões)

- Máximo 1 ação `contained` por contexto — é o CTA principal
- Ação secundária → `outlined`; ação terciária/abandono → `text`
- `FancyAlert` com 3+ botões: primeiro sem style = `contained`, `style:'default'` = `outlined`,
  `style:'cancel'` = `text`
- Nunca dois `outlined` lado a lado quando um é abandono (Cancelar) — rebaixa para `text`

### Dismiss e controle do usuário

- Nunca bloquear fechar/sair quando o usuário ainda não comprometeu dados
- Bottom sheet: sempre pode sair (swipe, X, Cancelar) durante loading inicial
- Bloquear dismiss apenas durante submit (`closeDisabled={isSubmitting}`)

### Estados vazios

- Nunca deixar área de conteúdo em branco — sempre `FancyListEmpty` com ícone + label + helperText
- helperText deve ser instrução de ação ("Toque no botão + para adicionar"), não descrição do estado
- Ícone relevante ao contexto (não o robô padrão quando há um ícone mais específico disponível)

### Cores semânticas em ações

- Ações de CTA primário → `palette.primary` sólido
- Ações informacionais/insights → `palette.secondary` tint (withAlpha 0.14)
- Ações de configuração/ajuste → `palette.warning` tint (withAlpha 0.14)
- Ações destrutivas → `palette.error` sólido com `palette.icons.light`
- Nunca usar `palette.fonts.inactive` como cor de ação ativa — é o token de "desabilitado"

## Checklist antes de finalizar tela

- [ ] Cores via `usePallete()` (sem hex hardcoded)?
- [ ] Dark mode funciona?
- [ ] Touch targets ≥ 44px?
- [ ] Estados loading / erro / vazio implementados?
- [ ] Hierarquia de botões correta (contained > outlined > text)?
- [ ] Bottom sheets com loading usam spinner centralizado (não row no topo)?
- [ ] `npx tsc --noEmit` passou sem erros?
