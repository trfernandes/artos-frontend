# OTA updates (eas update)

## Regra de ouro

`eas update` **não lê** `eas.json > build.<profile>.env`. Ele roda o Metro localmente e
carrega `.env` + `.env.local` (nessa ordem, `.env.local` sempre vence). Como esses dois
apontam pro backend de **staging**, um `eas update --channel production` cru publica o
bundle de produção falando com o banco de staging.

Já aconteceu: update `b885d1c7` (2026-09), corrigido pelo `509cd377`.

## Como publicar

Sempre pelos scripts — eles forçam a env certa via `dotenv -e`:

```bash
npm run update:prod -- --message "descricao"
npm run update:staging -- --message "descricao"
```

`update:prod` usa `.env.production` (gitignored, precisa existir na máquina;
`EXPO_PUBLIC_API_URL=https://diakonia-backend-virginia.onrender.com`).

## Verificação obrigatória pós-publish (produção)

```bash
B=$(ls -t dist/_expo/static/js/android/entry-*.hbc | head -1)
grep -aco "diakonia-backend-virginia.onrender.com" "$B"   # tem que ser >= 1
grep -aco "diakonia-backend-staging.onrender.com"  "$B"   # tem que ser 0
```

(`diakonia-backend-staging` sem `.onrender.com` aparece de propósito — é a string de
comparação do `utils/featureFlags.ts`.)

## Fix definitivo (pendente)

Migrar a env pro ambiente hospedado do EAS, aí `--environment production` puxa do
servidor e não depende de arquivo local:

```bash
eas env:create --environment production --name EXPO_PUBLIC_API_URL \
  --value "https://diakonia-backend-virginia.onrender.com" --visibility plaintext
```

Depois: `eas update --channel production --environment production`.

## runtimeVersion

Update só chega em builds com o mesmo `runtimeVersion` do bundle da loja (hoje `1.1.1`).
Mudança de dependência nativa quebra isso — aí é build novo + submit, não OTA.
