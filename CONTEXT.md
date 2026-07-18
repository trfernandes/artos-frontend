# CONTEXT.md

Glossário de termos do domínio usados no código deste projeto. Sem detalhes de implementação — só o
significado dos termos, para todo mundo (humano ou agente) falar a mesma língua.

## Tutorial interativo (tours)

- **Tour**: sequência curta de passos guiados sobre uma única tela do app, disparada manualmente
  pelo usuário. Não navega para outras telas.
- **Passo (tour step)**: um item de um tour — referencia um `targetId`, um título e uma descrição.
- **Tutorial Target**: elemento real de uma tela registrado sob um id, para que um tour possa
  desenhar o spotlight nele.
- **Catálogo de tours**: registro central de quais tours existem no app e se cada um já foi visto ou
  pulado pelo usuário.
