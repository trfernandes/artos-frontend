# Visual Improvement Target

## Screen
Assistente de Escalas - etapa Revisar

## Evidence
- initial/viewport-001.png
- initial/contact-sheet.png

## Chosen Direction
Clean operational review

## Goal
A etapa de revisao deve parecer uma conferencia final clara e profissional: secoes leves, fundo limpo, itens compactos e escaneaveis, menos cinza acumulado e melhor leitura de eventos/equipe antes de tocar em Gerar.

## Required Changes
- Reduzir os fundos acinzentados locais em secoes, configuracoes, eventos e participantes.
- Reforcar hierarquia com cards brancos, borda azul discreta e badges/chips mais leves.
- Compactar a lista de eventos e voluntarios sem remover informacoes importantes.
- Preservar Fancy components, tokens de tema, navegacao, validacoes e chamada de geracao.

## Acceptance Checklist
- A primeira tela visivel nao deve parecer dominada por cinza.
- Os cards de evento e participante devem ter superficie limpa, sem retangulos internos pesados.
- Eventos e equipe devem continuar escaneaveis em tela pequena.
- O botao Gerar e a navegacao do assistente devem manter o comportamento atual.
- `npx tsc --noEmit` deve passar ou reportar apenas erro preexistente nao relacionado.
