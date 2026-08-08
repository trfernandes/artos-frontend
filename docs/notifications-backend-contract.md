# Contrato Backend - Notificacoes (Frontend Expo)

Este documento define o contrato esperado pelo frontend para o fluxo completo de notificacoes.

## 1. GET `/notificacoes`

- Parametro: `apenasNaoLidas` deve aceitar `true/false` (string ou boolean) com parse consistente.
- Resposta: manter formato atual com array em `data`.

## 2. Registro de token (seguro)

- Endpoint atual: `POST /notificacoes/device-tokens/:voluntarioId`.
- Payload esperado pelo frontend:
  - `expoPushToken: string`
  - `plataforma: 'ios' | 'android'`
  - `previousToken?: string`
  - `deviceId?: string`
  - `appVersion?: string`
- Regras:
  - validar vinculo usuario autenticado x `:voluntarioId`
  - nao permitir registrar token em usuario diferente da sessao
  - considerar `deviceId` como identificador preferencial do dispositivo

## 3. Remocao de token

- Endpoint atual: `DELETE /notificacoes/device-tokens`.
- Backend deve aceitar:
  - `deviceId` (preferencial)
  - `expoPushToken` (fallback de compatibilidade)
- Frontend tenta remover por `deviceId` e, se falhar, tenta por token.

## 4. Envio push

- Enviar apenas para tokens ativos (`ativo=true`).
- Quando provider retornar token invalido/nao registrado, invalidar no banco automaticamente.

## 5. Payload padrao de navegacao

Padrao recomendado para push e inbox:

```json
{
  "tipo": "ESCALA_LEMBRETE",
  "deepLink": "artos://(app)/(drawer)/pessoal/escalas?escalaId=123",
  "route": "/(app)/(drawer)/pessoal/escalas",
  "params": { "escalaId": "123" }
}
```

- Regra no frontend: `deepLink` > `route + params` > fallback por `tipo`.
- `route` e fallback por `tipo` continuam por compatibilidade.

## 6. Enum + templates

- Expandir enum de tipos de notificacao no backend conforme casos de uso.
- Centralizar templates (titulo/mensagem/dados) por tipo para consistencia entre push e inbox.

## 7. Lembretes e idempotencia

- Job de lembretes automatico (agenda).
- Garantir idempotencia para evitar notificacoes duplicadas.

## 8. Disparos por eventos de escala

Integrar notificacoes nos eventos:

- publicar escala
- atualizar escala
- cancelar escala

Cada evento deve persistir inbox e tentar push.
