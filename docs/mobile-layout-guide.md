# Guia Permanente de Layout Mobile

Este guia define o padrão visual do app mobile Diakonia/Artos. Antes de criar ou alterar qualquer tela, componente visual, modal, sheet, lista, card, botão ou formulário, siga estas regras e prefira evoluir os componentes Fancy existentes em vez de criar variações locais.

## Princípios

- O app é uma ferramenta operacional: a interface deve ser calma, legível, densa o suficiente para trabalho recorrente e sem aparência de landing page.
- Use o Fancy component system como fonte de verdade. Não crie botões, abas, cards, campos, headers ou sheets customizados quando já existir um componente Fancy equivalente.
- Preserve consistência entre telas. Uma ação secundária, uma aba, um estado vazio ou um card de lista deve parecer igual em qualquer módulo.
- Prefira ajustes no componente base quando o padrão precisa mudar para várias telas. Evite corrigir visual com `containerStyle`, `headerStyle`, paddings e cores locais.
- Mantenha compatibilidade com tema claro/escuro: use `usePallete()` e tokens do tema, nunca valores fixos de cor para UI comum.

## Tokens

- Cores: use `usePallete()` para `primary`, `backgroundColor`, `backgroundColor2`, `backgroundColor3`, `backgroundColor4`, `border`, `borderCard`, `fonts`, `icons`, `warning`, `error`, `confirm` e `terciary`.
- Cor fixa só é aceitável para identidade externa inevitável, e mesmo assim deve ser isolada e rara. Para botões e controles do app, use `palette.primary`.
- Tipografia: use `FancyText` com tamanhos `extraSmall`, `small`, `medium`, `large`, `largeMedium` e `extraLarge`. Não use `Text` direto em UI do app.
- Ícones: use `DefaultIconsNames` quando houver semântica comum. Para ícones específicos, use `DefaultIcons.Custom` ou a prop `icon` dos componentes Fancy.
- Espaçamento padrão: gutters de página devem ser consistentes com `FancyTabs`/listas/base pages. Não misture `paddingHorizontal` 15, 16, 18 e 20 em uma mesma família de telas sem motivo estrutural.

## Componentes Obrigatórios

- Página: use `FancyPageView` como raiz visual de tela.
- Lista: use `FancyListPage`, `FancyList`, `FancyCard` e estados vazios Fancy quando a tela é uma coleção de itens.
- Botões: use `FancyButton`.
  - `contained`: ação principal.
  - `light`: ação secundária visível.
  - `outlined`: cancelar/alternativa forte ou contexto legado já padronizado.
  - `text`: ação discreta.
  - `mode='icon'`: ação sem texto.
- Abas: use `FancyTabs`.
  - `variant='page'` para telas completas.
  - `variant='compact'` para bottom sheets e modais.
  - Não use `FancyTabHeaderItem` diretamente fora de `components/tabs`; para seletor segmentado use `FancySegmentedTabs`.
- Campos: use `FancyTextInput`, `FancyBottomSheetSelect`, `FancySearchSelect`, `FancyToggle`, `FancyBpmField` e componentes Fancy equivalentes.
- Modais e sheets: use `FancyBottomSheetModal` para fluxos inferiores e `FancyModalDialog` quando for diálogo central.
- Cards: use `FancyCard`/`FancyBaseCard` para itens repetidos. Não crie um card novo para cada tela se a estrutura é título, subtítulo, dados e ações.

## Layout de Página

- Comece pela superfície de trabalho, não por hero, banner decorativo ou texto promocional.
- Use headers e subtítulos apenas quando orientam a tarefa. Texto explicativo deve ser curto e operacional.
- Em páginas com tabs, deixe `FancyTabs` aplicar o gutter e o header padrão. Só passe `contentContainerStyle`, `headerStyle` ou `containerStyle` quando há uma limitação real de layout.
- Em listas, mantenha o conteúdo escaneável: título, subtítulo, metadados curtos e ações à direita.
- Evite cartões dentro de cartões. Se uma seção não precisa de moldura para ser compreendida, use layout simples com espaçamento.
- Use sombras com moderação e prefira `palette.shadows[100]` quando necessário.

## Abas

- Todas as abas de página devem parecer iguais: mesma altura, raio, tipografia, gap e gutter.
- Todas as abas de modal/sheet devem usar o padrão compacto.
- Não force `compactHeader` em tela cheia para "caber mais"; se há muitas abas, deixe o scroll horizontal do componente base resolver.
- Não use texto itálico para estado inativo. A diferença deve vir de cor, fundo e peso controlados pelo componente base.
- Se uma tela precisa de exceção, documente no código o motivo e mantenha a exceção no menor escopo possível.

## Botões e Ações

- Botões com texto devem ter ícone quando isso melhora escaneabilidade, principalmente em ações recorrentes como salvar, adicionar, editar, abrir, buscar e gerenciar.
- Ícones de botões devem seguir a cor resolvida pelo `FancyButton`. Evite `iconStyle` local e cores fixas.
- Não use vermelho de marca externa em ação comum do app. Exemplo: "Buscar no YouTube" deve seguir `palette.primary`, não vermelho do YouTube.
- Estados loading devem usar `isLoading` do `FancyButton`.
- Estados disabled devem usar `disabled` do componente base, sem opacidade manual local.

## Forms e Sheets

- Formulários devem ser agrupados por tarefa, com labels curtos e helper text apenas quando reduz erro.
- Bottom sheets devem usar o padding e header do `FancyBottomSheetModal`; evite containers extras que dupliquem gutters.
- Sheets com campos devem usar o comportamento de teclado padrão do `FancyBottomSheetModal`; não adicione `KeyboardAvoidingView` ou scroll keyboard-aware local sem uma exceção documentada.
- Use `avoidKeyboard={false}` apenas em sheets sem campos ou quando o deslocamento por teclado for explicitamente indesejado.
- Em sheets com tabs, use `FancyTabs variant='compact'`.
- Ações de salvar/cancelar devem ficar no footer do modal/sheet quando o fluxo é modal.

## Estados

- Loading: use `FancyLoading`.
- Vazio: use os estados vazios Fancy (`FancyListEmpty` ou props de lista) com texto direto e ícone do sistema.
- Erro: use `FancyError`, `FancyAlert` ou Toast conforme o padrão já usado no fluxo.
- Permissão insuficiente: desabilite ações e mantenha visual de disabled do componente base.

## Checklist Antes de Finalizar UI

- A tela usa `FancyPageView` ou o container Fancy correto.
- Abas usam `FancyTabs` com `variant` correto e sem overrides desnecessários.
- Botões usam `FancyButton`, tipos corretos e cores do tema.
- Campos usam componentes Fancy.
- Cards/listas usam `FancyCard` ou lista Fancy.
- Não há cor hardcoded para UI comum.
- Não há padding horizontal local divergente quando o componente base já define o gutter.
- Textos cabem em mobile estreito, com `numberOfLines` ou `adjustsFontSizeToFit` quando necessário.
- Estados loading, vazio, disabled e erro estão padronizados.
- `npx tsc --noEmit` foi executado após mudanças de código.
