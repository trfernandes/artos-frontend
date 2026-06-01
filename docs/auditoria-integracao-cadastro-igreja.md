# Auditoria Integração Cadastro Igreja

## Achado CRÍTICO

O armazenamento do `cadastroSecret` e dados sensíveis do fluxo de cadastro de igreja estava sendo
feito via `AsyncStorage`, contrariando o padrão de segurança do projeto (deveria ser `SecureStore`).

### Correção Aplicada

- Implementado utilitário `utils/secureStorage.ts` usando `expo-secure-store`.
- Atualizado `domain/services/CadastroIgrejaRepository.ts` para:
  - Salvar, ler e apagar dados sensíveis apenas no `SecureStore`.
  - Migrar automaticamente dados do `AsyncStorage` para o `SecureStore` na primeira leitura
    (fallback de compatibilidade).
  - Remover qualquer gravação futura em `AsyncStorage` para secrets.

### Fallback de Migração

Ao ler os dados do cadastro:

1. Tenta ler do `SecureStore`.
2. Se não existir, lê do `AsyncStorage`, grava no `SecureStore`, apaga do `AsyncStorage` e retorna o
   valor.
3. Todas as gravações futuras são feitas apenas no `SecureStore`.

### Teste Manual

- Criar cadastro → receber `cadastroSecret` → salvar → fechar e abrir app → continuar polling status
  usando `X-Cadastro-Secret`.
- Após migração, `AsyncStorage` não contém mais o `cadastroSecret`.

## Achado ALTO

A Idempotency-Key era gerada a cada envio de cadastro, podendo causar duplicidade em reenvios.
Agora, a key é persistida no SecureStore durante a submissão e reutilizada até sucesso ou
cancelamento.

### Correção Aplicada

- Persistência da Idempotency-Key no SecureStore (`@artos:cadastro_igreja_idempotency_key`).
- Reenvios do cadastro reutilizam a mesma key até sucesso.
- Key é removida do SecureStore após cadastro bem-sucedido.

### Fallback de Migração

- O fluxo é transparente para o usuário. A key é gerada e persistida na primeira tentativa, e limpa
  após sucesso.

## Achado Navegação/Polling

O fluxo de navegação e polling do status está correto:

- Após criar cadastro, navega para tela de aguardando e-mail.
- Polling do status é feito via hook, com intervalos e timeout adequados.
- Navegação para login ocorre após confirmação.
- Reenvio/alteração de e-mail usa o secret do SecureStore.

## Resumo dos Achados

- CRÍTICO: Migração do cadastroSecret para SecureStore.
- ALTO: Persistência e reuso da Idempotency-Key.
- Navegação e polling: OK.

## Status Final

OK

## Arquivos alterados

- utils/secureStorage.ts
- domain/services/CadastroIgrejaRepository.ts
